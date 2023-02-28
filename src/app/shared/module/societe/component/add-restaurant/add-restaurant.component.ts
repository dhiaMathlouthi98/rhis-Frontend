import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {RestaurantModel} from '../../../../model/restaurant.model';
import {NationaliteModel} from '../../../../model/nationalite.model';
import {TypeRestaurantModel} from '../../../../model/typeRestaurant.model';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {TypePeriodeRestaurantModel} from '../../../../enumeration/typePeriodeRestaurant.model';
import {TypeRestaurantService} from '../../service/type-restaurant.service';
import {SocieteModel} from '../../../../model/societe.model';
import {RestaurantService} from '../../../../service/restaurant.service';
import {ConfigurationService} from '../../../../service/configuration.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NationaliteService} from '../../../../../modules/home/configuration/service/nationalite.service';
import {NotificationService} from '../../../../service/notification.service';
import {SocieteService} from '../../service/societe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ParametreGlobauxComponent} from '../../../params/param-globaux/parametre-globaux/parametre-globaux.component';
import {Observable, Subject} from 'rxjs';
import {AddFormRestaurantComponent} from '../add-form-restaurant/add-form-restaurant.component';
import {FranchiseModel} from 'src/app/shared/model/franchise.model';
import {FranchiseService} from 'src/app/modules/home/franchise/services/franchise.service';


@Component({
  selector: 'rhis-add-restaurant',
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.scss']
})
export class AddRestaurantComponent implements OnInit {

  public restaurantForm: FormGroup;
  public listPays: NationaliteModel[];
  public listFranchise: any[];
  public currentLanguage: any;
  public listTypeRestaurant: TypeRestaurantModel[];
  public societes: SocieteModel[];
  public listPeriodeRestaurant: SelectItem[];
  public periodeRestaurantMoisDecale = TypePeriodeRestaurantModel.MOIS_DECALE;
  public periodeRestaurantSemaineCompleteDecale = TypePeriodeRestaurantModel.SEMAINE_COMPLETE_DECALE;
  public isFormSubmitted = false;
  public isLibelleExist = false;
  public isMatriculteExist = false;
  public badgeNumber: number;
  public decalMoisJourSign = false;
  public uuidSocieteAddTo;
  public societeConfig;
  public isParametersBtnHidden = true;
  public isRestaurantBtnHidden = true;
  public isCodePointeuseExist = false;
  public franchises: FranchiseModel[];
  public emptyFranchise: FranchiseModel = new FranchiseModel();

  public sections = [
    {name: this.rhisTranslateService.translate('MENU.RESTAURANT.LABEL')},
    {name: this.rhisTranslateService.translate('MENU.PARAMETERS_LABEL')}
  ];
  public activeSection = 0;
  private listenToFormChanges = false;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  @ViewChild(AddFormRestaurantComponent)
  private addFormRestaurantComponent: AddFormRestaurantComponent;
  @ViewChild(ParametreGlobauxComponent)
  public parametreGlobauxComponent: ParametreGlobauxComponent;
  public uuidFranchiseAddTo: any;
  public franchiseConfig: any;

  public displayFranchisePopup = false;

  public listRestaurants = [];

  public displayProgressBar = false;

  public createdConfig = '';

  public createProgressionRate = 0;

  public progress = 0;
  public timeToWait = 1;
  public intervalleId : any;
  public progressBarValues = [{label: 'FRANCHISE.PROGRESS_BAR_PARAMS', value: 20},
    {label: 'FRANCHISE.PROGRESS_BAR_CHARTES', value: 40},
    {label: 'FRANCHISE.PROGRESS_BAR_POSTION_TRAVAIL', value: 50},
    {label: 'FRANCHISE.PROGRESS_BAR_RAPPORTS', value: 65},
    {label: 'FRANCHISE.PROGRESS_BAR_USERS', value: 85}];

