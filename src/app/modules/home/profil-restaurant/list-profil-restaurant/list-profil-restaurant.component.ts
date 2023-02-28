import {Component, OnInit} from '@angular/core';
import {ProfilModel} from '../../../../shared/model/profil.model';
import {ProfilRestaurantService} from '../service/profil-restaurant.service';
import {EcranService} from '../../../admin/profils/service/ecran.service';
import {EcranModel} from '../../../../shared/model/ecran.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SessionService} from '../../../../shared/service/session.service';
import {RestaurantModel} from '../../../../shared/model/restaurant.model';
import {NotificationService} from '../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../shared/service/rhis-translate.service';
import {DroitModel} from '../../../../shared/model/droit.model';
import {DroitService} from '../../../admin/profils/service/droit.service';
import {DroitPkModel} from '../../../../shared/model/droitPk.model';
import {AffectationService} from '../../../admin/utilisateur/service/affectation.service';
import {ConfirmationService} from 'primeng/api';
import {ProfilService} from '../../../admin/profils/service/profil.service';
import {DomControlService} from '../../../../shared/service/dom-control.service';
import {ParametreGlobalService} from '../../configuration/service/param.global.service';

@Component({
  selector: 'rhis-list-profil-restaurant',
  templateUrl: './list-profil-restaurant.component.html',
  styleUrls: ['./list-profil-restaurant.component.scss']
})
export class ListProfilRestaurantComponent implements OnInit {
  public isSubmitted = false;
  public duplicated = false;

