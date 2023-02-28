import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoiRestaurantModel} from '../../../../model/loi.restaurant.model';
import {LoiRestaurantService} from '../../../restaurant/service/loi.restaurant.service';
import {LazyLoadEvent} from 'primeng/api';
import {PaginationArgs, PaginationPage} from '../../../../model/pagination.args';
import {TempsTravailModel} from '../../../../enumeration/tempsTravail.model';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {PeriodiciteService} from '../../../../../modules/home/configuration/service/periodicite.service';
import {PeriodiciteModel} from '../../../../model/periodicite.model';
import {DateService} from '../../../../service/date.service';
import {GroupeTravailService} from '../../../../../modules/home/configuration/service/groupe-travail.service';
import {forkJoin, Observable} from 'rxjs';
import {GroupeTravailModel} from '../../../../model/groupeTravail.model';
import {EmployeeService} from '../../../../../modules/home/employes/service/employee.service';
import {EmployeeModel} from '../../../../model/employee.model';
import {LoiGroupeTravailService} from '../../../restaurant/service/loi.groupe.travail.service';
import {LoiEmployeeService} from '../../../restaurant/service/loi.employee.service';
import {LoiEmployeeModel} from '../../../../model/loi.employee.model';
import {LoiGroupeTravailModel} from '../../../../model/loi.groupe.travail.model';
import {Router} from '@angular/router';

@Component({
  selector: 'rhis-affichage-loi-restaurant',
  templateUrl: './affichage-loi-restaurant.component.html',
  styleUrls: ['./affichage-loi-restaurant.component.scss']
})
export class AffichageLoiRestaurantComponent {

  public listLoiAfficher: any = [];
  public listLoiRestaurant: LoiRestaurantModel[] = [];
  public listLoiEmployee: LoiEmployeeModel[] = [];
  public listLoiGroupeTravail: LoiGroupeTravailModel[] = [];

  public listPeriodicite: PeriodiciteModel[] = [];

  // par défaut on affiche les lois TEMP_PLEIN
  public selectedTempsTravail: TempsTravailModel;

