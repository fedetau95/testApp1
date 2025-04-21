import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonProgressBar, IonList, IonRadioGroup, IonItem, IonLabel,
  IonRadio, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonProgressBar,
    IonList,
    IonRadioGroup,
    IonItem,
    IonLabel,
    IonRadio,
    IonButton,
    IonIcon,
  ]
})
export class QuizPage implements OnInit {
  quizStarted: boolean = false;
  quizCompleted: boolean = false;
  currentQuestionIndex: number = 0;
  selectedAnswer: number | null = null;
  score: number = 0;
  userAnswers: number[] = [];
  currentProgress: number = 0;

  questions: QuizQuestion[] = [
    {
      question: "Qual è il modo migliore per iniziare una conversazione con qualcuno che non conosci?",
      options: [
        "Fare un complimento sul suo aspetto fisico",
        "Fare una domanda aperta su qualcosa di osservabile nell'ambiente",
        "Parlare subito dei tuoi interessi personali",
        "Raccontare una barzelletta divertente"
      ],
      correctAnswer: 1,
      explanation: "Le domande aperte su qualcosa nell'ambiente circostante (come un libro, un evento, ecc.) sono un modo naturale e non invasivo per iniziare una conversazione."
    },
    {
      question: "Durante una conversazione, quale di queste azioni dovresti evitare?",
      options: [
        "Mantenere un contatto visivo moderato",
        "Fare domande di approfondimento",
        "Controllare frequentemente il telefono",
        "Condividere brevi esperienze personali correlate"
      ],
      correctAnswer: 2,
      explanation: "Controllare frequentemente il telefono mostra disinteresse e rompe il flusso della conversazione."
    },
    {
      question: "Se l'altra persona sembra poco interessata alla conversazione, cosa dovresti fare?",
      options: [
        "Continuare a parlare di più argomenti finché non trovi quello che le interessa",
        "Parlare più forte per attirare la sua attenzione",
        "Chiedere direttamente perché non è interessata",
        "Rispettare i segnali e concludere la conversazione con gentilezza"
      ],
      correctAnswer: 3,
      explanation: "È importante riconoscere e rispettare quando l'altra persona non è interessata, concludendo la conversazione in modo gentile."
    },
    {
      question: "Quale di questi è un buon modo per fare un complimento?",
      options: [
        "Wow, sei davvero bellissima, molto più delle altre ragazze qui!",
        "Mi piace come hai espresso quel concetto, è interessante come ragioni",
        "Non sei come le altre ragazze, sei diversa",
        "Devi avere molti pretendenti con quel fisico"
      ],
      correctAnswer: 1,
      explanation: "I complimenti migliori sono quelli specifici e non basati solo sull'aspetto fisico o su confronti con altre persone."
    },
    {
      question: "Quando parli dei tuoi interessi in una conversazione, quale approccio è più efficace?",
      options: [
        "Parlare in dettaglio di ogni tuo interesse per impressionare l'altra persona",
        "Parlare solo degli interessi che pensi possano piacere anche all'altra persona",
        "Condividere brevemente i tuoi interessi e poi chiedere dei suoi",
        "Evitare di parlare dei tuoi interessi per non sembrare egocentrico"
      ],
      correctAnswer: 2,
      explanation: "Condividere brevemente i tuoi interessi e poi chiedere all'altra persona dei suoi crea un equilibrio e mostra interesse reciproco."
    }
  ];

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  constructor() {
    addIcons({ checkmarkCircle, closeCircle });
  }

  ngOnInit() {
  }

  startQuiz() {
    this.quizStarted = true;
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.selectedAnswer = null;
    this.updateProgress();
  }

  submitAnswer() {
    if (this.selectedAnswer === null) return;

    // Salvare la risposta dell'utente
    this.userAnswers[this.currentQuestionIndex] = this.selectedAnswer;

    // Aggiornare il punteggio
    if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
      this.score++;
    }

    // Passare alla prossima domanda o completare il quiz
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.updateProgress();
    } else {
      this.completeQuiz();
    }
  }

  completeQuiz() {
    this.quizCompleted = true;
  }

  restartQuiz() {
    this.startQuiz();
  }

  updateProgress() {
    this.currentProgress = (this.currentQuestionIndex) / this.questions.length;
  }

  getFeedbackMessage(): string {
    const percentage = (this.score / this.questions.length) * 100;

    if (percentage >= 80) {
      return "Eccellente! Hai dimostrato ottime capacità di comunicazione. Continua così!";
    } else if (percentage >= 60) {
      return "Buon risultato! Hai una buona comprensione delle dinamiche di conversazione, ma c'è ancora margine di miglioramento.";
    } else if (percentage >= 40) {
      return "Sei sulla buona strada, ma dovresti rivedere alcuni concetti fondamentali sulle conversazioni efficaci.";
    } else {
      return "C'è molto spazio per migliorare. Ti consigliamo di leggere la sezione Tips & Tricks e provare ancora la simulazione chat.";
    }
  }
}