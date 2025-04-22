import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-api-settings',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Impostazioni AI</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Status Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Stato AI</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="status-container">
            <div class="status-item">
              <div class="status-label">Crediti</div>
              <div class="status-value">
                <ion-badge color="primary">{{ userStatus.credits }}</ion-badge>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">Account</div>
              <div class="status-value">
                <ion-badge color="{{ userStatus.isPremium ? 'success' : 'medium' }}">
                  {{ userStatus.isPremium ? 'Premium' : 'Standard' }}
                </ion-badge>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">Modalità AI</div>
              <div class="status-value">
                <ion-badge color="{{ useAI ? 'success' : 'medium' }}">
                  {{ useAI ? 'Attiva' : 'Disattivata' }}
                </ion-badge>
              </div>
            </div>
          </div>
          
          <ion-item lines="none" class="toggle-item">
            <ion-label>Usa risposte AI (consuma crediti)</ion-label>
            <ion-toggle 
              [checked]="useAI" 
              [disabled]="!canToggleAI" 
              (ionChange)="toggleAIMode($event)">
            </ion-toggle>
          </ion-item>
          
          <div *ngIf="!canToggleAI && !userStatus.isPremium && userStatus.credits === 0" class="info-message">
            Acquista crediti o passa a Premium per utilizzare le risposte AI
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- API Key Input Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>API Key OpenAI</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            Inserisci la tua API key di OpenAI per utilizzare risposte AI personalizzate.
            Puoi ottenere una key dalla <a href="https://platform.openai.com/api-keys" target="_blank">dashboard di OpenAI</a>.
          </p>
          
          <ion-item>
            <ion-input 
              type="password" 
              placeholder="Inserisci API key" 
              [(ngModel)]="apiKey" 
              (ionInput)="onKeyChanged()">
            </ion-input>
            <ion-button slot="end" fill="clear" (click)="saveApiKey()">Salva</ion-button>
          </ion-item>
          
          <div *ngIf="hasApiKey" class="info-message success">
            API Key salvata ✓
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- Premium Options Card -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Acquista Crediti o Premium</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item button (click)="purchaseCredits(10)">
              <ion-label>
                <h2>10 Crediti</h2>
                <p>€2.99</p>
              </ion-label>
            </ion-item>
            
            <ion-item button (click)="purchaseCredits(50)">
              <ion-label>
                <h2>50 Crediti</h2>
                <p>€9.99</p>
              </ion-label>
            </ion-item>
            
            <ion-item button (click)="purchasePremium()">
              <ion-label>
                <h2>Abbonamento Premium</h2>
                <p>€4.99/mese - Crediti illimitati</p>
              </ion-label>
            </ion-item>
          </ion-list>
          
          <div class="info-message">
            <small>Nota: Per questa demo, i pagamenti sono simulati e non vengono realmente processati.</small>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .status-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    
    .status-item {
      text-align: center;
      padding: 5px;
    }
    
    .status-label {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin-bottom: 5px;
    }
    
    .status-value {
      font-weight: bold;
    }
    
    .toggle-item {
      margin-top: 10px;
    }
    
    .info-message {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin-top: 10px;
      padding: 8px;
      border-radius: 4px;
      background-color: rgba(var(--ion-color-medium-rgb), 0.1);
    }
    
    .info-message.success {
      color: var(--ion-color-success);
      background-color: rgba(var(--ion-color-success-rgb), 0.1);
    }
  `],
  standalone: true,
  providers: [ChatService],
  imports: [
    FormsModule,
    NgIf,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge
  ]
})
export class ApiSettingsComponent implements OnInit {
  apiKey: string = '';
  useAI: boolean = false;
  hasApiKey: boolean = false;
  canToggleAI: boolean = false;

  userStatus = {
    credits: 0,
    isPremium: false,
    hasApiKey: false
  };

  constructor(
    private chatService: ChatService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({ close });
  }

  ngOnInit() {
    // Carica lo stato attuale
    this.userStatus = this.chatService.getUserStatus();
    this.hasApiKey = this.userStatus.hasApiKey;

    // Determina se l'utente può utilizzare l'AI
    this.canToggleAI = this.userStatus.isPremium || (this.userStatus.credits > 0 && this.userStatus.hasApiKey);

    // Imposta lo stato iniziale del toggle
    this.useAI = this.canToggleAI;
  }

  onKeyChanged() {
    // Reset della validazione quando l'utente modifica l'input
    this.hasApiKey = false;
  }

  saveApiKey() {
    if (this.apiKey && this.apiKey.trim().length > 0) {
      this.chatService.setApiKey(this.apiKey.trim());
      this.hasApiKey = true;
      this.userStatus.hasApiKey = true;

      // Aggiorna lo stato di attivazione AI
      this.canToggleAI = this.userStatus.isPremium || (this.userStatus.credits > 0 && this.userStatus.hasApiKey);

      this.presentToast('API key salvata con successo');
    } else {
      this.presentToast('Inserisci una API key valida', 'danger');
    }
  }

  toggleAIMode(event: any) {
    this.useAI = event.detail.checked;

    if (this.useAI && !this.canToggleAI) {
      this.useAI = false;
      this.presentToast('Non hai abbastanza crediti o devi inserire una API key', 'warning');
      return;
    }

    this.chatService.toggleAIMode(this.useAI);

    if (this.useAI) {
      this.presentToast('Modalità AI attivata');
    } else {
      this.presentToast('Modalità AI disattivata');
    }
  }

  purchaseCredits(amount: number) {
    // Qui dovresti implementare l'integrazione con un sistema di pagamento
    // Per questa demo, simuliamo semplicemente l'acquisto

    this.chatService.addCredits(amount);
    this.userStatus.credits += amount;

    // Aggiorna lo stato di attivazione AI
    this.canToggleAI = this.userStatus.isPremium || (this.userStatus.credits > 0 && this.userStatus.hasApiKey);

    this.presentToast(`Hai aggiunto ${amount} crediti al tuo account`);
  }

  purchasePremium() {
    // Qui dovresti implementare l'integrazione con un sistema di abbonamento
    // Per questa demo, simuliamo semplicemente l'acquisto

    this.chatService.setPremiumStatus(true);
    this.userStatus.isPremium = true;

    // Aggiorna lo stato di attivazione AI
    this.canToggleAI = true;

    this.presentToast('Hai attivato l\'abbonamento Premium!');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });

    await toast.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}