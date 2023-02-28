import {Component, Input, OnInit} from '@angular/core';
import {DecoupageHoraireModel} from '../../../../../../shared/model/decoupage.horaire.model';
import {DecoupageHoraireService} from '../../service/decoupage.horaire.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {PhaseService} from '../../service/phase.service';
import {PhaseModel} from '../../../../../../shared/model/phase.model';

@Component({
  selector: 'rhis-decoupage-horaire',
  templateUrl: './decoupage-horaire.component.html',
  styleUrls: ['./decoupage-horaire.component.scss']
})
export class DecoupageHoraireComponent implements OnInit {

  public listDecoupageHoraire: DecoupageHoraireModel[] = [];

  public collumns: any[] = [];

  public firstDayAsInteger: number;

  public addNewLabel: string;

  public updateLabel: string;

  public setNightValue = null;

  public setNewValueNightValue = null;

  public isDuplicated = null;


  @Input()
  set initListeJours(listJours: any[]) {
    this.collumns = listJours;
  }

  @Input()
  set initPremierJourSemaine(firstDayAsInteger: number) {
    this.firstDayAsInteger = firstDayAsInteger;
  }

  constructor(private decoupageHoraireService: DecoupageHoraireService,
              private sharedRestaurant: SharedRestaurantService,
              private phaseService: PhaseService,
              private dateService: DateService,
              private rhisTranslator: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.addNewLabel = this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ADD_NEW_DECOUPAGE');
    this.updateLabel = this.rhisTranslator.translate('DECOUPAGE_HORAIRE.UPDATE_DECOUPAGE');
    this.getAllDecoupageHoraire();
  }

