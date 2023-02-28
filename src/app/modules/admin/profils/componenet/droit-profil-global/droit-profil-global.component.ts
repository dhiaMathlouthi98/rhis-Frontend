import {Component, Input, OnInit} from '@angular/core';
import {ProfilService} from '../../service/profil.service';
import {EcranService} from '../../service/ecran.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DroitService} from '../../service/droit.service';
import {EcranModel} from '../../../../../shared/model/ecran.model';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {DroitModel} from '../../../../../shared/model/droit.model';
import {DroitPkModel} from '../../../../../shared/model/droitPk.model';

@Component({
  selector: 'rhis-droit-profil-global',
  templateUrl: './droit-profil-global.component.html',
  styleUrls: ['./droit-profil-global.component.scss']
})

export class DroitProfilGlobalComponent implements OnInit {

  @Input()
  public Profil: ProfilModel;
  @Input()
  public ecrans: EcranModel[];
  @Input()
  public droitList: DroitModel[];

  // FIXME : USE TRANSLSATE SERVICE
  public permissions = [
    {permission: 1, name: 'afficher'},
    {permission: 2, name: 'detailler'},
    {permission: 4, name: 'ajouter'},
    {permission: 8, name: 'supprimer'},
    {permission: 16, name: 'modifier'},
    {permission: 32, name: 'bloquer/débloquer'}
  ];

  public totalRecords: number;
  public listProfil: ProfilModel[] = [];
  public droit: DroitModel;
  public droitPk: DroitPkModel;
  public profil: ProfilModel;
  public heightInterface: any;

  constructor(private profilService: ProfilService,
              private ecranService: EcranService,
              private sessionService: SessionService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private droitSErvice: DroitService) {
  }

  ngOnInit() {

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
  private updateDroit(ecranId: number, profilId: number, permession: number) {
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
   * cette methode permet de verifier si profil a le droit sur une ecran
   * @param: ecran
   */
  public doesProfilHasEcran(ecran: EcranModel): boolean {

    let profilHasEcran = false;

    const profil = this.Profil;
    this.droitList.forEach((item: DroitModel) => {
      if ((item.droitPk.profilId === profil.idProfil) && (item.permission > 0) && (ecran.idEcran === item.droitPk.ecranId)) {
        profilHasEcran = true;
      }
    });
    return profilHasEcran;
  }

  /**
   * cette methode permet de verifier si un profil a le droit sur une fonctionnalité de l'ecran
   * @param: ecran
   * @param: permission
   */
  public doesProfilHasDroit(ecran: EcranModel, permission: any): boolean {
    let profilHasDroit = false;

    const profil = this.Profil;

    if (this.droitList.length !== 0) {
      this.droitList.forEach((item: DroitModel) => {
        if ((item.droitPk.profilId === profil.idProfil) && ecran.idEcran === item.droitPk.ecranId) {
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

  /**
   * cette methode permet de changer l'etat du droit du profil sur l'ecran
   * @param: ecran
   */
  changeEcran(ecran) {
    const profil = this.Profil;
    if (this.droitList.length !== 0) {
      this.droitList.forEach((item: DroitModel) => {
        if ((item.droitPk.profilId === profil.idProfil) && ecran.idEcran === item.droitPk.ecranId) {
          if (item.permission <= 0) {
            item.permission = 63;
            this.updateDroit(ecran.idEcran, profil.idProfil, 63);
          } else {
            item.permission = 0;
            this.updateDroit(ecran.idEcran, profil.idProfil, 0);
          }
        }
      });
    }
  }

  /**
   * cette methode permet de changer l'etat du droit du profil sur une fonctionnalité de l'ecran
   * @param: ecran
   * @param: droitAcces
   */
  changeDroit(ecran, droitAcces) {
    const profil = this.Profil;

    if (this.droitList.length !== 0) {
      this.droitList.forEach(item => {

        if ((item.droitPk.profilId === profil.idProfil) && ecran.idEcran === item.droitPk.ecranId) {

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
}
