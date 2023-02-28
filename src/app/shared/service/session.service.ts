import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

// TODO add btoa() and atob()

  /**
   * gerer le profil de l'utilisateur-restaurant courant dans la session
   */
  public getProfil(): string {
    return atob(localStorage.getItem('profil'));
  }

  public setIdProfil(idProfil: number) {
    localStorage.setItem('profilId', btoa(String(idProfil)));
  }

  public getIdProfil(): number {
    return +atob(localStorage.getItem('profilId'));
  }

  public setProfil(profil: string) {
    localStorage.setItem('profil', btoa(profil));
  }

  public getUuidProfil(): string {
    return atob(localStorage.getItem('profilUuid'));
  }

  public setUuidProfil(profil: string) {
    localStorage.setItem('profilUuid', btoa(profil));
  }

  /**
   * gerer l'utilisateur-restaurant courant dans la session
   */
  public getUser(): number {
    return +atob(localStorage.getItem('user'));
  }

  public setUser(user: any) {
    localStorage.setItem('user', btoa(user));
  }


  /***
   * gerer l'objet restaurant courant
   */
  public getUuidRestaurant(): string {
    return atob(sessionStorage.getItem('restaurant_uuid'));
  }

  public setUuidRestaurant(restaurantUuid: string | number): void {
    sessionStorage.setItem('restaurant_uuid', btoa(String(restaurantUuid)));
  }

  /***
   * gerer l'objet restaurant courant
   */
  public getRestaurant(): string {
    return atob(sessionStorage.getItem('restaurant'));
  }

  public setRestaurant(restaurant: string | number): void {
    sessionStorage.setItem('restaurant', btoa(String(restaurant)));
  }

  public getRestaurantName() {
    return atob(sessionStorage.getItem('restaurantName'));
  }

  public setRestaurantName(restaurantName) {
    sessionStorage.setItem('restaurantName', btoa(restaurantName));
  }

  /**
   * gerer l'id du societe courante
   */
  public getSociete() {
    return +atob(sessionStorage.getItem('societe'));
  }

  public setSociete(societe) {
    sessionStorage.setItem('societe', btoa(societe));
  }

  public getSocieteName(): string {
    return atob(sessionStorage.getItem('societeName'));
  }

  public setSocieteName(societe: string) {
    sessionStorage.setItem('societeName', btoa(societe));
  }

  /**
   * gerer l'uuid du societe courante
   */
  public getUuidSociete() {
    return atob(sessionStorage.getItem('uuid_societe'));
  }

  public setUuidSociete(uuidSociete: string) {
    sessionStorage.setItem('uuid_societe', btoa(uuidSociete));
  }
  /**
   * gerer l'uuid de la franchise selectionnée
   */
   public getUuidFranchise() {
    return atob(sessionStorage.getItem('uuid_franchise'));
  }

  public setUuidFranchisee(uuidFranchise: string) {
    sessionStorage.setItem('uuid_franchise', btoa(uuidFranchise));
  }

  public getEmail() {
    return atob(localStorage.getItem('email'));
  }

  public setEmail(email) {
    localStorage.setItem('email', btoa(email));
  }


  public getBearerToken() {
    if (localStorage.getItem('T120')) {
      return atob(localStorage.getItem('T120'));
    } else {
      return null;
    }
  }

  public setBearerToken(token) {
    return localStorage.setItem('T120', btoa(token));
  }

  public deleteBearerToken() {
    return localStorage.removeItem('T120');
  }

  public getUsername() {
    return atob(localStorage.getItem('username'));
  }

  public setUsername(username: string) {
    return localStorage.setItem('username', btoa(username));
  }

  public getLastUrl() {
    return atob(localStorage.getItem('lastUrl'));
  }

  public setLastUrl(url: string) {
    localStorage.setItem('lastUrl', btoa(url));
  }

  public getPermissions() {
    return atob(localStorage.getItem('PR2560'));
  }

  public setPermissions(permissions: any) {
    localStorage.setItem('PR2560', btoa(permissions));
  }

  public getUserNom() {
    return atob(localStorage.getItem('user-nom'));
  }

  public setUserNom(nom: string) {
    return localStorage.setItem('user-nom', btoa(nom));
  }

  public getUserPrenom() {
    return atob(localStorage.getItem('user-prenom'));
  }

  public setUserPrenom(prenom: string) {
    return localStorage.setItem('user-prenom', btoa(prenom));
  }

  public getUserId() {
    return atob(localStorage.getItem('user'));
  }

  public getUserEmail() {
    return atob(localStorage.getItem('email'));
  }

  public setUserEmail(email: string) {
    return localStorage.setItem('email', btoa(email));
  }

  public getCurrentYear(): string {
    return atob(localStorage.getItem('currentYear'));
  }

  public setCurrentYear(currentYear: string): void {
    localStorage.setItem('currentYear', btoa(currentYear));
  }

  public getCurrentWeek(): string {
    return atob(localStorage.getItem('currentWeek'));
  }

  public setCurrentWeek(currentWeek: string): void {
    localStorage.setItem('currentWeek', btoa(currentWeek));
  }

  public getDateSelected(): string {
    return atob(localStorage.getItem('selectedDate'));
  }

  public setDateSelected(selectedDate: string): void {
    localStorage.setItem('selectedDate', btoa(selectedDate));
  }

  public getPdfAnomalieSettings(): {
    uuidRestaurant: string,
    uuidEmployee: string,
    dateDebut: string,
    dateFin: string
  } {
    return JSON.parse(localStorage.getItem('pdfAnomalie'));
  }

  public getPdfPlanningEmployeeSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    employeeIds: number[],
    groupeTravailIds: number[]
  } {
    return JSON.parse(localStorage.getItem('pdfPlanningEmployee'));
  }

  public getPdfServiceAPrendreSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string
  } {
    return JSON.parse(localStorage.getItem('pdfServiceAPrendre'));
  }

  public getPdfDetailsPeriodeSettings(): {
    uuidRestaurant: string,
    groupeTravail: string,
    dateDebut: string,
    dateFin: string,
    minutesOrCentieme: boolean,
    employeeOrGroupTravail: string,
    listEmployee: any
  } {
    return JSON.parse(localStorage.getItem('pdfDetailsPeriode'));
  }

  public getPdfCompteursEmployesSettings(): {
    uuidRestaurant: string,
    date: string,
    sortingCriteria: string
  } {
    return JSON.parse(localStorage.getItem('pdfCompteursEmployes'));
  }

  public getPdfCompteursEmployesSettingsDownload(): {
    uuidRestaurant: string,
    periodeAnalyser: string,
    date: string,
    sortingCriteria: string
  } {
    return JSON.parse(localStorage.getItem('pdfDownloadCompteursEmployes'));
  }

  public getPdfRapportOperationnelSettings(): {
    uuidRestaurant: string,
    groupeTravail: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    hundredth: boolean
  } {
    return JSON.parse(localStorage.getItem('pdfRapportOperationnel'));
  }

  public getPdfResumePlanningSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string
  } {
    return JSON.parse(localStorage.getItem('pdfResumePlanning'));
  }

  public getPdfCorrectionPointageSettings(): {
    uuidRestaurant: string,
    dateJournee: string
  } {
    return JSON.parse(localStorage.getItem('pdfCorrectionPointage'));
  }

  public setPdfAnomalieSettings(settings: {
    uuidRestaurant: string,
    uuidEmployee: string,
    dateDebut: string,
    dateFin: string
  }): void {
    return localStorage.setItem('pdfAnomalie', JSON.stringify(settings));
  }

  public getPdfDisponibilitesSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    type: string,
    sortingCriteria: string
  } {
    return JSON.parse(localStorage.getItem('pdfDisponibilites'));
  }

  public getPdfAbsencesSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    motifAbsence: string[],
    employeeIds: number[],
    groupeTravailIds: number[]
  } {
    return JSON.parse(localStorage.getItem('pdfAbsences'));
  }

  public getPdfCompetencesSettings(): {
    uuidRestaurant: string
  } {
    return JSON.parse(localStorage.getItem('pdfCompetences'));
  }

  public getResetPlanningCalendar(): string {
    return atob(localStorage.getItem('resetPlanningCalendar'));
  }

  public getPdfPlanningManagerSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    managerOrLeader: string
    sortingCriteria: string
  } {
    return JSON.parse(localStorage.getItem('pdfPlanningManagers'));
  }

  public setResetPlanningCalendar(state: boolean) {
    localStorage.setItem('resetPlanningCalendar', btoa(String(state)));
  }

  public setPdfPlanningEmployeeSettings(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    employeeIds: number[],
    groupeTravailIds: number[]
  }): void {
    return localStorage.setItem('pdfPlanningEmployee', JSON.stringify(settings));
  }

  public setPdfServiceAPrendreSettings(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string
  }): void {
    return localStorage.setItem('pdfServiceAPrendre', JSON.stringify(settings));
  }

  public setPdfDetailsPeriodeSettings(settings: {
    uuidRestaurant: string,
    groupeTravail: string,
    dateDebut: string,
    dateFin: string,
    minutesOrCentieme: boolean,
    employeeOrGroupTravail: number
    listEmployee: any
  }): void {
    return localStorage.setItem('pdfDetailsPeriode', JSON.stringify(settings));
  }

  public setPdfCompteursEmployesSettings(settings: {
    uuidRestaurant: string,
    date: string,
    sortingCriteria: string
  }): void {
    return localStorage.setItem('pdfCompteursEmployes', JSON.stringify(settings));
  }

  public setPdfCompteursEmployesForDownloadSettings(settings: {
    uuidRestaurant: string,
    periodeAnalyser: string,
    date: string,
    sortingCriteria: string
  }): void {
    return localStorage.setItem('pdfCompteursEmployes', JSON.stringify(settings));
  }

  public setPdfRapportOperationnelSettings(settings: {
    uuidRestaurant: string,
    groupeTravail: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    hundredth: boolean
  }): void {
    return localStorage.setItem('pdfRapportOperationnel', JSON.stringify(settings));
  }


  public setPdfResumePlanningSettings(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
  }): void {
    return localStorage.setItem('pdfResumePlanning', JSON.stringify(settings));
  }

  public setPdfCorrectionPointageSettings(settings: {
    uuidRestaurant: string,
    dateJournee: string,
  }): void {
    return localStorage.setItem('pdfCorrectionPointage', JSON.stringify(settings));
  }

  public setPdfDisponibilites(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    type: string,
    sortingCriteria: string
  }): void {
    return localStorage.setItem('pdfDisponibilites', JSON.stringify(settings));
  }

  public setPdfAbsences(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    motifAbsence: string[],
    employeeIds: number[],
    groupeTravailIds: number[]
  }): void {
    return localStorage.setItem('pdfAbsences', JSON.stringify(settings));
  }

  public setPdfCompetencesSettings(settings: {
    uuidRestaurant: string
  }): void {
    return localStorage.setItem('pdfCompetences', JSON.stringify(settings));
  }

  public setPdfPlanningManagersSettings(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    managerOrLeader: string,
    sortingCriteria: string
  }): void {
    return localStorage.setItem('pdfPlanningManagers', JSON.stringify(settings));
  }

  public getComponents() {
    return atob(localStorage.getItem('CP1236'));
  }

  public setComponents(components: any) {
    localStorage.setItem('CP1236', btoa(components));
  }

  /**
   * gerer l'utilisateur-restaurant courant dans la session
   */
  public getUuidUser(): string {
    return atob(localStorage.getItem('uuid_user'));
  }

  public setUuidUser(userUuid: string): void {
    localStorage.setItem('uuid_user', btoa(userUuid));
  }

  public getLastSelectedDate(): string {
    return atob(localStorage.getItem('lastSelectedDate'));
  }

  public setLastSelectedDate(lastSelectedDate: string): void {
    localStorage.setItem('lastSelectedDate', btoa(lastSelectedDate));
  }

  public getRefreshToken(): string {
    return atob(localStorage.getItem('refresh'));
  }

  public setRefreshToken(refresh: string): void {
    localStorage.setItem('refresh', btoa(refresh));
  }

  public getRefreshTimer(): string {
    return atob(localStorage.getItem('refreshTimer'));
  }

  public setRefreshTimer(refreshTimer: string): void {
    localStorage.setItem('refreshTimer', btoa(refreshTimer));
  }

  public setIsDirector(isDirector: boolean): void {
    localStorage.setItem('director', String(isDirector));
  }

  public isDirector(): boolean {
    return localStorage.getItem('director') === 'true';
  }

  public getRestaurantUUIdForReport() {
    return atob(sessionStorage.getItem('restauranUUid'));
  }

  public setRestaurantUUidForReport(restauranUUid: any) {
    sessionStorage.setItem('restauranUUid', btoa(restauranUUid));
  }

  public getPdfVacancesSettings(): {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    motifAbsence: string[],
    employeeIds: number[],
    groupeTravailIds: number[]
  } {
    return JSON.parse(localStorage.getItem('pdfAbsences'));
  }

  public setPdfVacancesSettings(settings: {
    uuidRestaurant: string,
    dateDebut: string,
    dateFin: string,
    sortingCriteria: string,
    motifAbsence: string[],
    employeeIds: number[],
    groupeTravailIds: number[]
  }): void {
    return localStorage.setItem('pdfAbsences', JSON.stringify(settings));
  }

  public getUuidFranchiseForRestaurantOfSuperviseur() {
    return atob(sessionStorage.getItem('uuid_franchise_superviseur'));
  }

  public setUuidFranchiseeForRestaurantOfSuperviseur(uuidFranchise: string) {
    sessionStorage.setItem('uuid_franchise_superviseur', btoa(uuidFranchise));
  }

  public getDureeMinShiftParam() {
    return atob(sessionStorage.getItem('paramMinShiftValue'));
  }

  public setDureeMinShiftParam(paramValue: string) {
    sessionStorage.setItem('paramMinShiftValue', btoa(paramValue));
  }
}
