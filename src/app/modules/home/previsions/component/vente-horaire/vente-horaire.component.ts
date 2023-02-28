import {Component, OnInit} from '@angular/core';
import {VenteHoraireService} from '../../service/vente.horaire.service';
import {DateService} from '../../../../../shared/service/date.service';
import {ModeVenteModel} from '../../../../../shared/model/modeVente.model';
import {ModeVenteService} from '../../../configuration/service/mode-vente.service';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {VenteHoraireModel} from '../../../../../shared/model/vente.horaire.model';
import {PrevisionsHelperService} from '../../service/previsions-helper.service';
import {VenteHoraireModeVenteModel} from '../../../../../shared/model/vente.horaire.mode.vente.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../shared/service/rhis.routing.service';
import {VenteHoraireModeVentePkModel} from '../../../../../shared/model/vente.horaire.mode.vente.pk.model';
import {PrevisionsService} from '../../service/previsions.service';

@Component({
  selector: 'rhis-vente-horaire',
  templateUrl: './vente-horaire.component.html',
  styleUrls: ['./vente-horaire.component.scss']
})
export class VenteHoraireComponent implements OnInit {

  public vhData: VenteHoraireModel[] = [];

  public vhDataToBeUpdated: VenteHoraireModel[] = [];

  public heightInterface: any;

  public listModeVentes: ModeVenteModel[] = [];

  public venteHoraireModeVenteCol: any = [];

  public fullTitle: string;

  public uuidVenteJournaliere: string;

  public dateAsString;

  private totalVenteValue = 0;

  private ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public realVentes: boolean;

  constructor(private venteHoraireService: VenteHoraireService,
              private modeVenteService: ModeVenteService,
              private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private previsionServiceHelper: PrevisionsHelperService,
              private previsionService: PrevisionsService,
              private notificationService: NotificationService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private rhisRoutingService: RhisRoutingService) {
    this.activatedRoute.params.subscribe((params) => {
      if (params.date && params.id && params.realVentes) {
        this.realVentes = (params.realVentes === 'false') ? true : false;
        this.dateAsString = params.date;
        const dateParts = params.date.split('-').reverse();
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        this.fullTitle = this.previsionServiceHelper.setFullDateAsString(date);
        this.uuidVenteJournaliere = params.id;
      }
    });
  }

  ngOnInit() {
    this.getVenteHoraireByIdVenteJournaliere(this.uuidVenteJournaliere);
  }

  /**
   * Cette methode permet de mettre à jour les valeurs du ventes/pourcentage/transaction pour la vente horaire (total) et
   * pour les mode de vente d'une vente horaire dans la cas où une modification est effectuée au niveau des mode de ventes d'une vente horaire
   * @param: element
   */
  public updateVenteHoraireModeVenteValue(element: VenteHoraireModeVenteModel): void {
    if (element) {
      element.ventes = +element.ventes;
      let vhNewVente = 0;
      let vhNewTransaction = 0;
      const indexVenteHoraire = this.vhData.findIndex(item => item.idVenteHoraire === element.venteHoraireModeVentePK.idVenteHoraire);

      // Permet de recuperer la nouvelle valeure de la vente ( la somme des ventes des mode de vente d'une vente horaire)
      this.vhData[indexVenteHoraire].venteHoraireModeVentes.forEach(item => {
        vhNewVente += +item.ventes;
      });

      // Mettre à jour la valeur du total de vente
      this.vhData[indexVenteHoraire].ventes = +(vhNewVente.toFixed(2));

      this.vhData[indexVenteHoraire].venteHoraireModeVentes.forEach(item => {
        if (+vhNewVente !== 0) {
          item.pourcentage = +((+item.ventes * 100) / +vhNewVente).toFixed(2);

          item.transaction = +(this.getNewTransactionValue(this.vhData[indexVenteHoraire].plateauMoyen, item.ventes).toFixed(2));

          vhNewTransaction += item.transaction;
        }
      });

      // Mettre à jour la valeur du total de transaction
      this.vhData[indexVenteHoraire].trans = +(vhNewTransaction.toFixed(2));

      // Ajouter la vente horaire modifiée dans la liste des ventes horaires qui seront envoyés au back après
      this.addDataToBeUpdated(this.vhData[indexVenteHoraire]);
    }
  }

