import {Component, OnInit, ViewChild} from '@angular/core';
import {AddRestaurantComponent} from '../add-restaurant/add-restaurant.component';
import {RestaurantService} from '../../../../service/restaurant.service';
import {ConfigurationService} from '../../../../service/configuration.service';
import {SocieteService} from '../../service/societe.service';
import {TypeRestaurantService} from '../../service/type-restaurant.service';
import {NationaliteService} from '../../../../../modules/home/configuration/service/nationalite.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {RestaurantModel} from '../../../../model/restaurant.model';
import {SocieteModel} from '../../../../model/societe.model';
import {forkJoin, Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfirmationService} from 'primeng/api';
import {AddFormRestaurantComponent} from '../add-form-restaurant/add-form-restaurant.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedRestaurantService} from '../../../../service/shared.restaurant.service';
import {TypeRestaurantModel} from '../../../../model/typeRestaurant.model';
import {FranchiseService} from 'src/app/modules/home/franchise/services/franchise.service';
import {RestaurantSyncService} from "../../../../service/restaurant-sync.service";

@Component({
  selector: 'rhis-edit-societe',
  templateUrl: './edit-societe.component.html',
  styleUrls: ['../add-restaurant/add-restaurant.component.scss']
})
export class EditSocieteComponent extends AddRestaurantComponent implements OnInit {
  public companyForm: FormGroup;
  private restaurant: RestaurantModel;
  public societe: SocieteModel;
  public isFormCompanySubmitted = false;
  public baseCompanyInfos: object;
  public prefectureInfos: object;
  public baseRestaurantInfos: object;
  private updateByNavigationAway = false;
  private defaultdecalMoisJourSign: boolean;
  public isSocieteBtnHidden = true;
  public title: string;
  public formConfig = {
    showNumBadgeField: false,
    readOnlyPays: true,
    readOnlyFranchise: true,
  };
  private updateRestaurantAfterEnteringOne = true;
  @ViewChild(AddFormRestaurantComponent) addFormRestaurant: AddFormRestaurantComponent;

  canSwitchComponent = true;

