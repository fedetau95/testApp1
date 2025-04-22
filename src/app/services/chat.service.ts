import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { StorageService } from './storage.service';

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

export interface UserProfile {
  isPremium: boolean;
  credits: number;
  apiKey?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
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
  
  // Conversation context - Per rendere le risposte più coerenti
  private conversationContext: { role: string, content: string }[] = [];
  private maxContextLength = 10; // Maggiore per AI reale
  
  // Modalità AI o simulata
  private useAIMode = false;
  
  // URL per il server API (quando usi un tuo backend)
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  
  // Dati utente
  private userProfile: UserProfile = {
    isPremium: false,
    credits: 5, // Crediti gratuiti iniziali
    apiKey: ''
  };

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

  // Risposte per ogni personalità, organizzate per tipologia di input
  private responseMappings = {
    'timida': {
      'greeting': [
        'Ciao... come stai?',
        'Ehm... ciao!',
        'Oh, ehm... salve!',
        'Ehi... tutto bene?'
      ],
      'question': [
        'Non so... forse...',
        'Mmm... ci devo pensare...',
        'Non sono sicura di potertelo dire ancora...',
        'È una domanda difficile per me...'
      ],
      'compliment': [
        'Grazie... sei gentile a dirlo',
        '*arrossisce* Grazie...',
        'Non so cosa dire... grazie',
        'Davvero lo pensi? Grazie...'
      ],
      'interests': [
        'Mi piace leggere... ma non ne parlo spesso',
        'A volte mi piace guardare film... ma niente di speciale',
        'Ho alcuni hobby, ma sono cose semplici...',
        'Mi piace ascoltare musica tranquilla... ti piace la musica?'
      ],
      'personal': [
        'Non ti conosco ancora bene...',
        'Scusa, non sono abituata a parlare di cose personali...',
        'Preferirei conoscerci meglio prima...',
        'Mi serve un po\' di tempo per aprirmi...'
      ],
      'generic': [
        'Capisco...',
        'Ok...',
        'Scusa, sono un po\' timida',
        'Mi dispiace, non so bene cosa dire...',
        'Non sono brava con le parole...'
      ]
    },
    'diretta': {
      'greeting': [
        'Ciao! Cosa fai nella vita?',
        'Ehi! Come va? Raccontami di te.',
        'Ciao! Sei una persona interessante?',
        'Salve! Andiamo subito al punto: cosa cerchi in una conversazione?'
      ],
      'question': [
        'Rispondo volentieri. Ecco cosa penso...',
        'Bella domanda. Secondo me...',
        'Non ho problemi a dirtelo. La risposta è...',
        'Ti dico subito cosa ne penso...'
      ],
      'compliment': [
        'Grazie, apprezzo la sincerità',
        'Mi piace che sei diretto con i complimenti',
        'Grazie! Anche tu hai qualcosa di interessante',
        'Molto gentile. Sei sempre così con tutte?'
      ],
      'interests': [
        'Mi piace il cinema d\'autore. Tu che film guardi?',
        'Amo viaggiare, soprattutto in posti poco turistici. Sei mai stato in un posto insolito?',
        'Leggo molto, preferisco i classici. E tu che letture hai?',
        'Mi interessa la fotografia. Hai qualche hobby creativo?'
      ],
      'personal': [
        'Mi piaci, sei interessante',
        'Non sono convinta, spiegami meglio',
        'Andiamo al punto: ti interesso?',
        'Preferisco essere chiara: quella cosa non mi piace'
      ],
      'generic': [
        'Dimmi di più, sono curiosa',
        'Interessante. Continua.',
        'Vai al punto principale, ti ascolto',
        'Dimmi cosa pensi veramente',
        'Ok, ma qual è la tua vera opinione?'
      ]
    },
    'sarcastica': {
      'greeting': [
        'Oh wow, che originale come saluto...',
        'Finalmente qualcuno mi parla, che emozione!',
        'Un altro che sa dire "ciao", sono impressionata',
        'Oh guarda, sa scrivere. Che talento raro.'
      ],
      'question': [
        'Complimenti per l\'osservazione geniale...',
        'Ma dai, non ci avrei mai pensato... *rotola gli occhi*',
        'Una domanda così profonda... come hai fatto a pensarci?',
        'Ti hanno mai detto che fai domande incredibilmente prevedibili?'
      ],
      'compliment': [
        'Wow, ci hai provato con questa frase con tutte le ragazze della città?',
        'Oh, un complimento. Dovrei svenire ora o dopo?',
        'Hai letto questo complimento su un manuale di rimorchio?',
        'Che dolce, quasi quasi ci credo...'
      ],
      'interests': [
        'Mi piace guardare le persone che falliscono nei loro approcci... oh guarda, proprio come ora!',
        'Colleziono scuse di ragazzi respinti. Vuoi contribuire alla mia collezione?',
        'Il mio hobby preferito è rispondere sarcasticamente a domande ovvie',
        'Adoro il silenzio. Strano che non lo stia sperimentando ora, vero?'
      ],
      'personal': [
        'Davvero? Mai sentito prima... *rotola gli occhi*',
        'Ti hanno mai detto che sei incredibilmente prevedibile?',
        'Oh sì, raccontami ancora quanto sei "diverso dagli altri"',
        'Wow, che storia unica e speciale, mai sentita prima...'
      ],
      'generic': [
        'Ok genio, e poi?',
        'Affascinante... quasi quanto guardare la vernice asciugarsi',
        'Continua pure, sto prendendo appunti sull\'ovvietà',
        'Ma non mi dire! Chi l\'avrebbe mai immaginato?',
        'Oh, mi hai lasciato senza parole. O forse è solo noia?'
      ]
    },
    'default': {
      'greeting': [
        'Ciao! Come va?',
        'Ehi, come stai oggi?',
        'Ciao! Piacere di conoscerti',
        'Salve! Come procede la giornata?'
      ],
      'question': [
        'È una bella domanda. Direi che...',
        'Ci ho pensato spesso. Secondo me...',
        'Interessante che tu lo chieda. Penso che...',
        'Buona domanda! Ecco il mio punto di vista...'
      ],
      'compliment': [
        'Grazie! Sei molto gentile',
        'Che carino da parte tua, grazie',
        'Apprezzo molto il complimento!',
        'Mi fa piacere che tu la pensi così'
      ],
      'interests': [
        'Mi piace come la pensi',
        'Mi piace leggere e ascoltare musica. Tu che interessi hai?',
        'Sono appassionata di film e serie tv. Hai visto qualcosa di interessante ultimamente?',
        'Mi interessa l\'arte e la fotografia. Hai qualche hobby creativo?'
      ],
      'personal': [
        'Interessante, raccontami di più',
        'Non ci avevo mai pensato così',
        'Hai una prospettiva interessante',
        'Mi trovo d\'accordo con te su questo'
      ],
      'generic': [
        'Interessante! Dimmi di più',
        'Capisco cosa intendi',
        'Hai dei piani per il weekend?',
        'Mi piacerebbe saperne di più',
        'Continua pure, ti sto ascoltando'
      ]
    }
  };

