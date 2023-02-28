import {Component, Input, OnInit} from '@angular/core';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {EcranModel} from '../../../../../shared/model/ecran.model';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {DroitModel} from '../../../../../shared/model/droit.model';
import {DroitPkModel} from '../../../../../shared/model/droitPk.model';
import {DroitService} from '../../../../admin/profils/service/droit.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-list-profil-mobile',
  templateUrl: './list-profil-mobile.component.html',
  styleUrls: ['./list-profil-mobile.component.scss']
})
export class ListProfilMobileComponent implements OnInit {


  @Input()
  public listProfilMobile: ProfilModel[] = [];
  @Input()
  public ecransMobile: EcranModel[] = [];
  @Input()
  public droitList: DroitModel[] = [];
  private ecran = 'FMO';
  public isEditable: boolean;
  public frozenCols: any[] = [];
  public totalRecords: number;
  public droitPk: DroitPkModel;
  public droit: DroitModel;
  public heightInterface: any;
  public showAddProfilPopup = false;
  public showAddProfilTitle: string;
  public permissions = [
    {permission: 1, name: 'afficher'},
    {permission: 2, name: 'detailler'},
    {permission: 4, name: 'ajouter'},
    {permission: 8, name: 'supprimer'},
    {permission: 16, name: 'modifier'},
    {permission: 32, name: 'dupliquer'}
  ];

  constructor(private domControlService: DomControlService,
              private droitSErvice: DroitService,
              private rhisTranslateService: RhisTranslateService) {
  }


  ngOnInit() {
    this.frozenCols = [
      {field: 'code', header: 'ecran'}
    ];
    this.totalRecords = this.ecransMobile.length;
    this.updateButtonControl();
  }

  public updateButtonControl(): void {
    this.isEditable = this.domControlService.updateListControl(this.ecran);
  }

  public doesProfilHasEcran(ecran: EcranModel, index: number): boolean {
    let profilHasEcran = false;

    const profil = this.listProfilMobile[index];

    this.droitList.forEach((item: DroitModel) => {
      if ((item.droitPk.profilId === profil.idProfil) && (item.permission > 0) && (ecran.idEcran === item.droitPk.ecranId)) {
        profilHasEcran = true;
      }
    });
    return profilHasEcran;
  }

  public changeEcran(ecran, index): void {
    const profil = this.listProfilMobile[index];
    if (this.droitList.length !== 0) {
      this.droitList.forEach(item => {
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

  public showAddPopup() {
    this.showAddProfilPopup = true;
    this.showAddProfilTitle = this.rhisTranslateService.translate('PROFIL.ADD');
  }
}
