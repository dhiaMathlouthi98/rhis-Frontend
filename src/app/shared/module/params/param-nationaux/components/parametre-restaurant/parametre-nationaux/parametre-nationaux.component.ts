import {Component, OnInit} from '@angular/core';
import {ParamNationauxService} from 'src/app/shared/module/params/param-nationaux/service/param.nationaux.service';
import {PlanningEquipierService} from 'src/app/modules/home/planning/planning-equipier/service/planning-equipier.service';
import {JourSemaine} from 'src/app/shared/enumeration/jour.semaine';
import {ParametreNationauxModel} from 'src/app/shared/model/parametre.nationaux.model';
import {LoiGroupeTravailService} from 'src/app/shared/module/restaurant/service/loi.groupe.travail.service';
import {DateService} from 'src/app/shared/service/date.service';
import {DomControlService} from 'src/app/shared/service/dom-control.service';
import {NotificationService} from 'src/app/shared/service/notification.service';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';
import {SharedRestaurantService} from 'src/app/shared/service/shared.restaurant.service';
import {Router} from '@angular/router';
import {SharedRestaurantListService} from 'src/app/shared/service/shared-restaurant-list.service';
import {ConfirmationService} from 'primeng/api';

@Component({
  selector: 'rhis-parametre-nationaux',
  templateUrl: './parametre-nationaux.component.html',
  styleUrls: ['./parametre-nationaux.component.scss']
})
export class ParametreNationauxComponent implements OnInit {

  public soustraireBreakLabel = '';
  public inactiviteBreakLabel = '';

  public jourSemaineItemList = [{
    label: this.translator.translate('DAYS.SUNDAY'),
    value: JourSemaine.DIMANCHE
  }, {
    label: this.translator.translate('DAYS.MONDAY'),
    value: JourSemaine.LUNDI
  }, {
    label: this.translator.translate('DAYS.SATURDAY'),
    value: JourSemaine.SAMEDI
  }];
  private ecran = 'GPN';

  public paramNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;
  public defaultParamNationaux: ParametreNationauxModel = {} as ParametreNationauxModel;

  private previousPremierJourRestaurant: JourSemaine;
  public heightInterface: any;
  public displayRestoList: boolean;
  public listRestoSource: any[];
  public restaurantSource: any;
  public showPopup = false;
  public listRestoDestination = [];
  public submitButtonText = this.translator.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  public listRestoIds = [];
  public defaultRestoUuid: string;
  public resourceName = this.translator.translate('GESTION_PARC_RAPPORT.PARAM_NAT_RESOURCE');

