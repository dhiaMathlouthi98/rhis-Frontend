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
import {VerificationContraintePlanningEquipierService} from './verification-contrainte-planning-equipier.service';


@Injectable({
  providedIn: 'root'
})
export class VerificationContraintePlanningEquipierViewHebdoService {
  public clone = rfdc();
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService,
              private contrainteSocialeService: ContrainteSocialeService, private shiftService: ShiftService, private datePipe: DatePipe,
              private helperService: HelperService, private contrainteSocialeCoupureService: ContrainteSocialeCoupureService,
              private translator: RhisTranslateService, private plgEquipierHelperService: PlgEquipierHelperService,
              private verificationContraintePlanningEquipierService: VerificationContraintePlanningEquipierService
  ) {


  }

  public verifContraintesForAllShift(shift: any,  employeVerifCs: any, employeeHasAnomalieContraintSocial: EmployeeModel,  listContraintesSocialesByShift: any,  messageVerification: VerificationContrainteModel, listContrainteOfLaodingWeek: VerificationContrainteModel[], dateContrainteAcheve: any, popupVerificationContrainteLoadingWeekVisibility: boolean, listContrainteOfLaodingWeekSuppression: VerificationContrainteModel[],  paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], decoupageHoraireFinEtDebutActivity: any, frConfig: any, listPairAndOdd: DisponiblitePairOrOdd[], modeAffichage: number, listJourFeriesByRestaurant: any, semaineRepos: SemaineReposModel[], paramDate: any, paramWeek: any, socialeConstraintesAreValid: boolean): any {
    popupVerificationContrainteLoadingWeekVisibility = false;
    if (listContraintesSocialesByShift.has(shift.idShift)) {
      listContraintesSocialesByShift.delete(shift.idShift);
    }
    const shiftRef = this.verificationContraintePlanningEquipierService.getShiftRef(shift);
    const employeCs = employeeHasAnomalieContraintSocial;

    shiftRef.jour = this.dateService.getJourSemaineFromInteger(new Date(shiftRef.dateJournee).getDay());
    if (!(shiftRef.heureDebut instanceof Date) || !(shiftRef.heureFin instanceof Date)) {
      this.dateService.setCorrectTimeToDisplayForShift(shiftRef);
    }
    let verificationContrainte = new VerificationContrainteModel();

    let statutCs;
    let statutDisponibilite = {};
    // verication durée minimum d'un shift
    const result =  this.contrainteSocialeService.verifDureeMinShift(shiftRef.heureFin, shiftRef.heureDebut);
    if (result) {
      statutCs = this.getStatuOfContrainst(result, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, null, shiftRef);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }
    // verification qualification
    verificationContrainte = this.contrainteSocialeService.validQualificationEmployee(shiftRef.positionTravail, employeCs.qualifications);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, false, shiftRef);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // disponibilité de l'employé (jours de repos, disponibilités du contrat...)
      const verificationDisponibilite = this.contrainteSocialeService.validDisponibiliteEmployee(employeVerifCs.contratActif, shiftRef, 'planning', decoupageHoraireFinEtDebutActivity, frConfig, listPairAndOdd);
      if (verificationDisponibilite.length > 0) {
        statutDisponibilite = this.verificationDisponibliteOfEmploye(shiftRef, verificationDisponibilite, dateContrainteAcheve, listContrainteOfLaodingWeek, socialeConstraintesAreValid);
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }

    ({listContrainteOfLaodingWeek, dateContrainteAcheve, socialeConstraintesAreValid} = {
      listContrainteOfLaodingWeek,
      dateContrainteAcheve,
      socialeConstraintesAreValid, ...statutDisponibilite
    });

    // disponibilité de l'employé (jours de repos)
      verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourRepos(semaineRepos, shiftRef, 'shift');
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, shiftRef);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

