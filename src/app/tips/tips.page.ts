import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

interface Tip {
  title: string;
  content: string;
}

@Component({
  selector: 'app-tips',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Tips & Tricks</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="tips-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Consigli per una conversazione efficace</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>
              Questi consigli ti aiuteranno a migliorare le tue capacità conversazionali in diverse situazioni.
              Esplora le varie categorie per imparare tecniche efficaci e suggerimenti pratici.
            </p>
          </ion-card-content>
        </ion-card>
        
        <!-- Sezione Approccio -->
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header" color="light">
              <ion-label>Come approcciarsi</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              <ion-card *ngFor="let tip of approccioTips">
                <ion-card-header>
                  <ion-card-title>{{ tip.title }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ tip.content }}
                </ion-card-content>
              </ion-card>
            </div>
          </ion-accordion>
          
          <!-- Sezione Conversazione -->
          <ion-accordion value="second">
            <ion-item slot="header" color="light">
              <ion-label>Mantenere la conversazione</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              <ion-card *ngFor="let tip of conversazioneTips">
                <ion-card-header>
                  <ion-card-title>{{ tip.title }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ tip.content }}
                </ion-card-content>
              </ion-card>
            </div>
          </ion-accordion>
          
          <!-- Sezione Errori da evitare -->
          <ion-accordion value="third">
            <ion-item slot="header" color="light">
              <ion-label>Errori da evitare</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              <ion-card *ngFor="let tip of erroriTips">
                <ion-card-header>
                  <ion-card-title>{{ tip.title }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ tip.content }}
                </ion-card-content>
              </ion-card>
            </div>
          </ion-accordion>
          
          <!-- Sezione Segnali non verbali -->
          <ion-accordion value="fourth">
            <ion-item slot="header" color="light">
              <ion-label>Segnali non verbali</ion-label>
            </ion-item>
            <div class="ion-padding" slot="content">
              <ion-card *ngFor="let tip of segnaliTips">
                <ion-card-header>
                  <ion-card-title>{{ tip.title }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ tip.content }}
                </ion-card-content>
              </ion-card>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </div>
    </ion-content>
  `,
  styles: [`
    .tips-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    ion-card {
      margin-bottom: 16px;
    }
    
    ion-accordion-group {
      margin-top: 20px;
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
    IonCardContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    NgFor
  ]
})
export class TipsPage {
  // Tips per l'approccio iniziale
  approccioTips: Tip[] = [
    {
      title: 'Domande aperte',
      content: 'Inizia con domande aperte che richiedono più di un "sì" o "no" come risposta. Esempio: "Cosa ne pensi di questo evento?" invece di "Ti piace questo evento?"'
    },
    {
      title: 'Osservazione contestuale',
      content: 'Fai un\'osservazione sull\'ambiente circostante o su qualcosa di rilevante per la situazione. Questo appare più naturale di approcci generici.'
    },
    {
      title: 'Complimenti specifici',
      content: 'Se fai un complimento, assicurati che sia specifico e sincero. Ad esempio, "Mi piace molto come hai espresso quel concetto prima" è meglio di "Sei molto carina".'
    },
    {
      title: 'Interesse genuino',
      content: 'Mostra un interesse genuino. Le persone percepiscono quando qualcuno è sinceramente interessato o sta solo seguendo un copione.'
    }
  ];

  // Tips per mantenere la conversazione
  conversazioneTips: Tip[] = [
    {
      title: 'Tecnica del follow-up',
      content: 'Quando qualcuno condivide qualcosa, fai una domanda di approfondimento su ciò che ha detto, anziché cambiare subito argomento.'
    },
    {
      title: 'Ascolto attivo',
      content: 'Mostra che stai ascoltando attraverso cenni, brevi conferme vocali e riformulando occasionalmente ciò che la persona ha detto.'
    },
    {
      title: 'Condivisione personale',
      content: 'Condividi esperienze personali rilevanti, ma senza monopolizzare la conversazione o cercare di "superare" l\'altra persona.'
    },
    {
      title: 'Pausa strategica',
      content: 'Non temere i brevi silenzi. A volte una pausa di 2-3 secondi può incoraggiare l\'altra persona ad aggiungere qualcosa di più profondo.'
    },
    {
      title: 'Cambiamenti di argomento fluidi',
      content: 'Per cambiare argomento in modo naturale, cerca collegamenti tra ciò di cui state parlando e il nuovo tema.'
    }
  ];

  // Tips sugli errori da evitare
  erroriTips: Tip[] = [
    {
      title: 'Interruzioni frequenti',
      content: 'Evita di interrompere costantemente. Lascia che l\'altra persona completi i suoi pensieri prima di rispondere.'
    },
    {
      title: 'Comportamento distratto',
      content: 'Non controllare il telefono o guardarti intorno mentre qualcuno ti parla. L\'attenzione completa è un segno di rispetto.'
    },
    {
      title: 'Conversazione centrata su di sé',
      content: 'Evita di riportare ogni argomento a te stesso o di rispondere a ogni storia con una tua storia "migliore".'
    },
    {
      title: 'Domande invasive',
      content: 'Non fare domande troppo personali nelle prime fasi di conoscenza. Rispetta i confini dell\'altra persona.'
    },
    {
      title: 'Giudizi affrettati',
      content: 'Evita di esprimere giudizi o opinioni troppo forti su argomenti che potrebbero essere sensibili (politica, religione, ecc.) all\'inizio di una conoscenza.'
    }
  ];

  // Tips sui segnali non verbali
  segnaliTips: Tip[] = [
    {
      title: 'Contatto visivo',
      content: 'Mantieni un contatto visivo adeguato (circa 60-70% del tempo), ma senza fissare in modo eccessivo che potrebbe mettere a disagio.'
    },
    {
      title: 'Postura',
      content: 'Una postura aperta (non incrociare braccia o gambe) comunica apertura e interesse. Inclinati leggermente verso la persona quando parla.'
    },
    {
      title: 'Espressione facciale',
      content: 'Un leggero sorriso e un\'espressione rilassata creano un\'atmosfera positiva. Le tue espressioni dovrebbero rispecchiare il tono della conversazione.'
    },
    {
      title: 'Distanza interpersonale',
      content: 'Rispetta lo spazio personale. La distanza confortevole dipende dalla cultura e dal contesto, ma generalmente 60-90 cm è appropriata per conversazioni informali.'
    },
    {
      title: 'Gesti delle mani',
      content: 'Gesti moderati delle mani possono enfatizzare ciò che stai dicendo e renderti più espressivo, ma evita movimenti eccessivi o nervosi.'
    }
  ];
}