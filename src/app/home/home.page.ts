import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonCardSubtitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbles, bulb, gameController } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          TalkMate
        </ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="welcome-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Benvenuto su TalkMate</ion-card-title>
            <ion-card-subtitle>Il tuo assistente per migliorare le tue conversazioni</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <p>
              TalkMate ti aiuta a migliorare le tue capacità conversazionali attraverso simulazioni realistiche, 
              consigli pratici e quiz interattivi.
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
              1. Scegli una personalità nella sezione Chat<br>
              2. Inizia una conversazione simulata<br>
              3. Ricevi feedback in tempo reale dal coach AI<br>
              4. Consulta i consigli nella sezione Tips
            </p>
          </ion-card-content>
        </ion-card>
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
    RouterLink
  ]
})
export class HomePage {
  constructor() {
    addIcons({ chatbubbles, bulb, gameController });
  }
}