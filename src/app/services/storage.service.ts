// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // Salva un valore
  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (error) {
      console.error('Errore nel salvare i dati:', error);
    }
  }

  // Recupera un valore
  async get(key: string): Promise<any> {
    try {
      const value = localStorage.getItem(key);
      
      if (!value) {
        return null;
      }
      
      try {
        // Prova a interpretarlo come JSON
        return JSON.parse(value);
      } catch (e) {
        // Se non è JSON, restituisci la stringa originale
        return value;
      }
    } catch (error) {
      console.error('Errore nel recuperare i dati:', error);
      return null;
    }
  }

  // Rimuovi un valore
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Errore nel rimuovere i dati:', error);
    }
  }

  // Pulisci tutti i valori
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Errore nel pulire i dati:', error);
    }
  }
}