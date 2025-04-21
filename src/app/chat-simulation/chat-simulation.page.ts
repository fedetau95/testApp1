// src/app/chat-simulation/chat-simulation.page.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, DatePipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonFooter,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, refreshOutline, send } from 'ionicons/icons';

import { ChatService, ChatMessage } from '../services/chat.service';
import { PersonalityModalComponent } from '../components/personality-modal/personality-modal.component';

@Component({
  selector: 'app-chat-simulation',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Chat Simulation</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openPersonalityModal()">
            <ion-icon name="person-circle-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="resetChat()">
            <ion-icon name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="chat-container">
        <div class="message-list">
          <div *ngFor="let message of messages" 
              [ngClass]="{'user-message': message.sender === 'user', 'ai-message': message.sender === 'ai'}">
            <div class="message-bubble">
              <div class="message-text" [innerHTML]="formatMessage(message.text)"></div>
              <div class="message-time">{{ message.timestamp | date:'shortTime' }}</div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-item>
          <ion-input 
            placeholder="Scrivi un messaggio..." 
            [(ngModel)]="newMessage" 
            (keyup.enter)="sendMessage()">
          </ion-input>
          <ion-button slot="end" (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <ion-icon name="send"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #f5f5f5;
      padding: 10px;
    }
    
    .message-list {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      margin-bottom: 10px;
    }
    
    .user-message, .ai-message {
      display: flex;
      margin-bottom: 10px;
    }
    
    .user-message {
      justify-content: flex-end;
    }
    
    .ai-message {
      justify-content: flex-start;
    }
    
    .message-bubble {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 18px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .user-message .message-bubble {
      background-color: #007bff;
      color: white;
      border-bottom-right-radius: 5px;
    }
    
    .ai-message .message-bubble {
      background-color: white;
      color: #333;
      border-bottom-left-radius: 5px;
    }
    
    .message-text {
      margin-bottom: 5px;
      white-space: pre-wrap;
    }
    
    .message-time {
      font-size: 0.7em;
      text-align: right;
      opacity: 0.7;
    }
    
    .coach-feedback {
      font-style: italic;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed rgba(0, 0, 0, 0.1);
    }
  `],
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgFor,
    DatePipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonFooter
  ]
})
export class ChatSimulationPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  private chatService = inject(ChatService);
  private modalController = inject(ModalController);

  messages: ChatMessage[] = [];
  newMessage: string = '';

  constructor() {
    addIcons({ personCircleOutline, refreshOutline, send });
  }

  ngOnInit() {
    // Subscribe to messages
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      // Scroll to bottom after messages update
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    });

    // Start with a fresh chat
    this.resetChat();
  }

  sendMessage() {
    if (this.newMessage?.trim()) {
      this.chatService.addUserMessage(this.newMessage.trim());
      this.newMessage = '';
    }
  }

  resetChat() {
    this.chatService.resetChat();
  }

  async openPersonalityModal() {
    const modal = await this.modalController.create({
      component: PersonalityModalComponent,
      componentProps: {
        personalities: this.chatService.personalities
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.personality) {
      this.chatService.setPersonality(data.personality.id);
    }
  }

  formatMessage(text: string): string {
    // Convert line breaks to HTML and handle feedback section
    if (text.includes('[Coach:')) {
      const parts = text.split('[Coach:');
      const message = parts[0].replace(/\n/g, '<br>');
      const feedback = parts[1].replace(/\n/g, '<br>').replace(']', '');
      return `${message}<div class="coach-feedback">[Coach: ${feedback}]</div>`;
    }
    return text.replace(/\n/g, '<br>');
  }

  private scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
}