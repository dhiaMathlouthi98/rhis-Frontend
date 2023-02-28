import {Injectable} from '@angular/core';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {ShiftModel} from '../../../../../shared/model/shift.model';
import * as moment from 'moment';
import {VerificationContrainteModel} from '../../../../../shared/model/verificationContrainte.model';
import {WeekDetailsPlanning} from '../../../../../shared/model/planning-semaine';
import * as rfdc from 'rfdc';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {DateService} from '../../../../../shared/service/date.service';
import {ContrainteSocialeService} from '../../../../../shared/service/contrainte-sociale.service';
import {ParametreNationauxModel} from '../../../../../shared/model/parametre.nationaux.model';
import {BreakAndShiftOfParametresNationauxModel} from '../../../../../shared/model/breakAndShiftOfParametresNationaux.model';
import {ShiftService} from './shift.service';
import {DatePipe} from '@angular/common';
import {DisponiblitePairOrOdd} from '../../../../../shared/enumeration/disponiblitePairOrOdd';
import {HelperService} from '../../../../../shared/service/helper.service';
import {SemaineReposModel} from '../../../../../shared/model/semaineRepos.model';
import {JourSemaine} from '../../../../../shared/enumeration/jour.semaine';
import {ContrainteSocialeCoupureService} from '../../../../../shared/service/contrainte-sociale-coupure.service';
import { RhisTranslateService } from 'src/app/shared/service/rhis-translate.service';
import {PlgEquipierHelperService} from './plg-equipier-helper.service';


