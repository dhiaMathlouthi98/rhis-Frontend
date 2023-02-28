import {Injectable} from '@angular/core';
import {JoursFeriesService} from '../module/params/jours-feries/service/jours.feries.service';
import {DatePipe} from '@angular/common';
import {EmployeeModel} from '../model/employee.model';
import * as moment from 'moment';
import {VerificationContrainteModel} from '../model/verificationContrainte.model';
import {ValidationContrainteSocialeModel} from '../enumeration/validationContrainteSociale.model';
import {SharedRestaurantService} from './shared.restaurant.service';
import {RhisTranslateService} from './rhis-translate.service';
import {DateService} from './date.service';
import {ContratModel} from '../model/contrat.model';
import {CodeNameContrainteSocial} from '../enumeration/codeNameContrainteSocial';
import {SemaineReposModel} from '../model/semaineRepos.model';
import {JourFeriesModel} from '../model/jourFeries.model';
import {AbsenceCongeModel} from '../model/absence.conge.model';
import {ShiftModel} from '../model/shift.model';
import {ParametreGlobalService} from 'src/app/modules/home/configuration/service/param.global.service';
import {DisponiblitePairOrOdd} from '../enumeration/disponiblitePairOrOdd';
import {JourDisponibiliteModel} from '../model/jourDisponibilite.model';
import {JourSemaine} from '../enumeration/jour.semaine';
import {QualificationModel} from '../model/qualification.model';
import {PositionTravailModel} from '../model/position.travail.model';
import * as rfdc from 'rfdc';
import { SessionService } from './session.service';


class WeekEnd {
  debutWeekend: Date;

  finWeekend: Date;
}

/**
 *  - Heure de repos min entre 2 jours (done)
 *  - disponibilité de l'employé (jours de repos, disponibilités du contrat...) (done)
 * Nb d'heure maxi par semaine  (done)
 - Les jours de repos doivent-ils être consécutifs(done)
 *  - Nb maxi de jours travaillés consécutifs ans 2 sem (done)
 - Le collaborateur peut travailler le weekend ?
 * Nb d'heures maxi par jour si planifié  (done)
 - Amplitude journalière maximal (done)
 * Nb shift maximum par jour  (done)
 - Nb de jours de repos mini dans une semaine(done)
 - Nb maxi de jours travaillés consécutifs ans 1 sem (done)
 - Le collaborateur ane peut traviller après heure?
 - Le collaborateur ne peut travailler avant heure ?
 - Le collaborateur peut travailler le dimanche ?
 - Le collaborateur peut travailler les jours fériés ? (done)
 - Heure planifié pas supérieure au nombre d'heure contrat. (bloquante) (DONE)
 - Contrat actif sur toute la période défini (done)
 */

@Injectable({
  providedIn: 'root'
})
export class ContrainteSocialeService {
  public amHeureDebut;
  public pmHeureDebut;
  public amHeureFin;
  public pmHeureFin;
  public congeDisplay = [];
  public listPairAndOdd: DisponiblitePairOrOdd [] = [];
  public sizeJourDisponiblite = 0;
  public ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
  public clone = rfdc();


  constructor(private sharedRestaurant: SharedRestaurantService,
              private jourFerierService: JoursFeriesService,
              private rhisTranslateService: RhisTranslateService,
              private dateService: DateService,
              private datePipe: DatePipe,
              private parametreGlobalService: ParametreGlobalService,
              private sessionService: SessionService
  ) {
  }


  public validDisponibiliteEmployee(contratActif: ContratModel, shift: any, filter, decoupageHoraireFinEtDebutActivity: any, frConfig: any, pairAndOdd?: DisponiblitePairOrOdd []): VerificationContrainteModel[] {
    const verificationContraintes: VerificationContrainteModel[] = [];
    this.listPairAndOdd = pairAndOdd;
    let jour;
    if (filter === 'shiftFixe') {
      jour = shift.jour;
    } else {
      jour = JSON.parse(JSON.stringify(shift.dateJournee));
      jour = new Date(jour);
      jour = this.dateService.getJourSemaine(jour);
    }
    if (contratActif) {
      // disponibilite contrat
      let contraintesDisponibilite;
      let contraintesDisponibiliteAcheve;
      if (shift.acheval && !shift.shiftInLastWeek && shift.modifiable) {
        let nextDay;
        let dateShift;
        let dateShiftNext;
        if (filter === 'shiftFixe') {
          const numJour = this.dateService.getIntegerValueFromJourSemaine(shift.jour);
          dateShift = this.dateService.getDateOfEnumertionJour(shift.jour);
          const day = numJour < 6 ? numJour + 1 : 0;
          nextDay = this.dateService.getJourSemaineFromInteger(day);
          dateShiftNext = this.dateService.getDateOfEnumertionJour(nextDay);
        } else {
          nextDay = this.clone(shift.dateJournee);
          dateShift = this.clone(shift.dateJournee);
          nextDay = new Date((new Date(nextDay)).getTime() + (24 * 60 * 60 * 1000));
          dateShiftNext = this.clone(nextDay);
          nextDay = this.dateService.getJourSemaine(nextDay);
        }
        const decoupageHoraire = this.getDebutAndFinActivite(dateShift, dateShiftNext, decoupageHoraireFinEtDebutActivity, frConfig);
        const shiftDisplay = this.clone(shift);
        const shiftAcheval = this.clone(shift);
        shiftDisplay.heureFin = decoupageHoraire.finJourneeActiviteRefrence;
        shiftAcheval.heureDebut = decoupageHoraire.debutJourneeActiviteRefrence;
        if (filter === 'shiftFixe') {
          shiftDisplay.dateFinIsNight = decoupageHoraire.nightValueFin;
          shiftAcheval.dateDebutIsNight = false;
          shiftAcheval.dateFinIsNight = false;
        } else {
          shiftDisplay.heureFinIsNight = decoupageHoraire.nightValueFin;
          shiftAcheval.heureDebutIsNight = false;
          shiftAcheval.heureFinIsNight = false;
        }
        contraintesDisponibilite = this.verificationDisponibiliteContrat(contratActif, shiftDisplay, jour, filter);
        contraintesDisponibiliteAcheve = this.verificationDisponibiliteContrat(contratActif, shiftAcheval, nextDay, filter);
      } else {
        contraintesDisponibilite = this.verificationDisponibiliteContrat(contratActif, shift, jour, filter);
      }
      // pour gerer l 'affichage de disponibilite pour n shift
      if (contraintesDisponibiliteAcheve && contraintesDisponibiliteAcheve.length) {
        contraintesDisponibiliteAcheve.forEach((contrainte: VerificationContrainteModel) => {
          contrainte.acheval = true;

        });
        if (contraintesDisponibilite && contraintesDisponibilite.length) {

          contraintesDisponibilite.forEach((contrainte: VerificationContrainteModel) => {
            contrainte.DisplayDate = true;

          });
        }
        contraintesDisponibilite = contraintesDisponibilite.concat(contraintesDisponibiliteAcheve);
      }
      if (contraintesDisponibilite.length > 0) {
        contraintesDisponibilite.forEach(contrainte => {
          verificationContraintes.push(contrainte);
        });
      }

    }
    return verificationContraintes;
  }