  constructor(private translator: RhisTranslateService,
              private notificationService: NotificationService,
              private paramNationauxService: ParamNationauxService,
              private planningEquipierService: PlanningEquipierService,
              private loiGroupTravailService: LoiGroupeTravailService,
              private sharedRestaurantService: SharedRestaurantService,
              private dateService: DateService,
              private domControlService: DomControlService,
              private route: Router,
              private sharedRestoService: SharedRestaurantListService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.soustraireBreakLabel = this.translator.translate('PARAM_NAT.SOUSTRAIRE_BREAK');
    this.inactiviteBreakLabel = this.translator.translate('PARAM_NAT.INACTIVITE_BREAK');
    if (this.route.url.includes('parc')) {
      this.displayRestoList = true;
      this.sharedRestoService.getListRestaurant().then((result: any) => {
        this.listRestoSource = result;
        if (this.listRestoSource.length) {
          this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.listRestoSource[0].uuid);
          this.getParamNationauxByRestaurant(this.listRestoSource[0].uuid);
          this.restaurantSource = this.listRestoSource[0];
        }

      });
    } else {
      this.displayRestoList = false;
      this.getParamNationauxByRestaurant();
    }
  }

  public changeParams(): void {
    this.listRestoDestination = this.listRestoSource.filter(val => val.uuid !== this.restaurantSource.uuid);
    if (this.compareObjects()) {
      this.getParamNationauxByRestaurant(this.restaurantSource.uuid);
    } else {
      this.saveContentBeforRestoChange();
    }
  }

  public submit(event: any[]): void {
    this.listRestoIds = [];
    this.showPopup = false;
    event.forEach(val => this.listRestoIds.push(val.IdenRestaurant));
    if (this.compareObjects()) {
      this.copierParams();
    } else {
      this.updateParamNat(true, false);

    }
  }

  public updateParamNat(fromCopieParam?: boolean, fromSaveContent?: boolean) {
    let uuidRestoSource: string;
    if (this.restaurantSource) {
      uuidRestoSource = this.restaurantSource.uuid;
    }
    if (fromSaveContent) {
      uuidRestoSource = this.defaultRestoUuid;
    }
    this.paramNationauxService.updateParamNationaux(this.paramNationaux, uuidRestoSource).subscribe(
      (data: ParametreNationauxModel) => {
        this.paramNationaux = data;
        if (this.sharedRestaurantService.selectedRestaurant && this.sharedRestaurantService.selectedRestaurant.parametreNationaux) {
          this.sharedRestaurantService.selectedRestaurant.parametreNationaux = data;
        }
        this.fixTime(this.paramNationaux);
        if (this.previousPremierJourRestaurant !== this.paramNationaux.premierJourSemaine) {
          this.previousPremierJourRestaurant = this.paramNationaux.premierJourSemaine;
          this.planningEquipierService.updatePlanningDateAfterChangingPremierJourRestaurant().subscribe();
          console.log('launch update Plannings');
        }
      }, (err: any) => {
      }, () => {
        if (!fromCopieParam) {
          this.notificationService.showSuccessMessage('PARAM_NAT.PARAM_NAT_UPDATED_SUCCESSFULLY');
        } else {
          this.copierParams();
        }
        if (fromSaveContent) {
          this.getParamNationauxByRestaurant(this.restaurantSource.uuid);
        }
      }
    );
  }

  public copierParams(): void {
    this.paramNationauxService.copierParamNationaux(this.restaurantSource.uuid, this.listRestoIds).subscribe((result: any) => {
        this.notificationService.showSuccessMessage('PARAM_NAT.PARAM_NAT_COPIED_SUCCESSFULLY');
      }
      , error => {
        console.log(error);
      });
  }

  public SaveButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  private fixTime(item: ParametreNationauxModel) {
    if (item.dureeShift1) {
      item.dureeShift1 = this.dateService.setTimeFormatHHMM(item.dureeShift1);
    }
    if (item.dureeShift2) {
      item.dureeShift2 = this.dateService.setTimeFormatHHMM(item.dureeShift2);
    }
    if (item.dureeShift3) {
      item.dureeShift3 = this.dateService.setTimeFormatHHMM(item.dureeShift3);
    }
    if (item.dureeBreak1) {
      item.dureeBreak1 = this.dateService.setTimeFormatHHMM(item.dureeBreak1);
    }
    if (this.paramNationaux.dureeBreak2) {
      item.dureeBreak2 = this.dateService.setTimeFormatHHMM(item.dureeBreak2);
    }
    if (item.dureeBreak3) {
      item.dureeBreak3 = this.dateService.setTimeFormatHHMM(item.dureeBreak3);
    }
    if (item.dureePref) {
      item.dureePref = this.dateService.setTimeFormatHHMM(item.dureePref);
    }
    if (item.heureDebutWeekend) {
      item.heureDebutWeekend = this.dateService.setTimeFormatHHMM(item.heureDebutWeekend);
    }
    if (item.heureFinWeekend) {
      item.heureFinWeekend = this.dateService.setTimeFormatHHMM(item.heureFinWeekend);
    }
    this.defaultParamNationaux = {...item};
  }

  private getParamNationauxByRestaurant(uuidResto?: any) {
    this.paramNationauxService.getParamNationauxByRestaurant(uuidResto).subscribe((data: ParametreNationauxModel) => {
        this.paramNationaux = data;
        this.fixTime(this.paramNationaux);
        this.defaultRestoUuid = uuidResto;
        this.previousPremierJourRestaurant = this.paramNationaux.premierJourSemaine;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Check if parametres nationaux has changed
   */
  public compareObjects(): boolean {
    return JSON.stringify(this.paramNationaux) === JSON.stringify(this.defaultParamNationaux);
  }

  closePopup() {
    this.showPopup = false;
  }

  showPopupListResto() {
    this.showPopup = true;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforRestoChange(): void {
    this.confirmationService.confirm({
      message: this.translator.translate('POPUPS.SAVING_MESSAGE'),
      header: this.translator.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.translator.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.translator.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParamNat(false, true);
      },
      reject: () => {
        this.getParamNationauxByRestaurant(this.restaurantSource.uuid);
      }
    });
  }
}
