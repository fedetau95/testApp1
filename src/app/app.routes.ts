import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'chat',
        loadComponent: () => import('./chat-simulation/chat-simulation.page').then(m => m.ChatSimulationPage),
      },
      {
        path: 'tips',
        loadComponent: () => import('./tips/tips.page').then(m => m.TipsPage),
      },
      {
        path: 'quiz',
        loadComponent: () => import('./quiz/quiz.page').then(m => m.QuizPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  // Se hai una rotta dedicata per api-settings, modificala così:
  {
    path: 'api-settings',
    loadComponent: () => import('./components/api-settings/api-settings.page').then(m => m.ApiSettingsComponent),
  }
];