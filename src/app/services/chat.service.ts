// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
  // Chat messages observable
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Selected personality
  private currentPersonality: keyof typeof this.responses = 'default';

  // Personality types
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

  // Canned responses based on personality
  private responses = {
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

  // Feedback templates
  private feedback = {
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

  // Set personality
  setPersonality(personalityId: string): void {
    if (this.personalities.some(p => p.id === personalityId)) {
      this.currentPersonality = personalityId as 'timida' | 'diretta' | 'sarcastica' | 'default';
      this.resetChat();
    }
  }

  // Reset chat
  resetChat(): void {
    const welcomeMessage = this.getRandomResponse();
    this.messagesSubject.next([{
      id: 1,
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date()
    }]);
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

    // Simulate AI response after a short delay
    setTimeout(() => {
      this.addAiResponse();
    }, 1000);
  }

  // Add AI response
  private addAiResponse(): void {
    const currentMessages = this.messagesSubject.value;
    const response = this.getRandomResponse();
    const feedback = Math.random() > 0.7 ? this.getRandomFeedback() : null;

    let responseText = response;
    if (feedback) {
      responseText += '\n\n[Coach: ' + feedback + ']';
    }

    const newMessage: ChatMessage = {
      id: currentMessages.length + 1,
      text: responseText,
      sender: 'ai',
      timestamp: new Date()
    };

    this.messagesSubject.next([...currentMessages, newMessage]);
  }

  // Get random response based on current personality
  private getRandomResponse(): string {
    const responseList = this.responses[this.currentPersonality];
    const randomIndex = Math.floor(Math.random() * responseList.length);
    return responseList[randomIndex];
  }

  // Get random feedback
  private getRandomFeedback(): string {
    const feedbackType = Math.random() > 0.5 ? 'positive' : 'negative';
    const feedbackList = this.feedback[feedbackType];
    const randomIndex = Math.floor(Math.random() * feedbackList.length);
    return feedbackList[randomIndex];
  }
}