  // Feedback templates
  private feedbackTemplates = {
    'positive': [
      'Buona risposta! Hai mostrato interesse senza esagerare.',
      'Ottimo approccio, personale ma non invadente.',
      'Ben fatto! La tua risposta è stata naturale.',
      'Buon lavoro nel mantenere la conversazione fluida!',
      'Ottima domanda aperta, invita a rispondere in modo dettagliato.'
    ],
    'negative': [
      'Attenzione, questa risposta potrebbe sembrare troppo generica.',
      'Prova ad essere più specifico per mostrare che stai ascoltando.',
      'Questa risposta potrebbe sembrare un po\' forzata.',
      'Evita domande a cui si può rispondere solo sì o no.',
      'Cerca di non cambiare argomento troppo bruscamente.'
    ],
    'neutral': [
      'Ricorda di mostrare interesse facendo domande di follow-up.',
      'Puoi provare a condividere qualcosa di personale per approfondire.',
      'Considera di fare riferimento a qualcosa che ha detto prima.',
      'Le conversazioni migliori hanno un buon equilibrio tra domande e condivisioni.',
      'Prova a trovare interessi comuni per creare connessione.'
    ]
  };

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Carica i dati dell'utente all'avvio
    this.loadUserProfile();
  }

  // Carica il profilo utente dallo storage
  private async loadUserProfile(): Promise<void> {
    const profile = await this.storageService.get('user_profile');
    if (profile) {
      this.userProfile = profile;
    }
    
    // Se l'utente ha un'API key o è premium, abilita la modalità AI
    this.checkAIMode();
  }

  // Salva il profilo utente nello storage
  private async saveUserProfile(): Promise<void> {
    await this.storageService.set('user_profile', this.userProfile);
  }

  // Controlla se usare la modalità AI
  private checkAIMode(): void {
    this.useAIMode = this.userProfile.isPremium || 
                     (this.userProfile.credits > 0 && !!this.userProfile.apiKey) ||
                     !!this.userProfile.apiKey;
  }

  // Aggiorna lo stato premium
  public setPremiumStatus(isPremium: boolean): void {
    this.userProfile.isPremium = isPremium;
    this.checkAIMode();
    this.saveUserProfile();
  }

  // Aggiunge crediti
  public addCredits(amount: number): void {
    this.userProfile.credits += amount;
    this.checkAIMode();
    this.saveUserProfile();
  }

  // Utilizza un credito
  private useCredit(): boolean {
    if (this.userProfile.isPremium) {
      return true; // Gli utenti premium non consumano crediti
    }
    
    if (this.userProfile.credits > 0) {
      this.userProfile.credits--;
      this.saveUserProfile();
      return true;
    }
    
    return false;
  }

  // Imposta l'API key
  public setApiKey(key: string): void {
    this.userProfile.apiKey = key;
    this.checkAIMode();
    this.saveUserProfile();
  }

  // Ottieni lo stato corrente
  public getUserStatus(): { isPremium: boolean, credits: number, hasApiKey: boolean } {
    return {
      isPremium: this.userProfile.isPremium,
      credits: this.userProfile.credits,
      hasApiKey: !!this.userProfile.apiKey
    };
  }

  // Toggle modalità AI
  public toggleAIMode(enabled: boolean): void {
    if (enabled && !this.canUseAI()) {
      return; // Non può attivare AI se non ha crediti o è premium
    }
    
    this.useAIMode = enabled;
  }

  // Verifica se l'utente può usare l'AI
  public canUseAI(): boolean {
    return this.userProfile.isPremium || this.userProfile.credits > 0;
  }

  // Set personality
  setPersonality(personalityId: string): void {
    if (this.personalities.some(p => p.id === personalityId)) {
      this.currentPersonality = personalityId;
      this.resetChat();
    }
  }

  // Reset chat
  resetChat(): void {
    // Reimposta il contesto di conversazione
    this.resetConversationContext();
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    if (this.useAIMode && this.canUseAI()) {
      // Modalità AI
      this.getAIResponse('Salutami e presentati brevemente').subscribe({
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
          console.error('Errore nell\'ottenere risposta AI:', error);
          // Fallback alla modalità simulata
          this.handleAIError('Non è stato possibile connettersi al servizio AI. Passaggio alla modalità simulata.');
        }
      });
    } else {
      // Modalità simulata
      this.getSimulatedResponse('', 'greeting').pipe(
        delay(800) // Simula un ritardo di elaborazione
      ).subscribe(response => {
        const welcomeMessage: ChatMessage = {
          id: 1,
          text: response.text,
          sender: 'ai',
          timestamp: new Date(),
          feedback: response.feedback
        };
  
        this.messagesSubject.next([welcomeMessage]);
        this.loadingSubject.next(false);
      });
    }
  }

  // Resetta il contesto della conversazione
  private resetConversationContext(): void {
    const systemPromptMap: {[key: string]: string} = {
      'timida': 'Sei una ragazza timida e riservata in una chat di appuntamenti. Rispondi in modo cauto, con frasi brevi e mostrandoti un po\' esitante. Ci metti tempo ad aprirsi. Usa frasi come "Forse...", "Non so...", "Scusa, sono un po\' timida". Rispondi sempre in italiano.',
      'diretta': 'Sei una ragazza molto diretta in una chat di appuntamenti. Vai dritta al punto senza giri di parole. Non hai paura di mostrare interesse o disinteresse. Sei sicura di te e sai cosa vuoi. Rispondi sempre in italiano.',
      'sarcastica': 'Sei una ragazza sarcastica in una chat di appuntamenti. Rispondi con umorismo e un po\' di sarcasmo. Usi spesso frasi ironiche e battute. Ti piace prendere in giro l\'altra persona in modo giocoso. Rispondi sempre in italiano.',
      'default': 'Sei una ragazza con una personalità equilibrata in una chat di appuntamenti. Rispondi in modo naturale, amichevole e sincero. Mostra interesse nella conversazione. Rispondi sempre in italiano.'
    };
    
    const basePrompt = systemPromptMap[this.currentPersonality] || systemPromptMap['default'];
    const coachPrompt = ' Alla fine di ogni messaggio, dopo aver risposto normalmente, aggiungi sempre un feedback costruttivo preceduto da [Coach:]. ' +
                     'Il feedback deve valutare l\'approccio dell\'utente nella conversazione, offrendo consigli su cosa ha funzionato ' +
                     'o come migliorare.';
    
    this.conversationContext = [
      { role: 'system', content: basePrompt + coachPrompt }
    ];
  }

  // Add user message
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

    if (this.useAIMode && this.canUseAI()) {
      // Usa l'AI se possibile
      if (!this.useCredit()) {
        // Se non ci sono crediti, fallback alla modalità simulata
        this.handleAIError('Crediti AI esauriti. Passaggio alla modalità simulata.');
        return;
      }
      
      // Aggiungi il messaggio al contesto
      this.conversationContext.push({ role: 'user', content: text });
      
      // Ottieni risposta dall'AI
      this.getAIResponse(text).subscribe({
        next: (response) => {
          const aiMessage: ChatMessage = {
            id: currentMessages.length + 2,
            text: response.text,
            sender: 'ai',
            timestamp: new Date(),
            feedback: response.feedback
          };
          
          // Aggiungi la risposta AI al contesto
          this.conversationContext.push({ role: 'assistant', content: response.text + (response.feedback ? ' [Coach: ' + response.feedback + ']' : '') });
          
          // Limita la lunghezza del contesto
          if (this.conversationContext.length > this.maxContextLength + 1) { // +1 per il messaggio di sistema
            this.conversationContext = [
              this.conversationContext[0], // Mantieni il messaggio di sistema
              ...this.conversationContext.slice(-(this.maxContextLength))
            ];
          }
          
          this.messagesSubject.next([...currentMessages, newMessage, aiMessage]);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          console.error('Errore nella risposta AI:', error);
          this.handleAIError('Errore nella risposta AI. Passaggio alla modalità simulata.');
        }
      });
    } else {
      // Modalità simulata
      const inputCategory = this.categorizeInput(text);
      
      this.getSimulatedResponse(text, inputCategory).pipe(
        delay(Math.random() * 1000 + 1000) // Ritardo casuale tra 1-2 secondi
      ).subscribe(response => {
        const aiMessage: ChatMessage = {
          id: currentMessages.length + 2,
          text: response.text,
          sender: 'ai',
          timestamp: new Date(),
          feedback: response.feedback
        };

        this.messagesSubject.next([...currentMessages, newMessage, aiMessage]);
        this.loadingSubject.next(false);
      });
    }
  }

  // Gestisci errori AI e passa alla modalità simulata
  private handleAIError(errorMessage: string): void {
    this.useAIMode = false; // Disattiva temporaneamente la modalità AI
    this.errorSubject.next(errorMessage);
    
    // Prendi l'ultimo messaggio utente
    const currentMessages = this.messagesSubject.value;
    const lastUserMessage = currentMessages[currentMessages.length - 1];
    
    if (lastUserMessage && lastUserMessage.sender === 'user') {
      const inputCategory = this.categorizeInput(lastUserMessage.text);
      
      this.getSimulatedResponse(lastUserMessage.text, inputCategory).pipe(
        delay(Math.random() * 1000 + 1000)
      ).subscribe(response => {
        const aiMessage: ChatMessage = {
          id: currentMessages.length + 1,
          text: response.text,
          sender: 'ai',
          timestamp: new Date(),
          feedback: response.feedback
        };

        this.messagesSubject.next([...currentMessages, aiMessage]);
        this.loadingSubject.next(false);
      });
    } else {
      this.loadingSubject.next(false);
    }
  }

  // Categorizza l'input dell'utente
  private categorizeInput(text: string): string {
    text = text.toLowerCase();
    
    // Saluti
    if (/^(ciao|salve|hey|ehi|buon(giorno|asera|anotte)|come va|come stai)/i.test(text)) {
      return 'greeting';
    }
    
    // Domande
    if (/^(cosa|come|perché|quando|dove|chi|quale|puoi|potresti|sai|pensi|credi|secondo te).+\?/i.test(text)) {
      return 'question';
    }
    
    // Complimenti
    if (/\b(bell[ao]|carin[ao]|dolce|gentile|simpatica|intelligente|interessante|mi piaci)\b/i.test(text)) {
      return 'compliment';
    }
    
    // Interessi/Hobby
    if (/\b(hobby|interess[ei]|passion[ei]|sport|film|libri|musica|viaggi|viaggiare|leggere|ascoltare|guardare|giocare)\b/i.test(text)) {
      return 'interests';
    }
    
    // Personale
    if (/\b(vivi|abiti|lavori|studi|scuola|università|fidanzat[ao]|single|relazione|famiglia|fratell[oi]|sorell[ae]|genitori|età|anni)\b/i.test(text)) {
      return 'personal';
    }
    
    // Default
    return 'generic';
  }

  // Ottieni risposta AI reale
  private getAIResponse(userInput: string): Observable<{ text: string, feedback: string }> {
    if (!this.userProfile.apiKey) {
      return throwError(() => new Error('API key non impostata'));
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.userProfile.apiKey}`
    });

    const body = {
      model: 'gpt-3.5-turbo', // Puoi usare 'gpt-4' per risposte migliori
      messages: this.conversationContext,
      temperature: 0.7,
      max_tokens: 300
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      map((response: any) => {
        const messageContent = response.choices[0].message.content;
        
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

  // Genera una risposta simulata (modalità offline)
  private getSimulatedResponse(userInput: string, category: string): Observable<{ text: string, feedback: string }> {
    // Ottieni le risposte disponibili per la personalità e categoria
    const availableResponses = this.responseMappings[this.currentPersonality as keyof typeof this.responseMappings][category as keyof (typeof this.responseMappings)['default']];
    
    // Seleziona una risposta casuale
    const randomIndex = Math.floor(Math.random() * availableResponses.length);
    const response = availableResponses[randomIndex];
    
    // Genera un feedback basato sul contenuto dell'input utente
    const feedback = this.generateFeedback(userInput);
    
    return of({ text: response, feedback });
  }

  // Genera feedback basato sull'input dell'utente
  private generateFeedback(userInput: string): string {
    if (!userInput) return ''; // No feedback for initial greeting
    
    const input = userInput.toLowerCase();
    let feedbackType: 'positive' | 'negative' | 'neutral';
    
    // Determina il tipo di feedback in base ad alcune euristiche
    if (input.length < 10) {
      feedbackType = 'negative'; // Messaggio troppo breve
    } else if (/\?/.test(input) && input.length > 20) {
      feedbackType = 'positive'; // Domanda dettagliata
    } else if (/\b(io|me|mio|mia|miei|mie)\b/i.test(input) && !/\b(tu|tuo|tua|tuoi|tue)\b/i.test(input)) {
      feedbackType = 'negative'; // Parla solo di sé
    } else if (/\b(tu|tuo|tua|tuoi|tue)\b/i.test(input)) {
      feedbackType = 'positive'; // Mostra interesse nell'altra persona
    } else {
      feedbackType = 'neutral'; // Default
    }
    
    // Scegli un feedback casuale dalla categoria appropriata
    const feedbackOptions = this.feedbackTemplates[feedbackType];
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }
}