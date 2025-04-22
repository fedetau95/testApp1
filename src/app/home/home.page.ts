import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonCardSubtitle, 
  IonIcon,
  IonButton,
  IonButtons,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbles, bulb, gameController, settingsOutline } from 'ionicons/icons';
import { ApiKeyModalComponent } from '../components/api-key-modal/api-key-modal.component';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          TalkMate
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openAISettings()">
            <ion-icon name="settings-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="welcome-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Benvenuto su TalkMate</ion-card-title>
            <ion-card-subtitle>Il tuo assistente AI per migliorare le tue conversazioni</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <p>
              TalkMate ti aiuta a migliorare le tue capacità conversazionali attraverso simulazioni realistiche, 
              consigli pratici e quiz interattivi.
            </p>

            <p>
              <strong>Powered by AI:</strong> Ottieni risposte realistiche e feedback personalizzato basato 
              sulle tue interazioni.
            </p>
          </ion-card-content>
        </ion-card>
        
        <div class="features-grid">
          <ion-card button [routerLink]="['/tabs/chat']" class="feature-card">
            <ion-card-header>
              <ion-icon name="chatbubbles" size="large"></ion-icon>
              <ion-card-title>Simulazione Chat</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Esercitati con chat realistiche e ricevi feedback in tempo reale
            </ion-card-content>
          </ion-card>
          
          <ion-card button [routerLink]="['/tabs/tips']" class="feature-card">
            <ion-card-header>
              <ion-icon name="bulb" size="large"></ion-icon>
              <ion-card-title>Tips & Tricks</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Scopri consigli e strategie efficaci per conversazioni di successo
            </ion-card-content>
          </ion-card>
          
          <ion-card button [routerLink]="['/tabs/quiz']" class="feature-card">
            <ion-card-header>
              <ion-icon name="game-controller" size="large"></ion-icon>
              <ion-card-title>Quiz</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Metti alla prova le tue conoscenze con quiz interattivi
            </ion-card-content>
          </ion-card>
        </div>
        
        <ion-card>
          <ion-card-header>
            <ion-card-title>Come iniziare</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>
              1. Configura l'AI nell'impostazioni (tasto in alto a destra)<br>
              2. Scegli una personalità nella sezione Chat<br>
              3. Inizia una conversazione simulata<br>
              4. Ricevi feedback in tempo reale dal coach AI<br>
              5. Consulta i consigli nella sezione Tips
            </p>
          </ion-card-content>
        </ion-card>
        
        <ion-button expand="block" (click)="openAISettings()" color="secondary">
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          Configura l'AI
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .welcome-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    
    .feature-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-card ion-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .feature-card ion-icon {
      margin-bottom: 10px;
      color: var(--ion-color-primary);
    }
    
    .feature-card ion-card-content {
      text-align: center;
    }
  `],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle,
    IonCardContent, 
    IonIcon,
    IonButton,
    IonButtons,
    RouterLink
  ]
})
export class HomePage {
  private modalController = inject(ModalController);
  
  constructor() {
    addIcons({ chatbubbles, bulb, gameController, settingsOutline });
  }
  
  async openAISettings() {
    const modal = await this.modalController.create({
      component: ApiKeyModalComponent
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      // Se l'utente ha configurato con successo l'API key, possiamo mostrare un messaggio
      console.log('API key configurata con successo');
      // Qui puoi aggiungere un toast o un alert per confermare all'utente
    }
  }
}