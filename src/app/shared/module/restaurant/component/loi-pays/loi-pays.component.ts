import {Component, OnInit} from '@angular/core';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NationaliteModel} from '../../../../model/nationalite.model';
import {LoiPaysModel} from '../../../../model/loi.pays.model';
import {PaginationArgs} from '../../../../model/pagination.args';
import {LoiPaysService} from '../../service/loi.pays.service';
import {NotificationService} from '../../../../service/notification.service';
import {TempsTravailModel} from '../../../../enumeration/tempsTravail.model';
import {NationaliteService} from '../../../../../modules/home/configuration/service/nationalite.service';
import {forkJoin, Observable} from 'rxjs';
import {PeriodiciteService} from '../../../../../modules/home/configuration/service/periodicite.service';
import {PeriodiciteModel} from '../../../../model/periodicite.model';
import {DateService} from '../../../../service/date.service';

@Component({
  selector: 'rhis-loi-pays',
  templateUrl: './loi-pays.component.html',
  styleUrls: ['./loi-pays.component.scss']
})
export class LoiPaysComponent implements OnInit {

  public listPays: NationaliteModel[] = [];
  public nationalite = {} as NationaliteModel;
  public selectedNationalite = {} as NationaliteModel;

  public listLoiPays: LoiPaysModel[] = [];

  public listPeriodicite: PeriodiciteModel[] = [];

  // par défaut on affiche les lois TEMP_PLEIN
  public selectedTempsTravail: TempsTravailModel;

  public totalRecords: number;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public first = 0;
  public row = 10;

  public tempsPlein = TempsTravailModel.TEMPS_PLEIN;
  public tempsPartiel = TempsTravailModel.TEMPS_PARTIEL;
  public tempsPleinLabel = this.rhisTranslateService.translate('LOI_RESTAURANT.TEMPS_PLEIN');
  public tempstempsPartielLabel = this.rhisTranslateService.translate('LOI_RESTAURANT.TEMPS_PARTIEL');
  private selectedLoi: any;

  public displayPopup = false;
  public updateLoiPopupTitle: string;

  public heightInterface: any;


  constructor(private nationaliteService: NationaliteService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private loiPaysService: LoiPaysService,
              private periodiciteService: PeriodiciteService,
              private dateService: DateService) {
  }

  ngOnInit() {
    this.selectedTempsTravail = this.tempsPlein;
    this.getListPaysAndListPeriodicite();
  }

  private getListPaysAndListPeriodicite() {
    this.getListPaysWithListPeriodicite().subscribe(responseList => {
        const listNationalite = responseList[0];
        const listPeriodicite = responseList[1];
        if (listNationalite) {
          this.listPays = listNationalite;
          this.getLabelPays();
        }
        if (listPeriodicite) {
          this.listPeriodicite = listPeriodicite;
        }
      }
    );
  }

  /**
   * recuperer la libelle de pays
   */
  private getLabelPays() {
      this.listPays.sort((a, b) => (a.paysFR < b.paysFR ? -1 : 1));
      this.listPays.forEach(pays => {
        pays.libellePays = pays.paysFR;
      });
  }

  /**
   * pour la pagination
   * @param : event
   */
  public onLazyLoad(event?: LazyLoadEvent) {
    if (event) {
      this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    }
    this.getAllLoiByPays();
  }

  /**
   * Permet de lancer l'appel de la methode responsable de la recuperation des lois par pays
   */
  public onSelectNationalite() {
    this.getAllLoiByPays();
  }

  /**
   * Permet de recuperer la liste des lois par pays et selon les arguments de la pagination
   */
  private getAllLoiByPays() {
    if (this.selectedNationalite.idNationalite) {
      this.loiPaysService.getAllLoiPaysByPaysWithPagination(this.selectedNationalite.code, this.paginationArgs).subscribe(
        (data: any) => {
          if (data) {
            this.listLoiPays = data.content;
            this.totalRecords = data.totalElements;
            this.setValueToDisplay();
            this.listLoiPays.forEach(item => {
              item.translatedLibelle = this.rhisTranslateService.translate('COMMON_LOI.' + item.codeName);
            });
            this.checkIfLawIsTimeValue(this.listLoiPays);
          } else {
            this.listLoiPays = [];
            this.notificationService.showErrorMessage('LOI_PAYS.ERROR_NO_LAWS_FOUND', 'LOI_PAYS.ERROR');
          }
        }, (err: any) => {
          // TODO notify of error
          console.log('error');
          console.log(err);
        }
      );
    }
  }