// disponibilité de l'employé (congé)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerConge(employeCs.absenceConges, shiftRef.dateJournee);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, shiftRef);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;


    // disponibilité de l'employé (jours feriés)
    verificationContrainte = this.contrainteSocialeService.validEmployeePeutTravaillerJourFeries(listJourFeriesByRestaurant, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, shiftRef, 'shift');
    if (verificationContrainte) {
      verificationContrainte.dateOfAnomalie = shift.acheval && !shift.modifiable && modeAffichage !== 0 ? this.dateService.formatToShortDate(JSON.parse(JSON.stringify(shiftRef.dateJournee)), '/') : null;
    }
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, shiftRef);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    if (shiftRef.jour === JourSemaine.DIMANCHE) {
      // Le collaborateur peut travailler le dimanche
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeDimanche(shiftRef.jour, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, shiftRef);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }

    // Le collaborateur peut travailler le weekend
      verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerLeWeekEnd(shiftRef.jour, shiftRef, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, paramWeek.jourDebutWeekEnd, paramWeek.jourFinWeekEnd, paramWeek.heureDebutWeekEnd, paramWeek.heureFinWeekEnd);
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, shiftRef);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;


    if (!listContrainteOfLaodingWeek.length) {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
        return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainteOfLaodingWeek,
      dateContrainteAcheve,
      popupVerificationContrainteLoadingWeekVisibility,
      listContrainteOfLaodingWeekSuppression,
      listContraintesSocialesByShift
    };
  }


  public verifContraintFromListShiftInWeek( newActiveEmployees: EmployeeModel[], employeVerifCs: any, employeeHasAnomalieContraintSocial: EmployeeModel,  messageVerification: VerificationContrainteModel, listContrainteOfLaodingWeek: VerificationContrainteModel[], dateContrainteAcheve: any, popupVerificationContrainteLoadingWeekVisibility: boolean, listContrainteOfLaodingWeekSuppression: VerificationContrainteModel[],  paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], decoupageHoraireFinEtDebutActivity: any, frConfig: any, listPairAndOdd: DisponiblitePairOrOdd[], modeAffichage: number, listJourFeriesByRestaurant: any, paramDate: any, paramWeek: any, socialeConstraintesAreValid: boolean
    , weekDates: string[], listShiftInWeek?: ShiftModel[], listInthreeWeek?: ShiftModel[]){

    const employeCs = this.getEmployeCs(listShiftInWeek[0], employeeHasAnomalieContraintSocial, modeAffichage, listShiftInWeek);
    let verificationContrainte = new VerificationContrainteModel();
    let statutCs;
    const dates = JSON.parse(JSON.stringify(weekDates));
    const employeHasContrat = employeCs;
    const totalWeekWithBreak = this.shiftService.getWeekTotalHours(dates, this.clone(employeCs.employeeWeekShiftCS), employeHasContrat, paramNationaux, listOfBreakAndShift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, employeCs.listShiftPreviousAndLastWekk, null, true);
    const listShiftWithAbsence = [];
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
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, false, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Les jours de repos doivent-ils être consécutifs

    verificationContrainte = this.contrainteSocialeService.validJourReposConsecutif(this.helperService.getJourRepos(listShiftInWeek), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeVerifCs.contratActif);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    // Nb d'heure maxi par semaine
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParSemaine(+totalWeekWithBreak, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb
    // de jours de repos mini dans une semaine
    const listShiftSemaineByEmployee = listShiftInWeek.filter((value: ShiftModel) => (!value.acheval || (value.acheval && value.modifiable)));
    verificationContrainte = this.contrainteSocialeService.validNombreJourOffDansUneSemaine(this.helperService.getNombreDeJourOffDansUneSemaine(listShiftSemaineByEmployee, null), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb maxi de jours travaillés consécutifs dans 1 sem
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansUneSemaine(this.helperService.getNombreDeJourTravaillerDansUneSemaine(null, listShiftSemaineByEmployee, paramDate.premierJourDeLaSemaine), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb maxi de jours travaillés consécutifs dans 2 sem
    // Nb des jours travaillés dans les deux premieres semaines 0-1
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.verificationContraintePlanningEquipierService.getNombreDeJourTravaillerDansDeuxSemaines(1, employeCs, paramDate.selectedDate, paramDate.premierJourDeLaSemaine, listInthreeWeek), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Nb des jours travaillés dans les deux deuxiemes semaines 1-2
    verificationContrainte = this.contrainteSocialeService.validNombreJourTravaillerDansDeuxSemaines(this.verificationContraintePlanningEquipierService.getNombreDeJourTravaillerDansDeuxSemaines(3, employeCs, paramDate.selectedDate, paramDate.premierJourDeLaSemaine, listInthreeWeek), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeHasAnomalieContraintSocial, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    if (listContrainteOfLaodingWeek.length) {
      socialeConstraintesAreValid = false;
    }else {
      socialeConstraintesAreValid = true;
    }

    return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainteOfLaodingWeek,
      dateContrainteAcheve,
      popupVerificationContrainteLoadingWeekVisibility,
      listShiftSemaineByEmployee,
      newActiveEmployees,
      listContrainteOfLaodingWeekSuppression

    };
  }

  public verifContraintFromListShiftInDay(employeeShiftsList: any,  employeVerifCs: any, employeeHasAnomalieContraintSocial: EmployeeModel,  messageVerification: VerificationContrainteModel, listContrainteOfLaodingWeek: VerificationContrainteModel[], dateContrainteAcheve: any, popupVerificationContrainteLoadingWeekVisibility: boolean, listContrainteOfLaodingWeekSuppression: VerificationContrainteModel[],  paramNationaux: ParametreNationauxModel, listOfBreakAndShift: BreakAndShiftOfParametresNationauxModel[], decoupageHoraireFinEtDebutActivity: any, frConfig: any, listPairAndOdd: DisponiblitePairOrOdd[], modeAffichage: number, listJourFeriesByRestaurant: any, paramDate: any, paramWeek: any, socialeConstraintesAreValid: boolean
                                          , weekDates: string[], listShiftInWeek?: ShiftModel[]){

    let employeesShift = [];
    let verificationContrainte = new VerificationContrainteModel();
    const employeCs = this.getEmployeCs(null, employeeHasAnomalieContraintSocial, modeAffichage, listShiftInWeek);
    let totalInDay = this.plgEquipierHelperService.getHoursInDay(employeeShiftsList);
    totalInDay = +this.dateService.convertNumberToTime(totalInDay);
    let statutCs;
    const employeHasContrat = employeCs;
    employeHasContrat.loiEmployee = employeVerifCs.listLoi;
    employeHasContrat.contrats[0].tempsPartiel = employeVerifCs.tempsTravailPartiel;
    // calcul total temps absence de la journee
    let totalTempsAbsence = 0;
    employeCs.weekDetailsPlannings.forEach((wdp: WeekDetailsPlanning) => {
      totalTempsAbsence += wdp.totalAbsence;
    });

    // Vérification de la Durée minimum non consecutive
    const totalDayWithBreakForMinShift = this.shiftService.getDayTotalHoursForEmployee(this.clone(employeeShiftsList), employeHasContrat, paramNationaux, listOfBreakAndShift, 0, null, null, null, false);
    verificationContrainte = this.contrainteSocialeService.validDureeMinNonConsecutive(employeeShiftsList, employeVerifCs.tempsTravailPartiel, this.helperService.getNombreHeureTravaille(+totalDayWithBreakForMinShift), employeVerifCs.listLoi, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0], false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;


    // Nombre heure Max Par Jour Si plannifie
    // recupere les shift apres ou avant de shift current de la journée
    const dateShiftCurrent = this.clone(employeeShiftsList[0].dateJournee);
    const listShiftInDayCurrent = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(dateShiftCurrent)));
    const previousOrLastOfShiftInDay = this.verificationContraintePlanningEquipierService.getPreviousOrLastShiftsOfShiftAcheval(modeAffichage, dateShiftCurrent, employeCs, employeHasContrat, weekDates);
    const totalDayWithBreak = this.shiftService.getDayTotalHoursForEmployee(this.clone(listShiftInDayCurrent), employeHasContrat, paramNationaux, listOfBreakAndShift, modeAffichage, decoupageHoraireFinEtDebutActivity, frConfig, previousOrLastOfShiftInDay, false);
    verificationContrainte = this.contrainteSocialeService.validNombreHeureMaxParJourSiPlannifie(this.helperService.getNombreHeureTravaille(+totalDayWithBreak), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;


    // Nombre Shift Max Par Jour
    verificationContrainte = this.contrainteSocialeService.validNombreShiftMaxParJour(this.helperService.addShiftToListShiftByDayWithBreak(employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeeShiftsList), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Le collaborateur ne peut travailler après heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerApresHeure(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Le collaborateur ne peut travailler avant heure
    verificationContrainte = this.contrainteSocialeService.validCollaborateurPeutTravaillerAvantHeure(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // Amplitude journaliere maximale.
    verificationContrainte = this.contrainteSocialeService.validAmplitudeJounaliereMaximale(employeeShiftsList.filter((value: ShiftModel) => (!value.acheval || (value.acheval && value.modifiable))), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // //  Heure de repos min entre 2 jours
    const previousOrNextListShit = this.helperService.getListShiftOrBeforeLastDay(paramDate.selectedDate, paramDate.premierJourDeLaSemaine, employeCs, employeeShiftsList[0]);
    verificationContrainte = this.contrainteSocialeService.validHeureRepoMinEntreDeuxJours(this.helperService.getLastDayValues(employeeShiftsList[0], listShiftInWeek, previousOrNextListShit), employeeShiftsList.filter((value: ShiftModel) => ((!value.acheval) || (value.acheval && value.modifiable))), this.helperService.getNextDayValues(employeeShiftsList[0], listShiftInWeek, previousOrNextListShit), employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, paramDate.limiteHeureDebut);
    statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
    messageVerification = statutCs.messageVerification;
    popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
    socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;

    // valider pause planifier
    const isBreak = this.contrainteSocialeService.validPausePlanifier(employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    employeesShift = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => moment(this.dateService.setTimeNull(element.dateJournee)).isSame(this.dateService.setTimeNull(employeeShiftsList[0].dateJournee)) && (!element.acheval || (element.acheval && element.modifiable)));
    verificationContrainte = this.helperService.verificationContraintMaxShiftWithoutBreak(employeeShiftsList[0], employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur, employeesShift);
    if (verificationContrainte) {
      if (isBreak) {
        statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
        messageVerification = statutCs.messageVerification;
        popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
        socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
      } else {
        socialeConstraintesAreValid = socialeConstraintesAreValid && true;
      }
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    verificationContrainte = this.shiftService.getPauseBetwenShift(employeeShiftsList, employeVerifCs.listLoi, employeVerifCs.tempsTravailPartiel, employeVerifCs.mineur);
    if (verificationContrainte) {
      verificationContrainte.dateOfAnomalie = this.dateService.formatToShortDate(JSON.parse(JSON.stringify(listShiftInDayCurrent[0].dateJournee)), '/');
      statutCs = this.getStatuOfContrainst(verificationContrainte, messageVerification, listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility, socialeConstraintesAreValid, true, employeeShiftsList[0],false, true);
      messageVerification = statutCs.messageVerification;
      popupVerificationContrainteLoadingWeekVisibility = statutCs.popupVerificationContrainteLoadingWeekVisibility;
      socialeConstraintesAreValid = statutCs.socialeConstraintesAreValid;
    }
    if (listContrainteOfLaodingWeek.length) {
      socialeConstraintesAreValid = false;
    }else {
      socialeConstraintesAreValid = true;
    }


    return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainteOfLaodingWeek,
      dateContrainteAcheve,
      popupVerificationContrainteLoadingWeekVisibility,
      listShiftInWeek,
      listContrainteOfLaodingWeekSuppression,

    };
  }
  /**
   * recupere l'employee pour untiliser dans le cs
   * @param shiftRef
   * @param employeeHasAnomalieContraintSocial
   * @param modeAffichage
   */
  public getEmployeCs(shiftRef: ShiftModel, employeeHasAnomalieContraintSocial: EmployeeModel, modeAffichage: number, listShiftInWeek?: ShiftModel[]): EmployeeModel {
    const employeCs =  employeeHasAnomalieContraintSocial;
    if(listShiftInWeek){
      employeCs.employeeWeekShiftCS = listShiftInWeek;
    }
    //employeCs.listShiftForThreeWeek = [];
    employeCs.employeeWeekShiftCS.forEach((sh: any) => {
      if (sh.acheval) {
        sh.heureDebut = sh.heureDebutCheval;
        sh.heureFin = sh.heureFinCheval;
      }
    });
    if (shiftRef && (!employeCs.listShiftForThreeWeek || employeCs.listShiftForThreeWeek.length === 0)) {
      employeCs.listShiftForThreeWeek = [];
      employeCs.listShiftForThreeWeek = shiftRef.employee.listShiftForThreeWeek;

    }
    if (modeAffichage === 2) {
      this.verificationContraintePlanningEquipierService.addAChevalShifts(employeCs.employeeWeekShiftCS);
    } else {
      employeCs.employeeWeekShiftCS = employeCs.employeeWeekShiftCS.filter((element: ShiftModel) => ((element.acheval && element.modifiable) || !element.acheval));
    }
    return employeCs;
  }


  private verificationDisponibliteOfEmploye(shiftRef, verificationDisponibilite, dateContrainteAcheve: any, listContrainteOfLaodingWeek, socialeConstraintesAreValid): any {
    verificationDisponibilite.forEach(item => {
      if (item.acheval) {
        const shiftAcheveToSave = this.clone(shiftRef);
        dateContrainteAcheve = this.dateService.formatToShortDate(shiftAcheveToSave.dateJournee.setDate(shiftAcheveToSave.dateJournee.getDate() + 1), '/');
      }
      item.employe = this.clone(shiftRef.employee);
      item.employee = this.clone(shiftRef.employee);
      item.idShift = this.clone(shiftRef.idShift);
      item.dateOfAnomalie = this.dateService.formatToShortDate(JSON.parse(JSON.stringify(shiftRef.dateJournee)), '/') ;
      listContrainteOfLaodingWeek.push(item);
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    });
    return {
      socialeConstraintesAreValid,
      listContrainteOfLaodingWeek,
      dateContrainteAcheve
    };
  }
  /**
   * recuperer le non de cs et le statut bloquante ou nn bloquante
   * @param verificationContrainte
   * @param listContrainteOfLaodingWeek
   * @param socialeConstraintesAreValid
   */
  public getStatuOfContrainst(verificationContrainte: any, messageVerification: VerificationContrainteModel, listContrainteOfLaodingWeek: VerificationContrainteModel[], popupVerificationContrainteLoadingWeekVisibility: boolean, socialeConstraintesAreValid: boolean, popupVerificationContrainteLoadingWeekVisibilityCheck: boolean, shiftOrEmployee: any, fromWeek?: boolean,
                              fromDay?: boolean): any {
    if (verificationContrainte) {
      popupVerificationContrainteLoadingWeekVisibilityCheck ? popupVerificationContrainteLoadingWeekVisibility = true : messageVerification = {} as VerificationContrainteModel;
      messageVerification.bloquante = verificationContrainte.bloquante;

      verificationContrainte.employe = fromWeek ? shiftOrEmployee : this.clone(shiftOrEmployee.employee);
      verificationContrainte.employee = verificationContrainte.employe;
        verificationContrainte.idShift = fromWeek || fromDay ?  0 : this.clone(shiftOrEmployee.idShift) ;

        verificationContrainte.dateOfAnomalie = fromWeek ?  null : this.dateService.formatToShortDate(JSON.parse(JSON.stringify(shiftOrEmployee.dateJournee)), '/') ;
      const sameMessage = listContrainteOfLaodingWeek.some((constrainteElement: any) => constrainteElement.message === verificationContrainte.message && constrainteElement.dateOfAnomalie ===  verificationContrainte.dateOfAnomalie && constrainteElement.employee && constrainteElement.employee.idEmployee === verificationContrainte.employee.idEmployee);
      if (!listContrainteOfLaodingWeek.length  || !sameMessage) {
            listContrainteOfLaodingWeek.unshift(verificationContrainte);
          }
      socialeConstraintesAreValid = socialeConstraintesAreValid && false;
    } else {
      socialeConstraintesAreValid = socialeConstraintesAreValid && true;
    }
    return {
      socialeConstraintesAreValid,
      messageVerification,
      listContrainteOfLaodingWeek, popupVerificationContrainteLoadingWeekVisibility

    };
  }

}