  constructor(protected restaurantService: RestaurantService,
              protected configurationService: ConfigurationService,
              protected societeService: SocieteService,
              protected franchiseService: FranchiseService,
              protected typeRestaurantService: TypeRestaurantService,
              protected nationaliteService: NationaliteService,
              protected rhisTranslateService: RhisTranslateService,
              protected notificationService: NotificationService,
              protected confirmationService: ConfirmationService,
              protected activatedRoute: ActivatedRoute,
              protected router: Router) {
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidSociete) {
        if (params.uuidSociete.includes(' fra')) {
          this.uuidFranchiseAddTo = params.uuidSociete.substring(0, params.uuidSociete.length - 4);
          this.franchiseConfig = {showFirst: true, readOnly: true};
        } else {
          this.uuidSocieteAddTo = params.uuidSociete;
          this.societeConfig = {showFirst: true, readOnly: true};
          this.uuidFranchiseAddTo = null;
          this.franchiseConfig = {showFirst: true, readOnly: false};
        }
      }
    });
    this.activatedRoute.url.subscribe(segments => {
      if (segments[0].path.includes('new-restaurant') || segments[1].path.includes('add-restaurant')) {
        this.listenToFormChanges = true;
      }
    });
  }

  /**
   * Force societes to be only the dedicated societe to add to it a restaurant
   * @param: id
   */
  protected setSociete(uuid: string): void {
    this.societeService.getSocieteByIdWithPays(uuid).subscribe((societe: SocieteModel) => {
      this.societes = [societe];
      this.restaurantForm.get('restaurant').patchValue({societe: societe});
      this.detectRestaurantFormChanges();
    });
  }

  /**
   * Check restaurant form validation and create one if it's ok
   */
  public addRestaurant(): void {
    this.isFormSubmitted = true;
    if (this.restaurantForm.valid && this.badgeNumber) {
      const restaurant: RestaurantModel = {...this.formatForm()};
      if (restaurant.franchise && restaurant.franchise.nom === 'Sans franchise') {
        restaurant.franchise = null;
      }
      if (restaurant.franchise) {
        this.franchiseService.getRestaurantByFranchise(restaurant.franchise.uuid).subscribe(
          (data: RestaurantModel[]) => {
            this.listRestaurants = [];
            data.forEach((value: RestaurantModel) => {
              this.listRestaurants.push({
                label: value.libelle,
                value: value.uuid
              });
            });
            this.listRestaurants.sort((franchise1, franchise2) => {
              if (franchise1.label.toLowerCase() > franchise2.label.toLowerCase()) {
                return 1;
              }
              if (franchise1.label.toLowerCase() < franchise2.label.toLowerCase()) {
                return -1;
              }
              return 0;
            });
            this.displayFranchisePopup = true;
          }
       );
      } else {
        this.createNewRestaurant(restaurant);
      }
    }
  }

  ngOnInit() {
    this.initForm();
    this.currentLanguage = this.rhisTranslateService.currentLang;
    this.getSocietes();
    this.getFranchises();
    this.getAllActiveTypeRestaurant();
    this.getListPays();
    this.getListFranchise();
    this.setDefaultBadgeNumber();
    this.setListPeriodeRestaurant();
  }

  /**
   * Set period list to restaurant
   */
  protected setListPeriodeRestaurant() {
    this.listPeriodeRestaurant = [
      {
        label: this.rhisTranslateService.translate('CREATE_RESTAURANT.MONTHLY'),
        value: TypePeriodeRestaurantModel.MENSUEL
      },
      {
        label: this.rhisTranslateService.translate('CREATE_RESTAURANT.FULL_WEEK'),
        value: TypePeriodeRestaurantModel.SEMAINE_COMPLETE
      },
      {
        label: this.rhisTranslateService.translate('CREATE_RESTAURANT.WEEK_SHIFTED'),
        value: TypePeriodeRestaurantModel.SEMAINE_COMPLETE_DECALE
      },
      {
        label: this.rhisTranslateService.translate('CREATE_RESTAURANT.MONTH_SHIFTED'),
        value: TypePeriodeRestaurantModel.MOIS_DECALE
      }
    ];
  }

  public addRestaurantFromAnotherRestaurant(event: any): void {
    let restaurant: RestaurantModel = {...this.formatForm()};
    restaurant = this.setSignOfValeurDebutMois(restaurant);
    this.configDisplayProgressBar(true);
    this.restaurantService.addRestaurant(restaurant, this.badgeNumber, event).subscribe(
      (uuidRestaurant: string) => {
        this.notificationService.showSuccessMessage('CREATE_RESTAURANT.RESTAURANT_ADDED_SUCCESSFULLY');
        this.configDisplayProgressBar(false);
        setTimeout(() => {
          this.router.navigateByUrl(`home/societe/restaurants/${uuidRestaurant}`);
        }, 1000);
        this.resetForm();
      },
      (err: any) => {
        this.configDisplayProgressBar(false);
        this.showNameAndMatriculeErrorsIfExist(err);
      }
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async configDisplayProgressBar(start: boolean) {
    if (start) {
      this.createProgressionRate = 10;
      this.createdConfig = this.progressBarValues[0].label;
      this.displayProgressBar = true;
      let i = 0;
      this.intervalleId =  setInterval(async () => {
        this.progress += 200;
        if(this.progressBarValues[i]){
          this.createdConfig = this.progressBarValues[i].label;
          this.createProgressionRate = this.progressBarValues[i].value;
        } else {
         clearInterval(this.intervalleId);
        }
        i++;
      }, 3000);
      if((this.progressBarValues.length - 1) < i){
        clearInterval(this.intervalleId);
      }
    } else {
      this.displayProgressBar = false;
      clearInterval(this.intervalleId);
    }
  }

  private detectRestaurantFormChanges() {
    this.restaurantForm.valueChanges.subscribe(_ => {
      if (this.isRestaurantBtnHidden) {
        this.isRestaurantBtnHidden = false;
      }
    });
  }

  /**
   * Check changes and navigate to next sections
   * @param: sectionNumber
   */
  public navigateToSection(sectionNumber: number) {
    if (!this.checkSectionsChanges()) {
      return this.saveContentBeforeDeactivation(sectionNumber);
    }
    this.activeSection = sectionNumber;
  }

  /**
   * Check current form/parameters content changes
   */
  private checkSectionsChanges() {
    if (this.activeSection === 0) {
      return this.isRestaurantBtnHidden;
    } else {
      return true;
    }
  }

  /**
   * Check if contents of tow objects are equal or not
   * @param: object1
   * @param: object2
   */
  public compareObjects(object1: any, object2: any): boolean {
    let same = true;
    if (JSON.stringify(object1) !== JSON.stringify(object2)) {
      same = false;
    }
    return same;
  }

  /**
   * Set sign of decalMoisJour
   * @param: sign
   */
  public setDecalMoisJourSign(sign: boolean) {
    this.decalMoisJourSign = sign;
    this.isRestaurantBtnHidden = false;
  }

  /**
   * Set badge number
   * @param: sign
   */
  public setBadgeNumber(badgeNumber: number) {
    this.badgeNumber = badgeNumber;
    if (this.listenToFormChanges) {
      this.addFormRestaurantComponent.nombreBadge.valueChanges.subscribe(_ => {
        if (this.isRestaurantBtnHidden) {
          this.isRestaurantBtnHidden = false;
        }
      });
    }
  }

  /**
   * Fix selected franchise
   * @param: id
   */
  protected setFranchise(uuid: string): void {
    this.franchiseService.getFranchiseByUuid(uuid).subscribe((fra: FranchiseModel) => {
      this.franchises = [fra];
      this.restaurantForm.get('restaurant').patchValue({franchise: fra});
      this.detectRestaurantFormChanges();
    });
  }

  /**
   * Test if we should suggest data saving of not when navigation to other route
   */
  public canDeactivate(): boolean {
    return this.checkSectionsChanges();
  }

  /**
   * Save content based on selected section
   * @param: sectionNumber
   */
  saveContent(sectionNumber) {
    if (this.activeSection === 0) {
      this.addRestaurant();
    }
    this.activeSection = sectionNumber;
  }

  /**
   * Delete undesired spacing around string attributes of the form
   */
  protected formatForm(): RestaurantModel {
    const formObject = {...this.restaurantForm.get('restaurant').value};
    for (const attribute in formObject) {
      if (formObject.hasOwnProperty(attribute) && typeof formObject[attribute] === 'string') {
        formObject[attribute] = (formObject[attribute]).trim();
      }
    }
    return formObject;
  }

  /**
   * Set the sign of valeurDebutMois based on decalMoisJourControl (after/before)
   */
  protected setSignOfValeurDebutMois(restaurant: RestaurantModel): RestaurantModel {
    const restaurantClone = {...restaurant};
    restaurantClone['valeurDebutMois'] = this.decalMoisJourSign ?
      +this.restaurantForm.get('restaurant').value['valeurDebutMois']
      :
      -this.restaurantForm.get('restaurant').value['valeurDebutMois'];
    return restaurantClone;
  }

  /**
   * Create restaurant form
   */
  protected initForm(): void {
    this.restaurantForm = new FormGroup({
      restaurant: new FormControl(null),
      parameters: new FormControl(null)
    });
    if (this.uuidSocieteAddTo && this.listenToFormChanges) {
      this.setSociete(this.uuidSocieteAddTo);
    } else if (this.uuidFranchiseAddTo && this.listenToFormChanges) {
      this.setFranchise(this.uuidFranchiseAddTo);
    } else if (this.listenToFormChanges) {
      this.detectRestaurantFormChanges();
    }
  }

  /**
   * Show errors for name and 'matricule' of restaurant
   * @param: err
   */
  public showNameAndMatriculeErrorsIfExist(err) {
    // on verifie si le nom du restaurant existe
    if (err.error === 'RHIS_RESTAURANT_NAME_EXISTS') {
      this.isLibelleExist = true;
      this.displayFranchisePopup = false;
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate('CREATE_RESTAURANT.RESTAURANT_NAME_EXISTS_ERROR'));
    }
    // on verifie si le matricule du restaurant existe
    if (err.error === 'RHIS_RESTAURANT_MATRICULE_EXISTS') {
      this.isMatriculteExist = true;
      this.displayFranchisePopup = false;
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate('CREATE_RESTAURANT.RESTAURANT_MATRICULE_EXISTS_ERROR'));
    }
    // on verifie si le codePointeuse du restaunrant existe
    if (err.error === 'RHIS_RESTAURANT_CODE_POINTEUSE_EXISTS') {
      this.isCodePointeuseExist = true;
      this.displayFranchisePopup = false;
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate('CREATE_RESTAURANT.RESTAURANT_CODE_POINTEUSE_EXISTS_ERROR'));
    }
  }

  /**
   * Reset restaurant form/parameters to its original values
   */
  protected resetContent() {
    if (this.activeSection === 0) {
      this.resetForm();
    }
  }

  /**
   * Reset restaurant form
   */
  protected resetForm() {
    this.restaurantForm.reset();
    this.isFormSubmitted = false;
    this.isRestaurantBtnHidden = true;
    if (this.listenToFormChanges) {
      this.addFormRestaurantComponent.nombreBadge.reset();
    }
  }

  /**
   * Fetch pays list
   */
  protected getListPays(): void {
    this.nationaliteService.getAll().subscribe(
      (data: NationaliteModel[]) => {
        this.listPays = data;
          this.listPays.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1));
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Fetch franchise list
   */
  protected getListFranchise(): void {
    this.nationaliteService.getAll().subscribe(
      (data: NationaliteModel[]) => {
        this.listPays = data;
          this.listPays.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1));
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Fetch `types restaurants` list
   */
  protected getAllActiveTypeRestaurant(): void {
    this.typeRestaurantService.getAllActive().subscribe(
      (data: TypeRestaurantModel[]) => {
        this.listTypeRestaurant = data;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }


  /**
   * Fetch the `societe` of the restaurant
   */
  private getSocietes(): void {
    if (!this.uuidSocieteAddTo) {
      this.societeService.getAll().subscribe(
        (societes: SocieteModel[]) => {
          this.societes = societes;
        },
        (err: any) => {
          console.log('error');
        });
    }
  }

  /**
   * get liste franchises
   */
  protected getFranchises(): void {
    if (!this.uuidFranchiseAddTo) {
      this.franchiseService.getAllFranchises('', '', 1).subscribe(
        (data: any) => {
          this.franchises = data.content;
          this.franchises.sort((franchise1, franchise2) => {
            if (franchise1.nom.toLowerCase() > franchise2.nom.toLowerCase()) {
              return 1;
            }
            if (franchise1.nom.toLowerCase() < franchise2.nom.toLowerCase()) {
              return -1;
            }
            return 0;
          });
          this.emptyFranchise.nom = 'Sans franchise';
          this.emptyFranchise.idFranchise = null;
          this.emptyFranchise.uuid = null;
          this.franchises.unshift(this.emptyFranchise);
        },
        (err: any) => {
          console.log('error');
        });
    }
  }

  /**
   * Fetch the number of badges to generate for the restaurant
   */
  protected setDefaultBadgeNumber(): void {
    this.configurationService.getDefaultBadgeNumber().subscribe(
      (data: number) => {
        this.badgeNumber = data;
      },
      (err: any) => {
        console.log('error');
      });
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(sectionNumber?: number): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveContent(sectionNumber);
        this.navigateAway.next(true);
      },
      reject: () => {
        this.resetContent();
        this.activeSection = sectionNumber;
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }

  /**
   * Save the restaurant
   */
  private createNewRestaurant(restaurant: RestaurantModel): void {
    restaurant = this.setSignOfValeurDebutMois(restaurant);
    this.notificationService.startLoader();
    this.restaurantService.addRestaurant(restaurant, this.badgeNumber, null).subscribe(
      (uuidRestaurant: string) => {
        this.notificationService.stopLoader();
        this.notificationService.showSuccessMessage('CREATE_RESTAURANT.RESTAURANT_ADDED_SUCCESSFULLY');
        setTimeout(() => {
          this.router.navigateByUrl(`home/societe/restaurants/${uuidRestaurant}`);
        }, 1000);
        this.resetForm();
      },
      (err: any) => {
        this.notificationService.stopLoader();
        this.showNameAndMatriculeErrorsIfExist(err);
      }
    );
  }
}