  public showAddProfilPopup = false;
  public profilAdded: ProfilModel;
  public showAddProfilTitle: string;
  public isEditable = true;
  public profil: ProfilModel;
  public isMobileAppEnabled: boolean;
  private readonly codeParameter = 'USEAPPLIMOBILE';
  private readonly IS_TRUE = 'true';
  public displaySpinner = false;
  public profilAddForm = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required]),

    }
  );

  public permissions = [
    {permission: 1, name: 'afficher'},
    {permission: 2, name: 'detailler'},
    {permission: 4, name: 'ajouter'},
    {permission: 8, name: 'supprimer'},
    {permission: 16, name: 'modifier'},
    {permission: 32, name: 'bloquer/débloquer'}
  ];

  public ecrans: EcranModel[] = [];
  public ecransMobile: EcranModel[] = [];
  public droitList: DroitModel[] = [];
  public frozenCols: any[] = [];
  public totalRecords: number;
  public listProfil: ProfilModel[] = [];
  public listProfilMobile: ProfilModel[] = [];

  public profilDefault: ProfilModel;
  public droit: DroitModel;
  public droitPk: DroitPkModel;
  private ecran = 'GPR';
  private ecranMobile = 'FMO';
  public heightInterface: any;

  constructor(private profilRestaurantService: ProfilRestaurantService,
              private ecranService: EcranService,
              private sessionService: SessionService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private affectationService: AffectationService,
              private confirmationService: ConfirmationService,
              private profilService: ProfilService,
              private droitSErvice: DroitService,
              private domControlService: DomControlService,
              private parametreGlobalService: ParametreGlobalService,
              private droitService: DroitService) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public showMobile(): boolean {
    return this.domControlService.showControl(this.ecranMobile);
  }


  ngOnInit() {
    this.isEditable = this.domControlService.updateListControl(this.ecran);
    this.getProfilsByRestaurant();
    this.frozenCols = [
      {field: 'code', header: 'ecran'}
    ];
    this.totalRecords = this.ecrans.length;
    this.displayMobileUsers();

  }

  /**
   * get list des ecrans par restaurant
   */
  private async getDefaultEcrans(): Promise<void> {
    this.displaySpinner = true;
    this.ecranService.getEcranByDefaultRestaurant().subscribe(
      async (data: EcranModel[]) => {
        this.ecrans = await data.filter((ecran: EcranModel) => !ecran.admin && !ecran.mobile && ecran.code !== 'GPC' && ecran.code !== 'GDF' && ecran.code !== 'LRF');
        this.ecransMobile = await data.filter((ecran: EcranModel) => !ecran.admin && ecran.mobile);
        this.displaySpinner = false;

      }, (err: any) => {
        console.log(err);
      }
    );
    this.droitList = await this.droitService.getListDroitByRestaurant(this.sessionService.getUuidRestaurant()).toPromise();
  }


  /**
   * get list des profils par restaurant sauf le profil default
   */
  private getProfilsByRestaurant(): void {
    let num = 0;
    this.profilRestaurantService.getProfilsByRestaurant().subscribe(
      async (data: ProfilModel[]) => {
        this.listProfilMobile = await data;
        this.listProfil = await data.filter((profil: ProfilModel) => profil.libelle !== 'mobile');
        this.getDefaultEcrans();
        for (num = 0; num <= this.listProfil.length; num++) {
          if (this.listProfil[num].libelle === 'default') {
            this.profilDefault = this.listProfil[num];
            this.listProfil.splice(num, 1);
            break;
          }
        }

        this.listProfil.forEach(profil => {
            if (this.listProfil[num].libelle === 'default') {
              this.profilDefault = this.listProfil[num];
              this.listProfil.splice(num, 1);
            }
          }, (err: any) => {
          }
        );
      });
  }

  /**
   * fermer le pupup
   */
  public closePopup() {
    this.showAddProfilPopup = false;
    this.isSubmitted = false;
    this.duplicated = false;
    this.profilAddForm.reset();
  }

  /**
   * permet de recuperer les droits d'acces unitaire apartir du permission decimal
   * @param: permission
   */
  private permissionConverter(permission) {
    let n = +parseInt(permission, 10).toString(2);

    const ListPermissions = ([]);
    let decimal = 0;
    let p = 0;
    while ((n !== 0)) {
      {
        decimal = (Math.round((n % 10) * Math.pow(2, p)) | 0);

        ListPermissions.push(decimal);
        n = (n / 10 | 0);
        p++;
      }
    }
    return ListPermissions;
  }

  /**
   * cette methode permet de modifier un droit
   * @param: ecranId
   * @param: profilId
   * @param: permession
   */
  private updateDroit(ecranId
                        :
                        number, profilId
                        :
                        number, permession
                        :
                        number
  ) {
    this.droitPk = new DroitPkModel();
    this.droit = new DroitModel();
    this.droitPk.profilId = profilId;
    this.droitPk.ecranId = ecranId;
    this.droit.droitPk = this.droitPk;
    this.droit.permission = permession;
    this.droitSErvice.updateDroit(this.droitPk, permession).subscribe(resp => {
    }, err => {
      console.log(err);
    });
  }

  /**
   * cette methode permet d'ajouter un profil et verifier l'unicité par libelle
   */
  public addProfil(): void {
    this.isSubmitted = true;
    if (this.profilAddForm.valid) {
      this.setProfilBeforeSave();
      this.profilRestaurantService.add(this.profil).subscribe((resp: ProfilModel) => {
        this.profilAdded = resp;
        this.listProfil.push(this.profilAdded);
        this.showAddProfilPopup = false;
        this.getDefaultEcrans();
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.ADDED'));
      }, err => {
        if (err.status === 409) {
          this.duplicated = true;
        }
      });
    }
  }

  public showAddPopup() {
    this.showAddProfilPopup = true;
    this.showAddProfilTitle = this.rhisTranslateService.translate('PROFIL.ADD');
  }

  private setProfilBeforeSave() {
    const restau: RestaurantModel = new RestaurantModel();
    this.profil = new ProfilModel();
    this.profilAdded = new ProfilModel();
    this.profil.libelle = this.profilAddForm.value['libelle'].toUpperCase();
    this.profil.defaults = false;
    restau.idRestaurant = +this.sessionService.getRestaurant();
    this.profil.restaurant = restau;
  }


  public doesProfilHasEcran(ecran: EcranModel, index: number): boolean {
    let profilHasEcran = false;

    const profil = this.listProfil[index];

   this.droitList.forEach((item: DroitModel) => {
      if ((item.droitPk.profilId === profil.idProfil) && (item.permission > 0) && (ecran.idEcran === item.droitPk.ecranId)) {
        profilHasEcran = true;
      }
    });
    return profilHasEcran;
  }

  public doesProfilHasDroit(ecran: EcranModel, index: number, permission: any): boolean {
    let profilHasDroit = false;

    const profil = this.listProfil[index];

    if (this.droitList.length !== 0) {
      this.droitList.forEach((item: DroitModel) => {
        if ((item.droitPk.profilId === profil.idProfil) && (ecran.idEcran === item.droitPk.ecranId)) {
          const list: number[] = this.permissionConverter(item.permission);

          list.forEach(droit => {

            if (permission.permission === droit) {
              profilHasDroit = true;
            }
          });
        }
      });
    }
    return profilHasDroit;
  }

  public changeEcran(ecran, index) {
    const profil = this.listProfil[index];
    if (this.droitList.length !== 0) {
      this.droitList.forEach(item => {
        if ((item.droitPk.profilId === profil.idProfil)) {
          if (item.permission <= 0) {
            item.permission = 127;
            this.updateDroit(ecran.idEcran, profil.idProfil, 127);
          } else {
            item.permission = 0;
            this.updateDroit(ecran.idEcran, profil.idProfil, 0);
          }
        }
      });
    }
  }

  public changeDroit(ecran, index, droitAcces) {
    const profil = this.listProfil[index];

    if (this.droitList.length !== 0) {
      this.droitList.forEach(item => {

        if ((item.droitPk.profilId === profil.idProfil) && (ecran.idEcran === item.droitPk.ecranId)) {

          const list: number[] = this.permissionConverter(item.permission);
          if (list.includes(droitAcces.permission)) {
            item.permission -= droitAcces.permission;
            if (droitAcces.permission === 1) {
              item.permission = 0;
            }
          } else {
            item.permission += droitAcces.permission;
            if (!list.includes(1) && droitAcces.permission > 1) {
              item.permission += 1;
            }
          }
          this.updateDroit(ecran.idEcran, profil.idProfil, item.permission);
        }
      });
    }
  }

  /**
   * permet de supprimer un profil restaurant
   * @param profil
   */
  public deletProfil(profil: ProfilModel): void {
    this.affectationService.isAffected(profil.uuid).subscribe((etat: boolean) => {
      if (etat) {
        this.confirmationService.confirm({
          message: this.rhisTranslateService.translate('PROFIL.DELETE_PROFIL_RESTAURANT'),
          header: this.rhisTranslateService.translate('PROFIL.DELETE_PROFIL_RESTAURANT_HEADER'),
          acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: () => {
            this.profilService.deleteProfilGlobal(profil.uuid).subscribe(a => {
              this.listProfil.splice(this.listProfil.indexOf(profil), 1);
              this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.DELETED'));
            });
          },
          reject: () => {
          }
        });
      } else {
        this.profilService.deleteProfilGlobal(profil.uuid).subscribe(() => {
          this.listProfil.splice(this.listProfil.indexOf(profil), 1);
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('PROFIL.DELETED'));
          this.getProfilsByRestaurant();
        });
      }
    });
  }

  private async displayMobileUsers(): Promise<void> {
    const userAppMobileParam = await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.codeParameter).toPromise();
    this.isMobileAppEnabled = userAppMobileParam.valeur.toString().toLowerCase() === this.IS_TRUE;
  }
}
