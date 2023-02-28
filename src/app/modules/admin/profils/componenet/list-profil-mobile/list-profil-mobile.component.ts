import {Component, Input, OnInit} from '@angular/core';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {EcranModel} from '../../../../../shared/model/ecran.model';
import {DroitModel} from '../../../../../shared/model/droit.model';
import {DroitPkModel} from '../../../../../shared/model/droitPk.model';
import {ProfilService} from '../../service/profil.service';
import {EcranService} from '../../service/ecran.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DroitService} from '../../service/droit.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-list-profil-mobile',
  templateUrl: './list-profil-mobile.component.html',
  styleUrls: ['./list-profil-mobile.component.scss']
})
export class ListProfilMobileComponent implements OnInit {
  @Input()
  public Profil: ProfilModel;
  @Input()
  public ecransMobile: EcranModel[];
  @Input()
  public droitList: DroitModel[];

  public totalRecords: number;
  public listProfil: ProfilModel[] = [];
  public droit: DroitModel;
  public droitPk: DroitPkModel;
  public profil: ProfilModel;
  public heightInterface: any;
  private ecran = 'FMO';
  public isEditable: boolean;


  constructor(private profilService: ProfilService,
              private ecranService: EcranService,
              private sessionService: SessionService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private droitSErvice: DroitService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.updateButtonControl();
  }

  public updateButtonControl(): void {
    this.isEditable = this.domControlService.updateListControl(this.ecran);
  }

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
   * cette methode permet de changer l'etat du droit du profil sur l'ecran
   * @param: ecran
   */
  changeEcran(ecran) {
    const profil = this.Profil;
    if (this.droitList.length !== 0) {
      this.droitList.forEach((item: DroitModel) => {
        if ((item.droitPk.profilId === profil.idProfil) && (ecran.idEcran === item.droitPk.ecranId)) {
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

}
