import {Component, OnInit} from '@angular/core';
import {NationaliteModel} from '../../../../../shared/model/nationalite.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NationaliteService} from '../../service/nationalite.service';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-gestion-nationalite',
  templateUrl: './gestion-nationalite.component.html',
  styleUrls: ['./gestion-nationalite.component.scss'],
})
export class GestionNationaliteComponent implements OnInit {

  public listNationalite: NationaliteModel[] = [];
  public listNationaliteToUpdate: NationaliteModel[] = [];
  public defaultListNationalite: NationaliteModel[] = [];
  public currentLangue: string;
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public heightInterface: any;

  constructor(private notificationService: NotificationService,
              private translateService: RhisTranslateService,
              private nationaliteService: NationaliteService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.getListNationalite();
  }

  /**
   * recuprer la list de nationalité
   */
  getListNationalite() {
    this.nationaliteService.getAll().subscribe(
      (data: NationaliteModel[]) => {
        this.listNationalite = data;
        this.sortNationaliteArray();
        this.resetAndCloneArray();
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * ordonner list nationalite par libelle
   */
  sortNationaliteArray() {
      this.listNationalite.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1));
  }

  /**
   *Cette methode permet de cloner la liste des  nationalités en une autre liste afin des le comparer
   * utilise pour savoir s'il y a eu un changement dans la liste des nationalités
   */
  resetAndCloneArray() {
    this.defaultListNationalite = [];
    this.listNationalite.forEach((item, index) => {
      this.defaultListNationalite.push(JSON.parse(JSON.stringify(item)));
    });
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des nationalite
   */
  private compareList(): boolean {
    this.listNationaliteToUpdate = [];
    let same = true;
    this.defaultListNationalite.forEach((item, index) => {
      if ((JSON.stringify(this.defaultListNationalite[index].titreSejour) !== JSON.stringify(this.listNationalite[index].titreSejour)) ||
        (JSON.stringify(this.defaultListNationalite[index].titreTravail) !== JSON.stringify(this.listNationalite[index].titreTravail))) {
        this.listNationaliteToUpdate.push(JSON.parse(JSON.stringify(this.listNationalite[index])));
        same = false;
      }
    });
    return same;
  }


  /**
   * modifier  list des nationalite
   */
  public saveListNationalite() {
    if (!this.compareList()) {

      this.nationaliteService.updateListNationalite(this.listNationaliteToUpdate).subscribe(
        (data: any) => {
          this.resetAndCloneArray();
          this.notificationService.showSuccessMessage('NATIONALITE.LIST_UPDATED_SUCCESS');
        },
        (err: any) => {
          console.log('error');
        }
      );
    }
  }

  /**
   * set titre travail
   * @param: nationalite
   */
  public setBooleanTitreTravail(nationalite: NationaliteModel) {
    nationalite.titreTravail = !nationalite.titreTravail;
  }

  /**
   * set titre sejour
   * @param: nationalite
   */
  public setBooleanTitreSejour(nationalite: NationaliteModel) {
    nationalite.titreSejour = !nationalite.titreSejour;
  }

  /**
   * Check nationalites tables are the same or not
   */
  public canDeactivate(): boolean {
    return this.compareList();
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.translateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveListNationalite();
        this.navigateAway.next(true);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }
}
