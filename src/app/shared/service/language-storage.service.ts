import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageStorageService {

  constructor() { }

  public getLanguageSettings() {
    return JSON.parse(localStorage.getItem('LANGUAGE'));
  }

  public setLanguageSettings(settings: {
    language: any
  }): void {
    return localStorage.setItem('LANGUAGE', JSON.stringify(settings));
  }

}
