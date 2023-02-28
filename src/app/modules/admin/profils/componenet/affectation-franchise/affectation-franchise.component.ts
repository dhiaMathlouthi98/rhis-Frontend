import {Component, Input, OnInit} from '@angular/core';
import {SocieteService} from '../../../../../shared/module/societe/service/societe.service';
import {SocieteModel} from '../../../../../shared/model/societe.model';
import {ActivatedRoute} from '@angular/router';
import {ProfilModel} from '../../../../../shared/model/profil.model';
import {ProfilService} from '../../service/profil.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {AffectationModel} from '../../../../../shared/model/affectation.model';

@Component({
  selector: 'rhis-affectation-franchise',
  templateUrl: './affectation-franchise.component.html',
  styleUrls: ['./affectation-franchise.component.scss']
})

// FIXME : USE TRANSLSATE SERVICE IN HTML
export class AffectationFranchiseComponent implements OnInit {

  @Input()
  public listSocietes: SocieteModel[];

  public societeChoisies: SocieteModel[] = [];
  public listSociete: SocieteModel[] = [];
  public profil: ProfilModel;

  constructor(private societeService: SocieteService,
              private activatedRoute: ActivatedRoute,
              private profilService: ProfilService,
              private rhisTranslateService: RhisTranslateService) {

  }

  ngOnInit() {
    this.getAllSociete();
    this.activatedRoute.params.subscribe(params => {
      if (params.uuidProfil) {

        this.getProfilByid(params.uuidProfil);
      }
    });
  }

  private getAllSociete() {
    // FIXME add error case
    this.societeService.getAllSociete().subscribe(data => {
      this.listSociete = data;
    });
  }

  private async getProfilByid(uuidProfil: string): Promise<void> {
    this.profil = await this.profilService.getProfilByid(uuidProfil).toPromise();
    this.profil.affectations.forEach((affectation: AffectationModel) => {
      if (!affectation.utilisateur) {
        this.societeChoisies.push(affectation.societe);
        if ((this.listSociete.findIndex(i => i.uuid === affectation.societe.uuid)) >= 0) {
          this.listSociete.splice(this.listSociete.findIndex(i => i.uuid === affectation.societe.uuid), 1);
        }
      }
    });
  }
}
