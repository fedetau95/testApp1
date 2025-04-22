import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
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
  IonSpinner,
  IonToast,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, refreshOutline, send, settingsOutline } from 'ionicons/icons';

import { ChatService, ChatMessage } from '../services/chat.service';
import { PersonalityModalComponent } from '../components/personality-modal/personality-modal.component';
import { ApiSettingsComponent } from '../components/api-settings/api-settings.page'; // Adjust the path as needed

@Component({
  selector: 'app-chat-simulation',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Chat Simulation</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openAISettings()">
            <ion-icon name="settings-outline"></ion-icon>
          </ion-button>
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
              <div class="message-text">{{ message.text }}</div>
              <div *ngIf="message.feedback" class="coach-feedback">
                [Coach: {{ message.feedback }}]
              </div>
              <div class="message-time">{{ message.timestamp | date:'shortTime' }}</div>
            </div>
          </div>
          
          <!-- Indicatore "sta scrivendo" -->
          <div *ngIf="loading$ | async" class="ai-message typing-indicator">
            <div class="message-bubble">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Messaggio di errore -->
      <ion-toast
        [isOpen]="!!(error$ | async)"
        [message]="error$ | async"
        [duration]="5000"
        position="top"
        color="warning"
      ></ion-toast>
    </ion-content>
    
    <ion-footer>
      <ion-toolbar>
        <ion-item>
          <ion-input 
            placeholder="Scrivi un messaggio..." 
            [(ngModel)]="newMessage" 
            (keyup.enter)="sendMessage()"
            [disabled]="(loading$ | async) ?? false">
          </ion-input>
          <ion-button slot="end" (click)="sendMessage()" [disabled]="!newMessage.trim() || (loading$ | async)">
            <ion-icon *ngIf="!(loading$ | async)" name="send"></ion-icon>
            <ion-spinner *ngIf="loading$ | async" name="dots"></ion-spinner>
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
    
    /* Indicatore di digitazione */
    .typing-indicator .message-bubble {
      padding: 12px 20px;
    }
    
    .typing-dots {
      display: flex;
      justify-content: center;
    }
    
    .typing-dots span {
      height: 8px;
      width: 8px;
      margin: 0 3px;
      background-color: #999;
      border-radius: 50%;
      opacity: 0.4;
      animation: blink 1.4s infinite both;
    }
    
    .typing-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes blink {
      0% { opacity: 0.4; }
      20% { opacity: 1; }
      100% { opacity: 0.4; }
    }
  `],
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgFor,
    NgIf,
    DatePipe,
    AsyncPipe,
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
    IonSpinner,
    IonToast
  ]
})
export class ChatSimulationPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  private chatService = inject(ChatService);
  private modalController = inject(ModalController);

  messages: ChatMessage[] = [];
  newMessage: string = '';
  loading$ = this.chatService.loading$;
  error$ = this.chatService.error$;

  constructor() {
    addIcons({ personCircleOutline, refreshOutline, send, settingsOutline });
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

  async openAISettings() {
    const modal = await this.modalController.create({
      component: ApiSettingsComponent
    });

    await modal.present();

    // Quando il modale viene chiuso, potremmo voler aggiornare qualcosa
    await modal.onDidDismiss();
  }

  private scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }
}