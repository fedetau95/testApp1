import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AIService } from './ai.service';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  feedback?: string;
}

export interface PersonalityType {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private aiService = inject(AIService);

  // Chat messages observable
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Stato del caricamento
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Stato dell'errore
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Selected personality
  private currentPersonality: string = 'default';

  // Personalità disponibili
  public personalities: PersonalityType[] = [
    {
      id: 'timida',
      name: 'Timida',
      description: 'Una ragazza riservata che impiega tempo per aprirsi'
    },
    {
      id: 'diretta',
      name: 'Diretta',
      description: 'Va dritta al punto, senza troppe cerimonie'
    },
    {
      id: 'sarcastica',
      name: 'Sarcastica',
      description: 'Risponde con umorismo e un po\' di sarcasmo'
    },
    {
      id: 'default',
      name: 'Standard',
      description: 'Una personalità bilanciata'
    }
  ];

  // Risposte di fallback (usate quando l'API non è disponibile)
  private fallbackResponses = {
    'timida': [
      'Ciao... come stai?',
      'Non so... forse...',
      'Non ti conosco ancora bene...',
      'Mi piace questo, ma non ne parlo spesso',
      'Scusa, sono un po\' timida'
    ],
    'diretta': [
      'Ciao! Cosa fai nella vita?',
      'Mi piaci, sei interessante',
      'Non sono convinta, spiegami meglio',
      'Andiamo al punto: ti interesso?',
      'Preferisco essere chiara: quella cosa non mi piace'
    ],
    'sarcastica': [
      'Oh wow, che originalità...',
      'Complimenti per l\'osservazione geniale...',
      'Davvero? Mai sentito prima... *rotola gli occhi*',
      'Ti hanno mai detto che sei incredibilmente prevedibile?',
      'Ok genio, e poi?'
    ],
    'default': [
      'Ciao! Come va?',
      'Interessante, raccontami di più',
      'Non ci avevo mai pensato così',
      'Mi piace come la pensi',
      'Hai dei piani per il weekend?'
    ]
  };

  // Feedback predefiniti di fallback
  private fallbackFeedback = {
    'positive': [
      'Buona risposta! Hai mostrato interesse senza esagerare.',
      'Ottimo approccio, personale ma non invadente.',
      'Ben fatto! La tua risposta è stata naturale.'
    ],
    'negative': [
      'Attenzione, questa risposta potrebbe sembrare troppo generica.',
      'Prova ad essere più specifico per mostrare che stai ascoltando.',
      'Questa risposta potrebbe sembrare un po\' forzata.'
    ]
  };

  constructor() { }

  // Imposta la chiave API per il servizio AI
  setApiKey(key: string): Promise<void> {
    return this.aiService.setApiKey(key);
  }

  // Imposta la personalità
  setPersonality(personalityId: string): void {
    if (this.personalities.some(p => p.id === personalityId)) {
      this.currentPersonality = personalityId;
      this.aiService.setPersonality(personalityId as 'default' | 'timida' | 'diretta' | 'sarcastica');
      this.resetChat();
    }
  }

  // Resetta la chat
  resetChat(): void {
    this.aiService.resetConversation();

    // Invia un messaggio iniziale usando l'AI
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.aiService.getAIResponse('Ciao!').subscribe({
      next: (response) => {
        const welcomeMessage: ChatMessage = {
          id: 1,
          text: response.text,
          sender: 'ai',
          timestamp: new Date(),
          feedback: response.feedback
        };

        this.messagesSubject.next([welcomeMessage]);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        // Fallback alle risposte predefinite in caso di errore
        console.error('Errore nel recupero della risposta AI:', error);

        const randomResponse = this.getRandomFallbackResponse();
        const welcomeMessage: ChatMessage = {
          id: 1,
          text: randomResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        this.messagesSubject.next([welcomeMessage]);
        this.loadingSubject.next(false);
        this.errorSubject.next('Non è stato possibile connettersi al servizio AI. Usando risposte predefinite.');
      }
    });
  }

  // Aggiungi un messaggio utente
  addUserMessage(text: string): void {
    const currentMessages = this.messagesSubject.value;
    const newMessage: ChatMessage = {
      id: currentMessages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date()
    };

    this.messagesSubject.next([...currentMessages, newMessage]);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Ottieni risposta AI
    this.aiService.getAIResponse(text).subscribe({
      next: (response) => {
        this.addAiResponseFromAPI(response);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Errore nella risposta AI:', error);
        this.addFallbackAiResponse();
        this.loadingSubject.next(false);
        this.errorSubject.next('Non è stato possibile ottenere una risposta AI. Usando risposte predefinite.');
      }
    });
  }

  // Aggiungi risposta AI dall'API
  private addAiResponseFromAPI(response: { text: string, feedback?: string }): void {
    const currentMessages = this.messagesSubject.value;

    const newMessage: ChatMessage = {
      id: currentMessages.length + 1,
      text: response.text,
      sender: 'ai',
      timestamp: new Date(),
      feedback: response.feedback
    };

    this.messagesSubject.next([...currentMessages, newMessage]);
  }

  // Aggiungi risposta predefinita (fallback)
  private addFallbackAiResponse(): void {
    const currentMessages = this.messagesSubject.value;
    const response = this.getRandomFallbackResponse();
    const feedback = Math.random() > 0.5 ? this.getRandomFallbackFeedback('positive') : this.getRandomFallbackFeedback('negative');

    const newMessage: ChatMessage = {
      id: currentMessages.length + 1,
      text: response,
      sender: 'ai',
      timestamp: new Date(),
      feedback: feedback
    };

    this.messagesSubject.next([...currentMessages, newMessage]);
  }

  // Ottieni una risposta predefinita casuale
  private getRandomFallbackResponse(): string {
    const responseList = this.fallbackResponses[this.currentPersonality as keyof typeof this.fallbackResponses];
    const randomIndex = Math.floor(Math.random() * responseList.length);
    return responseList[randomIndex];
  }

  // Ottieni un feedback predefinito casuale
  private getRandomFallbackFeedback(type: 'positive' | 'negative'): string {
    const feedbackList = this.fallbackFeedback[type];
    const randomIndex = Math.floor(Math.random() * feedbackList.length);
    return feedbackList[randomIndex];
  }
}