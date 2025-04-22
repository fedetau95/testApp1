import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface AIResponse {
  text: string;
  feedback?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = ''; // Dovrai impostare la tua API key

  // Memorizza la conversazione per mantenere il contesto
  private conversationHistory: { role: string, content: string }[] = [];
  private currentPersonality: 'default' | 'timida' | 'diretta' | 'sarcastica' = 'default';

  // Limite di contesto per evitare messaggi troppo lunghi
  private maxHistoryLength = 10;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Carica l'API key dallo storage
    this.loadApiKey();

    // Imposta il contesto iniziale per l'AI
    this.resetConversation();
  }

  // Impostare l'API key
  async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    await this.storageService.set('openai_api_key', key);
  }

  // Caricare l'API key
  private async loadApiKey(): Promise<void> {
    const key = await this.storageService.get('openai_api_key');
    if (key) {
      this.apiKey = key;
    }
  }

  // Impostare la personalità
  setPersonality(personality: 'default' | 'timida' | 'diretta' | 'sarcastica'): void {
    this.currentPersonality = personality;
    this.resetConversation();
  }

  // Resettare la conversazione con un nuovo contesto iniziale
  resetConversation(): void {
    // Definisci le istruzioni di sistema per ogni personalità
    const systemInstructions = {
      'default': 'Sei una ragazza con una personalità equilibrata in una chat di appuntamenti. Rispondi in modo naturale, amichevole e sincero. Mostra interesse nella conversazione. Rispondi sempre in italiano.',

      'timida': 'Sei una ragazza timida e riservata in una chat di appuntamenti. Rispondi in modo cauto, con frasi brevi e mostrandoti un po\' esitante. Ci metti tempo ad aprirsi. Usa frasi come "Forse...", "Non so...", "Scusa, sono un po\' timida". Rispondi sempre in italiano.',

      'diretta': 'Sei una ragazza molto diretta in una chat di appuntamenti. Vai dritta al punto senza giri di parole. Non hai paura di mostrare interesse o disinteresse. Sei sicura di te e sai cosa vuoi. Rispondi sempre in italiano.',

      'sarcastica': 'Sei una ragazza sarcastica in una chat di appuntamenti. Rispondi con umorismo e un po\' di sarcasmo. Usi spesso frasi ironiche e battute. Ti piace prendere in giro l\'altra persona in modo giocoso. Rispondi sempre in italiano.'
    };

    // Imposta il ruolo di sistema per la personalità corrente
    this.conversationHistory = [
      {
        role: 'system',
        content: systemInstructions[this.currentPersonality] +
          ' Alla fine di ogni messaggio, dopo aver risposto normalmente, aggiungi sempre un feedback costruttivo preceduto da [Coach:]. ' +
          'Il feedback deve valutare l\'approccio dell\'utente nella conversazione, offrendo consigli su cosa ha funzionato ' +
          'o come migliorare. Ad esempio: [Coach: Buona domanda aperta, mostra interesse!] o ' +
          '[Coach: Attenzione, questa domanda potrebbe sembrare invadente. Prova ad essere più graduale.]'
      }
    ];
  }

  // Aggiungere un messaggio utente al contesto e ottenere una risposta
  getAIResponse(userMessage: string): Observable<AIResponse> {
    if (!this.apiKey) {
      return throwError(() => new Error('API key non impostata'));
    }

    // Aggiungi il messaggio utente alla cronologia
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Limita la lunghezza della cronologia per evitare costi eccessivi
    if (this.conversationHistory.length > this.maxHistoryLength + 1) { // +1 per il messaggio di sistema
      this.conversationHistory = [
        this.conversationHistory[0], // Mantieni il messaggio di sistema
        ...this.conversationHistory.slice(-(this.maxHistoryLength))
      ];
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: 'gpt-4o', // o 'gpt-3.5-turbo' per un'opzione più economica
      messages: this.conversationHistory,
      temperature: 0.7,
      max_tokens: 300
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      map((response: any) => {
        const messageContent = response.choices[0].message.content;
        this.conversationHistory.push({
          role: 'assistant',
          content: messageContent
        });

        // Estrai il feedback dal messaggio (se presente)
        const feedbackMatch = messageContent.match(/\[Coach:(.*?)\]/);
        let text = messageContent;
        let feedback = '';

        if (feedbackMatch) {
          // Rimuovi il feedback dal testo principale
          text = messageContent.replace(/\[Coach:.*?\]/, '').trim();
          feedback = feedbackMatch[1].trim();
        }

        return { text, feedback };
      }),
      catchError(error => {
        console.error('Errore nella chiamata API:', error);
        return throwError(() => new Error('Errore nella risposta dell\'AI: ' + error.message));
      })
    );
  }
}