  public validHebdoEmployee(contratActif: ContratModel, total, totalTempsAbsenceSemaine?: number): VerificationContrainteModel {
    if (totalTempsAbsenceSemaine !== undefined) {
      totalTempsAbsenceSemaine = totalTempsAbsenceSemaine / 60;
    } else {
      totalTempsAbsenceSemaine = 0;
    }
    let verificationContrainte;
    if (contratActif) {
      if ((+contratActif.hebdo * (1 + (+contratActif.compt / 100)) - totalTempsAbsenceSemaine) < +total) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.bloquante = true;
        verificationContrainte.message = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIE_VALEUR_HEBDO_CONTRAT') + ' ' + (+(contratActif.hebdo * (1 + (contratActif.compt / 100)))).toFixed(2) + '\r\n' + this.rhisTranslateService.translate('SHIFT_FIXE.VALEUR_SAISIE') + ' ' + (+total + totalTempsAbsenceSemaine).toFixed(2);
      }
    }
    return verificationContrainte;
  }

  public validQualificationEmployee(selectedPosifitionTravail: PositionTravailModel, employeQualificationList: QualificationModel[]): VerificationContrainteModel {
    let verificationContrainte: VerificationContrainteModel;
    let employeeQualification = null;
    if (employeQualificationList && employeQualificationList.length) {
      employeeQualification = employeQualificationList.find((qualif: any) => qualif.positionTravail.idPositionTravail === selectedPosifitionTravail.idPositionTravail);
    }
    if (!employeeQualification) {
      verificationContrainte = new VerificationContrainteModel();
      verificationContrainte.bloquante = false;
      verificationContrainte.message = this.rhisTranslateService.translate('PLANNING_EQUIPIER.VERIFICATION_QUALIFICATION');
    } else if (employeeQualification && employeeQualification.valeurQualification < selectedPosifitionTravail.minQualfication) {
      verificationContrainte = new VerificationContrainteModel();
      verificationContrainte.bloquante = false;
      verificationContrainte.message = this.rhisTranslateService.translate('PLANNING_EQUIPIER.VERIFICATION_QUALIFICATION_MINIMALE');
    }

    return verificationContrainte;
  }

  public validEmployeePeutTravaillerConge(AbsenceConge: AbsenceCongeModel[], dateShift): VerificationContrainteModel {
    let verificationContrainte;
    if (AbsenceConge) {
      this.displayConge(AbsenceConge);
      this.congeDisplay.forEach(conge => {
        if (moment(this.dateService.setTimeNull(new Date(dateShift))).isSame(conge.dateDebutDisplayInPlanningManagerOrLeader)) {
          verificationContrainte = new VerificationContrainteModel();
          verificationContrainte.bloquante = true;
          verificationContrainte.message = this.rhisTranslateService.translate('PLANNING_MANAGER.COLLABORATEUR_PEUT_TRAVAILLER_CONGE');
        }
      });
    }
    return verificationContrainte;
  }

  public validEmployeePeutTravaillerJourRepos(listSemaineRepos: SemaineReposModel[], shift: any, filter): VerificationContrainteModel {
    let verificationContrainte;
    listSemaineRepos.forEach((semaineRepos) => {
      semaineRepos.joursRepos.forEach((jour) => {
        this.isAmOrPmHeureDebutOrHeureFin(shift.heureDebut, 'debut');
        this.isAmOrPmHeureDebutOrHeureFin(shift.heureFin, 'fin');
        jour.dateRepos = this.dateService.setTimeNull(jour.dateRepos);
        if (filter === 'shiftFixe') {

          if (shift.dateDebut) {
            shift.dateDebut = this.dateService.setTimeNull(shift.dateDebut);
          }
          if (shift.dateFin) {
            shift.dateFin = this.dateService.setTimeNull(shift.dateFin);
          }
          if ((moment(shift.dateDebut).isSameOrBefore(jour.dateRepos) &&
            moment(shift.dateFin).isSameOrAfter(jour.dateRepos)) ||
            (moment(shift.dateDebut).isSameOrBefore(jour.dateRepos) && !shift.dateFin) ||
            (!shift.dateFin && !shift.dateDebut)) {
            if ((shift.jour === jour.jourSemaine && ((jour.am && jour.pm) ||
              (jour.am && (this.amHeureDebut || this.amHeureFin)) || ((jour.pm && (this.pmHeureDebut || this.pmHeureFin)))))) {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = true;
              verificationContrainte.message = jour.jourSemaine + ' ' + this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIE_SEMAINE_REPOS');
            }
          }
        } else {
          shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
          if ((moment(shift.dateJournee).isSame(jour.dateRepos) && ((jour.am && jour.pm) ||
            (jour.am && (this.amHeureDebut || this.amHeureFin)) || ((jour.pm && (this.pmHeureDebut || this.pmHeureFin)))))) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = true;
            verificationContrainte.message = jour.jourSemaine + ' ' + this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIE_SEMAINE_REPOS');
          }
        }
      });

    });
    return verificationContrainte;
  }

  public validDureeMinNonConsecutive(listShift, tempsTravailPartiel, nombreHeureJournalier: Date, listLoi, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let totalTravaillerEnMinute = 0;
    listShift.forEach((shift: any) => {
      totalTravaillerEnMinute += Math.abs(shift.heureFin.getTime() - shift.heureDebut.getTime()) / 60000;
    });
    const nombreHeureTravaillerJournalier = new Date();
    nombreHeureTravaillerJournalier.setHours(Math.floor(totalTravaillerEnMinute / 60));
    nombreHeureTravaillerJournalier.setMinutes(totalTravaillerEnMinute - (nombreHeureTravaillerJournalier.getHours() * 60));
    nombreHeureTravaillerJournalier.setSeconds(0);
    nombreHeureTravaillerJournalier.setMilliseconds(0);
    const item = listLoi.find((val: any) => val.codeName === CodeNameContrainteSocial.DURRE_MIN_NON_CONSECUTIF);
    const maxBreak = listLoi.find((val: any) => val.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK);
    if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
      if (tempsTravailPartiel) {
        if (mineur) {
          if ((nombreHeureTravaillerJournalier <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMineurTempsPartiel)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        } else {
          if ((nombreHeureTravaillerJournalier <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMajeurTempsPartiel)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        }
      } else if (!tempsTravailPartiel) {
        if (mineur) {
          if ((nombreHeureTravaillerJournalier <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMineurTempsPlein)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        } else {
          if ((nombreHeureTravaillerJournalier <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMajeurTempsPlein)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        }
      }
    } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

      if (tempsTravailPartiel) {
        if (mineur) {
          if ((nombreHeureTravaillerJournalier >= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMineurTempsPartiel)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        } else {
          if ((nombreHeureTravaillerJournalier >= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMajeurTempsPartiel)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        }
      } else if (!tempsTravailPartiel) {
        if (mineur) {
          if ((nombreHeureTravaillerJournalier >= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMineurTempsPlein)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        } else {
          if ((nombreHeureTravaillerJournalier >= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) && !this.areShiftsConsecutifs(listShift, maxBreak.valeurMajeurTempsPlein)) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = item.bloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_CONSECUTIVE');
          }
        }
      }
    }

    return verificationContrainte;
  }

  public validNombreHeureMaxParJourSiPlannifie(nombreHeureJournalier: Date, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_MAXI_JOUR_PLANIFIE) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_maxi_jour_planifiées') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validNombreHeureMaxParSemaine(nombreHeureHebdomadaire: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_MAXI_SEMAINE) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureHebdomadaire < +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreHeureHebdomadaire < +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreHeureHebdomadaire < +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureHebdomadaire < +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          valeurAffiche = item.valeurMajeurTempsPlein;

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureHebdomadaire > +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreHeureHebdomadaire > +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreHeureHebdomadaire > +item.valeurMineurTempsPlein) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureHebdomadaire > +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_max_par_semaine') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validNombreHeureMinParSemaine(nombreHeureHebdomadaire: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_MINI_SEMAINE) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureHebdomadaire < +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreHeureHebdomadaire < +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreHeureHebdomadaire < +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureHebdomadaire < +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          valeurAffiche = item.valeurMajeurTempsPlein;

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureHebdomadaire > +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreHeureHebdomadaire > +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreHeureHebdomadaire > +item.valeurMineurTempsPlein) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureHebdomadaire > +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_semaine') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validDureeMinimumShift(dureeShift: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    dureeShift = this.dateService.setTimeFormatHHMM(dureeShift);
    dureeShift = this.dateService.setSecondAndMilliSecondsToNull(dureeShift);
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (dureeShift < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (dureeShift < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (dureeShift < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (dureeShift < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          valeurAffiche = item.valeurMajeurTempsPlein;

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (dureeShift > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (dureeShift > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (dureeShift > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (dureeShift > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.DUREE_MIN_SHIFT') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validNombreHeureMinSansCoupure(numHourInDay: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    numHourInDay = this.dateService.getNombreHeureTravaille(numHourInDay);
    numHourInDay = this.dateService.setSecondAndMilliSecondsToNull(numHourInDay);
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_MIN_SANS_COUPURES) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (numHourInDay <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (numHourInDay <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (numHourInDay <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (numHourInDay <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          valeurAffiche = item.valeurMajeurTempsPlein;

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (numHourInDay >= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (numHourInDay >= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (numHourInDay >= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (numHourInDay >= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = +item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini_coupure') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }
  public verifCSContratMinSansCoupure(employeeToCheck: EmployeeModel, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean): any {
    let checkCSCoupure: boolean;
    let verificationContrainte;
    const hebdoContratValue = employeeToCheck.hebdoCourant * 60;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (hebdoContratValue < this.dateService.timeStringToNumber(item.valeurMineurTempsPartiel)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            } else {
              if (hebdoContratValue < this.dateService.timeStringToNumber(item.valeurMajeurTempsPartiel)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (hebdoContratValue < this.dateService.timeStringToNumber(item.valeurMineurTempsPlein)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            } else {
              if (hebdoContratValue < this.dateService.timeStringToNumber(item.valeurMajeurTempsPlein)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (hebdoContratValue > this.dateService.timeStringToNumber(item.valeurMineurTempsPartiel)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            } else {
              if (hebdoContratValue > this.dateService.timeStringToNumber(item.valeurMajeurTempsPartiel)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (hebdoContratValue > this.dateService.timeStringToNumber(item.valeurMineurTempsPlein)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            } else {
              if (hebdoContratValue > this.dateService.timeStringToNumber(item.valeurMajeurTempsPlein)) {
                checkCSCoupure = false;
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' 0';
              } else {
                checkCSCoupure = true;
              }
            }
          }
        }
      }
    });
    return {checkCSCoupure, verificationContrainte};
  }
  public validNombreMaxCoupureParSemaine(nbrCoupure: number, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, verifContrainte: any): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    if(verifContrainte.checkCSCoupure){
      listLoi.forEach(item => {
        if (item.codeName === CodeNameContrainteSocial.NB_COUPURE_SEMAINE) {
          if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
  
            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (nbrCoupure < +item.valeurMineurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (nbrCoupure < +item.valeurMajeurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (nbrCoupure < +item.valeurMineurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (nbrCoupure < +item.valeurMajeurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = +item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              }
            }
          } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
            valeurAffiche = item.valeurMajeurTempsPlein;
  
            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (nbrCoupure > +item.valeurMineurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (nbrCoupure > +item.valeurMajeurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (nbrCoupure > +item.valeurMineurTempsPlein) {
  
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (nbrCoupure > +item.valeurMajeurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = +item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_COUPURE_SEMAINE') + ' ' + valeurAffiche;
                }
              }
            }
          }
        }
      });
    } else if(nbrCoupure && verifContrainte.verificationContrainte){
      verificationContrainte = verifContrainte.verificationContrainte;
    }
    
    return verificationContrainte;
  }

  public validNombreShiftMaxParJour(nombreShift: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_SHIFT_MAX_JOUR) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreShift < +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreShift < +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreShift < +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreShift < +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreShift > +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (nombreShift > +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (nombreShift > +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreShift > +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_shifts_maximum_jour') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validNombreHeureMinParJourSiPlannifie(nombreHeureJournalier: Date, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_MINI_JOUR) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;

              if (nombreHeureJournalier < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (nombreHeureJournalier > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_heures_mini__jour') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validAmplitudeJounaliereMaximale(listSelected: any[], listLoi, tempsTravailPartiel, mineur): any {
    let verificationContrainte;
    const amplitude: Date = new Date();
    let minutesCumule = 0;
    listSelected.sort((a, b) => a.heureDebut - b.heureDebut);
    const premiereHeureDebut = listSelected[0].heureDebut;
    const derniereHeureFin = listSelected[listSelected.length - 1].heureFin;

    let differenceHeure = derniereHeureFin.getHours() - premiereHeureDebut.getHours();
    if (differenceHeure < 0) {
      differenceHeure += 24;

    }
    let differenceMinutes = derniereHeureFin.getMinutes() - premiereHeureDebut.getMinutes();
    if (differenceMinutes < 0) {
      differenceMinutes += 60;
      differenceHeure -= 1;
    }
    if (differenceHeure === 0 && differenceMinutes <= 0) {
      differenceHeure = 24 + differenceMinutes;
    }
    minutesCumule += ((differenceHeure * 60) + differenceMinutes);
    amplitude.setHours(minutesCumule / 60);
    amplitude.setMinutes(minutesCumule - (amplitude.getHours() * 60));
    amplitude.setSeconds(0);
    amplitude.setMilliseconds(0);
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.AMPLITUDE_JOUR_MAX) {
        let valeurAmplitude;
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAmplitude = item.valeurMineurTempsPartiel;

              if (amplitude < this.dateService.setTimeFormatHHMM(valeurAmplitude)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMineurTempsPartiel;
              }
            } else {
              valeurAmplitude = item.valeurMajeurTempsPartiel;
              if (amplitude < this.dateService.setTimeFormatHHMM(valeurAmplitude)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAmplitude = item.valeurMineurTempsPlein;
              if (amplitude < this.dateService.setTimeFormatHHMM(valeurAmplitude)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMineurTempsPlein;
              }
            } else {
              valeurAmplitude = item.valeurMajeurTempsPlein;
              if (amplitude < this.dateService.setTimeFormatHHMM(valeurAmplitude)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMajeurTempsPlein;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAmplitude = item.valeurMineurTempsPartiel;

              if (amplitude > this.dateService.setTimeFormatHHMM(valeurAmplitude)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMineurTempsPartiel;
              }
            } else {
              valeurAmplitude = item.valeurMajeurTempsPartiel;
              if (amplitude > this.dateService.setTimeFormatHHMM(valeurAmplitude)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAmplitude = item.valeurMineurTempsPlein;
              if (amplitude > this.dateService.setTimeFormatHHMM(valeurAmplitude)) {

                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMineurTempsPlein;
              }
            } else {
              valeurAmplitude = item.valeurMajeurTempsPlein;
              if (amplitude > this.dateService.setTimeFormatHHMM(valeurAmplitude)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Amplitude_journaleere_maximale_message') + item.valeurMajeurTempsPlein;
              }
            }
          }
        }
      }
    });

    return verificationContrainte;
  }

  public validHeureContrat(employee: EmployeeModel, nombreHeureHebdomadaireMinutes: number): VerificationContrainteModel {
    let verificationContrainte;
    if (employee.contrats) {
      const nombreHeureHebdomadaireContratMinutes = employee.contrats[0].hebdo * 60;
      if (nombreHeureHebdomadaireContratMinutes < nombreHeureHebdomadaireMinutes) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.bloquante = true;
        verificationContrainte.message = this.rhisTranslateService.translate('SHIFT_FIXE.ANOMALIE_VALEUR_HEBDO_CONTRAT');
      }
    }
    return verificationContrainte;
  }

  public validContratActifSurTouteLaPeriodeDefinie(employee: EmployeeModel) {
    let verificationContrainte;
    if (!employee.contrats) {
      verificationContrainte = new VerificationContrainteModel();
      verificationContrainte.bloquante = true; // a verifier
      verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.CONTRAT_NON_DEFINI_JOUR');
    }
    return verificationContrainte;
  }

  public validEmployeePeutTravaillerJourFeries(listJourFeries, listLoi, tempsTravailPartiel, mineur, shift: any, filter): VerificationContrainteModel {
    let verificationContrainte;
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_JOUR_FERIE) {
        if (tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPartiel === 'true') {
              return verificationContrainte;
            } else {
              verificationContrainte = this.isJourFeries(listJourFeries, item.bloquante, verificationContrainte, shift, filter);
            }
          } else {
            if (item.valeurMajeurTempsPartiel === 'true') {
              return verificationContrainte;
            } else {
              verificationContrainte = this.isJourFeries(listJourFeries, item.bloquante, verificationContrainte, shift, filter);
            }
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPlein === 'true') {
              return verificationContrainte;
            } else {
              verificationContrainte = this.isJourFeries(listJourFeries, item.bloquante, verificationContrainte, shift, filter);
            }
          } else {
            if (item.valeurMajeurTempsPlein === 'true') {
              return verificationContrainte;
            } else {
              verificationContrainte = this.isJourFeries(listJourFeries, item.bloquante, verificationContrainte, shift, filter);
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validCollaborateurPeutTravaillerLeDimanche(jourTravail, listLoi, tempsTravailPartiel, mineur) {
    let verificationContrainte;

    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_DIMANCHE) {
        if (tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPartiel === 'false') {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_travailler_Dimanche');
            }
          } else {
            if (item.valeurMajeurTempsPartiel === 'false') {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_travailler_Dimanche');
            }
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPlein === 'false') {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_travailler_Dimanche');
            }
          } else {
            if (item.valeurMajeurTempsPlein === 'false') {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_travailler_Dimanche');
            }
          }
        }
      }
    });

    return verificationContrainte;
  }

  public validCollaborateurPeutTravaillerLeWeekEnd(jours: any, listSelected: any, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, jourDebutWeekEnd: JourSemaine, jourFinWeekEnd: JourSemaine, heureDebutWeekEnd: Date, heureFinWeekEnd: Date, shiftFixe?: string): VerificationContrainteModel {
    let verificationContrainte;
    if (!this.isNotWeekEndEnumertion(jours, listSelected, jourDebutWeekEnd, jourFinWeekEnd, heureDebutWeekEnd, heureFinWeekEnd, shiftFixe)) {
      listLoi.forEach(item => {
        if (item.codeName === CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_WEEK_END) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (item.valeurMineurTempsPartiel === 'false') {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_le_week_end');
              }
            } else {
              if (item.valeurMajeurTempsPartiel === 'false') {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_le_week_end');
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (item.valeurMineurTempsPlein === 'false') {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_le_week_end');
              }
            } else {
              if (item.valeurMajeurTempsPlein === 'false') {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_le_week_end');
              }
            }
          }
        }
      });

    }
    return verificationContrainte;
  }

  public validCollaborateurPeutTravaillerApresHeure(listSelected: any, listLoi, tempsTravailPartiel, mineur) {
    let verificationContrainte;
    // verication si loi existe ou nn
    let isCOLLABORATEUR_TRAVAIL_APRES_HEURE = false;
    let maxHeure = new Date();
    let isBloquante: boolean;
    let valeurApresHeureAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_APRES_HEURE) {
        isCOLLABORATEUR_TRAVAIL_APRES_HEURE = true;
        isBloquante = item.bloquante;
        if (tempsTravailPartiel) {
          if (mineur) {
            valeurApresHeureAffiche = item.valeurMineurTempsPartiel;
            maxHeure = this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel);
          } else {
            valeurApresHeureAffiche = item.valeurMajeurTempsPartiel;
            maxHeure = this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel);
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            valeurApresHeureAffiche = item.valeurMineurTempsPlein;
            maxHeure = this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein);
          } else {
            valeurApresHeureAffiche = item.valeurMajeurTempsPlein;
            maxHeure = this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein);
          }
        }
      }
    });
    if (isCOLLABORATEUR_TRAVAIL_APRES_HEURE) {
      listSelected.sort((a, b) => a.heureDebut - b.heureDebut);
      listSelected.forEach(shift => {
        if (maxHeure) {
          if (shift.hasOwnProperty('dateJournee')) {
            shift.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, shift.heureDebut), shift.heureDebutIsNight);
            this.dateService.resetSecondsAndMilliseconds(shift.heureDebut);
            shift.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, shift.heureFin), shift.heureFinIsNight);
            this.dateService.resetSecondsAndMilliseconds(shift.heureFin);
            maxHeure = this.formatHeureLimit(shift, maxHeure);
          } else if (shift.jour) {
            const plannedDate = this.dateService.getDateOfEnumertionJour(shift.jour);
            maxHeure = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, maxHeure), false);
            this.dateService.resetSecondsAndMilliseconds(maxHeure);
          }

          if (shift.heureFin > maxHeure) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = isBloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_après_heure') + ' ' + valeurApresHeureAffiche;
          }
        }
      });
    }
    return verificationContrainte;
  }

