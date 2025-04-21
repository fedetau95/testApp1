import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { PersonalityType } from '../services/chat.service';
import { NgFor } from '@angular/common';

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
  styles: [],
  standalone: true,
  imports: [IonicModule, NgFor]
})
export class PersonalityModalComponent {
  @Input() personalities: PersonalityType[] | undefined;

  constructor(private modalController: ModalController) { }

  selectPersonality(personality: PersonalityType) {
    this.modalController.dismiss({
      personality: personality
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}