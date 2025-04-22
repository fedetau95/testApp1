import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-api-key-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Configurazione AI</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Per utilizzare TalkMate con risposte AI reali, è necessaria una API key di OpenAI. La chiave verrà salvata solo nel tuo dispositivo.</p>
      
      <ion-item>
        <ion-label position="stacked">API Key di OpenAI</ion-label>
        <ion-input 
          type="password" 
          [(ngModel)]="apiKey" 
          placeholder="sk-...">
        </ion-input>
        <ion-note>La tua API key sarà salvata solo sul tuo dispositivo</ion-note>
      </ion-item>

      <div class="instructions ion-padding">
        <h4>Come ottenere una API key:</h4>
        <ol>
          <li>Crea un account su <a href="https://platform.openai.com" target="_blank">platform.openai.com</a></li>
          <li>Vai alla sezione "API keys"</li>
          <li>Clicca su "Create new secret key"</li>
          <li>Copia la chiave generata e incollala qui</li>
        </ol>
        <p><strong>Nota:</strong> L'utilizzo dell'API di OpenAI potrebbe comportare costi in base al volume di messaggi. Consulta la loro documentazione per i dettagli sui prezzi.</p>
      </div>

      <ion-button expand="block" (click)="saveApiKey()" [disabled]="!isValidApiKey()">
        Salva API Key
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .instructions {
      margin-top: 20px;
      margin-bottom: 20px;
      background-color: #f8f8f8;
      border-radius: 8px;
    }
  `],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonNote
  ]
})
export class ApiKeyModalComponent implements OnInit {
  private chatService = inject(ChatService);
  apiKey: string = '';

  constructor(private modalController: ModalController) {
    addIcons({ close });
  }

  ngOnInit(): void { }

  isValidApiKey(): boolean {
    return this.apiKey.trim().startsWith('sk-') && this.apiKey.length > 10;
  }

  async saveApiKey(): Promise<void> {
    if (this.isValidApiKey()) {
      try {
        await this.chatService.setApiKey(this.apiKey);
        this.modalController.dismiss({
          success: true
        });
      } catch (error) {
        console.error('Errore nel salvare l\'API key:', error);
      }
    }
  }

  dismiss(): void {
    this.modalController.dismiss();
  }
}