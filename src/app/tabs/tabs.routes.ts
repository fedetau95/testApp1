import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('../chat-simulation/chat-simulation.page').then((m) => m.ChatSimulationPage),
      },
      {
        path: 'tips',
        loadComponent: () =>
          import('../tips/tips.page').then((m) => m.TipsPage),
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('../quiz/quiz.page').then((m) => m.QuizPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
];