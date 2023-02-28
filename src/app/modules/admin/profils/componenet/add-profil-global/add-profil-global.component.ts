import {Component, OnInit, ViewChild} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../shared/validator/trim-validators';
import {AffectationFranchiseComponent} from '../affectation-franchise/affectation-franchise.component';
import {AffectationAdministrateurComponent} from '../affectation-administrateur/affectation-administrateur.component';
import {ProfilService} from '../../service/profil.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {EcranModel} from '../../../../../shared/model/ecran.model';
import {EcranService} from '../../service/ecran.service';
import {ActivatedRoute} from '@angular/router';
import {SocieteModel} from '../../../../../shared/model/societe.model';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {ParametreGlobalService} from '../../../../home/configuration/service/param.global.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {DroitService} from '../../service/droit.service';
import {DroitModel} from '../../../../../shared/model/droit.model';


@Component({
  selector: 'rhis-add-profil-global',
  templateUrl: './add-profil-global.component.html',
  styleUrls: ['./add-profil-global.component.scss'],
})

export class AddProfilGlobalComponent implements OnInit {

  public droitDisabled = true;
  public ongletProfil: string;
  public ongletDroit: string;
  public showSaveButton = false;
  public selectedProfil = '';
  public societeChoisies;
  public profilExistant = false;
  public isSubmitted = false;
  public profilToUpdate: ProfilModel;
  public uuidProfil = '';
  public profilLibelle = '';
  public Profil: ProfilModel;
  // List des ecrans
  public ecrans: EcranModel[] = [];
  public ecransMobile: EcranModel[] = [];
  public droitList: DroitModel[] = [];
  public profilType = false;
  public defaultProfil: string;
  public ADD = true;
  public changed = false;
  public isMobileAppEnabled: boolean;
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  @ViewChild(AffectationFranchiseComponent)
  private franchiseComponent: AffectationFranchiseComponent;

  @ViewChild(AffectationAdministrateurComponent)
  private administrateurComponent: AffectationAdministrateurComponent;

  public admin = 'Administrateur';
  public franchise = 'Franchisé';
  private ecranMobile = 'FMO';

  // FIXME no literal strings allowded pass by rhisTranslator service
  public listProfil =
    [{libelle: 'Superviseur'},
      {libelle: 'Franchisé'},
      {libelle: 'Administrateur'}];
  public listSocietes: SocieteModel[] = [];
  public listRestaurants: RestaurantModel[] = [];
  public isFranchise = false;
  public isAdmin = false;
  public displaySpinner = false;
  private readonly codeParameter = 'USEAPPLIMOBILE';
  private readonly IS_TRUE = 'true';
  formGroup = new FormGroup(
    {
      nom: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      type: new FormControl('', [Validators.required, TrimValidators.trimValidator]),


    });


