import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RemoveItemLocalStorageService {

  constructor() {
  }

  public removeFromLocalStorage() {
    const index = localStorage.length;
    for (let i = 0; i <= index; i++) {
      if (!this.checkItemInLocalSessionStorage(localStorage.key(i))) {
        localStorage.removeItem(localStorage.key(i));
      }
    }
  }

  public removeFromSessionStorage() {
    const index1 = localStorage.length;
    for (let i = 0; i <= index1; i++) {
      if (!this.checkItemInLocalSessionStorage(sessionStorage.key(i))) {
        sessionStorage.removeItem(sessionStorage.key(i));
      }
    }
  }

  public checkItemInLocalSessionStorage(check: string) {
    const list = ['ANOMALIE_GDH', 'COMPTEURS_EMPLOYES', 'DETAILS_PERIODE', 'DISPONIBILITES_RAPPORT',
                  'RAPPORT_OPERATIONNEL', 'PLANNING_EMPLOYEE', 'ABSENCES_RAPPORT', 'PLANNING_MANAGERS',
                  'VACANCES_RAPPORT', 'PLG_RAPPORT_JOURNALIER', 'LANGUAGE'];
    return list.includes(check);
  }
}