// Changer l'heure limite de travail selon date journée du shift
  private formatHeureLimit(shift: ShiftModel, HeureLimite: Date): Date {
    let dateJournne = JSON.parse(JSON.stringify(shift.dateJournee));
    dateJournne = new Date(dateJournne);
    HeureLimite = this.dateService.getTimeWithouSecond(dateJournne, HeureLimite);
    this.dateService.resetSecondsAndMilliseconds(HeureLimite);
    return HeureLimite;
  }

  public validCollaborateurPeutTravaillerAvantHeure(listSelected: any, listLoi, tempsTravailPartiel, mineur) {
    let verificationContrainte;
    // verication si loi existe ou nn
    let isCOLLABORATEUR_TRAVAIL_AVANT_HEURE = false;
    let minHeure = new Date();
    let isBloquante: boolean;
    let valeurAvantHeureAffiche;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_AVANT_HEURE) {
        isCOLLABORATEUR_TRAVAIL_AVANT_HEURE = true;
        isBloquante = item.bloquante;
        if (tempsTravailPartiel) {
          if (mineur) {
            valeurAvantHeureAffiche = item.valeurMineurTempsPartiel;
            minHeure = this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel);
          } else {
            valeurAvantHeureAffiche = item.valeurMajeurTempsPartiel;
            minHeure = this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel);
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            valeurAvantHeureAffiche = item.valeurMineurTempsPlein;
            minHeure = this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein);
          } else {
            valeurAvantHeureAffiche = item.valeurMajeurTempsPlein;
            minHeure = this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein);
          }
        }

      }
    });
    if (isCOLLABORATEUR_TRAVAIL_AVANT_HEURE) {
      listSelected.sort((a, b) => a.heureDebut - b.heureDebut);
      listSelected.forEach(shift => {
        if (minHeure) {
          if (shift.hasOwnProperty('dateJournee')) {
            shift.heureDebut = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, shift.heureDebut), shift.heureDebutIsNight);
            this.dateService.resetSecondsAndMilliseconds(shift.heureDebut);
            shift.heureFin = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(shift.dateJournee, shift.heureFin), shift.heureFinIsNight);
            this.dateService.resetSecondsAndMilliseconds(shift.heureFin);
            minHeure = this.formatHeureLimit(shift, minHeure);
          } else if (shift.jour) {
            const plannedDate = this.dateService.getDateOfEnumertionJour(shift.jour);
            minHeure = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, minHeure), false);
            this.dateService.resetSecondsAndMilliseconds(minHeure);
          }
          if (shift.heureDebut < minHeure) {
            verificationContrainte = new VerificationContrainteModel();
            verificationContrainte.bloquante = isBloquante;
            verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_avant_heure') + ' ' + valeurAvantHeureAffiche;
          }
        }
      });
    }
    return verificationContrainte;
  }

  public validNombreJourOffDansUneSemaine(nombreDeJourOff: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    if (nombreDeJourOff > 0) {
      let verificationContrainte;
      listLoi.forEach((item: any) => {
        if (item.codeName === CodeNameContrainteSocial.NB_MINI_OFF_SEMAINE) {
          if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
            if (tempsTravailPartiel) {
              if (!mineur) {
                if (nombreDeJourOff < +item.valeurMajeurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMajeurTempsPartiel;
                }
              } else {
                if (nombreDeJourOff < +item.valeurMineurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMineurTempsPartiel;
                  verificationContrainte.bloquante = item.bloquante;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                if (nombreDeJourOff < +item.valeurMineurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMineurTempsPlein;
                }
              } else {
                if (nombreDeJourOff < +item.valeurMajeurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMajeurTempsPlein;
                }
              }
            }
          } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
            if (tempsTravailPartiel) {
              if (mineur) {
                if (nombreDeJourOff > +item.valeurMineurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMineurTempsPartiel;
                }
              } else {
                if (nombreDeJourOff > +item.valeurMajeurTempsPartiel) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMajeurTempsPartiel;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                if (nombreDeJourOff > +item.valeurMineurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMineurTempsPlein;
                }
              } else {
                if (nombreDeJourOff > +item.valeurMajeurTempsPlein) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_de_jours_off_mini_semaine') + ' ' + item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        }
      });
      return verificationContrainte;
    }
  }

  public validNombreJourTravaillerDansUneSemaine(nombreDeJourTravailler: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    // nombreDeJourTravailler = this.findMaxJourTravailler(nombreDeJourTravailler);
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_SEMAINE) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler < +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMineurTempsPartiel;
              }
            } else {
              if (nombreDeJourTravailler < +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler < +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMineurTempsPlein;
              }
            } else {
              if (nombreDeJourTravailler < +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMajeurTempsPlein;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler > +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMineurTempsPartiel;
              }
            } else {
              if (nombreDeJourTravailler > +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler > +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMineurTempsPlein;
              }
            } else {
              if (nombreDeJourTravailler > +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_1_semaine') + ' ' + item.valeurMajeurTempsPlein;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validNombreJourTravaillerDansDeuxSemaines(nombreDeJourTravailler: number, listLoi, tempsTravailPartiel, mineur): VerificationContrainteModel {
    let verificationContrainte;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_DEUX_SEMAINES_SNARR) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler < +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMineurTempsPartiel;
              }
            } else {
              if (nombreDeJourTravailler < +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler < +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMineurTempsPlein;
              }
            } else {
              if (nombreDeJourTravailler < +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMajeurTempsPlein;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler > +item.valeurMineurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMineurTempsPartiel;
              }
            } else {
              if (nombreDeJourTravailler > +item.valeurMajeurTempsPartiel) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMajeurTempsPartiel;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (nombreDeJourTravailler > +item.valeurMineurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMineurTempsPlein;
              }
            } else {
              if (nombreDeJourTravailler > +item.valeurMajeurTempsPlein) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Nb_maxi_jours_travailles_2_semaine') + ' ' + item.valeurMajeurTempsPlein;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validJourReposConsecutif(jourRepos: number[], listLoi, tempsTravailPartiel, mineur, contratActif): VerificationContrainteModel {
    let verificationContrainte;
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.JOURS_REPOS_CONS) {
        if (tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPartiel === 'true' && this.isJourResposConsecutifs(jourRepos)) {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Jours_repos_doivent_ils_etre_consecutifs_message');
            }
          } else {
            if (item.valeurMajeurTempsPartiel === 'true' && this.isJourResposConsecutifs(jourRepos)) {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Jours_repos_doivent_ils_etre_consecutifs_message');
            }
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPlein === 'true' && this.isJourResposConsecutifs(jourRepos)) {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Jours_repos_doivent_ils_etre_consecutifs_message');
            }
          } else {
            if (item.valeurMajeurTempsPlein === 'true' && this.isJourResposConsecutifs(jourRepos)) {
              verificationContrainte = new VerificationContrainteModel();
              verificationContrainte.bloquante = item.bloquante;
              verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Jours_repos_doivent_ils_etre_consecutifs_message');
            }
          }
        }
      }
    });
    return verificationContrainte;
  }


  public validHeureRepoMinEntreDeuxJours(lastDayValues: any[], listSelected: any[], nextDayValues: any[], listLoi, tempsTravailPartiel, mineur, limiteHeureDebut, isShiftFix?: boolean): VerificationContrainteModel {
    let verificationContrainte: VerificationContrainteModel;
    if (!lastDayValues && !nextDayValues) {
      return verificationContrainte;
    } else {
      listSelected.forEach((item: any) => {

        this.dateService.setCorrectTimeToDisplayForShift(item);
      });
      listSelected.sort((a, b) => a.heureDebut - b.heureDebut);
      let differenceComplet: Date;
      if (lastDayValues && lastDayValues.length > 0) {
        // verification jour avant
        lastDayValues.forEach((item: any) => {
          this.dateService.setCorrectTimeToDisplayForShift(item);
        });

        if (isShiftFix) {
          lastDayValues.forEach((item: any) => {
            item.heureDebut = moment(item.heureDebut).subtract(1, 'days').toDate();
            item.heureFin = moment(item.heureFin).subtract(1, 'days').toDate();
          });
        }
        const heureLimit = this.getHeureLimite(listLoi, tempsTravailPartiel, mineur, lastDayValues[0].dateJournee);
        lastDayValues.sort((a, b) => a.heureDebut - b.heureDebut);
        const depasseLimit = heureLimit < lastDayValues[lastDayValues.length - 1].heureFin;
        differenceComplet = new Date();
        const differenceEnMinute = Math.abs((listSelected[0].heureDebut.getTime() - lastDayValues[lastDayValues.length - 1].heureFin.getTime()) / 60000);
        differenceComplet.setHours(Math.floor(differenceEnMinute / 60));
        differenceComplet.setMinutes(differenceEnMinute - (differenceComplet.getHours() * 60));
        differenceComplet.setSeconds(0);
        differenceComplet.setMilliseconds(0);
        let indexLoi = -1;
        if (depasseLimit) {
          indexLoi = listLoi.findIndex(loi => loi.codeName === CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS_SI_APRES_LIMIT);
        } else {
          indexLoi = listLoi.findIndex(loi => loi.codeName === CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS);
        }
        if (indexLoi !== -1) {
          const item = listLoi[indexLoi];
          let valeurAffiche;
          if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            }
          } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            }
          }
        }
      }
      if (nextDayValues && nextDayValues.length > 0) {
        nextDayValues.forEach((item: any) => {
          this.dateService.setCorrectTimeToDisplayForShift(item);
        });
        if (isShiftFix) {
          nextDayValues.forEach((item: any) => {
            item.heureDebut = moment(item.heureDebut).add(1, 'days').toDate();
            item.heureFin = moment(item.heureFin).add(1, 'days').toDate();
          });
        }
        const heureLimit = this.getHeureLimite(listLoi, tempsTravailPartiel, mineur, listSelected[0].dateJournee);
        // verification jour apres
        nextDayValues.sort((a, b) => a.heureDebut - b.heureDebut);
        const depasseLimit = heureLimit < listSelected[listSelected.length - 1].heureFin;
        differenceComplet = new Date();
        const differenceEnMinute = Math.abs((nextDayValues[0].heureDebut.getTime() - listSelected[listSelected.length - 1].heureFin.getTime()) / 60000);
        differenceComplet.setHours(Math.floor(differenceEnMinute / 60));
        differenceComplet.setMinutes(differenceEnMinute - (differenceComplet.getHours() * 60));
        differenceComplet.setSeconds(0);
        differenceComplet.setMilliseconds(0);
        let indexLoi = -1;
        if (depasseLimit) {
          indexLoi = listLoi.findIndex(loi => loi.codeName === CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS_SI_APRES_LIMIT);
        } else {
          indexLoi = listLoi.findIndex(loi => loi.codeName === CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS);
        }
        if (indexLoi !== -1) {
          const item = listLoi[indexLoi];
          let valeurAffiche;
          if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (differenceComplet < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            }
          } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

            if (tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPartiel;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPartiel;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            } else if (!tempsTravailPartiel) {
              if (mineur) {
                valeurAffiche = item.valeurMineurTempsPlein;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              } else {
                valeurAffiche = item.valeurMajeurTempsPlein;
                if (differenceComplet > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Heure_minimum_repos_entre_deux_jours') + ' ' + valeurAffiche;
                }
              }
            }
          }
        }
      }
    }
    return verificationContrainte;
  }


  private getHeureLimite(listLoi: any[], tempsTravailPartiel: boolean, mineur: boolean, dateJournee: any): Date {
    const loi = listLoi.find(item => item.codeName === CodeNameContrainteSocial.HEURE_LIMITE_CALCUL_DU_REPOS);
    let valeurLoi: string;
    if (tempsTravailPartiel) {
      if (mineur) {
        valeurLoi = loi.valeurMineurTempsPartiel;
      } else {
        valeurLoi = loi.valeurMajeurTempsPartiel;
      }
    } else {
      if (mineur) {
        valeurLoi = loi.valeurMineurTempsPlein;
      } else {
        valeurLoi = loi.valeurMajeurTempsPlein;
      }
    }

    return this.dateService.getDateFromIsNight(this.getTimeWithouSecond(dateJournee, this.dateService.setTimeFormatHHMM(JSON.parse(JSON.stringify(valeurLoi)))), valeurLoi === '00:00');
  }

  public validDureeMaxSansBreak(dureeMax: Date, listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, displayMessage?: boolean): any {
    let verificationContrainte;
    dureeMax = this.dateService.setMllisecondeNull(dureeMax);
    listLoi.forEach(item => {
      let valeurAffiche;
      if (item.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (dureeMax < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (dureeMax < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (dureeMax < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (dureeMax < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (dureeMax > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;
              if (dureeMax > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;
              if (dureeMax > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (dureeMax > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                if (displayMessage) {
                  verificationContrainte = new VerificationContrainteModel();
                  verificationContrainte.bloquante = item.bloquante;
                  verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.Longueur_maximum_shift_sans_break') + ' ' + valeurAffiche;
                } else {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  /**
   *  recuperer la durée min break pour calculer les heures travaillés avec pause de l'employe dans un journée ou dans une semaine
   *  pour identifier le signe de pause
   *  vérifier l'employé à un pause ou nn
   * @param: listLoi
   * @param: tempsTravailPartiel
   * @param: mineur
   * @param: dureeMinBreak
   */
  public validDureeMinBreak(listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, dureeMinBreak?: Date): Date {
    let verificationContrainte;
    if (dureeMinBreak) {
      dureeMinBreak = this.dateService.setMllisecondeNull(dureeMinBreak);
    }
    listLoi.forEach(item => {
      if (item.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_BREAK) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMineurTempsPartiel;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMajeurTempsPartiel;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMineurTempsPlein;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMajeurTempsPlein;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMineurTempsPartiel;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMajeurTempsPartiel;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMineurTempsPlein;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              if (!dureeMinBreak) {
                verificationContrainte = item.valeurMajeurTempsPlein;
              } else {
                if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validDureeBetweenTwoShift(listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, dureeMinBreak: Date): Date {
    let verificationContrainte;
    let valeurAffiche;
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.NB_HEURE_ENTRE_DEUX_SHIFT) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;
              if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;

              if (dureeMinBreak < this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {

          if (tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPartiel;

              if (dureeMinBreak > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPartiel;

              if (dureeMinBreak > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              valeurAffiche = item.valeurMineurTempsPlein;

              if (dureeMinBreak > this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            } else {
              valeurAffiche = item.valeurMajeurTempsPlein;
              if (dureeMinBreak > this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                verificationContrainte = new VerificationContrainteModel();
                verificationContrainte.bloquante = item.bloquante;
                verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.NB_HEURE_ENTRE_DEUX_SHIFT') + ' ' + valeurAffiche;
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  /**
   * recuperer la durée max  break  pour compter le nombre de shift par jour
   * @param: listLoi
   * @param: tempsTravailPartiel
   * @param: mineur
   * @param: dureeMaxBreak
   */
  public validDureeMaxBreak(listLoi: any, tempsTravailPartiel: boolean, mineur: boolean, dureeMaxBreak?: Date): Date {
    let verificationContrainte;
    if (dureeMaxBreak) {
      dureeMaxBreak = this.dateService.setMllisecondeNull(dureeMaxBreak);
    }
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK) {
        if (item.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMineurTempsPartiel;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMajeurTempsPartiel;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMineurTempsPlein;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMajeurTempsPlein;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        } else if (item.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
          if (tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMineurTempsPartiel;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPartiel)) {
                  verificationContrainte = item.valeurMineurTempsPartiel;
                }
              }
            } else {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMajeurTempsPartiel;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPartiel)) {
                  verificationContrainte = item.valeurMajeurTempsPartiel;
                }
              }
            }
          } else if (!tempsTravailPartiel) {
            if (mineur) {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMineurTempsPlein;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMineurTempsPlein)) {
                  verificationContrainte = item.valeurMineurTempsPlein;
                }
              }
            } else {
              if (!dureeMaxBreak) {
                verificationContrainte = item.valeurMajeurTempsPlein;
              } else {
                if (dureeMaxBreak <= this.dateService.setTimeFormatHHMM(item.valeurMajeurTempsPlein)) {
                  verificationContrainte = item.valeurMajeurTempsPlein;
                }
              }
            }
          }
        }
      }
    });
    return verificationContrainte;
  }

  public validPausePlanifier(listLoi, tempsTravailPartiel, mineur): boolean {
    let isBreak = false;
    listLoi.forEach((item: any) => {
      if (item.codeName === CodeNameContrainteSocial.PAUSE_PLANIFIE) {
        if (tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPartiel === 'true') {
              isBreak = true;
            } else {
              isBreak = false;
            }
          } else {
            if (item.valeurMajeurTempsPartiel === 'true') {
              isBreak = true;
            } else {
              isBreak = false;
            }
          }
        } else if (!tempsTravailPartiel) {
          if (mineur) {
            if (item.valeurMineurTempsPlein === 'true') {
              isBreak = true;
            } else {
              isBreak = false;
            }
          } else {
            if (item.valeurMajeurTempsPlein === 'true') {
              isBreak = true;
            } else {
              isBreak = false;
            }
          }
        }
      }
    });
    return isBreak;
  }

  private isJourFeries(listJourFeries: JourFeriesModel[], isBloquante: boolean, verificationContrainte: VerificationContrainteModel, shift: any, filter: string): VerificationContrainteModel {
    listJourFeries.forEach((jour: any) => {
      if (filter === 'shiftFixe') {
        jour.dateFeries = this.dateService.setTimeNull(jour.dateFeries);
        if (shift.dateDebut) {
          shift.dateDebut = this.dateService.setTimeNull(shift.dateDebut);
        }
        if (shift.dateFin) {
          shift.dateFin = this.dateService.setTimeNull(shift.dateFin);
        }

        if ((moment(shift.dateDebut).isSameOrBefore(jour.dateFeries) &&
          moment(shift.dateFin).isSameOrAfter(jour.dateFeries)) && (jour.dateFeries).getDay() === this.getNumDay(shift.jour)) {
          verificationContrainte = new VerificationContrainteModel();
          verificationContrainte.bloquante = isBloquante;
          verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_les_jours_feries');
        }
      } else {
        jour.dateFeries = this.dateService.setTimeNull(jour.dateFeries);
        if (shift.dateJournee) {
          shift.dateJournee = this.dateService.setTimeNull(shift.dateJournee);
        }
        if (moment(jour.dateFeries).isSame(shift.dateJournee)) {
          verificationContrainte = new VerificationContrainteModel();
          verificationContrainte.bloquante = isBloquante;
          verificationContrainte.message = this.rhisTranslateService.translate('CONTRAINTE_SOCIAL.collaborateur_peut_il_travailler_les_jours_feries');
        }
      }
    });
    return verificationContrainte;
  }

  private findMaxJourTravailler(numb: number): number {
    let max = 0;
    let count = 1;
    while (numb != 0) {
      if ((numb & 0b11) == 0b11) {
        count++;
      } else {
        count = 1;
      }
      numb >>>= 1;
      if (count > max) {
        max = count;
      }
    }
    return max;
  }

  /**
   * recupere le contrat actif pour cette date
   * @param listContrat
   * @param datePlanning
   */
  public getContratByDay(employe: EmployeeModel, datePlanning: Date, fromPlanningPdf?: boolean): EmployeeModel {
    datePlanning = this.dateService.setTimeNull(datePlanning);
    let contratDisplay = null;
    let avenantDisplay = null;
    if(employe.contrats) {
      employe.contrats.forEach((contrat: ContratModel) => {
        if (contrat.datefin) {
          contrat.datefin = this.dateService.setTimeNull(contrat.datefin);
        }
        contrat.dateEffective = this.dateService.setTimeNull(contrat.dateEffective);

        if ((moment(datePlanning).isSameOrAfter(contrat.dateEffective) && moment(datePlanning).isSameOrBefore(contrat.datefin)) || (moment(datePlanning).isSameOrAfter(contrat.dateEffective) && !contrat.datefin)) {
          if (contrat.contratPrincipale) {
            avenantDisplay = contrat;
          } else {
            contratDisplay = contrat;
          }
        }
      });
    }
    if (avenantDisplay) {
      employe.contrats.unshift(avenantDisplay);
    } else if (contratDisplay) {
      employe.contrats.unshift(contratDisplay);
    } else {
      if (fromPlanningPdf || (!avenantDisplay && !contratDisplay)) {
        employe.contrats = null;
      }
    }
    return employe;
  }


  private isNotWeekEndEnumertion(jour: any, shift: any, jourDebutWeekEnd: JourSemaine, jourFinWeekEnd: JourSemaine, heureDebutWeekEnd: Date, heureFinWeekEnd: Date, shiftFixe: string): boolean {
    /*let debutWeekEnd: Date;
    let finWeekEnd: Date;
    let dateDebut: Date;
    let dateFin: Date;
    let debutWeekEndIndex;
    let finWeekEndIndex;
    let dateDebutIndex;
    let returnedValues = true;
    debutWeekEndIndex = this.dateService.getIntegerValueFromJourSemaine(jourDebutWeekEnd);
    finWeekEndIndex = this.dateService.getIntegerValueFromJourSemaine(jourFinWeekEnd);
    dateDebutIndex = this.dateService.getIntegerValueFromJourSemaine(jour);

    debutWeekEnd = this.dateService.getDateOfEnumertionJour(jourDebutWeekEnd);
    finWeekEnd = this.dateService.getDateOfEnumertionJour(jourFinWeekEnd);
    dateDebut = this.dateService.getDateOfEnumertionJour(jour);
    dateFin = this.dateService.getDateOfEnumertionJour(jour);
    // ajouter les num des jouirs de week
    const arrayList = [];
    dateDebut = this.getTimeWithouSecond(dateDebut, shift.heureDebut);
    dateFin = this.getTimeWithouSecond(dateFin, shift.heureFin);
    if (finWeekEndIndex < debutWeekEndIndex) {
      arrayList.push(debutWeekEndIndex, finWeekEndIndex);
    }
    // mettre le numero de jours de week dans une array
    for (let i = 0; i <= 6; i++) {
      if (finWeekEndIndex < debutWeekEndIndex) {
        if (!(i >= finWeekEndIndex && i <= debutWeekEndIndex)) {
          arrayList.push(i);
        }
      } else {
        if (i >= debutWeekEndIndex && i <= finWeekEndIndex) {
          arrayList.push(i);
        }
      }
    }
    arrayList.forEach(indexOfJour => {
      // si le date de shift est la meme date de debut week
      if (0 === indexOfJour && debutWeekEndIndex !== 0 && finWeekEndIndex !== 0) {
        // on peut pas faire .getDate()-7 directement le max c 'est 6
        debutWeekEnd.setDate(debutWeekEnd.getDate() - 6);
        debutWeekEnd.setDate(debutWeekEnd.getDate() - 1);
        // si le date de shift est sup à date de debut week
        if (dateDebutIndex >= debutWeekEndIndex) {
          dateDebut.setDate(dateDebut.getDate() - 6);
          dateDebut.setDate(dateDebut.getDate() - 1);
        }
      }
    });
    if (!(isDate(heureDebutWeekEnd))) {
      heureDebutWeekEnd = this.dateService.setTimeFormatHHMM(heureDebutWeekEnd);
    }
    if (!(isDate(heureFinWeekEnd))) {
      heureFinWeekEnd = this.dateService.setTimeFormatHHMM(heureFinWeekEnd);
    }
    debutWeekEnd = this.getTimeWithouSecond(debutWeekEnd, heureDebutWeekEnd);
    finWeekEnd = this.getTimeWithouSecond(finWeekEnd, heureFinWeekEnd);

    if (moment(dateDebut).isSameOrAfter(debutWeekEnd) &&
      moment(dateDebut).isSameOrBefore(finWeekEnd)) {
      returnedValues = returnedValues && false;
    }
    if (moment(dateFin).isSameOrAfter(debutWeekEnd) &&
      moment(dateFin).isSameOrBefore(finWeekEnd)) {
      returnedValues = returnedValues && false;
    }

    // condition heureDebut OK mais heureFin dans l'intervale
    if ((moment(dateDebut).isSameOrBefore(debutWeekEnd)) &&
      (moment(dateFin).isSameOrAfter(debutWeekEnd)) &&
      (moment(dateFin).isSameOrBefore(finWeekEnd))) {
      returnedValues = returnedValues && false;
    }

    // condition heureFin OK mais heureDebut dans l'intervale
    if ((moment(dateDebut).isSameOrAfter(debutWeekEnd)) &&
      (moment(dateDebut).isSameOrBefore(finWeekEnd)) &&
      (moment(dateFin).isSameOrAfter(finWeekEnd))) {
      returnedValues = returnedValues && false;
    }

    // condition heureFin OK et heureDebut OK mais les valeurs déjà présentes sont inclues EXP :
    // valeur a verifier 7-10
    // valeur existante 8-9
    if ((moment(dateDebut).isSameOrBefore(debutWeekEnd)) &&
      (moment(dateFin).isSameOrAfter(finWeekEnd))) {
      returnedValues = returnedValues && false;
    }

    return returnedValues;*/

    let plannedDate;
    let dateHeureDebut;
    let dateHeureFin;
    if (shiftFixe) {
      plannedDate = this.dateService.getDateOfEnumertionJour(jour);
      dateHeureDebut = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, shift.heureDebut), shift.dateDebutIsNight);
      dateHeureFin = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, shift.heureFin), shift.dateFinIsNight);
    } else {
      plannedDate = shift.dateJournee;
      dateHeureDebut = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, shift.heureDebut), shift.heureDebutIsNight);
      dateHeureFin = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(plannedDate, shift.heureFin), shift.heureFinIsNight);
    }
    let isWeekEnd = false;
    const weekEnds: WeekEnd[] = this.getListJourWeekEndMois(plannedDate, jourDebutWeekEnd, jourFinWeekEnd);
    weekEnds.forEach((weekEnd: WeekEnd) => {
      const dateDebutWeekEnd = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(weekEnd.debutWeekend, heureDebutWeekEnd), false);
      const dateFinWeekEndthis = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(weekEnd.finWeekend, heureFinWeekEnd), false);
      if (((moment(dateHeureDebut).isSameOrAfter(dateDebutWeekEnd)) &&
        (moment(dateHeureDebut).isSameOrBefore(dateFinWeekEndthis))) || ((moment(dateHeureFin).isSameOrAfter(dateDebutWeekEnd)) &&
        (moment(dateHeureFin).isSameOrBefore(dateFinWeekEndthis)))) {
        isWeekEnd = true;
      }
    });

    return !isWeekEnd;
  }

  private getListJourWeekEndMois(dateAPlannifier: Date, jourDebutWeekend: JourSemaine, jourFinWeekend: JourSemaine): WeekEnd[] {
    const listJourWeekEndMois = [];
    let debutMois: Date = new Date(dateAPlannifier.getTime() - ((dateAPlannifier.getDate() - 1) * this.ONE_DAY_IN_MS));
    const nextMois: Date = new Date(debutMois.getFullYear(), debutMois.getMonth() + 1, 1);
    const intDebutMois = this.dateService.getIntegerValueFromJourSemaine(this.dateService.getJourSemaine(debutMois));
    const intDebutWeekEnd = this.dateService.getIntegerValueFromJourSemaine(jourDebutWeekend);
    const intFinWeekEnd = this.dateService.getIntegerValueFromJourSemaine(jourFinWeekend);

    let decalageDebut = (intDebutWeekEnd - intDebutMois);
    let decalageFin = (intFinWeekEnd - intDebutMois);

    if (decalageDebut < 0) {
      decalageDebut += 7;
    }
    if (decalageFin < 0) {
      decalageFin += 7;
    }

    if (decalageDebut > decalageFin) {
      const weekend = new WeekEnd();
      weekend.debutWeekend = debutMois;
      weekend.finWeekend = new Date(debutMois.getTime() + (decalageFin * this.ONE_DAY_IN_MS));
      listJourWeekEndMois.push(weekend);
      debutMois = new Date(debutMois.getTime() + (7 * this.ONE_DAY_IN_MS));
      decalageDebut -= 7;
    }

    for (let workingDate = debutMois; workingDate < nextMois; workingDate = new Date(workingDate.getTime() + (7 * this.ONE_DAY_IN_MS))) {
      const weekend = new WeekEnd();
      if (!(new Date(workingDate.getTime() + (decalageDebut * this.ONE_DAY_IN_MS)) < nextMois) && !(new Date(workingDate.getTime() + (decalageFin * this.ONE_DAY_IN_MS)) < nextMois)) {
        break;
      }
      if (new Date(workingDate.getTime() + (decalageDebut * this.ONE_DAY_IN_MS)) < nextMois) {
        weekend.debutWeekend = new Date(workingDate.getTime() + (decalageDebut * this.ONE_DAY_IN_MS));
      } else {
        weekend.debutWeekend = new Date(nextMois.getTime() - this.ONE_DAY_IN_MS);
      }
      if (new Date(workingDate.getTime() + (decalageFin * this.ONE_DAY_IN_MS)) < nextMois) {
        weekend.finWeekend = new Date(workingDate.getTime() + (decalageFin * this.ONE_DAY_IN_MS));
      } else {
        weekend.finWeekend = new Date(nextMois.getTime() - this.ONE_DAY_IN_MS);
      }
      if (weekend.debutWeekend || weekend.finWeekend) {
        listJourWeekEndMois.push(weekend);
      }
    }
    return listJourWeekEndMois;
  }

  /**
   * anomalie disponiblite
   * @param :contratActif
   * @param :shift
   */
  private verificationDisponibiliteContrat(contratActif: ContratModel, shift: any, jour: JourSemaine, filter): VerificationContrainteModel[] {
    let listMessageVerification: VerificationContrainteModel[] = [];
    const verificationContrainte = new VerificationContrainteModel();
    if (contratActif.disponibilite.jourDisponibilites) {
      this.sizeJourDisponiblite = contratActif.disponibilite.jourDisponibilites.length;
      contratActif.disponibilite.jourDisponibilites.forEach((jourDisponible) => {
        if (!jourDisponible.dispoJour && jour === jourDisponible.jourSemain) {
          if ((!jourDisponible.odd && (this.listPairAndOdd === undefined || (this.listPairAndOdd && this.listPairAndOdd.includes(DisponiblitePairOrOdd.PAIR)))) || this.sizeJourDisponiblite <= 7) {
            listMessageVerification = this.disponibliteEmployeByShift(jourDisponible, verificationContrainte, listMessageVerification, shift, filter);
          } else if (jourDisponible.odd && (this.listPairAndOdd && this.listPairAndOdd.includes(DisponiblitePairOrOdd.ODD))) {
            listMessageVerification = this.disponibliteEmployeByShift(jourDisponible, verificationContrainte, listMessageVerification, shift, filter);
          } else if (this.listPairAndOdd && this.listPairAndOdd.includes(DisponiblitePairOrOdd.PAIRE_ODD)) {
            listMessageVerification = this.disponibliteEmployeByShift(jourDisponible, verificationContrainte, listMessageVerification, shift, filter);
          }
        }

      });
    }
    return listMessageVerification;
  }

  /**
   * verification heure debut et heure fin is am or pm
   * @param heure
   */
  private isAmOrPmHeureDebutOrHeureFin(heure, filter) {
    let isAMOrPM;
    isAMOrPM = this.dateService.formatDateInAmAndPm(heure);
    if (filter === 'debut') {
      if (isAMOrPM === 'AM') {
        this.amHeureDebut = true;
        this.pmHeureDebut = false;
      } else {
        this.amHeureDebut = false;
        this.pmHeureDebut = true;
      }
    } else {
      if (isAMOrPM === 'AM') {
        this.amHeureFin = true;
        this.pmHeureFin = false;
      } else {
        this.amHeureFin = false;
        this.pmHeureFin = true;
      }
    }
  }

  /**
   * cast  le jour de semaine en number
   * @param jour
   */
  public getNumDay(jour): number {
    switch (jour) {
      case 'DIMANCHE': {
        return 0;
        break;
      }
      case 'LUNDI': {
        return 1;
        break;
      }
      case 'MARDI': {
        return 2;
        break;
      }
      case 'MERCREDI': {
        return 3;
        break;
      }
      case 'JEUDI': {
        return 4;
        break;
      }
      case 'VENDREDI': {
        return 5;
        break;
      }
      case 'SAMEDI': {
        return 6;
        break;
      }
    }
  }

  /**
   * recuperer l'heure en formatm hh:mm
   * @param: time, date
   */
  public getTimeWithouSecond(date: Date, time): Date {
    if (time && !(time instanceof Date)) {
      const hours = +(time.substring(0, 2));
      const minutes = +(time.substring(3, 5));
      time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
    }
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  /**
   * recuperer tous les congés de manager de debut vers le fin
   * @param absenceConge
   */
  public displayConge(absenceConge: AbsenceCongeModel[]): void {
    this.congeDisplay = [];
    absenceConge.forEach(conge => {
      for (let i = 0; i < conge.dureeJour; i++) {
        conge.dateDebutDisplayInPlanningManagerOrLeader = JSON.parse(JSON.stringify(conge.dateDebut));
        conge.dateDebutDisplayInPlanningManagerOrLeader = this.dateService.setTimeNull(conge.dateDebutDisplayInPlanningManagerOrLeader);
        conge.dateDebutDisplayInPlanningManagerOrLeader.setDate(conge.dateDebutDisplayInPlanningManagerOrLeader.getDate() + i);
        if (this.congeDisplay && this.congeDisplay.length) {
          // pour n est pas avois des congés en meme date
          const exists = !!this.congeDisplay.find(absConge => moment(absConge.dateDebutDisplayInPlanningManagerOrLeader).isSame(conge.dateDebutDisplayInPlanningManagerOrLeader));
          if (!exists) {
            this.congeDisplay.push({...conge});
          }
        } else {
          this.congeDisplay.push({...conge});

        }
      }

    });
  }

  /**
   * Vérifie si les shift sont consécutifs ou non
   */
  public areShiftsConsecutifs(listShift: ShiftModel[], maxBreak: string) {
    let verif = true;
    if (listShift.length > 1) {
      listShift.forEach((item: any) => {

        this.dateService.setCorrectTimeToDisplayForShift(item);
      });
      listShift.sort((a, b) => a.heureDebut - b.heureDebut);
      for (let index = 0; index <= (listShift.length - 2); index++) {
        const differenceComplet = new Date();
        const differenceEnMinute = Math.abs((listShift[index + 1].heureDebut.getTime() - listShift[index].heureFin.getTime()) / 60000);
        differenceComplet.setHours(Math.floor(differenceEnMinute / 60));
        differenceComplet.setMinutes(differenceEnMinute - (differenceComplet.getHours() * 60));
        differenceComplet.setSeconds(0);
        differenceComplet.setMilliseconds(0);
        if (differenceComplet > this.dateService.setTimeFormatHHMM(maxBreak)) {
          verif = verif && false;
        } else {
          verif = verif && true;
        }
      }
    }
    return verif;
  }

  /**
   * Permet de verifier la durée minimum d'un shift selon le paramètre DUREE_DETAIL_PHASE
   * @param :heureFin
   * @param :heureDebut
   */
  public verifDureeMinShift(heureFin: Date, heureDebut: Date): any {
    const parameter = this.sessionService.getDureeMinShiftParam();
    if (parameter) {
      let verificationContrainte: VerificationContrainteModel;
      const parameterValue = this.dateService.timeStringToNumber(parameter);
      if (parameterValue > this.dateService.getDiffHeure(heureFin, heureDebut)) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.rhisTranslateService.translate('PLANNING_EQUIPIER.MIN_SHIFT_DELAY_ERROR_MSG') + ' ' + parameterValue + ' minutes';
        verificationContrainte.bloquante = true;
      }
      return verificationContrainte;
    }
  }

  /**
   * vérifier la diponiblité de l'employee
   * @param: jourDisponible
   * @param: verificationContrainte
   * @param :listMessageVerification
   * @param :shift
   */
  private disponibliteEmployeByShift(jourDisponible: JourDisponibiliteModel, verificationContrainte: VerificationContrainteModel, listMessageVerification: VerificationContrainteModel[], shiftDisplay: any, filter): any {
    const shift: any = {...shiftDisplay};
    if (filter !== 'shiftFixe') {
      shift.heureFin = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(new Date(), shift.heureFin), shift.heureFinIsNight);
      shift.heureDebut = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(new Date(), shift.heureDebut), shift.heureDebutIsNight);
    } else {
      shift.heureFin = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(new Date(), shift.heureFin), shift.dateFinIsNight);

      shift.heureDebut = this.dateService.getDateFromIsNight(this.getTimeWithouSecond(new Date(), shift.heureDebut), shift.dateDebutIsNight);
    }
    if (jourDisponible.debut1 != null && jourDisponible.debut2 != null && jourDisponible.debut3 != null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut1, jourDisponible.heureDebut1IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin1, jourDisponible.heureFin1IsNight) && (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut2, jourDisponible.heureDebut2IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin2, jourDisponible.heureFin2IsNight)) && (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut3, jourDisponible.heureDebut3IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin3, jourDisponible.heureFin1IsNight))) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut1, jourDisponible.fin1, jourDisponible.odd) + ' ' + this.messageDisponibilite(jourDisponible.debut2, jourDisponible.fin2, jourDisponible.odd) + ' ' + this.messageDisponibilite(jourDisponible.debut3, jourDisponible.fin3, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut1 != null && jourDisponible.debut2 != null && jourDisponible.debut3 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut1, jourDisponible.heureDebut1IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin1, jourDisponible.heureFin1IsNight) && (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut2, jourDisponible.heureDebut2IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin2, jourDisponible.heureFin2IsNight))) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut1, jourDisponible.fin1, jourDisponible.odd) + ' ' + this.messageDisponibilite(jourDisponible.debut2, jourDisponible.fin2, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut1 != null && jourDisponible.debut3 != null && jourDisponible.debut2 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut1, jourDisponible.heureDebut1IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin1, jourDisponible.heureFin1IsNight) && (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut3, jourDisponible.heureDebut3IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin3, jourDisponible.heureFin3IsNight))) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut1, jourDisponible.fin1, jourDisponible.odd) + ' ' + this.messageDisponibilite(jourDisponible.debut3, jourDisponible.fin3, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut2 != null && jourDisponible.debut3 != null && jourDisponible.debut1 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut2, jourDisponible.heureDebut2IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin2, jourDisponible.heureFin2IsNight) && (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut3, jourDisponible.heureDebut3IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin3, jourDisponible.heureFin3IsNight))) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut2, jourDisponible.fin2, jourDisponible.odd) + ' ' + this.messageDisponibilite(jourDisponible.debut3, jourDisponible.fin3, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut1 == null && jourDisponible.debut2 == null && jourDisponible.debut3 == null) {
      {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut1, jourDisponible.fin1, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut1 != null && jourDisponible.debut2 == null && jourDisponible.debut3 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut1, jourDisponible.heureDebut1IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin1, jourDisponible.heureFin1IsNight)) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut1, jourDisponible.fin1, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut2 != null && jourDisponible.debut1 == null && jourDisponible.debut3 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut2, jourDisponible.heureDebut2IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin2, jourDisponible.heureFin2IsNight)) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut2, jourDisponible.fin2, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    } else if (jourDisponible.debut3 != null && jourDisponible.debut1 == null && jourDisponible.debut2 == null) {
      if (shift.heureDebut < this.dateService.setTimeFormatHHMM(jourDisponible.debut3, jourDisponible.heureDebut3IsNight) || shift.heureFin > this.dateService.setTimeFormatHHMM(jourDisponible.fin3, jourDisponible.heureFin3IsNight)) {
        verificationContrainte = new VerificationContrainteModel();
        verificationContrainte.message = this.messageDisponibilite(jourDisponible.debut3, jourDisponible.fin3, jourDisponible.odd);
        verificationContrainte.bloquante = false;
        listMessageVerification.push(verificationContrainte);
      }
    }
    return listMessageVerification;
  }

  /**
   * message de disponiblite de l'employe
   * @param: debut
   * @param :fin
   */
  private messageDisponibilite(debut: any, fin: any, odd: boolean): string {
    let messageVerification;
    let messageWeekPairAndOdd;
    if (this.listPairAndOdd === undefined || this.sizeJourDisponiblite <= 7) {
      messageWeekPairAndOdd = '';
    } else if (this.listPairAndOdd.includes(DisponiblitePairOrOdd.PAIR)) {
      messageWeekPairAndOdd = this.rhisTranslateService.translate('PLANNING_MANAGER.WEEK_PAIR');
    } else if (this.listPairAndOdd.includes(DisponiblitePairOrOdd.ODD)) {
      messageWeekPairAndOdd = this.rhisTranslateService.translate('PLANNING_MANAGER.WEEK_ODD');
    } else if (this.listPairAndOdd.includes(DisponiblitePairOrOdd.PAIRE_ODD)) {
      if (odd) {
        messageWeekPairAndOdd = this.rhisTranslateService.translate('PLANNING_MANAGER.WEEK_ODD');
      } else {
        messageWeekPairAndOdd = this.rhisTranslateService.translate('PLANNING_MANAGER.WEEK_PAIR');
      }
    }
    if (debut === null && fin === null) {
      messageVerification = this.rhisTranslateService.translate('SHIFT_FIXE.INDISPONIBLITE') + ' ' + messageWeekPairAndOdd;
    } else {
      messageVerification = this.rhisTranslateService.translate('SHIFT_FIXE.DISPONIBLITE') + ' ' + this.datePipe.transform(this.dateService.setTimeFormatHHMM(debut), 'HH:mm') + ' ' + this.rhisTranslateService.translate('SHIFT_FIXE.JUSQUA') + ' ' + this.datePipe.transform(this.dateService.setTimeFormatHHMM(fin), 'HH:mm') + ' ' + messageWeekPairAndOdd;
    }
    return messageVerification;
  }

  public getDureeMaxBreak(listLoi: any[], tempsTravailPartiel: boolean, mineur: boolean): any {
    const dureeMaxBreakLoi = listLoi.find((val: any) => val.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK);
    if (dureeMaxBreakLoi) {
      if (tempsTravailPartiel) {
        if (mineur) {
          return dureeMaxBreakLoi.valeurMineurTempsPartiel;
        } else {
          return dureeMaxBreakLoi.valeurMajeurTempsPartiel;
        }
      } else if (!tempsTravailPartiel) {
        if (mineur) {
          return dureeMaxBreakLoi.valeurMineurTempsPlein;
        } else {
          return dureeMaxBreakLoi.valeurMajeurTempsPlein;
        }
      }
    } else {
      return null;
    }
  }

  private isJourResposConsecutifs(jourRepos: number[]): boolean {
    const premierJourDeLaSemaine = this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine;
    const firstDayAsInteger = this.dateService.getIntegerValueFromJourSemaine(this.sharedRestaurant.selectedRestaurant.parametreNationaux.premierJourSemaine);
    let isConsecutifs = false;
    jourRepos.sort((a, b) => a - b);
    if (firstDayAsInteger !== 0 && jourRepos.includes(0) && jourRepos.includes(6)) {
      isConsecutifs = true;
      return !isConsecutifs;
    }
    for (let index = 0; index <= jourRepos.length - 2; index++) {
      if ((jourRepos[index] - jourRepos[index + 1]) === 1 || (jourRepos[index] - jourRepos[index + 1]) === -1) {
        if ((jourRepos[index] === 5 && jourRepos[index + 1] === 6 && firstDayAsInteger === 6) || (jourRepos[index] === 0 && jourRepos[index + 1] === 1 && firstDayAsInteger === 1)) {
          isConsecutifs = false;
        } else {
          isConsecutifs = true;
          return !isConsecutifs;
        }
      }
    }
    return !isConsecutifs;
  }

  public getDebutAndFinActivite(dateJournne, dateNext, decoupageHoraireFinEtDebutActivity: any, frConfig: any): any {

    let debutJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dateNext, 'debut', frConfig, decoupageHoraireFinEtDebutActivity);
    const nightValueDebut = debutJourneeActiviteRefrence.night;
    debutJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(debutJourneeActiviteRefrence.value);
    debutJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateNext, debutJourneeActiviteRefrence), nightValueDebut);
    this.dateService.resetSecondsAndMilliseconds(debutJourneeActiviteRefrence);
    let finJourneeActiviteRefrence = this.getDecoupageHoraireForShiftInWeek(dateJournne, 'fin', frConfig,
      decoupageHoraireFinEtDebutActivity);
    const nightValueFin = finJourneeActiviteRefrence.night;
    finJourneeActiviteRefrence = this.dateService.setTimeFormatHHMM(finJourneeActiviteRefrence.value);
    finJourneeActiviteRefrence = this.dateService.getDateFromIsNight(this.dateService.getTimeWithouSecond(dateJournne, finJourneeActiviteRefrence), nightValueFin);
    this.dateService.resetSecondsAndMilliseconds(finJourneeActiviteRefrence);

    return {
      debutJourneeActiviteRefrence: debutJourneeActiviteRefrence,
      nightValueDebut: nightValueDebut,
      finJourneeActiviteRefrence: finJourneeActiviteRefrence,
      nightValueFin: nightValueFin
    };
  }

  public getDecoupageHoraireForShiftInWeek(datePlanning: Date, filter: string, frConfig: any, decoupageHoraireFinEtDebutActivity: any): any {
    const dateShift = new Date(datePlanning);
    const index = dateShift.getDay();
    const dayName = frConfig.dayNames[index];
    if (filter === 'fin') {
      const filteredDecoupageFin = Object.keys(decoupageHoraireFinEtDebutActivity['finJournee']).filter(val => val.includes(dayName));

      const finJourneeActiviteByDay = {
        value: decoupageHoraireFinEtDebutActivity.finJournee[filteredDecoupageFin[0]],
        night: decoupageHoraireFinEtDebutActivity.finJournee[filteredDecoupageFin[1]]
      };
      return finJourneeActiviteByDay;
    } else if (filter === 'debut') {
      const filteredDecoupage = Object.keys(decoupageHoraireFinEtDebutActivity['debutJournee']).filter(val => val.includes(dayName));

      const debutJourneeActiviteByDay = {
        value: decoupageHoraireFinEtDebutActivity.debutJournee[filteredDecoupage[0]],
        night: decoupageHoraireFinEtDebutActivity.debutJournee[filteredDecoupage[1]]
      };
      return debutJourneeActiviteByDay;
    }

  }
}