  public createNewVenteHoraireModeVente(newElement: any, venteHoraire: VenteHoraireModel, modeVente: ModeVenteModel): void {
    const key = new VenteHoraireModeVentePkModel();
    key.idVenteHoraire = venteHoraire.idVenteHoraire;
    key.idModeVente = modeVente.idModeVente;

    const element = new VenteHoraireModeVenteModel();
    element.venteHoraireModeVentePK = key;
    element.ventes = +newElement.textContent;

    venteHoraire.venteHoraireModeVentes.push(element);

    this.updateVenteHoraireModeVenteValue(element);


  }

  /**
   * Cette methode permet de mettre à jour les valeurs de ventes/transaction pour les modes de ventes d'une vente horaire et le total de transaction dans la vente horaire
   * dans la cas où une modification a été faite au niveau du total de vente
   * @param: vh
   */
  public updateVenteHoraireVenteValue(vh: VenteHoraireModel): void {
    if (vh) {
      const newVente = +vh.ventes;
      let vhNewTransaction = 0;
      // Permet de mettre à jour les valeurs de ventes et transaction pour les modes de vente d'une vente horaire
      vh.venteHoraireModeVentes.forEach(item => {
        item.ventes = +(((+newVente * +item.pourcentage) / +100).toFixed(2));
        item.transaction = +(this.getNewTransactionValue(vh.plateauMoyen, item.ventes).toFixed(2));
        vhNewTransaction += item.transaction;
      });
      vh.ventes = +(vh.ventes);
      const previousVenteValue = +((vh.pourcentage * this.totalVenteValue) / 100);

      this.totalVenteValue = +(this.totalVenteValue - previousVenteValue) + (+vh.ventes);
      // Mettre à jour la valeur du total de transaction
      vh.trans = +(vhNewTransaction.toFixed(2));

      this.updateVenteHorairePourcentageValue();


    }
  }

  /**
   * Cette methode fait appel au web service responsable à la modification des ventes horaires
   */
  public updateVenteHoraire(): void {
    if (this.uuidVenteJournaliere === '0') {
      this.vhDataToBeUpdated = [];
      this.vhData.forEach(item => {
        item.idVenteHoraire = 0;
        item.venteHoraireModeVentes.forEach(itemAssoc => {
          itemAssoc.venteHoraireModeVentePK.idVenteHoraire = item.idVenteHoraire;
        });
        this.vhDataToBeUpdated.push({...item});
      });
    }
    this.updateListVenteHoraire();
  }

  public lisserVenteHoraire(): void {
    this.notificationService.startLoader();
    this.resetVenteHoraireIDs();
    this.previsionService.lisserVenteJournaliereWithoutSave(this.uuidVenteJournaliere, this.vhData).subscribe(
      (data: VenteHoraireModel[]) => {
        this.notificationService.stopLoader();
        this.vhDataToBeUpdated = [];
        this.vhData = data;
        this.vhData.forEach((item: VenteHoraireModel) => {
          if (item.heureDebut) {
            item.heureDebut = this.dateService.setTimeFormatHHMM(item.heureDebut);
          }
          if (item.heureFin) {
            item.heureFin = this.dateService.setTimeFormatHHMM(item.heureFin);
          }
        });
        this.vhData.sort((a: VenteHoraireModel, b: VenteHoraireModel) => a.idVenteHoraire - b.idVenteHoraire);
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }, () => {
        this.notificationService.showSuccessMessage('VENTE_HORAIRE.LISSED_SUCCES');
      }
    );
  }

  public checkForWrongNumberFormat(event: any, value: number): void {
    const specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight', 'Shift'];
    // Allow Backspace, tab, end, home, Delete, left,  and right  keys
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const twoDigitDecimalNumberRegex = new RegExp(/^\d+\.?\d{0,2}$/g);

    const current = String(value);

    const next: string = current.concat(event.key);
    if (next && !twoDigitDecimalNumberRegex.test(next.toString())) {
      event.preventDefault();
    }

  }

