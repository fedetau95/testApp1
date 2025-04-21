import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { PersonalityType } from '../../services/chat.service';

@Component({
  selector: 'app-personality-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Scegli Personalità</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let personality of personalities" (click)="selectPersonality(personality)">
          <ion-label>
            <h2>{{ personality.name }}</h2>
            <p>{{ personality.description }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel,
    NgFor
  ]
})
export class PersonalityModalComponent {
  @Input() personalities: PersonalityType[] = [];
  
  constructor(private modalController: ModalController) {
    addIcons({ close });
  }
  
  selectPersonality(personality: PersonalityType) {
    this.modalController.dismiss({
      personality: personality
    });
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}