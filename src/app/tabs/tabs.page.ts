import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, chatbubbles, bulb, gameController } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon aria-hidden="true" name="home"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="chat" href="/tabs/chat">
          <ion-icon aria-hidden="true" name="chatbubbles"></ion-icon>
          <ion-label>Chat</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="tips" href="/tabs/tips">
          <ion-icon aria-hidden="true" name="bulb"></ion-icon>
          <ion-label>Tips</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="quiz" href="/tabs/quiz">
          <ion-icon aria-hidden="true" name="game-controller"></ion-icon>
          <ion-label>Quiz</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: var(--ion-color-primary);
      --color: rgba(255, 255, 255, 0.7);
      --color-selected: var(--ion-color-light);
    }
    
    ion-tab-button {
      --ripple-color: var(--ion-color-light);
    }
    
    ion-icon {
      font-size: 24px;
    }
  `],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
  constructor() {
    addIcons({ home, chatbubbles, bulb, gameController });
  }
}