  private updateVenteHorairePourcentageValue(): void {
    this.vhData.forEach((item: VenteHoraireModel) => {
      if (this.totalVenteValue === 0) {
        item.pourcentage = 0;
      } else {
        item.pourcentage = +(((item.ventes * 100) / this.totalVenteValue).toFixed(2));
      }

      // Ajouter la vente horaire modifiée dans la liste des ventes horaires qui seront envoyés au back après
      this.addDataToBeUpdated(item);
    });
  }

  private updateListVenteHoraire(): void {
    this.notificationService.startLoader();
    const tmpVhData = [...this.vhDataToBeUpdated];
    tmpVhData.forEach((item: VenteHoraireModel) => {
      item.venteHoraireModeVentes.forEach((vhModeVente: VenteHoraireModeVenteModel) => {
        vhModeVente.modeVente = null;
        delete vhModeVente.venteHoraire;
      });
    });
    this.venteHoraireService.updateListVenteHoraire(tmpVhData, this.uuidVenteJournaliere, this.dateAsString).subscribe(
      () => {
        this.notificationService.stopLoader();
        this.vhDataToBeUpdated = [];
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      },
      () => {
        this.notificationService.showSuccessMessage('VENTE_HORAIRE.SAVED_INFORMATIONS');
        setTimeout(() => {
          this.goToPrevisionInTheSameDate();
        }, 500);
      }
    );
  }

  /**
   * Cette methode permet de retourner la valeure de transaction
   * @param: plateauMoyen
   * @param: vente
   */
  private getNewTransactionValue(plateauMoyen: number, vente: number): number {
    let newTransactionValue = 0;
    if (plateauMoyen !== 0) {
      newTransactionValue = vente / plateauMoyen;
    }
    return Math.ceil(newTransactionValue);
  }

  private goToPrevisionInTheSameDate(): void {
    const date = this.dateAsString.split('-').reverse().join(' ');
    this.router.navigateByUrl(this.rhisRoutingService.getRoute('HOME_PREVISION'), {
      state: {date: date},
    });
  }

  private async getModesVents(data: VenteHoraireModel[]): Promise<void> {
    if (this.uuidVenteJournaliere === '0') {
      this.setModesVentes(data);
    } else {
      this.listModeVentes = await this.modeVenteService.getAllByIdVenteJournaliere(this.uuidVenteJournaliere).toPromise();
    }
    this.listModeVentes.forEach(_ => {
      this.venteHoraireModeVenteCol.push(this.rhisTranslateService.translate('VENTE_HORAIRE.COL_VENTE'),
        this.rhisTranslateService.translate('VENTE_HORAIRE.COL_POURCENTAGE'),
        this.rhisTranslateService.translate('VENTE_HORAIRE.COL_TRANSACTION'));
    });
  }

  /**
   * Initialiser la liste des modes de vente par pour les vente journaliere non validées
   */
  private setModesVentes(ventesHoraires: VenteHoraireModel[]): void {
    if (ventesHoraires.length) {
      ventesHoraires[0].venteHoraireModeVentes.forEach((venteHoraireModeVente: VenteHoraireModeVenteModel) => this.listModeVentes.push(venteHoraireModeVente.modeVente));
    }
  }