  constructor(private rhisTranslateService: RhisTranslateService,
              private ecranService: EcranService,
              private profileService: ProfilService,
              private notificationService: NotificationService,
              private activatedRoute: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private profilService: ProfilService,
              private parametreGlobalService: ParametreGlobalService,
              private domControlService: DomControlService,
              private droitService: DroitService) {
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidProfil) {
        this.ADD = false;
        this.uuidProfil = params.uuidProfil;
        this.getProfilByid();
        this.profilType = true;
        this.showSaveButton = true;
        this.getEcransByDefaultRestaurant();
        this.droitDisabled = false;
      }
    });
    this.societeChoisies = this.listProfil;
  }

  ngOnInit() {
    this.ongletProfil = this.rhisTranslateService.translate('MENU_PROFIL.PROFIL');
    this.ongletDroit = this.rhisTranslateService.translate('MENU_PROFIL.DROIT');
  }

  /**
   * get list des ecrans par restaurant
   */
  private async getEcransByDefaultRestaurant(): Promise<void> {
    this.ecranService.getEcranByDefaultRestaurant().subscribe(
      async (data: EcranModel[]) => {
        if (this.selectedProfil['libelle'] === this.franchise || this.selectedProfil['libelle'] === this.admin
          || this.defaultProfil === this.franchise || this.defaultProfil === this.admin) {
          this.ecrans = await data.filter((ecran: EcranModel) => !ecran.admin && !ecran.mobile);
          this.ecransMobile = await data.filter((ecran: EcranModel) => !ecran.admin && ecran.mobile);
        } else {
          this.ecrans = await data.filter((ecran: EcranModel) => !ecran.mobile);
          this.ecransMobile = await data.filter((ecran: EcranModel) => ecran.mobile);
        }
      }, (err: any) => {
      }
    );

    this.droitList = await this.droitService.getListDroitByProfilUuid(this.uuidProfil !== '' ? this.uuidProfil : this.Profil.uuid).toPromise();
  }

  /**
   * cette methide permet de charger l'interface de choix des socites et de restaurant selon le type de profil choisi
   */
  public choisirProfil() {
    this.showSaveButton = true;
    if (this.selectedProfil['libelle'] === this.franchise) {
      this.isFranchise = true;
      this.isAdmin = false;
    } else if (this.selectedProfil['libelle'] === this.admin) {
      this.isFranchise = false;
      this.isAdmin = true;
    } else {
      this.isFranchise = false;
      this.isAdmin = false;
    }
  }


  /**
   * cette methode permet recuperer les données du formulaire et selon le type de profil apelle le service convenable
   */
  public onSubmit() {
    this.profilExistant = false;
    this.isSubmitted = true;

    if (this.formGroup.valid) {
      /** traitement au cas de Franchisé **/
      if (this.formGroup.value.type.libelle === this.franchise) {

        if (!this.franchiseComponent.societeChoisies.length) {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PROFIL.ATLEAST_ONE_SOCIETE'));
        } else {
          const nomProfil = this.formGroup.value['nom'];
          this.profileService.addFranchise(this.franchiseComponent.societeChoisies, nomProfil).subscribe((data: ProfilModel) => {
            this.Profil = data;
            this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.ADDED'));
            this.droitDisabled = false;
            this.getEcransByDefaultRestaurant();
          }, err => {
            if (err.status === 409) {
              this.profilExistant = true;
            }
          });
        }
      } else if (this.formGroup.value.type.libelle === this.admin) {/** traitement au cas d'administrateur **/
        if (!this.administrateurComponent.restaurantChoisies.length) {
          this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PROFIL.ATLEAST_ONE_RESTAURANT'));
        } else {
          const nomProfil = this.formGroup.value['nom'];
          this.profileService.addAdministrateur(this.administrateurComponent.restaurantChoisies, nomProfil)
            .subscribe((data: ProfilModel) => {
              this.Profil = data;
              this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.ADDED'));
              this.droitDisabled = false;
              this.getEcransByDefaultRestaurant();
            }, err => {
              if (err.status === 400) {
                this.profilExistant = true;
              }
            });
        }
      } else {
        /** traitement au cas de superviseur **/
        const nomProfil = this.formGroup.value['nom'];

        this.profileService.addSuperviseur(null, nomProfil).subscribe((data: ProfilModel) => {
          this.Profil = data;

          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.ADDED'));
          this.droitDisabled = false;
          this.getEcransByDefaultRestaurant();
        }, err => {
          if (err.status === 409) {
            this.profilExistant = true;
          }
        });
      }
    }
  }

  private getProfilByid() {
    this.profilService.getProfilByid(this.uuidProfil).subscribe((data: ProfilModel) => {
      this.profilToUpdate = data;
      this.profilLibelle = this.profilToUpdate.libelle;
      this.Profil = this.profilToUpdate;
      this.defaultProfil = this.profilTypeFunc(this.profilToUpdate);
    });
  }


  private profilTypeFunc(profil: ProfilModel) {
    if (profil.affectations[0].restaurant === null && profil.affectations[0].societe === null) {
      return 'Superviseur';
    } else if (profil.affectations[0].restaurant === null) {
      this.isFranchise = true;
      profil.affectations.forEach(affectation => {
        this.listSocietes.push(affectation.societe);

      });
      return 'Franchisé';
    }
    this.isAdmin = true;
    return 'Administrateur';
  }

  public async updateProfil(): Promise<void> {
    this.profilToUpdate.libelle = this.profilLibelle.trim();
    this.profilExistant = false;
    if (this.isAdmin) {
      if (this.administrateurComponent.restaurantChoisies.length === 0) {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PROFIL.ATLEAST_ONE_RESTAURANT'));
      } else {
        try {
          const profil: ProfilModel = await this.profilService.updateProfil(this.profilToUpdate).toPromise();
          await this.profilService.updateProfilAdmin(profil.uuid, this.administrateurComponent.restaurantChoisies).toPromise();
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.MODIFIED'));
          this.Profil = this.profilToUpdate;
        } catch (e) {
          if (e.status === 406) {
            this.profilExistant = true;
          }
        }
      }
    } else if (this.isFranchise) {
      if (this.franchiseComponent.societeChoisies.length === 0) {
        this.notificationService.showErrorMessage(this.rhisTranslateService.translate('PROFIL.ATLEAST_ONE_SOCIETE'));
      } else {
        try {
          const profil: ProfilModel = await this.profilService.updateProfil(this.profilToUpdate).toPromise();
          await this.profilService.updateProfilFranchise(profil.uuid, this.franchiseComponent.societeChoisies).toPromise();
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.MODIFIED'));
          this.Profil = this.profilToUpdate;
        } catch (e) {
          if (e.status === 406) {
            this.profilExistant = true;
          }
        }
      }
    } else {
      try {
        await this.profilService.updateProfil(this.profilToUpdate).toPromise();
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.MODIFIED'));
        this.Profil = this.profilToUpdate;
      } catch (e) {
        if (e.status === 406) {
          this.profilExistant = true;
        }
      }
    }
  }

  public showMobile(): boolean {
    return this.domControlService.showControl(this.ecranMobile);
  }

  private async displayMobileUsers(): Promise<void> {
    const userAppMobileParam = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.codeParameter).toPromise();
    this.isMobileAppEnabled = userAppMobileParam.valeur.toString().toLowerCase() === this.IS_TRUE;
  }
}
