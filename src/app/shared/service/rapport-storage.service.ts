import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RapportStorageService {

  public getPdfAnomalieSettings(): {
    selectAllEmployees: boolean,
    uuidEmployee: any,
    uuidRestaurant: string,
  } {
    return JSON.parse(localStorage.getItem('ANOMALIE_GDH'));
  }

  public setPdfAnomalieSettings(settings: {
    selectAllEmployees: boolean,
    uuidEmployee: any,
    uuidRestaurant: string,
  }): void {
    return localStorage.setItem('ANOMALIE_GDH', JSON.stringify(settings));
  }

  public getPdfCompteursEmployesSettings(): {
    checked: any,
    periodeAnalysee: any,
    sortingCriteria: any
  } {
    return JSON.parse(localStorage.getItem('COMPTEURS_EMPLOYES'));
  }

  public setPdfCompteursEmployesSettings(settings: {
    checked: any,
    periodeAnalysee: any,
    sortingCriteria: any
  }): void {
    return localStorage.setItem('COMPTEURS_EMPLOYES', JSON.stringify(settings));
  }

  public getPdfDetailsPeriodeSettings(): {
    groupeTravail: any,
    uuidRestaurant: string,
    minutesOrCentieme: boolean,
    employeeOrGroupTravail: string
  } {
    return JSON.parse(localStorage.getItem('DETAILS_PERIODE'));
  }

  public setPdfDetailsPeriodeSettings(settings: {
    groupeTravail: any,
    uuidRestaurant: string,
    minutesOrCentieme: boolean,
    employeeOrGroupTravail: string
  }): void {
    return localStorage.setItem('DETAILS_PERIODE', JSON.stringify(settings));
  }

  public getPdfDisponibilitesSettings(): {
    type: any,
    sortingCriteria: any
  } {
    return JSON.parse(localStorage.getItem('DISPONIBILITES_RAPPORT'));
  }

  public setPdfDisponibilites(settings: {
    type: any,
    sortingCriteria: any
  }): void {
    return localStorage.setItem('DISPONIBILITES_RAPPORT', JSON.stringify(settings));
  }

  public getPdfRapportOperationnelSettings(): {
    groupeTravail: any,
    sortingCriteria: any,
    hundredth: any,
    uuidRestaurant: string
  } {
    return JSON.parse(localStorage.getItem('RAPPORT_OPERATIONNEL'));
  }

  public setPdfRapportOperationnelSettings(settings: {
    groupeTravail: any,
    sortingCriteria: any,
    hundredth: any,
    uuidRestaurant: string
  }): void {
    return localStorage.setItem('RAPPORT_OPERATIONNEL', JSON.stringify(settings));
  }

  public getPdfPlanningEmployeeSettings(): {
    mensuel: any,
    sortingCriteria: any,
    affichageEmployee: any,
    employeeIds: { label: string, value: {name: string, code: string} }[],
    groupeTravailIds: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  } {
    return JSON.parse(localStorage.getItem('PLANNING_EMPLOYEE'));
  }

  public setPdfPlanningEmployeeSettings(settings: {
    mensuel: any,
    sortingCriteria: any,
    affichageEmployee: any,
    employeeIds: { label: string, value: {name: string, code: string} }[],
    groupeTravailIds: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  }): void {
    return localStorage.setItem('PLANNING_EMPLOYEE', JSON.stringify(settings));
  }

  public getPdfPlanningJournalierSettings(): {
    payasage: any,
    sortingCriteria: any,
    selectedValue: any,
    heureSeparation: Date,
    displayWeek: any
  } {
    return JSON.parse(localStorage.getItem('PLG_RAPPORT_JOURNALIER'));
  }

  public setPdfPlanningJournalierSettings(settings: {
    payasage: any,
    sortingCriteria: any,
    selectedValue: any,
    heureSeparation: Date,
    displayWeek: any
  }): void {
    return localStorage.setItem('PLG_RAPPORT_JOURNALIER', JSON.stringify(settings));
  }

  public getPdfAbsencesSettings(): {
    sortingCriteria: any,
    motifAbsence: { label: string, value: {name: string, code: string} }[],
    rappAbsRadioButtonSelectedValue: any,
    employeeIds: { label: string, value: {name: string, code: string} }[],
    groupeTravailIds: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  } {
    return JSON.parse(localStorage.getItem('ABSENCES_RAPPORT'));
  }

  public setPdfAbsences(settings: {
    sortingCriteria: any,
    motifAbsence: { label: string, value: {name: string, code: string} }[],
    rappAbsRadioButtonSelectedValue: any,
    employeeIds: { label: string, value: {name: string, code: string} }[],
    groupeTravailIds: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  }): void {
    return localStorage.setItem('ABSENCES_RAPPORT', JSON.stringify(settings));
  }

  public getPdfPlanningManagerSettings(): {
    weekMonthSelectedValue: any,
    managerOrLeader: any,
    sortingCriteria: any
  } {
    return JSON.parse(localStorage.getItem('PLANNING_MANAGERS'));
  }

  public setPdfPlanningManagersSettings(settings: {
    weekMonthSelectedValue: any,
    managerOrLeader: any,
    sortingCriteria: any
  }): void {
    return localStorage.setItem('PLANNING_MANAGERS', JSON.stringify(settings));
  }

  public getPdfVacancesSettings(): {
    mensuel: any,
    sortingCriteria: any,
    motifAbsence: { label: string, value: {name: string, code: string} }[],
    employeeAffichage: any,
    employeeId: { label: string, value: {name: string, code: string} }[],
    groupTravailId: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  } {
    return JSON.parse(localStorage.getItem('VACANCES_RAPPORT'));
  }

  public setPdfVacancesSettings(settings: {
    mensuel: any,
    sortingCriteria: any,
    motifAbsence: { label: string, value: {name: string, code: string} }[],
    employeeAffichage: any,
    employeeId: { label: string, value: {name: string, code: string} }[],
    groupTravailId: { label: string, value: {name: string, code: string} }[],
    uuidRestaurant: string
  }): void {
    return localStorage.setItem('VACANCES_RAPPORT', JSON.stringify(settings));
  }

}