  constructor(
    protected restaurantService: RestaurantService,
    protected configurationService: ConfigurationService,
    protected societeService: SocieteService,
    protected typeRestaurantService: TypeRestaurantService,
    protected nationaliteService: NationaliteService,
    protected rhisTranslateService: RhisTranslateService,
    protected notificationService: NotificationService,
    protected confirmationService: ConfirmationService,
    protected sharedRestaurantService: SharedRestaurantService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected franchiseService: FranchiseService,
    private restaurantSyncService: RestaurantSyncService
  ) {
    super(restaurantService, configurationService, societeService, franchiseService,
      typeRestaurantService, nationaliteService, rhisTranslateService,
      notificationService, confirmationService, activatedRoute, router);
    this.initializeSections();
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidRestaurant) {
        this.setRestaurant(params.uuidRestaurant);
      }
      if (params.uuidSociete) {
        this.setSociete(params.uuidSociete);
      }
      if (params.uuidRestaurant || params.uuidSociete) {
        this.updateRestaurantAfterEnteringOne = false;
      }
    });
  }

  /**
   * Config restaurant and sections to show whene restaurant id is passed in the URL
   * @param: id
   */
  private setRestaurant(id: string): void {
    this.restaurantService.restaurantUuid = id;
    this.sections = [
      {name: this.rhisTranslateService.translate('MENU.RESTAURANT.LABEL')},
      {name: this.rhisTranslateService.translate('MENU.PARAMETERS_LABEL')}
    ];
    this.title = this.rhisTranslateService.translate('RESTAURANT.EDIT_LABEL');
  }

  /**
   * Get/show only the societe to be edited
   * @param: id
   */
  protected setSociete(uuid: string): void {
    // we have 4 sections to show and we should display only the the last 2 ones related to societe edition
    this.activeSection = 2;
    this.societeService.getSocieteByIdWithPays(uuid).subscribe((societe: SocieteModel) => {
      this.societe = societe;
      this.setSocieteForm();
    });
    this.sections = [
      null, null,
      {name: this.rhisTranslateService.translate('SOCIETE.LABEL')},
      {name: this.rhisTranslateService.translate('SOCIETE.PREFECTURE_LABEL')}
    ];
    this.title = this.rhisTranslateService.translate('SOCIETE.EDIT_LABEL');
  }

  ngOnInit() {
    this.currentLanguage = this.rhisTranslateService.currentLang;
    if (this.activeSection !== 2) {
      this.initForm();
      this.initCompanyForm();
      this.getAllActiveTypeRestaurant();
      this.getListPays();
      this.setDefaultBadgeNumber();
      this.setListPeriodeRestaurant();
      this.setRestaurantForm();
      this.getCompanies();
      this.getFranchises();
    } else {
      this.initCompanyForm();
      this.getListPays();
      this.detectCompanyFormChanges();
    }
  }

  /**
   * Create company form
   */
  private initCompanyForm() {
    this.companyForm = new FormGroup({
      company: new FormControl(),
      prefecture: new FormControl()
    });
  }

  /**
   * Detect forms changes so we display the appropriate save button
   */
  private detectFormsChanges(): void {
    this.restaurantForm.valueChanges.subscribe(_ => {
      if (this.isRestaurantBtnHidden) {
        this.isRestaurantBtnHidden = false;
      }
    });
    this.detectCompanyFormChanges();
  }

  private detectCompanyFormChanges(): void {
    this.companyForm.valueChanges.subscribe(_ => {
      if (this.isSocieteBtnHidden) {
        this.isSocieteBtnHidden = false;
      }
    });
  }

  /**
   * Initialize restaurant form
   */
  private setRestaurantForm() {
    this.restaurantService.getRestaurantWithPaysAndTypeRestaurantById().subscribe((restaurant: RestaurantModel) => {
      this.restaurant = restaurant;
      const ownerTypeRestaurantIndex = this.listTypeRestaurant.findIndex((typeResaurant: TypeRestaurantModel) => typeResaurant.idTypeRestaurant === this.restaurant.typeRestaurant.idTypeRestaurant);
      if (ownerTypeRestaurantIndex === -1) {
        this.listTypeRestaurant.unshift(this.restaurant.typeRestaurant);
        this.listTypeRestaurant = [...this.listTypeRestaurant];
      }
      this.decalMoisJourSign = this.restaurant['valeurDebutMois'] >= 0;
      if (!this.decalMoisJourSign) {
        restaurant['valeurDebutMois'] = -restaurant['valeurDebutMois'];
      }
      this.restaurantForm.get('restaurant').patchValue(restaurant);
      this.defaultdecalMoisJourSign = this.decalMoisJourSign;
    });
  }

  /**
   * Get the societe (company) of the restaurant and all other companies
   */
  private getCompanies() {
    const restaurantSociete = this.societeService.getSocieteByRestaurantId();
    const availableSocieties = this.societeService.getAll();
    forkJoin([restaurantSociete, availableSocieties])
      .subscribe((companies: [SocieteModel, SocieteModel[]]) => {
        if (!this.societe) {
          this.societe = companies[0];
        }
        this.setSocieteForm();
        this.societes = companies[1];
        this.restaurantForm.get('restaurant').patchValue({societe: companies[0]});
        this.baseRestaurantInfos = {...this.restaurantForm.get('restaurant').value};
      }, console.error, () => {
        this.detectFormsChanges();
      });
  }

  /**
   * Set company form value
   */
  private setSocieteForm() {
    this.companyForm.get('company').patchValue(this.societe);
    this.companyForm.get('prefecture').patchValue(this.societe);
    this.baseCompanyInfos = this.companyForm.get('company').value;
    this.prefectureInfos = this.companyForm.get('prefecture').value;
  }

  /**
   * Initialize all sections for company edition
   */
  private initializeSections() {
    this.title = this.rhisTranslateService.translate('SOCIETE.EDIT_LABEL');
    this.sections = [
      {name: this.rhisTranslateService.translate('MENU.RESTAURANT.LABEL')},
      {name: this.rhisTranslateService.translate('MENU.PARAMETERS_LABEL')},
      {name: this.rhisTranslateService.translate('SOCIETE.LABEL')},
      {name: this.rhisTranslateService.translate('SOCIETE.PREFECTURE_LABEL')}
    ];
  }

  /**
   * Prepare restaurant to be updated
   */
  private prepareRestaurantToUpdate(): RestaurantModel {
    let restaurant: RestaurantModel = {...this.formatForm()};
    restaurant = this.setSignOfValeurDebutMois(restaurant);
    restaurant.idRestaurant = this.restaurant.idRestaurant;
    if (restaurant.franchise && restaurant.franchise.nom === 'Sans franchise'){
      restaurant.franchise = null;
    }
    return restaurant;
  }

  /**
   * Update Restaurant
   */
  public updateRestaurant() {
    this.isFormSubmitted = true;
    if (this.restaurantForm.valid) {
      const restaurant = this.prepareRestaurantToUpdate();
      this.restaurantService.update(restaurant).subscribe(
        _ => {
          const message = restaurant.libelle + this.rhisTranslateService.translate('CREATE_RESTAURANT.RESTAURANT_UPDATED_SUCCESSFULLY');
          this.notificationService.showMessageWithoutTranslateService('success', message);
          this.isFormSubmitted = false;
          if (this.updateByNavigationAway) {
            this.updateByNavigationAway = false;
          }
          this.baseRestaurantInfos = {...this.restaurantForm.get('restaurant').value};
          this.defaultdecalMoisJourSign = this.decalMoisJourSign;
          if (this.updateRestaurantAfterEnteringOne) {
            this.sharedRestaurantService.getRestaurantById().toPromise();
          }
          this.restaurantSyncService.setEntrepriseParam(restaurant['codeRestaurantExterne']);
        }, (err: any) => {
          this.showNameAndMatriculeErrorsIfExist(err);
          if (this.updateByNavigationAway) {
            this.updateByNavigationAway = false;
            this.isFormSubmitted = false;
            this.resetRestaurantForm();
          }
        },
        () => this.isRestaurantBtnHidden = true
      );
    } else if (this.updateByNavigationAway) {
      this.updateByNavigationAway = false;
      this.isFormSubmitted = false;
      this.resetRestaurantForm();
    }
  }

  /**
   * Reset Restaurant Form
   */
  private resetRestaurantForm() {
    this.restaurantForm.get('restaurant').patchValue(this.baseRestaurantInfos);
    this.addFormRestaurant.decalMoisJourControl.setValue(this.defaultdecalMoisJourSign);
    this.isRestaurantBtnHidden = true;
  }

  /**
   * Delete undesired spacing around string attributes of the form
   */
  public formatCompanyForm(): SocieteModel {
    const formObject: SocieteModel = {
      ...this.companyForm.get('company').value,
      ...this.companyForm.get('prefecture').value
    };
    for (const attribute in formObject) {
      if (formObject.hasOwnProperty(attribute) && typeof formObject[attribute] === 'string') {
        formObject[attribute] = (formObject[attribute]).trim();
      }
    }
    formObject.idSociete = this.societe.idSociete;
    return formObject;
  }

  /**
   * Update the company
   */
  public updateSociete() {
    this.isFormCompanySubmitted = true;
    if (this.companyForm.valid) {
      this.societeService.update(this.formatCompanyForm()).subscribe(
        (data: any) => {
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('SOCIETE.UPDATE_SUCCESS'));
          this.isFormCompanySubmitted = false;
          if (this.updateByNavigationAway) {
            this.updateByNavigationAway = false;
          }
          this.updateCompanyForm();
        },
        (err: any) => {
          if (err.error === 'RHIS_SOCIETE_NAME_EXISTS') {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('SOCIETE.SOCIETE_NAME_EXISTS_ERROR'));
          }
          if (this.updateByNavigationAway) {
            this.resetCompanyForm();
            this.isFormCompanySubmitted = false;
            this.updateByNavigationAway = false;
          }
        }, () => this.isSocieteBtnHidden = true);
    } else if (this.updateByNavigationAway) {
      this.updateByNavigationAway = false;
      this.isFormCompanySubmitted = false;
      this.resetCompanyForm();
    }
  }

  /**
   * Update default company infos
   */
  private updateCompanyForm() {
    this.baseCompanyInfos = {...this.companyForm.get('company').value};
    this.prefectureInfos = {...this.companyForm.get('prefecture').value};
  }

  /**
   * Reset company form to it's default value
   */
  private resetCompanyForm() {
    this.companyForm.get('company').patchValue(this.baseCompanyInfos);
    this.companyForm.get('prefecture').patchValue(this.prefectureInfos);
    this.isSocieteBtnHidden = true;
  }

  /**
   * Reset Modified Form
   */
  protected resetForm() {
    if (this.activeSection === 0) {
      this.resetRestaurantForm();
    }
    if (this.activeSection === 1) {
      this.parametreGlobauxComponent.setDefaultValue();
      this.isParametersBtnHidden = true;
    } else {
      this.resetCompanyForm();
    }
  }

  /**
   * Test if we should suggest data saving of not when navigation to other route
   */
  public canDeactivate(): boolean {
    return this.isCurrentFormChanged();
  }

  /**
   * Update restaurant/company based on section number from witch navigation it's done
   * @param: sectionNumber
   */
  public updateContent(sectionNumber: number) {
    switch (this.activeSection) {
      case 0:
        this.updateRestaurant();
        break;
      case 1:
        if (this.parametreGlobauxComponent.canSave()) {
          this.parametreGlobauxComponent.saveUpdate();
          this.isParametersBtnHidden = true;
          this.canSwitchComponent = true;
        } else {
          this.canSwitchComponent = false;
          this.isParametersBtnHidden = false;
        }
        break;
      case 2 || 3:
        this.updateSociete();
        break;
    }
    if (this.canSwitchComponent) {
      this.activeSection = sectionNumber;
    }
  }

  /**
   * Check changes and navigate to next sections
   * @param: sectionNumber
   */
  public navigateToSection(sectionNumber: number) {
    if (!this.isCurrentFormChanged()) {
      return this.saveContentBeforeDeactivation(sectionNumber);
    }
    this.activeSection = sectionNumber;
  }

  /**
   * Check current form content changes
   */
  private isCurrentFormChanged() {
    switch (this.activeSection) {
      case 0:
        return this.compareObjects(this.restaurantForm.get('restaurant').value, this.baseRestaurantInfos) &&
          (this.decalMoisJourSign === this.defaultdecalMoisJourSign);
      case 1:
        return this.parametreGlobauxComponent.compareList();
      case 2:
        return this.compareObjects(this.companyForm.get('company').value, this.baseCompanyInfos);
      case 3:
        return this.compareObjects(this.companyForm.get('prefecture').value, this.prefectureInfos);
      default:
        return true;
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(sectionNumber?: number): Observable<boolean> {
    this.updateByNavigationAway = true;
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateContent(sectionNumber);
        this.navigateAway.next(this.canSwitchComponent);
      },
      reject: () => {
        this.resetForm();
        this.activeSection = sectionNumber;
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }
}