  /**
   * Permet de recuperer la liste des ventes horaires à partir d'idVenteJournaliere
   * @param: idVenteJournaliere
   */
  private getVenteHoraireByIdVenteJournaliere(uuidVenteJournaliere: string): void {
    this.venteHoraireService.getVenteHoraireByIdVenteJournaliere(uuidVenteJournaliere, this.dateAsString).subscribe(
      async (data: VenteHoraireModel[]) => {
        this.vhData = data;
        this.setTotalVenteValue();
        await this.getModesVents(data);
        this.vhData.forEach(item => {
          if (item.heureDebut) {
            item.heureDebut = this.dateService.setTimeFormatHHMM(item.heureDebut);
          }
          if (item.heureFin) {
            item.heureFin = this.dateService.setTimeFormatHHMM(item.heureFin);
          }
          if (!item.venteHoraireModeVentes.length) {
            this.listModeVentes.forEach(
              (mv: ModeVenteModel) => {
                const venteHoraireModeVente = new VenteHoraireModeVenteModel();
                venteHoraireModeVente.modeVente = mv;
                if (mv.libelle.toUpperCase() === 'CMPT' || mv.libelle.toUpperCase() === 'COMPTOIR') {
                  venteHoraireModeVente.pourcentage = 100;
                } else {
                  venteHoraireModeVente.pourcentage = 0;
                }
                venteHoraireModeVente.transaction = 0;
                venteHoraireModeVente.ventes = 0;
                venteHoraireModeVente.venteHoraire = item;
                const venteHoraireModeVentePK = new VenteHoraireModeVentePkModel();
                venteHoraireModeVentePK.idModeVente = mv.idModeVente;
                venteHoraireModeVentePK.idVenteHoraire = item.idVenteHoraire;
                venteHoraireModeVente.venteHoraireModeVentePK = venteHoraireModeVentePK;
                item.venteHoraireModeVentes.push(venteHoraireModeVente);
              }
            );
          }
        });

        // Permet de trier les ventes horaire par ID de façon croissante -> trier les ventes horaires par ordre chronologique
        this.vhData.sort((a, b) => {
          let dateA = new Date(a.heureDebut.getTime());
          if (a.heureDebutNuit) {
            dateA = new Date(dateA.getTime() + this.ONE_DAY_IN_MILLISECONDS);
          }

          let dateB = new Date(b.heureDebut.getTime());
          if (b.heureDebutNuit) {
            dateB = new Date(dateB.getTime() + this.ONE_DAY_IN_MILLISECONDS);
          }

          let result = ((dateA.valueOf() > dateB.valueOf()) ? 1 : ((dateA.valueOf() < dateB.valueOf()) ? -1 : 0));
          if (result === 0) {
            result = dateA.valueOf() - dateB.valueOf();
          }
          return result;
        });
        if (uuidVenteJournaliere === '0') {

          this.vhData.forEach(item => {
            this.setUniqueIdentifier(item);
          });
        }
      }, console.error
    );
  }

  /**
   * Permet de creer un string de 32 char utilise comme identifiant unique
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  /**
   * Cette methode permet de mettre à jour la liste des donnes modifiée qui seront ensuite envoyé au back.
   * On garde toujours la dernière modification d'une vente horaire pour ne pas avoir des duplications dans la liste
   * @param: vh
   */
  private addDataToBeUpdated(vh: VenteHoraireModel): void {
    const index = this.vhDataToBeUpdated.findIndex(item => item.idVenteHoraire === vh.idVenteHoraire);
    if (index !== -1) {
      this.vhDataToBeUpdated[index] = {...vh};
    } else {
      this.vhDataToBeUpdated.push({...vh});
    }
  }

  public modeVenteNotPresent(element: VenteHoraireModel, modeVente: ModeVenteModel): boolean {
    return (element.venteHoraireModeVentes.findIndex(item => item.venteHoraireModeVentePK.idModeVente === modeVente.idModeVente) === -1);
  }

  private setUniqueIdentifier(vh: VenteHoraireModel): void {
    const newId = this.makeString();
    if (this.vhData.findIndex(item => item.idVenteHoraire === newId) !== -1) {
      this.setUniqueIdentifier(vh);
    }
    vh.idVenteHoraire = newId;
    vh.venteHoraireModeVentes.forEach(item => {
      item.venteHoraireModeVentePK.idVenteHoraire = newId;
    });
  }

  private setTotalVenteValue(): void {
    this.totalVenteValue = 0;
    this.vhData.forEach((item: VenteHoraireModel) => {
      this.totalVenteValue += +(item.ventes);
    });
  }

  private resetVenteHoraireIDs(): void {
    if (this.uuidVenteJournaliere === '0') {
      this.vhData.forEach(item => {
        item.idVenteHoraire = 0;
        item.venteHoraireModeVentes.forEach(itemAssoc => {
          itemAssoc.venteHoraireModeVentePK.idVenteHoraire = item.idVenteHoraire;
        });
      });
    }
  }
}