@Injectable({
  providedIn: 'root'
})
export class VerificationContraintePlanningEquipierService {
  public clone = rfdc();
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService,
              private contrainteSocialeService: ContrainteSocialeService, private shiftService: ShiftService, private datePipe: DatePipe,
              private helperService: HelperService, private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
              private translator: RhisTranslateService, private plgEquipierHelperService: PlgEquipierHelperService
  ) {


  }

  public verifContraintes(shift: any, oldShift: ShiftModel, employeVerifCs: any, employeeHasAnomalieContraintSocial: EmployeeModel, newActiveEmployees: EmployeeModel[], listContraintesSocialesByShift: any, listShiftSemaineByEmployee: ShiftModel[], listShiftWithSign: any, messageVerification: VerificationContrainteModel, listContrainte: VerificationContrainteModel[], dateContrainteAcheve: any, popupVerificationContrainteVisibility: boolean, listContrainteSuppression: VerificationContrainteModel[], weekDates: string[], paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], decoupageHoraireFinEtDebutActivity: any, frConfig: any, listPairAndOdd: DisponiblitePairOrOdd[], modeAffichage: number, listJourFeriesByRestaurant: any, semaineRepos: SemaineReposModel[], paramDate: any, paramWeek: any, hiddenSaveGlobale: boolean, hiddenSave: boolean, isAssigned?: boolean, listShiftInWeek?: ShiftModel[], listInthreeWeek?: ShiftModel[], affectationViewHebdo?: boolean): any {
    let employeOldShift = null;
    hiddenSaveGlobale = false;
    popupVerificationContrainteVisibility = false;
    if (listContraintesSocialesByShift.has(shift.idShift)) {
      listContraintesSocialesByShift.delete(shift.idShift);
    }
    hiddenSave = false;
    let employeesShift = [];
    const shiftRef = this.getShiftRef(shift);
    const employeCs = this.getEmployeCs(newActiveEmployees, shiftRef, employeeHasAnomalieContraintSocial, modeAffichage, listShiftInWeek);
    const employeeShiftsList = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(shiftRef.dateJournee)) && (!element.acheval || (element.acheval && element.modifiable)));
    if (oldShift && this.differenceBettwenOldAndNewShift(this.clone(oldShift), this.clone(shiftRef))) {
      employeOldShift = newActiveEmployees.find((employeeDisplay: EmployeeModel) =>
        oldShift.employee && (employeeDisplay.idEmployee === oldShift.employee.idEmployee)
      );
    }
    let totalInDay = this.plgEquipierHelperService.getHoursInDay(employeeShiftsList);
    totalInDay = +this.dateService.convertNumberToTime(totalInDay);
    shiftRef.jour = this.dateService.getJourSemaineFromInteger(new Date(shiftRef.dateJournee).getDay());
    if (!(shiftRef.heureDebut instanceof Date) || !(shiftRef.heureFin instanceof Date)) {
      this.dateService.setCorrectTimeToDisplayForShift(shiftRef);
    }
    let socialeConstraintesAreValid = true;
    let verificationContrainte = new VerificationContrainteModel();
    if(!affectationViewHebdo) {
      listContrainte = [];
    }
    listContrainteSuppression = [];
    let statutCs;
    let statutDisponibilite = {};
    // verication durée minimum d'un shift
    const result =  this.contrainteSocialeService.verifDureeMinShift(shiftRef.heureFin, shiftRef.heureDebut);
    if (result) {
      statutCs = this.getStatuOfContrainst(result, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, null);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }
    const dates = JSON.parse(JSON.stringify(weekDates));
    const employeHasContrat = this.clone(employeCs);
    const totalWeekWithBreak = this.shiftService.getWeekTotalHours(dates, this.clone(employeCs.employeeWeekShiftCS), employeHasContrat, paramNationaux, listOfBreakAndShift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, employeCs.listShiftPreviousAndLastWekk, null, true);
    let listShiftWithAbsence = [];
    employeCs.employeeWeekShiftCS.forEach((sh: any) => {
      if (!this.plgEquipierHelperService.checkEmployeAbsenceInDate(newActiveEmployees, sh.dateJournee, employeCs.idEmployee, )) {
        listShiftWithAbsence.push(sh);
      }
    });
    const totalWeekWithBreakWithoutShiftsFromAbsence = this.shiftService.getWeekTotalHours(dates, this.clone(listShiftWithAbsence), employeHasContrat, paramNationaux, listOfBreakAndShift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, null, null, true);
    // calcul total temps absence de la journee
    let totalTempsAbsence = 0;
    employeCs.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
      totalTempsAbsence += wdp.totalAbsence;
    });

    // verification hebdo contrat
    employeVerifCs.contratActif.hebdo = employeCs.hebdoCourant;
    verificationContrainte = this.contrainteSocialeService.validHebdoEmployee(employeVerifCs.contratActif, +totalWeekWithBreakWithoutShiftsFromAbsence, totalTempsAbsence);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, false);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // verification qualification
    verificationContrainte = this.contrainteSocialeService.validQualificationEmployee(shiftRef.positionTravail, employeCs.qualifications);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, false);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // disponibilité de l'employé (congé)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerConge(employeCs.absenceConges, shiftRef.dateJournee);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Vérification de la Durée minimum non consecutive
    employeHasContrat.loiEmployee = employeVerifCs.listLoi;
    employeHasContrat.employeeWeekShiftCS = [];
    employeHasContrat.contrats[0].tempsPartiel = employeVerifCs.tempsTravailPartiel;
    const totalDayWithBreakForMinShift = this.shiftService.getDayTotalHoursForEmployee(this.clone(employeeShiftsList), employeHasContrat, paramNationaux, listOfBreakAndShift, 0, null, null, null, false);
    verificationContrainte = this.contrainteSocialeService.validDureeMinNonConsecutive(employeeShiftsList, employeVerifCs.tempsTravailPartiel, this.helperService.getNombreHeureTravaille(+totalDayWithBreakForMinShift), employeVerifCs.listLoi, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // disponibilité de l'employé (jours de repos, disponibilités du contrat...)
    if (isAssigned) {
      let verificationDisponibilite;
      let shiftAcheval;
      if (employeeShiftsList.some((shiftDisplay: ShiftModel) => {
        if (shiftDisplay.acheval && shiftDisplay.modifiable) {
          shiftAcheval = this.clone(shiftDisplay);
        }
        verificationDisponibilite = this.contrainteSocialeService.validDisponibiliteEmployee(employeVerifCs.contratActif, shiftDisplay, 'planning', decoupageHoraireFinEtDebutActivity, frConfig, listPairAndOdd);
        return verificationDisponibilite.length > 0;
      })) {
        statutDisponibilite = this.verificationDisponibliteOfEmploye(shiftAcheval, verificationDisponibilite, dateContrainteAcheve, listContrainte, socialeConstraintesAreValid);
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    } else {
      const verificationDisponibilite = this.contrainteSocialeService.validDisponibiliteEmployee(employeVerifCs.contratActif, shiftRef, 'planning', decoupageHoraireFinEtDebutActivity, frConfig, listPairAndOdd);
      if (verificationDisponibilite.length > 0) {
        statutDisponibilite = this.verificationDisponibliteOfEmploye(shiftRef, verificationDisponibilite, dateContrainteAcheve, listContrainte, socialeConstraintesAreValid);
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    }

    ({listContrainte, dateContrainteAcheve, socialeConstraintesAreValid} = {
      listContrainte,
      dateContrainteAcheve,
      socialeConstraintesAreValid, ...statutDisponibilite
    });

    // disponibilité de l'employé (jours de repos)
    if (isAssigned) {
      if (employeeShiftsList.some((shiftDisplay: ShiftModel) => {
        verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourRepos(semaineRepos, shiftDisplay, 'shift');
        return !!verificationContrainte;
      })) {
        statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
        messageVerification = statutCs.messageVerification;
        popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
        socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
      }
    } else {
      verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourRepos(semaineRepos, shiftRef, 'shift');
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }

    // disponibilité de l'employé (jours feriés)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourFeries(listJourFeriesByRestaurant, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, shiftRef, 'shift');
    if (verificationContrainte) {
      verificationContrainte.dateOfAnomalie = shift.acheval && !shift.modifiable && modeAffichage !== 0 ? this.dateService.formatToShortDate(JSON.parse(JSON.stringify(shiftRef.dateJournee)), '/') : null;
    }
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nombre heure Max Par Jour Si plannifie
    // recupere les shift apres ou avant de shift current de la journée
    const dateShiftCurrent = this.clone(shiftRef.dateJournee);
    const listShiftInDayCurrent = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(dateShiftCurrent)));
    const previousOrLastOfShiftInDay = this.getPreviousOrLastShiftsOfShiftAcheval(modeAffichage, dateShiftCurrent, employeCs, employeHasContrat, weekDates);
    const totalDayWithBreak = this.shiftService.getDayTotalHoursForEmployee(this.clone(listShiftInDayCurrent), employeHasContrat, paramNationaux, listOfBreakAndShift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, previousOrLastOfShiftInDay, false);
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParJourSiPlannifie(this.helperService.getNombreHeureTravaille(+totalDayWithBreak), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    // Nb d'heure maxi par semaine
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParSemaine(+totalWeekWithBreak, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nombre Shift Max Par Jour
    verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeeShiftsList), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    // Le collaborateur ne peut travailler après heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerApresHeure(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Le collaborateur ne peut travailler avant heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerAvantHeure(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Amplitude journaliere maximale.
    verificationContrainte = this.contrainteSocialeService.validAmplitudeJounaliereMaximale(employeeShiftsList.filter((value: ShiftModel) => (!value.acheval || (value.acheval && value.modifiable))), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    if (shiftRef.jour === JourSemaine.DIMANCHE) {
      // Le collaborateur peut travailler le dimanche
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeDimanche(shiftRef.jour, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }
    // Nb
    // de jours de repos mini dans une semaine
    listShiftSemaineByEmployee = listShiftSemaineByEmployee.filter((value: ShiftModel) => (!value.acheval || (value.acheval && value.modifiable)));
    verificationContrainte = this.contrainteSocialeService.validNombreJourOffDansUneSemaine(this.helperService.getNombreDeJourOffDansUneSemaine(listShiftSemaineByEmployee, shiftRef), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Les jours de repos doivent-ils être consécutifs

    verificationContrainte = this.contrainteSocialeService.validJourReposConsecutif(this.helperService.getJourRepos(listShiftSemaineByEmployee), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeVerifCs.contratActif);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // //  Heure de repos min entre 2 jours
    const previousOrNextListShit = this.helperService.getListShiftOrBeforeLastDay(paramDate.selectedDate, paramDate.premierJourDeLaSemaine, employeCs, shiftRef);
    verificationContrainte = this.contrainteSocialeService.validHeureRepoMinEntreDeuxJours(this.helperService.getLastDayValues(shiftRef, listShiftSemaineByEmployee, previousOrNextListShit), employeeShiftsList.filter((value: ShiftModel) => ((!value.acheval) || (value.acheval && value.modifiable))), this.helperService.getNextDayValues(shiftRef, listShiftSemaineByEmployee, previousOrNextListShit), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, paramDate.limiteHeureDebut);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    // Le collaborateur peut travailler le weekend
    // cas d'affectation
    if (isAssigned) {
      if (employeeShiftsList.some((shiftDisplay: ShiftModel) => {
        verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeWeekEnd(shiftDisplay.jour, shiftDisplay, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, paramWeek.jourDebutWeekEnd, paramWeek.jourFinWeekEnd, paramWeek.heureDebutWeekEnd, paramWeek.heureFinWeekEnd);
        return !!verificationContrainte;
      })) {
        statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
        messageVerification = statutCs.messageVerification;
        popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
        socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
      }
    } else {
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeWeekEnd(shiftRef.jour, shiftRef, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, paramWeek.jourDebutWeekEnd, paramWeek.jourFinWeekEnd, paramWeek.heureDebutWeekEnd, paramWeek.heureFinWeekEnd);
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }

    // Nb maxi de jours travaillés consécutifs dans 1 sem
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansUneSemaine(this.helperService.getNombreDeJourTravaillerDansUneSemaine(shiftRef, listShiftSemaineByEmployee, paramDate.premierJourDeLaSemaine), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb maxi de jours travaillés consécutifs dans 2 sem
    // Nb des jours travaillés dans les deux premieres semaines 0-1
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(1, employeCs, paramDate.selectedDate, paramDate.premierJourDeLaSemaine, listInthreeWeek), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb des jours travaillés dans les deux deuxiemes semaines 1-2
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.getNombreDeJourTravaillerDansDeuxSemaines(3, employeCs, paramDate.selectedDate, paramDate.premierJourDeLaSemaine, listInthreeWeek), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // valider pause planifier
    const isBreak = this.contrainteSocialeService.validPausePlanifier(employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    // affectation
    if (isAssigned) {
      verificationContrainte = this.helperService.verificationContraintMaxShiftWithoutBreakInListShift(employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeeShiftsList);
      if (verificationContrainte) {
        if (isBreak) {
          statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
          messageVerification = statutCs.messageVerification;
          popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
          socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
        } else {
          socialeConstraintesAreValid = socialeConstraintesAreValid && true;
        }
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }

    } else {
      employeesShift = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(shiftRef.dateJournee)) && (!element.acheval || (element.acheval && element.modifiable)));
      const indexShiftToUpdate = employeesShift.findIndex((shiftDiplay: ShiftModel) => shiftDiplay.idShift === shiftRef.idShift);
      if (indexShiftToUpdate !== -1) {
        employeesShift.splice(indexShiftToUpdate, 1);
        employeesShift.push(shiftRef);
      } else {
        employeesShift.push(shiftRef);
      }
      verificationContrainte = this.helperService.verificationContraintMaxShiftWithoutBreak(shiftRef, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeesShift);
      if (verificationContrainte) {
        if (isBreak) {
          statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
          messageVerification = statutCs.messageVerification;
          popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
          socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
        } else {
          socialeConstraintesAreValid = socialeConstraintesAreValid && true;
        }
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    }
    verificationContrainte = this.shiftService.getPauseBetwenShift(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    if (verificationContrainte) {
      verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(JSON.parse(JSON.stringify(shiftRef.dateJournee)), '/');
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }
    if (employeOldShift) {
      let employeHaslaw;
      if (employeOldShift.contrats.length === 1) {
        employeHaslaw = this.clone(employeOldShift);
      } else if (employeOldShift.contrats.length > 1) {
        const employeeNew = this.clone(employeOldShift);
        employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(oldShift.dateJournee))));
      }
      const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);
      this.contrainteSocialeCoupureService.sortListShift(employeHaslaw.employeeWeekShiftCS);
      verificationContrainte = this.shiftService.getPauseBetwenShift(employeHaslaw.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(oldShift.dateJournee)) && (!element.acheval || (element.acheval && element.modifiable))), employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
      if (verificationContrainte) {
        verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(JSON.parse(JSON.stringify(oldShift.dateJournee)), '/');
        statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainte, popupVerificationContrainteVisibility, socialeConstraintesAreValid, true);
        messageVerification = statutCs.messageVerification;
        popupVerificationContrainteVisibility = statutCs.popupVerificationContrainteVisibility;
        socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
      }
    }
    if (!listContrainte.length) {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    listShiftSemaineByEmployee = this.getListDefaultEmployeeWeekShiftCs(newActiveEmployees, employeeHasAnomalieContraintSocial, listShiftSemaineByEmployee);
    employeCs.listShiftForThreeWeek = [];

    if (isAssigned) {
      listShiftWithSign = employeeShiftsList;
    } else {
      listShiftWithSign = employeesShift;
    }

    return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainte,
      dateContrainteAcheve,
      popupVerificationContrainteVisibility,
      listShiftWithSign,
      listShiftSemaineByEmployee,
      newActiveEmployees,
      listContrainteSuppression,
      listContraintesSocialesByShift,
      hiddenSaveGlobale,
      hiddenSave
    };
  }

  /**
   * récupérer le nbr de jour travailller ds deux semaine
   * @param: nbrWeek
   * @param: shift
   */
  public getNombreDeJourTravaillerDansDeuxSemaines(nbrWeek: number, employee: EmployeeModel, selectedDate: Date, premierJourDeLaSemaine: any, listInthreeWeek?: ShiftModel[]): number {
    let resultingNumber = 0;
    const dateDisplay = new Date(selectedDate);
    const dateDebut = new Date(dateDisplay.getTime() - (this.shiftService.findDecalage(dateDisplay, premierJourDeLaSemaine) * this.ONE_DAY_IN_MILLISECONDS));
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + 6);
    const accumulateConsecutiveWorkDays: number[] = [];
    let incrementer = 0;
    const collection = [];
    employee.employeeWeekShiftCS.forEach((item: ShiftModel) => {
      if (!item.acheval || (item.acheval && !item.modifiable)) {
        collection.push(item);
      }
    });

    let maxConsecutiveWorking: Date[] = [];
    let currentWeekdateFin: Date = new Date(JSON.parse(JSON.stringify(dateFin)));
    let previousWeekDateDebut: Date = new Date(JSON.parse(JSON.stringify(dateDebut)));
    previousWeekDateDebut = new Date(previousWeekDateDebut.setDate(previousWeekDateDebut.getDate() - 8));
    let nextWeekdateFin: Date = new Date(JSON.parse(JSON.stringify(dateFin)));
    nextWeekdateFin = new Date(nextWeekdateFin.setDate(nextWeekdateFin.getDate() + 7));
    if (nbrWeek === 1) {
      maxConsecutiveWorking = this.getNumberOfDaysFromRestaurantFirstWeekDay(previousWeekDateDebut, currentWeekdateFin);
    } else {
      currentWeekdateFin = new Date(currentWeekdateFin.setDate(currentWeekdateFin.getDate() - 7));
      maxConsecutiveWorking = this.getNumberOfDaysFromRestaurantFirstWeekDay(currentWeekdateFin, nextWeekdateFin);
    }
    maxConsecutiveWorking.sort((d1: Date, d2: Date) => this.dateService.sortDates(d1, d2));
    if(listInthreeWeek && listInthreeWeek.length) {
      listInthreeWeek.forEach((item: any) => {
        collection.push(item);
      });
    } else if (employee.listShiftForThreeWeek && employee.listShiftForThreeWeek.length) {
      employee.listShiftForThreeWeek.forEach((item: any) => {
        collection.push(item);
      });

    }

    maxConsecutiveWorking.forEach((date: Date) => {
      if (this.isPlanningExistInDate(collection, date)) {
        incrementer++;
      } else {
        accumulateConsecutiveWorkDays.push(incrementer);
        incrementer = 0;
      }
    });
    accumulateConsecutiveWorkDays.push(incrementer);
    if (accumulateConsecutiveWorkDays.length) {
      resultingNumber = Math.max(...accumulateConsecutiveWorkDays); // quand un tableau vide returns (maxConsecutiveWorkDays  -Infinity)
    } else {
      resultingNumber = 0;
    }
    return resultingNumber;
  }

  public getNumberOfDaysFromRestaurantFirstWeekDay(dateDebut: Date, dateFin: Date): Date[] {
    const wantedDates: Date[] = [];
    let workingDate = dateDebut;
    while (moment(workingDate).isBefore(new Date(dateFin))) {
      wantedDates.push(workingDate);
      workingDate = new Date(workingDate.setDate(workingDate.getDate() + 1));
    }

    return wantedDates;
  }

  private isPlanningExistInDate(listShifts: ShiftModel[], date: Date): boolean {
    return listShifts.some(
      p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
  }

  /**
   * determiner la difference entre ancien shift et nouveau shift
   * @param ancientShift
   * @param newShift
   */
  private differenceBettwenOldAndNewShift(ancientShift: ShiftModel, newShift: ShiftModel): boolean {
    let same = false;
    if (!moment(this.dateService.setTimeNull(ancientShift.dateJournee)).isSame(this.dateService.setTimeNull(newShift.dateJournee))
      || ((ancientShift.employee && newShift.employee) && ancientShift.employee.idEmployee !== newShift.employee.idEmployee)) {
      same = true;
    }
    return same;
  }

  /**
   * recuperer la liste de shift fixe par default pour la verification contrainte scciale
   */
  public getListDefaultEmployeeWeekShiftCs(newActiveEmployees: EmployeeModel[], employeeHasAnomalieContraintSocial: EmployeeModel, listShiftSemaineByEmployee: ShiftModel[], idEmploye?: number): ShiftModel[] {
    let idEmployeToUpdate: number;
    if (idEmploye) {
      idEmployeToUpdate = idEmploye;
    } else {
      idEmployeToUpdate = employeeHasAnomalieContraintSocial.idEmployee;
    }
    const employeeDefault = newActiveEmployees.find((employeeDisplay: EmployeeModel) =>
      employeeDisplay.idEmployee === idEmployeToUpdate);
    employeeDefault.employeeWeekShiftCS = [];
    employeeDefault.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
      employeeDefault.employeeWeekShiftCS = employeeDefault.employeeWeekShiftCS.concat(JSON.parse(JSON.stringify(wdp.shifts)));
      employeeDefault.employeeWeekShiftCS.forEach((element: ShiftModel) => {
        element.heureFin = new Date(Date.parse(element.heureFin));
        element.heureDebut = new Date(Date.parse(element.heureDebut));
        element.heureDebutCheval = new Date(Date.parse(element.heureDebutCheval));
        element.heureFinCheval = new Date(Date.parse(element.heureFinCheval));
        this.dateService.setCorrectTimeToDisplayForShift(element);
      });
    });
    listShiftSemaineByEmployee = employeeDefault.employeeWeekShiftCS;
    return listShiftSemaineByEmployee;
  }
  /**
   * ajouter shift avant la véerification de contrainte socialze
   * @param: employeCs
   * @param: shift
   */
  public addShiftToEmployeeWeekContrainteSociale(employeCs: EmployeeModel, shift: any) {
    this.dateService.setCorrectTimeToDisplayForShift(shift);
    employeCs.employeeWeekShiftCS.forEach((shiftDisplay: any, index) => {
      if (shift.acheval) {
        if ((shiftDisplay.idShift === shift.idShift) && shiftDisplay.modifiable === shift.modifiable) {
          employeCs.employeeWeekShiftCS.splice(index, 1);
          employeCs.employeeWeekShiftCS.push({...shift});
        }
      } else {
        if (shiftDisplay.idShift === shift.idShift) {
          employeCs.employeeWeekShiftCS.splice(index, 1);
          employeCs.employeeWeekShiftCS.push({...shift});
        }
      }
    });
    employeCs.employeeWeekShiftCS.forEach((shiftDisplay: any, index) => {
      this.dateService.setCorrectTimeToDisplayForShift(shiftDisplay);
      shiftDisplay.jour = this.dateService.getJourSemaineFromInteger(new Date(shiftDisplay.dateJournee).getDay());
    });
  }

  public addAChevalShifts(listShift: ShiftModel[]): void {
    listShift.forEach((sh: ShiftModel) => {
      if (sh.acheval && sh.modifiable) {
        sh.heureDebut = sh.heureDebutCheval;
        sh.heureFin = sh.heureFinCheval;
        const tmpShift = {...sh};
        tmpShift.dateJournee = new Date(tmpShift.dateJournee.getTime() + (24 * 60 * 60 * 1000));
        tmpShift.heureDebutIsNight = false;
        tmpShift.heureFinIsNight = false;
        tmpShift.modifiable = false;
        const indexOfShiftAcheval = listShift.findIndex(shiftDisplay => shiftDisplay.idShift === sh.idShift && !shiftDisplay.modifiable);
        if (indexOfShiftAcheval !== -1) {
          listShift.splice(indexOfShiftAcheval, 1);
        }
        listShift.push(tmpShift);
      }
    });

  }
  /**
   * recuperer le non de cs et le statut bloquante ou nn bloquante
   * @param verificationContrainte
   * @param listContrainte
   * @param socialeConstraintesAreValid
   */
  public getStatuOfContrainst(verificationContrainte: any, messageVerification: VerificationContrainteModel, listContrainte: VerificationContrainteModel[], popupVerificationContrainteVisibility: boolean, socialeConstraintesAreValid: boolean, popupVerificationContrainteVisibilityCheck: boolean): any {
    if (verificationContrainte) {
      popupVerificationContrainteVisibilityCheck ? popupVerificationContrainteVisibility = true : messageVerification = {} as VerificationContrainteModel;
      messageVerification.bloquante = verificationContrainte.bloquante;
      listContrainte.push(verificationContrainte);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainte, popupVerificationContrainteVisibility

    };
  }

  /**
   * recuperer le shift pour utiliser dans le cs
   * @param shift
   */
  public getShiftRef(shift: ShiftModel): ShiftModel {
    let shiftRef: any;
    shiftRef = this.clone(shift);
    if (shiftRef.acheval) {
      shiftRef.heureDebut = shiftRef.heureDebutCheval;
      shiftRef.heureFin = shiftRef.heureFinCheval;
    }
    shiftRef.heureDebut = this.dateService.setStringFromDate(shiftRef.heureDebut);
    shiftRef.heureFin = this.dateService.setStringFromDate(shiftRef.heureFin);
    this.dateService.setCorrectTimeToDisplayForShift(shiftRef);
    return shiftRef;


  }

  /**
   * recupere l'employee pour untiliser dans le cs
   * @param newActiveEmployees
   * @param shiftRef
   * @param employeeHasAnomalieContraintSocial
   * @param modeAffichage
   */
  public getEmployeCs(newActiveEmployees: EmployeeModel[], shiftRef: ShiftModel, employeeHasAnomalieContraintSocial: EmployeeModel, modeAffichage: number, listShiftInWeek?: ShiftModel[]): EmployeeModel {
    const employeCs = newActiveEmployees.find((employeeDisplay: EmployeeModel) =>
      employeeDisplay.idEmployee === employeeHasAnomalieContraintSocial.idEmployee);
    if(listShiftInWeek){
      employeCs.employeeWeekShiftCS = listShiftInWeek;
    }
    employeCs.listShiftForThreeWeek = [];
    this.addShiftToEmployeeWeekContrainteSociale(employeCs, shiftRef);
    employeCs.employeeWeekShiftCS.forEach((sh: any) => {
      if (sh.acheval) {
        sh.heureDebut = sh.heureDebutCheval;
        sh.heureFin = sh.heureFinCheval;
      }
    });
    if (!employeCs.listShiftForThreeWeek || employeCs.listShiftForThreeWeek.length === 0) {
      employeCs.listShiftForThreeWeek = [];
      employeCs.listShiftForThreeWeek = shiftRef.employee.listShiftForThreeWeek;

    }
    if (modeAffichage === 2) {
      this.addAChevalShifts(employeCs.employeeWeekShiftCS);
    } else {
      employeCs.employeeWeekShiftCS = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => ((element.acheval && element.modifiable) || !element.acheval));
    }
    return employeCs;
  }

  /**
   * recupere message de verification de disponiblilté
   * @param shiftRef
   * @param verificationDisponibilite
   * @param dateContrainteAcheve
   * @param listContrainte
   * @param socialeConstraintesAreValid
   */
  private verificationDisponibliteOfEmploye(shiftRef, verificationDisponibilite, dateContrainteAcheve: any, listContrainte, socialeConstraintesAreValid): any {
    verificationDisponibilite.forEach(item => {
      if (item.acheval) {
        const shiftAcheveToSave = this.clone(shiftRef);
        dateContrainteAcheve = this.dateService.formatToShortDate(shiftAcheveToSave.dateJournee.setDate(shiftAcheveToSave.dateJournee.getDate() + 1), '/');
      }
      listContrainte.push(item);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    });
    return {
      socialeConstraintesAreValid,
      listContrainte,
      dateContrainteAcheve
    };
  }

  /**
   * recuperer les shifts de journée precedente et suivante de shift acheval
   * @param modeAffichage
   * @param dateShiftCurrent
   * @param employeCs
   * @param employeHasContrat
   * @param weekDates
   */
  public getPreviousOrLastShiftsOfShiftAcheval(modeAffichage: number, dateShiftCurrent: Date, employeCs: EmployeeModel, employeHasContrat: EmployeeModel, weekDates: any) {
    if (modeAffichage === 2) {
      let previousOrLastOfShiftInDay;
      const dateDebutSemaine = this.dateService.setTimeNull(new Date(weekDates[0]));
      const dateFinSemaine = this.dateService.setTimeNull(new Date(weekDates[6]));
      if (moment(dateShiftCurrent).isSame(dateDebutSemaine) || moment(dateShiftCurrent).isSame(dateFinSemaine)) {
        previousOrLastOfShiftInDay = this.clone(employeCs.listShiftPreviousAndLastWekk);
      } else {
        previousOrLastOfShiftInDay = this.clone(employeCs.employeeWeekShiftCS);
      }
      if (previousOrLastOfShiftInDay && previousOrLastOfShiftInDay.length) {
        previousOrLastOfShiftInDay = previousOrLastOfShiftInDay.filter((shiftPreviousOrNext: ShiftModel) => shiftPreviousOrNext.employee.idEmployee === employeHasContrat.idEmployee);
        this.shiftService.sortListShift(previousOrLastOfShiftInDay);
      }
      return previousOrLastOfShiftInDay;
    }
  }
  /**
   * Vérification de la durée minimale d'un shift lors du sauvegarde global
   */
   public verifDureeMinDesShifts(dates: any[], listEmployees: EmployeeModel[], messageVerification:VerificationContrainteModel, groupShiftByEmployee?: any): {listContrainteDureeMinShift: VerificationContrainteModel[], messageVerification: VerificationContrainteModel} {
    let verificationContrainte = new VerificationContrainteModel();
    let employeHaslaw: EmployeeModel;
    const listContrainteDureeMinShift: VerificationContrainteModel[] = [];
    for (const employeDisplay of listEmployees) {
      let listShiftWeek = [];
      if(groupShiftByEmployee && groupShiftByEmployee.get(employeDisplay.idEmployee)){
        listShiftWeek =  groupShiftByEmployee.get(employeDisplay.idEmployee);
      } else if (groupShiftByEmployee === undefined) {
        listShiftWeek = this.clone(employeDisplay.employeeWeekShiftCS);
      }
      listShiftWeek = listShiftWeek.filter((element: any) => (!element.acheval || (element.acheval && element.modifiable))).map((sh: any) => {
        if (sh.acheval) {
          sh.heureDebut = sh.heureDebutCheval;
          sh.heureFin = sh.heureFinCheval;
        }
        return sh;
      });
      dates.forEach((day: any) => {
        if (employeDisplay.contrats && employeDisplay.contrats.length === 1) {
          employeHaslaw = employeDisplay;
        } else if (employeDisplay.contrats && employeDisplay.contrats.length > 1) {
          const employeeNew = JSON.parse(JSON.stringify(employeDisplay));
          employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(day))));
        }
        if (employeHaslaw.contrats && employeHaslaw.contrats.length){
          const employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);

        verificationContrainte = new VerificationContrainteModel();
        // get list shift by day by employee
        const listShiftByDay = this.contrainteSocialeCoupureService.grouperShiftParJour(this.dateService.getJourSemaine(new Date(day)), listShiftWeek);
        if (listShiftByDay.length && listShiftByDay.length === 1) {
          const dureeShift = this.dateService.formatMinutesToHours(this.dateService.getDiffHeure(listShiftByDay[0].heureFin, listShiftByDay[0].heureDebut));
          verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
          if (verificationContrainte) {
            messageVerification.bloquante = verificationContrainte.bloquante;
            verificationContrainte.employe = employeHaslaw;
            verificationContrainte.idShift = listShiftByDay[0].idShift;
            verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
            listContrainteDureeMinShift.push(verificationContrainte);

          }
        } else if (listShiftByDay.length && listShiftByDay.length > 1) {
          this.contrainteSocialeCoupureService.sortListShift(listShiftByDay);
          const listShiftDuree = this.shiftService.getListShiftDurationByMaxBreak(listShiftByDay, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
          listShiftDuree.forEach((dureeShift: any) => {
            dureeShift = this.dateService.formatMinutesToHours(dureeShift);
            verificationContrainte = this.contrainteSocialeService.validDureeMinimumShift(dureeShift, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
            if (verificationContrainte) {
              messageVerification.bloquante = verificationContrainte.bloquante;
              verificationContrainte.employe = employeHaslaw;
              verificationContrainte.idShift = listShiftByDay[0].idShift;
              verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
              if (!listContrainteDureeMinShift.some((cs: any) => cs.employe.idEmployee === verificationContrainte.employe.idEmployee && cs.dateOfAnomalie === verificationContrainte.dateOfAnomalie)) {
                listContrainteDureeMinShift.push(verificationContrainte);
              }

            }
          });

        }
      }
      });
    }
    return {listContrainteDureeMinShift, messageVerification};
  }

    /**
   * contrainte nb des heures travaillés sans coupure
   */
     public verificationNbrHourWithoutCoupure(dates: any[], listEmployees: EmployeeModel[], messageVerification: VerificationContrainteModel, minBeforeCoupure: number, groupShiftByEmployee?: any ): {listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[], messageVerification: VerificationContrainteModel} {
      let verificationContrainte = new VerificationContrainteModel();
      let verificationContrainteNbrCoupure = new VerificationContrainteModel();
      let verificationContraintePauseBetwenShift = new VerificationContrainteModel();
      let employeHaslaw;
      const listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[] = [];
      let nbrCoupure = 0;

      for (const employeDisplay of listEmployees) {
        nbrCoupure = 0;
        let employeeMineur;
        let listShiftWeek = [];
        if(groupShiftByEmployee && groupShiftByEmployee.get(employeDisplay.idEmployee)){
          listShiftWeek =  groupShiftByEmployee.get(employeDisplay.idEmployee);
        } else if(groupShiftByEmployee === undefined){
          listShiftWeek = this.clone(employeDisplay.employeeWeekShiftCS);
        }
        listShiftWeek = listShiftWeek.filter((element: any) => (!element.acheval || (element.acheval && element.modifiable))).map((sh: any) => {
          if (sh.acheval) {
            sh.heureDebut = sh.heureDebutCheval;
            sh.heureFin = sh.heureFinCheval;
          }
          return sh;
        });
        dates.forEach((day: any) => {
          verificationContrainte = new VerificationContrainteModel();
          const listShiftByDay = this.contrainteSocialeCoupureService.grouperShiftParJour(this.dateService.getJourSemaine(new Date(day)), listShiftWeek);
          if (listShiftByDay.length > 1) {
            if (employeDisplay.contrats && employeDisplay.contrats.length === 1) {
              employeHaslaw = employeDisplay;
            } else if (employeDisplay.contrats && employeDisplay.contrats.length > 1) {
              const employeeNew = JSON.parse(JSON.stringify(employeDisplay));
              employeHaslaw = this.contrainteSocialeService.getContratByDay(employeeNew, new Date(JSON.parse(JSON.stringify(day))));
            }
            if(employeHaslaw.contrats && employeHaslaw.contrats.length){
              employeeMineur = this.contrainteSocialeCoupureService.checkEmployeMineur(employeHaslaw);
              this.contrainteSocialeCoupureService.sortListShift(listShiftByDay);
              const numberOfHourInDayAndBreak = this.contrainteSocialeCoupureService.getNumberOfWorkedHoursInDay(listShiftByDay, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur, minBeforeCoupure, nbrCoupure);
              nbrCoupure = numberOfHourInDayAndBreak.nbrCoupure;
              const dureeMax = this.dateService.convertNumberToTime(numberOfHourInDayAndBreak.NumberOfHour);
              
              verificationContrainte = this.contrainteSocialeService.validNombreHeureMinSansCoupure(dureeMax, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
              if (verificationContrainte && numberOfHourInDayAndBreak.break) {
                messageVerification.bloquante = verificationContrainte.bloquante;
                verificationContrainte.employe = employeHaslaw;
                verificationContrainte.idShift = listShiftByDay[0].idShift;
                verificationContrainte.dateOfAnomalie = JSON.parse(JSON.stringify(day));
                listContrainteMinTimeWithoutCoupure.push(verificationContrainte);
  
              }
              verificationContraintePauseBetwenShift = this.shiftService.getPauseBetwenShift(listShiftByDay, employeHaslaw.loiEmployee, employeHaslaw.contrats[0].tempsPartiel, employeeMineur);
              if (verificationContraintePauseBetwenShift) {
                messageVerification.bloquante = verificationContraintePauseBetwenShift.bloquante;
                verificationContraintePauseBetwenShift.employe = employeHaslaw;
                verificationContraintePauseBetwenShift.idShift = listShiftByDay[0].idShift;
                verificationContraintePauseBetwenShift.dateOfAnomalie = JSON.parse(JSON.stringify(day));
                listContrainteMinTimeWithoutCoupure.push(verificationContraintePauseBetwenShift);
              }
            }

          }
        });
        if (!employeHaslaw) {
          employeHaslaw = employeDisplay;
        }
        const verfiContrainteCoupureSemaine = this.contrainteSocialeService.verifCSContratMinSansCoupure(employeDisplay, employeDisplay.loiEmployee, employeDisplay.contrats[0].tempsPartiel, employeeMineur)
        verificationContrainteNbrCoupure = this.contrainteSocialeService.validNombreMaxCoupureParSemaine(nbrCoupure, employeDisplay.loiEmployee, employeDisplay.contrats[0].tempsPartiel, employeeMineur, verfiContrainteCoupureSemaine);
        if (verificationContrainteNbrCoupure) {
          messageVerification.bloquante = verificationContrainteNbrCoupure.bloquante;
          verificationContrainteNbrCoupure.employe = employeHaslaw;
          listContrainteMinTimeWithoutCoupure.push(verificationContrainteNbrCoupure);

        }
      }
      return {listContrainteMinTimeWithoutCoupure, messageVerification};
    }
   /**
   * Permet de grouper les contraintes sociales par employé
   * @param: list
   * @param: keyGetter
   */
    public contraintesSocialesByEmployee(key: any, list: any, map: any, employe: EmployeeModel) {
      // pour supprimer la duplication de contrainte
      if (list.length) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].message.includes(this.translator.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT'))) {
            list.splice(i, 1);
            i--;
          }
        }
      }
      if (list.length) {
        list.forEach((item: any) => item.employee = employe);
        map.set(key, list);
      }
      return map;
    }


  /**
   * Récupère la liste des contraintes globales des employés
   */
  public getListConstraintGlobale(listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[],
                                  listContrainteDureeMinShift: VerificationContrainteModel[],
    listContrainteGlobale: any[], hiddenSaveGlobale: boolean, listContraintesSocialesByShift: Map<any, any>):
    {areBlocked: boolean, listContrainteMinTimeWithoutCoupure: VerificationContrainteModel[],
    listContrainteDureeMinShift : VerificationContrainteModel[], listContrainteGlobale: any[], hiddenSaveGlobale: boolean, listContraintesSocialesByShift: Map<any,any>} {
    let areBlocked = false;
    listContrainteGlobale = [];
    if (listContrainteMinTimeWithoutCoupure.length) {
      listContrainteGlobale = listContrainteMinTimeWithoutCoupure;
      listContrainteMinTimeWithoutCoupure.forEach((contrainte: VerificationContrainteModel) => {
        if (contrainte.dateOfAnomalie)
          contrainte.dateOfAnomalie = this.dateService.formatToShortDate(new Date(JSON.parse(JSON.stringify(contrainte.dateOfAnomalie))), '/');
        if (contrainte.bloquante) {
          areBlocked = contrainte.bloquante;
          hiddenSaveGlobale = true;
        }
      });
    } else {
      hiddenSaveGlobale = false;
      areBlocked = false;
    }

    if (listContrainteDureeMinShift.length) {
      if (listContrainteGlobale && listContrainteGlobale.length)
        listContrainteGlobale = listContrainteGlobale.concat(listContrainteDureeMinShift);
      else
        listContrainteGlobale = listContrainteDureeMinShift;

      listContrainteDureeMinShift.forEach((contrainte: VerificationContrainteModel) => {
        contrainte.dateOfAnomalie = this.dateService.formatToShortDate(new Date(JSON.parse(JSON.stringify(contrainte.dateOfAnomalie))), '/');
        if (contrainte.bloquante) {
          areBlocked = contrainte.bloquante;
          hiddenSaveGlobale = true;
        }
      });
    } else {
      if (!hiddenSaveGlobale) {
        hiddenSaveGlobale = false;
        areBlocked = false;
      }
    }
    listContraintesSocialesByShift.forEach((value) => {
      value.forEach((contrainte: any) => {
        areBlocked = areBlocked || contrainte.bloquante;
        if (!listContrainteGlobale.length || !listContrainteGlobale.some((constrainte: any) => constrainte.employee && constrainte.employee.idEmployee === contrainte.employee.idEmployee)) {
          listContrainteGlobale.unshift(contrainte);
        } else if ((listContrainteGlobale.some((constrainte: any) => constrainte.employee && constrainte.employee.idEmployee === contrainte.employee.idEmployee)
          && !listContrainteGlobale.some((constrainteElement: any) => constrainteElement.message === contrainte.message && constrainteElement.dateOfAnomalie === contrainte.dateOfAnomalie  && (constrainteElement.employee && constrainteElement.employee.idEmployee === contrainte.employee.idEmployee)))
        ) {
          listContrainteGlobale.unshift(contrainte);
        }
        if (contrainte.bloquante) {
          hiddenSaveGlobale = true;
        }
      });
    });
    return {areBlocked, listContrainteMinTimeWithoutCoupure,listContrainteDureeMinShift,listContrainteGlobale, hiddenSaveGlobale,listContraintesSocialesByShift};
  }

}