  public activerDesactiverLoiPays(loi: LoiPaysModel) {
    let message = '';
    if (loi.status) {
      message = this.rhisTranslateService.translate('LOI_PAYS.DISABLE_LAW');
    } else {
      message = this.rhisTranslateService.translate('LOI_PAYS.ENABLE_LAW');
    }
    this.confirmationService.confirm({
      message: message,
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmActiverDesactiverLoiPays(loi);
      },
      reject: () => {
      }
    });
  }

  private onConfirmActiverDesactiverLoiPays(loi: LoiPaysModel) {
    loi.status = !loi.status;
    // faire appel au web service responsable à la mise a jour du loi
    this.loiPaysService.updateLoiPaysStatus(loi).subscribe(
      () => {
        if (!loi.status) {
          this.notificationService.showMessageWithoutTranslateService('success',
            loi.translatedLibelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.DISACTIVER'));
        } else {
          this.notificationService.showMessageWithoutTranslateService('success',
            loi.translatedLibelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.ACTIVER_OK'));
        }
      },
      (err: any) => {
        loi.status = !loi.status;
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }


  public setTempTravail(state, value) {
    this.selectedTempsTravail = state ? value : this.getOtherValue(value);
    if (this.selectedNationalite.idNationalite) {
      this.setValueToDisplay();
    }
  }

  private getOtherValue(value): string {
    return value === TempsTravailModel.TEMPS_PLEIN ? TempsTravailModel.TEMPS_PARTIEL : TempsTravailModel.TEMPS_PLEIN;
  }

  private setValueToDisplay() {
    this.listLoiPays.forEach(item => {
      if (this.selectedTempsTravail === this.tempsPlein) {
        item.valeurMajeurAfficher = item.valeurMajeurTempsPlein;
        item.valeurMineurAfficher = item.valeurMineurTempsPlein;
      } else {
        item.valeurMajeurAfficher = item.valeurMajeurTempsPartiel;
        item.valeurMineurAfficher = item.valeurMineurTempsPartiel;
      }
      if (item.valeurMajeurAfficher === '%%') {
        item.majeurForbiddenChanges = true;
      }
      if (item.valeurMineurAfficher === '%%') {
        item.mineurForbiddenChanges = true;
      }
    });
  }

  /**
   * Permet d'afficher la popup de modification d'une loi
   * @param : loi
   */
  public displayUpdateLoiPopup(loi: any) {
    this.updateLoiPopupTitle = this.rhisTranslateService.translate('LABELS.UPDATE_POPUP_TITLE');
    this.displayPopup = true;
    this.selectedLoi = loi;
  }

  /**
   * Permet de disparaitre la popup de modification d'une loi
   */
  public hideUpdateLoiPopup() {
    this.displayPopup = false;
  }

  /**
   * Cette methode permet de lancer l'appel WS pour faire la mise à jour du loi du restaurant
   * @param : event
   */
  public updateLoi(event: any) {
    if (event.valeurMajeurAfficher == null) {
      event.valeurMajeurAfficher = '-';
    }
    if (event.valeurMineurAfficher == null) {
      event.valeurMineurAfficher = '-';
    }
    if (this.selectedTempsTravail === this.tempsPlein) {
      event.valeurMajeurTempsPlein = event.valeurMajeurAfficher;
      event.valeurMineurTempsPlein = event.valeurMineurAfficher;
    } else {
      event.valeurMajeurTempsPartiel = event.valeurMajeurAfficher;
      event.valeurMineurTempsPartiel = event.valeurMineurAfficher;
    }
    this.updateLoiPays(event);
  }

  private updateLoiPays(event: any) {
    this.loiPaysService.update(event, '/').subscribe(
      () => {
        const index = this.listLoiPays.indexOf(this.selectedLoi);
        this.listLoiPays[index] = event;
        this.displayPopup = false;
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }, () => {
        this.notificationService.showMessageWithoutTranslateService('success',
          this.selectedLoi.translatedLibelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_OK'));
      }
    );
  }

  /**
   * Cette méthode permet de récupérer la liste des pays ainsi la liste des periodicites
   */
  private getListPaysWithListPeriodicite(): Observable<any[]> {
    const listNationalite = this.nationaliteService.getAll();
    const listPeriodicite = this.periodiciteService.getAllActivePeriodicite();
    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin([listNationalite, listPeriodicite]);
  }

  private checkIfLawIsTimeValue(listLoiPays: LoiPaysModel[]) {
    listLoiPays.forEach((item, index) => {
      item.isValid = true;
      if (this.dateService.isTimeValue(item.valeurMajeurAfficher.toString())
        || this.dateService.isTimeValue(item.valeurMineurAfficher.toString())) {
        item.isTime = true;
      }
    });
  }

}