  public showDeleteConfirmBox(index: number): void {
    this.confirmationService.confirm({
      message: this.rhisTranslator.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslator.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslator.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteDecoupageHoraire(index);
      },
      reject: () => {
      }
    });
  }

  public checkIfNightValue(action: string): void {
    if (action === 'new') {
      this.setNewValueNightValue = null;
      this.confirmationService.confirm({
        message: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
        header: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
        acceptLabel: this.rhisTranslator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslator.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.setNewValueNightValue = true;
        },
        reject: () => {
          this.setNewValueNightValue = false;
        }
      });
    } else {
      this.setNightValue = null;
      this.confirmationService.confirm({
        message: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_MESSAGE'),
        header: this.rhisTranslator.translate('POPUPS.HEURE_NUIT_DECOUPAGE_HEADER'),
        acceptLabel: this.rhisTranslator.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslator.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.setNightValue = true;
        },
        reject: () => {
          this.setNightValue = false;
        }
      });
    }

  }

  public showErrorInValues(obj: any): void {
    this.notificationService.messageService.add({
      severity: 'error',
      summary: this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ERROR_VALIDATION'),
      detail: this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ERROR_REASON') + obj.phaseName + ', ' + obj.fieldName
    });
  }

  public persistDecoupageHoraire(decoupage: DecoupageHoraireModel): void {
    const libellePhaseToAdd = decoupage.phase.libelle;
    this.decoupageHoraireService.persistDecoupageHoraire(decoupage).subscribe(
      (data: DecoupageHoraireModel) => {
        data.isVisited = true;
        data.hasCorrectValue = true;
        data.canDelete = true;
        this.setCorrectDateFormat(data);
        this.listDecoupageHoraire.push(data);
        this.sortListDecoupageHoraire(this.listDecoupageHoraire);
      }, (err: any) => {
        console.log('error');
        console.log(err);
      }, () => {
        this.notificationService.showMessageWithoutTranslateService('success', libellePhaseToAdd + ' ' + this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ADD_SUCCESS'), this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ADD_MESSAGE_HEADER'));
      }
    );
  }

  public saveListDecoupageHoraire(listDecoupage: DecoupageHoraireModel[]): void {
    const midNightIndex = listDecoupage.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.length === 0);
    if (midNightIndex !== -1) {
      listDecoupage.splice(midNightIndex, 1);
    }
    const listPhase = [];
    listDecoupage.forEach((item: DecoupageHoraireModel) => {
      listPhase.push(item.phase);
    });
    this.phaseService.checkListLibelleExists(listPhase).subscribe(
      () => {
        this.updatedecoupageHoraire(listDecoupage);
      }, (err: any) => {
        // display error message if phae name name exists
        if (err.error === 'RHIS_PHASE_NAME_EXISTS') {
          this.notificationService.showErrorMessage('PHASE.EXIST_ERROR');
        }
        console.log('error');
        console.log(err);
      }
    );
  }

  public dispalyErrorValidationMessage(event: { moreThanDay: boolean, order: boolean, other: boolean, day: string, phaseName: string }): void {
    if (event.order) {
      this.notificationService.showErrorMessage('DECOUPAGE_HORAIRE.CHECK_ORDER', 'DECOUPAGE_HORAIRE.ERROR_VALIDATION');
    } else {
      if (event.moreThanDay) {
        this.notificationService.showMessageWithoutTranslateService('error', this.rhisTranslator.translate('DECOUPAGE_HORAIRE.MORE_THAN_A_DAY') + ' ' + event.day, this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ERROR_VALIDATION'));
      } else {
        this.notificationService.showMessageWithoutTranslateService('error', this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ERROR_REASON_GLOBAL') + ' ' + event.day + ',phase: ' + event.phaseName, this.rhisTranslator.translate('DECOUPAGE_HORAIRE.ERROR_VALIDATION'));

      }
    }
  }

  public checkThatLibelleExist(libelle: string): void {
    this.isDuplicated = null;
    this.phaseService.getPhaseByLibelleAndRestaurant(libelle).subscribe(
      (data: PhaseModel) => {
        this.isDuplicated = !!data;
      }, (err: any) => {
        console.log('error');
        console.log(err);
      }
    );
  }

  private getAllDecoupageHoraire(): void {
    this.decoupageHoraireService.getAllDecoupageHoraireByRestaurant().subscribe(
      (data: DecoupageHoraireModel[]) => {
        this.ordonnerEnRecuperation(data);
      }, (err: any) => {
        console.log('error');
        console.log(err);
      }
    );
  }

  // Cette methode permet de recuperer et ordonner les decoupages horaires
  private ordonnerEnRecuperation(data: DecoupageHoraireModel[]): void {
    let firstItem: DecoupageHoraireModel;
    let firstIndex = -1;
    let lastItem: DecoupageHoraireModel;
    let lastIndex = -1;
    let tmpAllItems: DecoupageHoraireModel[];
    tmpAllItems = data;
    tmpAllItems.forEach((item: DecoupageHoraireModel, index: number) => {
      item.isVisited = true;
      item.hasCorrectValue = true;
      item.canDelete = true;
      this.setCorrectDateFormat(item);
      if (item.phase.libelle.toUpperCase() === 'Début de journée d\'activité'.toUpperCase()) {
        firstItem = item;
        firstIndex = index;
        item.canDelete = false;
      }
      if (item.phase.libelle.toUpperCase() === 'Fin de journée d\'activité'.toUpperCase()) {
        lastItem = item;
        lastIndex = index;
        item.canDelete = false;
      }
      if (item.phase.libelle.toUpperCase() === 'open'.toUpperCase()) {
        item.canDelete = false;
      }
      if (item.phase.libelle.toUpperCase() === 'close'.toUpperCase()) {
        item.canDelete = false;
      }
    });
    const midNightDecoupage: DecoupageHoraireModel = new DecoupageHoraireModel();
    midNightDecoupage.phase.libelle = '';
    this.collumns.forEach((itemJour: any, indexJour: number) => {
      const correctDatevalue = new Date();
      correctDatevalue.setDate(correctDatevalue.getDate() + indexJour + 1);
      correctDatevalue.setMilliseconds(0);
      correctDatevalue.setSeconds(0);
      correctDatevalue.setHours(0);
      correctDatevalue.setMinutes(0);
      midNightDecoupage['valeur' + itemJour.val] = correctDatevalue;
      midNightDecoupage['valeur' + itemJour.val + 'IsNight'] = true;
    });
    tmpAllItems.splice(1, 0, midNightDecoupage);
    this.sortListDecoupageHoraire(tmpAllItems);
  }

  private sortListDecoupageHoraire(tmpAllItems: DecoupageHoraireModel[]): void {
    this.listDecoupageHoraire = tmpAllItems;
    this.listDecoupageHoraire.sort((a: DecoupageHoraireModel, b: DecoupageHoraireModel) => a.valeurDimanche - b.valeurDimanche);

  }

  // TODO à refaire voir une meilleur façon
  private setCorrectDateFormat(item: DecoupageHoraireModel): void {
    if (item.valeurDimanche) {
      let index = 0 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurDimanche = this.dateService.createDateFromStringAndOffset(item.valeurDimanche, index);
      if (item.valeurDimancheIsNight) {
        item.valeurDimanche.setDate(item.valeurDimanche.getDate() + 1);
      }
    }
    if (item.valeurLundi) {
      let index = 1 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurLundi = this.dateService.createDateFromStringAndOffset(item.valeurLundi, index);
      if (item.valeurLundiIsNight) {
        item.valeurLundi.setDate(item.valeurLundi.getDate() + 1);
      }
    }
    if (item.valeurMardi) {
      let index = 2 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurMardi = this.dateService.createDateFromStringAndOffset(item.valeurMardi, index);
      if (item.valeurMardiIsNight) {
        item.valeurMardi.setDate(item.valeurMardi.getDate() + 1);
      }
    }
    if (item.valeurMercredi) {
      let index = 3 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurMercredi = this.dateService.createDateFromStringAndOffset(item.valeurMercredi, index);
      if (item.valeurMercrediIsNight) {
        item.valeurMercredi.setDate(item.valeurMercredi.getDate() + 1);
      }
    }
    if (item.valeurJeudi) {
      let index = 4 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurJeudi = this.dateService.createDateFromStringAndOffset(item.valeurJeudi, index);
      if (item.valeurJeudiIsNight) {
        item.valeurJeudi.setDate(item.valeurJeudi.getDate() + 1);
      }
    }
    if (item.valeurVendredi) {
      let index = 5 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurVendredi = this.dateService.createDateFromStringAndOffset(item.valeurVendredi, index);
      if (item.valeurVendrediIsNight) {
        item.valeurVendredi.setDate(item.valeurVendredi.getDate() + 1);
      }
    }
    if (item.valeurSamedi) {
      let index = 6 - this.firstDayAsInteger;
      if (index < 0) {
        index = index + 7;
      }
      item.valeurSamedi = this.dateService.createDateFromStringAndOffset(item.valeurSamedi, index);
      if (item.valeurSamediIsNight) {
        item.valeurSamedi.setDate(item.valeurSamedi.getDate() + 1);
      }
    }
  }

  private onConfirmDeleteDecoupageHoraire(index: number): void {
    const libellePhaseToDelete = this.listDecoupageHoraire[index].phase.libelle;
    if (this.listDecoupageHoraire[index].idDecoupageHoraire === 0) {
      this.listDecoupageHoraire.splice(index, 1);
      this.notificationService.showMessageWithoutTranslateService('success', libellePhaseToDelete + ' ' + this.rhisTranslator.translate('DECOUPAGE_HORAIRE.SINGLE_DELETE_MESSAGE'), this.rhisTranslator.translate('BIMPOSE.DELETE_INFORMATION'));
    } else {
      //
      this.decoupageHoraireService.deleteDecoupageHoraire(this.listDecoupageHoraire[index].uuid).subscribe(
        () => {
          this.listDecoupageHoraire.splice(index, 1);
        }, (err: any) => {
          console.log('error');
          console.log(err);
        }, () => {
          this.notificationService.showMessageWithoutTranslateService('success', libellePhaseToDelete + ' ' + this.rhisTranslator.translate('DECOUPAGE_HORAIRE.SINGLE_DELETE_MESSAGE'), this.rhisTranslator.translate('BIMPOSE.DELETE_INFORMATION'));
        }
      );
    }
  }

  private updatedecoupageHoraire(listDecoupage: DecoupageHoraireModel[]): void {
    this.decoupageHoraireService.persistListDecoupageHoraire(listDecoupage).subscribe(
      (data: DecoupageHoraireModel[]) => {
        this.ordonnerEnRecuperation(data);
      }, (err: any) => {
        console.log('error');
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('DECOUPAGE_HORAIRE.UPDATE_SUCCESS', 'DECOUPAGE_HORAIRE.UPDATE_DECOUPAGE');
      }
    );
  }
}