  public totalRecords: number;
  public paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 10};
  public rowsPerPageOptions = [1, 5, 10, 15, 20, 25];
  public first = 0;
  public row = 10;

  public updateLoiPopupTitle: string;
  public displayPopup = false;
  public selectedLoi: any;

  public tooltipStyle = {
    top: '',
    buttom: 0,
    isFlagTop: false,
    right: 20
  };

  public tempsPlein = TempsTravailModel.TEMPS_PLEIN;
  public tempsPartiel = TempsTravailModel.TEMPS_PARTIEL;
  public tempsPleinLabel = this.rhisTranslateService.translate('LOI_RESTAURANT.TEMPS_PLEIN');
  public tempstempsPartielLabel = this.rhisTranslateService.translate('LOI_RESTAURANT.TEMPS_PARTIEL');

  public activeGroupeTravail: GroupeTravailModel[] = [];
  public selectedGroupeTravail: GroupeTravailModel;

  public listActiveEmployee: EmployeeModel[] = [];
  public selectedEmployee: EmployeeModel;

  public heightInterface: any;
  // restaurant to show it's ``lois restaurant`` and ``lois groupe de travail``
  private restaurant: any;
  @Output()
  public sendGroupTravail: EventEmitter<GroupeTravailModel> = new EventEmitter<GroupeTravailModel>();
  // Show or not employee dropdown list
  @Input()
  public showEmployees = true;
  @Input()
  public set selectedRestaurant (restaurant: any) {
    // if restaurant changed, reset data (low and employee) to match the selected one
    if (restaurant) {
      this.restaurant = restaurant;
      this.initilizeProperties();
      this.fetchData(restaurant.uuid);
    }
  }

  constructor(private loiRestaurantService: LoiRestaurantService,
              private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private periodiciteService: PeriodiciteService,
              private groupeTravailService: GroupeTravailService,
              private employeeService: EmployeeService,
              private loiEmployeeService: LoiEmployeeService,
              private loiGroupeTravailService: LoiGroupeTravailService,
              private router: Router,
              private dateService: DateService) {
    // if page is not part of parc management, fetch data of the chosen restaurant selected from list of restaurant
    if (!this.router.url.includes('parc')) {
      this.fetchData();
    }
  }

  private fetchData(uuid?: string): void {
    this.notificationService.startLoader();
    this.selectedTempsTravail = this.tempsPlein;
    this.requestDataFromMultipleSources(uuid).subscribe((responseList: { listLoiRestaurant: PaginationPage<LoiRestaurantModel>, listPeriodicite: PeriodiciteModel[], listActiveGroupeTravail: GroupeTravailModel[], listActiveEmployee: EmployeeModel[] }) => {
      const response1 = responseList['listLoiRestaurant'];
      const response2 = responseList['listPeriodicite'];
      const response3 = responseList['listActiveGroupeTravail'];
      const response4 = responseList['listActiveEmployee'];

      if (response1) {
        this.listLoiRestaurant = response1.content;
        this.totalRecords = response1.totalElements;
        this.listLoiRestaurant.forEach(item => {
          item.translatedLibelle = this.rhisTranslateService.translate('COMMON_LOI.' + item.codeName);
        });
        this.setValueToDisplay();
        this.checkIfLawIsTimeValue(this.listLoiRestaurant);
        this.listLoiAfficher = this.listLoiRestaurant;
      }
      if (response2) {
        this.listPeriodicite = response2;
      }
      if (response3) {
        this.activeGroupeTravail.push(new GroupeTravailModel());
        this.activeGroupeTravail = this.activeGroupeTravail.concat(response3);
      }
      if (response4) {
        response4.forEach((item: any) => {
          item.displayedName = item.nom + ' ' + item.prenom;
        });
        this.listActiveEmployee.push(new EmployeeModel());
        this.listActiveEmployee = this.listActiveEmployee.concat(response4);
      }
      this.notificationService.stopLoader();
    });

  }

  // Initialize properties that hold restaurant law, employee and its parameters
  private initilizeProperties(): void {
    this.listLoiAfficher = [];
    this.listLoiRestaurant = [];
    this.listLoiEmployee = [];
    this.listLoiGroupeTravail = [];
    this.listPeriodicite = [];
    this.activeGroupeTravail = [];
    this.listActiveEmployee = [];
    this.selectedTempsTravail = TempsTravailModel.TEMPS_PLEIN;
    this.selectedGroupeTravail = undefined;
  }

  /**
   * pour la pagination
   * @param : event
   */
  public onLazyLoad(event?: LazyLoadEvent): void {
    if (event) {
      this.paginationArgs = {pageNumber: event.first / event.rows, pageSize: event.rows};
    }
    if (this.selectedEmployee && this.selectedEmployee.idEmployee) {
      if (this.selectedEmployee.hasLaws) {
        this.getEmployeeLaws();
      } else if (this.selectedEmployee.groupeTravail.hasLaws) {
        this.getGroupeTravailLaws(this.selectedEmployee.groupeTravail.uuid);
      } else {
        this.getAllActiveLoiRestaurant();
      }
    } else if (this.selectedGroupeTravail && this.selectedGroupeTravail.idGroupeTravail && this.selectedGroupeTravail.hasLaws) {
      this.getGroupeTravailLaws(this.selectedGroupeTravail.uuid);
    } else {
      this.getAllActiveLoiRestaurant();
    }
  }

  /**
   * Permet de faire un appel WS pour recuperer la liste des lois du restaurant en fonction de la pagination
   */
  private getAllActiveLoiRestaurant(): void {
    const uuid = this.restaurant ? this.restaurant.uuid : undefined;
    this.loiRestaurantService.getAllWithPagination(this.paginationArgs, uuid).subscribe(
      (data: any) => {
        this.listLoiRestaurant = data.content;
        this.totalRecords = data.totalElements;
        this.listLoiRestaurant.forEach((item: LoiRestaurantModel) => {
          item.translatedLibelle = this.rhisTranslateService.translate('COMMON_LOI.' + item.codeName);
        });
        this.setLoiRefAndSetValueToDisplay(this.listLoiRestaurant);
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * Permet d'identifier si la loi est une valeure de time ou non
   */
  private checkIfLawIsTimeValue(data: any): void {
    data.forEach((item: any) => {
      item.isValid = true;
      if (this.dateService.isTimeValue(item.valeurMajeurAfficher.toString()) || this.dateService.isTimeValue(item.valeurMineurAfficher.toString())) {
        item.isTime = true;
      }
      if (this.dateService.isTimeValue(item.valeurMajeurPointeuseAfficher.toString()) || this.dateService.isTimeValue(item.valeurMineurPointeuseAfficher.toString())) {
        item.isTime = true;
      }
    });
  }

  /**
   * Cette methode permet d'afficher/masquer la tooltip qui permet d'afficher les valeurs par défaut du loi (valeur du pays)
   * @param : loi
   */
  public showOrHideToolTip(loi: LoiRestaurantModel, isMajeur: boolean, isPointeuse: boolean): void {
    if (isMajeur && isPointeuse) {
      loi.toolTipShowMajeur = false;
      loi.toolTipShowMineur = false;
      loi.toolTipShowMajeurPointeuse = !loi.toolTipShowMajeurPointeuse;
      loi.toolTipShowMineurPointeuse = false;
    } else if (isMajeur && !isPointeuse) {
      loi.toolTipShowMajeur = !loi.toolTipShowMajeur;
      loi.toolTipShowMineur = false;
      loi.toolTipShowMajeurPointeuse = false;
      loi.toolTipShowMineurPointeuse = false;
    } else if (!isMajeur && isPointeuse) {
      loi.toolTipShowMineur = false;
      loi.toolTipShowMajeur = false;
      loi.toolTipShowMineurPointeuse = !loi.toolTipShowMineurPointeuse;
      loi.toolTipShowMajeurPointeuse = false;
    } else {
      // !isMajeur && !isPointeuse
      loi.toolTipShowMajeur = false;
      loi.toolTipShowMineur = !loi.toolTipShowMineur;
      loi.toolTipShowMajeurPointeuse = false;
      loi.toolTipShowMineurPointeuse = false;
    }
  }

  /**
   * Permet d'afficher la popup de modification d'une loi
   * @param : loi
   */
  public displayUpdateLoiPopup(loi: LoiRestaurantModel): void {
    if (this.selectedEmployee && this.selectedEmployee.idEmployee) {
      this.updateLoiPopupTitle = this.rhisTranslateService.translate('LOI_EMPLOYEE.UPDATE_POPUP_TITLE');
    } else if (this.selectedGroupeTravail && this.selectedGroupeTravail.idGroupeTravail) {
      this.updateLoiPopupTitle = this.rhisTranslateService.translate('LOI_GROUPE_TRAVAIL.UPDATE_POPUP_TITLE');
    } else {
      this.updateLoiPopupTitle = this.rhisTranslateService.translate('LOI_RESTAURANT.UPDATE_POPUP_TITLE');
    }
    this.displayPopup = true;
    this.selectedLoi = loi;
  }

  /**
   * Permet de disparaitre la popup de modification d'une loi
   */
  public hideUpdateLoiPopup(): void {
    this.displayPopup = false;
  }

  /**
   * Cette methode permet de lancer l'appel WS pour faire la mise à jour du loi du restaurant
   * @param : event
   */
  public updateLoi(event: any): void {
    if (event.valeurMajeurAfficher == null) {
      event.valeurMajeurAfficher = '-';
    }
    if (event.valeurMajeurPointeuseAfficher == null) {
      event.valeurMajeurPointeuseAfficher = '-';
    }
    if (event.valeurMineurAfficher == null) {
      event.valeurMineurAfficher = '-';
    }
    if (event.valeurMineurPointeuseAfficher == null) {
      event.valeurMineurPointeuseAfficher = '-';
    }
    if (this.selectedTempsTravail === this.tempsPlein) {
      event.valeurMajeurTempsPlein = event.valeurMajeurAfficher;
      event.valeurMineurTempsPlein = event.valeurMineurAfficher;
      event.valeurMajeurPointeuseTempsPlein = event.valeurMajeurPointeuseAfficher;
      event.valeurMineurPointeuseTempsPlein = event.valeurMineurPointeuseAfficher;
    } else {
      event.valeurMajeurTempsPartiel = event.valeurMajeurAfficher;
      event.valeurMineurTempsPartiel = event.valeurMineurAfficher;
      event.valeurMajeurPointeuseTempsPartiel = event.valeurMajeurPointeuseAfficher;
      event.valeurMineurPointeuseTempsPartiel = event.valeurMineurPointeuseAfficher;
    }
    if (this.selectedEmployee && this.selectedEmployee.idEmployee) {
      this.updateLoiEmployee(event);
    } else if (this.selectedGroupeTravail && this.selectedGroupeTravail.idGroupeTravail) {
      this.updateLoiGroupeTravail(event);
    } else {
      this.updateLoiRestaurant(event);
    }
  }

  public setTempTravail(state, value): void {
    this.selectedTempsTravail = state ? value : this.getOtherValue(value);
    this.setValueToDisplay();
  }

  private getOtherValue(value): string {
    return value === TempsTravailModel.TEMPS_PLEIN ? TempsTravailModel.TEMPS_PARTIEL : TempsTravailModel.TEMPS_PLEIN;
  }

  private setValueToDisplay(): void {
    if (this.selectedEmployee && this.selectedEmployee.idEmployee) {
      if (this.selectedEmployee.hasLaws) {
        this.setValueInProperList(this.listLoiEmployee);
      } else if (this.selectedEmployee.groupeTravail.hasLaws) {
        this.setValueInProperList(this.listLoiGroupeTravail);
      } else {
        this.setValueInProperList(this.listLoiRestaurant);
      }
    } else if (this.selectedGroupeTravail && this.selectedGroupeTravail.idGroupeTravail && this.selectedGroupeTravail.hasLaws) {
      this.setValueInProperList(this.listLoiGroupeTravail);
    } else {
      this.setValueInProperList(this.listLoiRestaurant);
    }

  }

  private setValueInProperList(data: any): void {
    data.forEach((item: any) => {
      if (this.selectedTempsTravail === this.tempsPlein) {
        item.valeurMajeurAfficher = item.valeurMajeurTempsPlein;
        item.loiRef.valeurMajeurAfficher = item.loiRef.valeurMajeurTempsPlein;
        item.valeurMajeurPointeuseAfficher = item.valeurMajeurPointeuseTempsPlein;
        item.loiRef.valeurMajeurPointeuseAfficher = item.loiRef.valeurMajeurPointeuseTempsPlein;

        item.valeurMineurAfficher = item.valeurMineurTempsPlein;
        item.loiRef.valeurMineurAfficher = item.loiRef.valeurMineurTempsPlein;
        item.valeurMineurPointeuseAfficher = item.valeurMineurPointeuseTempsPlein;
        item.loiRef.valeurMineurPointeuseAfficher = item.loiRef.valeurMineurPointeuseTempsPlein;

      } else {
        item.valeurMajeurAfficher = item.valeurMajeurTempsPartiel;
        item.loiRef.valeurMajeurAfficher = item.loiRef.valeurMajeurTempsPartiel;
        item.valeurMajeurPointeuseAfficher = item.valeurMajeurPointeuseTempsPartiel;
        item.loiRef.valeurMajeurPointeuseAfficher = item.loiRef.valeurMajeurPointeuseTempsPartiel;

        item.valeurMineurAfficher = item.valeurMineurTempsPartiel;
        item.loiRef.valeurMineurAfficher = item.loiRef.valeurMineurTempsPartiel;
        item.valeurMineurPointeuseAfficher = item.valeurMineurPointeuseTempsPartiel;
        item.loiRef.valeurMineurPointeuseAfficher = item.loiRef.valeurMineurPointeuseTempsPartiel;

      }
      if (item.valeurMajeurAfficher === '%%') {
        item.majeurForbiddenChanges = true;
      }
      if (item.valeurMajeurPointeuseAfficher === '%%') {
        item.majeurPointeuseForbiddenChanges = true;
      }
      if (item.valeurMineurAfficher === '%%') {
        item.mineurForbiddenChanges = true;
      }
      if (item.valeurMineurPointeuseAfficher === '%%') {
        item.mineurPointeuseForbiddenChanges = true;
      }
    });
  }

  private requestDataFromMultipleSources(uuid?: string): Observable<{ listLoiRestaurant: PaginationPage<LoiRestaurantModel>, listPeriodicite: PeriodiciteModel[], listActiveGroupeTravail: GroupeTravailModel[], listActiveEmployee: EmployeeModel[] }> {
    const response1 = this.loiRestaurantService.getAllWithPagination(this.paginationArgs, uuid);
    const response2 = this.periodiciteService.getAllActivePeriodicite();
    const response3 = this.groupeTravailService.getAllGroupTravailActifByRestaurant(uuid);
    const response4 = this.employeeService.findActiveEmployeesWithGroupeTravailByRestaurant(uuid);
    return forkJoin({
      listLoiRestaurant: response1,
      listPeriodicite: response2,
      listActiveGroupeTravail: response3,
      listActiveEmployee: response4
    });
  }

  public onSelectGroupeTravail($event): void {
    this.sendGroupTravail.emit($event.value);
    this.selectedEmployee = undefined;
    if (this.selectedGroupeTravail.idGroupeTravail) {
      if (this.selectedGroupeTravail.hasLaws) {
        // get LoiGroupeTravail by groupe de travail
        this.getGroupeTravailLaws(this.selectedGroupeTravail.uuid);
      } else {
        this.listLoiGroupeTravail = [];
        this.listLoiRestaurant.forEach((item: LoiRestaurantModel, index: number) => {
          this.listLoiGroupeTravail.push(JSON.parse(JSON.stringify(item)));
          this.listLoiGroupeTravail[index].loiRef = item;
        });
        this.setLoiRefAndSetValueToDisplay(this.listLoiGroupeTravail);
      }
    } else {
      this.getAllActiveLoiRestaurant();
    }
  }

  public onSelectEmployee(): void {
    this.selectedGroupeTravail = undefined;
    if (this.selectedEmployee.idEmployee) {
      if (this.selectedEmployee.hasLaws) {
        // get LoiEmployee by employee
        this.getEmployeeLaws();
      } else if (this.selectedEmployee.groupeTravail.hasLaws) {
        // get LoiGroupeTravail by groupe de travail
        this.getGroupeTravailLaws(this.selectedEmployee.groupeTravail.uuid);
      } else {
        this.listLoiEmployee = [];
        this.listLoiRestaurant.forEach((item: LoiRestaurantModel, index: number) => {
          this.listLoiEmployee.push(JSON.parse(JSON.stringify(item)));
          this.listLoiEmployee[index].loiRef = item;
        });
        this.setLoiRefAndSetValueToDisplay(this.listLoiEmployee);
      }
    } else {
      this.getAllActiveLoiRestaurant();
    }
  }

  private getGroupeTravailLaws(uuidGroupeTravail: string): void {
    this.notificationService.startLoader();

    this.loiGroupeTravailService.getGroupeTravailLaws(this.paginationArgs, uuidGroupeTravail).subscribe(
      (data: any) => {
        this.listLoiGroupeTravail = data.content;
        this.totalRecords = data.totalElements;
        this.listLoiGroupeTravail.forEach((item: LoiGroupeTravailModel) => {
          item.translatedLibelle = this.rhisTranslateService.translate('COMMON_LOI.' + item.codeName);
        });
        this.setLoiRefAndSetValueToDisplay(this.listLoiGroupeTravail);

        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
        this.notificationService.stopLoader();
      }
    );
  }

  private getEmployeeLaws(): void {
    this.notificationService.startLoader();
    this.loiEmployeeService.getEmployeeLaws(this.paginationArgs, this.selectedEmployee.uuid).subscribe(
      (data: any) => {
        this.listLoiEmployee = data.content;
        this.totalRecords = data.totalElements;
        this.listLoiEmployee.forEach((item: LoiEmployeeModel) => {
          item.translatedLibelle = this.rhisTranslateService.translate('COMMON_LOI.' + item.codeName);
        });
        this.setLoiRefAndSetValueToDisplay(this.listLoiEmployee);

        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
        this.notificationService.stopLoader();
      }
    );
  }

  private setLoiRefAndSetValueToDisplay(data: any): void {
    this.setValueToDisplay();
    this.checkIfLawIsTimeValue(data);
    this.listLoiAfficher = data;
  }

  private updateLoiGroupeTravail(event: any): void {
    this.notificationService.startLoader();
    this.loiGroupeTravailService.updateLoiGroupeTravail(event, this.selectedGroupeTravail.uuid, this.paginationArgs).subscribe(
      () => {
        if (this.selectedGroupeTravail.hasLaws) {
          const index = this.listLoiGroupeTravail.indexOf(this.selectedLoi);
          this.listLoiGroupeTravail[index] = event;
          this.listLoiAfficher = this.listLoiGroupeTravail;
        } else {
          this.selectedGroupeTravail.hasLaws = true;
          this.getGroupeTravailLaws(this.selectedGroupeTravail.uuid);
        }
        this.displayPopup = false;

        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
        this.notificationService.stopLoader();
      }, () => {
        this.displaySucessUpdateMessage();
      }
    );
  }

  private updateLoiEmployee(event: any): void {
    this.notificationService.startLoader();

    this.loiEmployeeService.updateLoiEmployee(event, this.selectedEmployee.uuid, this.paginationArgs).subscribe(
      () => {
        if (this.selectedEmployee.hasLaws) {
          const index = this.listLoiEmployee.indexOf(this.selectedLoi);
          this.listLoiEmployee[index] = event;
          this.listLoiAfficher = this.listLoiEmployee;
        } else {
          this.selectedEmployee.hasLaws = true;
          this.getEmployeeLaws();
        }
        this.displayPopup = false;

        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
        this.notificationService.stopLoader();

      }, () => {
        this.displaySucessUpdateMessage();
      }
    );
  }

  private updateLoiRestaurant(event: any): void {
    this.notificationService.startLoader();
    const uuid = this.restaurant ? this.restaurant.uuid : undefined;
    this.loiRestaurantService.update(event, uuid).subscribe(
      () => {
        const index = this.listLoiRestaurant.indexOf(this.selectedLoi);
        this.listLoiRestaurant[index] = event;
        this.displayPopup = false;

        this.notificationService.stopLoader();
      }, (err: any) => {
        // TODO notify of error
        console.log('error');
        console.log(err);
        this.notificationService.stopLoader();

      }, () => {
        this.displaySucessUpdateMessage();
      }
    );
  }

  private displaySucessUpdateMessage(): void {
    this.notificationService.showMessageWithoutTranslateService('success',
      this.selectedLoi.translatedLibelle + ' ' + this.rhisTranslateService.translate('NOTIFICATION_GENERIQUE.MODIFIED_OK'));
  }

}
