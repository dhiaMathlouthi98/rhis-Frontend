import {Component, OnInit} from '@angular/core';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {CharteModel} from '../../../../../../shared/model/charte.model';
import {PositionnementModel} from '../../../../../../shared/model/positionnement.model';
import {CharteService} from '../../../../planning/configuration/service/charte.service';
import {PositionTravailService} from '../../../../configuration/service/position-travail.service';
import {PositionnementService} from '../../../service/positionnement.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {forkJoin, Observable, Subject} from 'rxjs';
import {PositionnementPositionTravailPKModel} from '../../../../../../shared/model/positionnement.position.travail.PK.model';
import {PositionnementPositionTravailModel} from '../../../../../../shared/model/positionnement.position.travail.model';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {Router} from '@angular/router';
import {RhisRoutingService} from '../../../../../../shared/service/rhis.routing.service';
import {SharedRestaurantService} from '../../../../../../shared/service/shared.restaurant.service';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';

@Component({
  selector: 'rhis-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  public listePositionTravailProductif: PositionTravailModel[] = [];
  public listeCharte: CharteModel[] = [];
  public selectedCharte: CharteModel;
  public previousSelectedCharte: CharteModel;
  public listPositionnementToDisplay: PositionnementModel[] = [];
  public defaultListPositionnement: PositionnementModel[] = [];
  public isGraphicMode = false;
  public displayAddChartePopup = false;
  public charteExistante = false;
  public addCharteTitle = this.rhisTranslateService.translate('CHARTE.ADD');
  private listPositionnementToSave: PositionnementModel[] = [];
  private selectedPositionnement: PositionnementModel;

  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public canSave = false;
  private newLoadData: boolean;
  private emptyCA: boolean;
  private ecran = 'GCP';
  public tauxMoyen = '0';

  constructor(private charteService: CharteService,
              private positionTravailService: PositionTravailService,
              private positionnementService: PositionnementService,
              private sharedRestaurantService: SharedRestaurantService,
              private rhisTranslateService: RhisTranslateService,
              private rhisRoutingService: RhisRoutingService,
              private router: Router,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getTauxMoyenByRestaurant();
    this.getListeCharteAndListePositionTravailProductif();
  }

  private getTauxMoyenByRestaurant(): void {
    if (this.sharedRestaurantService.selectedRestaurant && this.sharedRestaurantService.selectedRestaurant.parametrePlanning) {
      this.tauxMoyen = this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier.toFixed(2);
    } else {
      this.getRestaurantById();
    }
  }

  private getRestaurantById(): void {
    this.notificationService.startLoader();
    this.sharedRestaurantService.getRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.notificationService.stopLoader();
        this.sharedRestaurantService.selectedRestaurant = data;
        this.tauxMoyen = this.sharedRestaurantService.selectedRestaurant.parametrePlanning.tauxMoyenEquipier.toFixed(2);
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }
    );
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  private getListeCharteAndListePositionTravailProductif() {
    this.getListeCharteWithListePositionTravailProductif().subscribe((responseList: { chartes: CharteModel[], positionTravailProductifs: PositionTravailModel[] }) => {
        const listeCharte = responseList['chartes'];
        const listePositionTravailProductif = responseList.positionTravailProductifs;
        if (listeCharte && listeCharte.length > 0) {
          this.listeCharte = listeCharte;
          this.selectedCharte = this.listeCharte[0];
          this.previousSelectedCharte = this.listeCharte[0];
          this.getAllpositionnementByCharte();
        }
        if (listePositionTravailProductif) {
          this.listePositionTravailProductif = listePositionTravailProductif;
        }
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des positions travail productif ainsi la liste des chartes
   */
  private getListeCharteWithListePositionTravailProductif(): Observable<{ chartes: CharteModel[], positionTravailProductifs: PositionTravailModel[] }> {
    const listeCharte = this.charteService.getAllCharteByRestaurant();
    const listePositionTravailProductif = this.positionTravailService.getAllActivePositionTravailProductifByRestaurant();
    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin({chartes: listeCharte, positionTravailProductifs: listePositionTravailProductif});
  }

  public getAllpositionnementByCharte() {
    if (this.noChangesAreMade()) {
      this.previousSelectedCharte = this.selectedCharte;
      this.getAllPositionnementByCharte(this.selectedCharte);
    } else {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
        header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.accetpChangeCharte();
        },
        reject: () => {
          this.getAllPositionnementByCharte(this.selectedCharte);
        }
      });
    }
  }

  private accetpChangeCharte() {
    this.performSaveChanges(true);
    if (!this.canSave) {
      this.selectedCharte = this.previousSelectedCharte;
    }
  }

  private getAllPositionnementByCharte(selectedCharte: CharteModel) {
    this.newLoadData = false;
    this.positionnementService.getAllPositionnementByCharte(selectedCharte.uuid).subscribe(
      (data: PositionnementModel[]) => {
        this.defaultListPositionnement = [];
        this.listPositionnementToDisplay = data;
        this.listPositionnementToDisplay.forEach((item: PositionnementModel) => {
          this.updateEffectifTotal(item);
          this.updatePositionnementProductivite(item);
          this.defaultListPositionnement.push(JSON.parse(JSON.stringify(item)));
        });
        this.listPositionnementToSave = [];
        this.newLoadData = true;
        // TODO notify of error
      }, console.error
    );
  }

  /**
   * Cette methode permet de mettre à jour l'effectif globale du positionnement avec les positions de travail productifs
   * @param: positionnement
   */
  private updateEffectifTotal(positionnement: PositionnementModel): void {
    let effectifProductifTotal = 0;
    positionnement.positionementPositionTravails.forEach((item: PositionnementPositionTravailModel) => {
      if (this.isPositionProd(item.positionnementPositionTravailID.idPositionPK)) {
        effectifProductifTotal += +(item.valeur);
      }
    });
    positionnement.effectif = effectifProductifTotal;
  }

  /**
   * Permet de vérifier que l'identifiant passant en param est un identifiant de position de travail productif ou pas
   * @param: idPosition
   */
  private isPositionProd(idPosition: number): boolean {
    return (this.listePositionTravailProductif.findIndex(pos => pos.idPositionTravail === idPosition) !== -1);
  }

  public setSelectedPositionnement(event: PositionnementModel) {
    this.selectedPositionnement = event;
  }

  public deletePositionnement(positionnement?: PositionnementModel) {
    if (this.isGraphicMode) {
      if (this.selectedPositionnement) {
        this.deleteSelectedPositionnement(this.selectedPositionnement);
      } else {
        this.suggestDeleteCharte();
      }
    } else {
      if (positionnement) {
        this.deleteSelectedPositionnement(positionnement);
      }
    }

  }

  private suggestDeleteCharte() {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PREVISION.WARN_SUPPRESSION_CHARTE') + this.selectedCharte.libelle + ' ?',
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteCharte();
      },
      reject: () => {
      }
    });
  }

  private deleteCharte() {
    this.charteService.remove(this.selectedCharte.uuid).subscribe(
      () => {
        const index = this.listeCharte.findIndex(item => item.idCharte === this.selectedCharte.idCharte);
        this.listeCharte.splice(index, 1);
        this.listPositionnementToDisplay = [];
        if (this.listeCharte.length > 0) {
          if (index === 0) {
            this.selectedCharte = this.listeCharte[0];
          } else {
            this.selectedCharte = this.listeCharte[index - 1];
          }
          this.listPositionnementToDisplay = [];
          this.defaultListPositionnement = [];
          this.getAllpositionnementByCharte();
        }
      }, () => {
        this.notificationService.showErrorMessage('CHARTE.SUPPECHEC_DECOUPAGE');
      }, () => {
        this.notificationService.showSuccessMessage('CHARTE.SUPPSUCCESS');
      }
    );
  }

  private deleteSelectedPositionnement(positionnement: PositionnementModel) {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PREVISION.WARN_SUPPRESSION_POSITIONNEMENT') + positionnement.venteHoraire + ' ?',
      header: this.rhisTranslateService.translate('FORMATION.DELETE_FORMATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeletePositionnement(positionnement);
      },
      reject: () => {
      }
    });
  }

  public displayProveUpdateMessage(object: any) {
    if (this.nextPosHaveTheSameValueOrBigger(object)) {
      const libellePositionTravail = this.listePositionTravailProductif[this.listePositionTravailProductif.findIndex(item => item.idPositionTravail === object.idPositionTravail)].libelle;
      let difference;
      if (object.newElement) {
        difference = object.newValue;
      } else {
        object.positionnement.positionementPositionTravails.forEach(item => {
          if (item.positionnementPositionTravailID.idPositionPK === object.idPositionTravail) {
            difference = +(object.newValue) - +(item.valeur);
          }
        });
      }
      if (difference > 0) {
        this.confirmationService.confirm({
          message: libellePositionTravail + this.rhisTranslateService.translate('PREVISION.UPDATE_EFFECTIF_QUESTION') + difference + ' ?',
          header: this.rhisTranslateService.translate('PREVISION.UPDATE_EFFECTIF_HEADER'),
          acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
          rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
          icon: 'pi pi-info-circle',
          accept: () => {
            this.onConfirmUpdatePositionnement(object, true);
          },
          reject: () => {
            this.onConfirmUpdatePositionnement(object, false);
          }
        });
      } else {
        this.onConfirmUpdatePositionnement(object, false);
      }
    } else {
      this.onConfirmUpdatePositionnement(object, false);
    }
  }

  public openAddChartePopup() {
    this.displayAddChartePopup = true;
  }

  public closeAddChartePopup() {
    this.displayAddChartePopup = false;
  }

  public addNewCharte(event: string) {
    this.charteService.addByLibelle(event).subscribe(
      (data: CharteModel) => {
        this.displayAddChartePopup = false;
        this.charteExistante = false;
        this.listeCharte.push(data);
        this.selectedCharte = data;
        this.getAllpositionnementByCharte();
      }, (err: any) => {
        // display error message if type contrat name exists
        if (err.error === 'RHIS_CHARTE_LIBELLE_EXISTS') {
          this.charteExistante = true;
        }
      }, () => {
        // display add success message
        this.notificationService.showSuccessMessage('CHARTE.ADDSUCCESS');
      }
    );
  }

  public saveAll() {
    if (this.noChangesAreMade()) {
      this.notificationService.showInfoMessage('CHARTEPOSITIONNEMENT.UP_TO_DATE_TABLE');
    } else {
      this.performSaveChanges();
    }
  }

  private performSaveChanges(changeCharte?: boolean) {
    if (this.checkIfPostTravTries()) {
      this.canSave = true;
      this.resetUniqueIdentifiers();
      this.listPositionnementToSave = [...this.listPositionnementToSave, ...this.listPositionnementToDisplay];
      this.saveListPositionnements(changeCharte);
    } else {
      this.canSave = false;
      if (this.emptyCA) {
        this.notificationService.showErrorMessage('CHARTEPOSITIONNEMENT.CA_ERROR');
      } else {
        this.notificationService.showErrorMessage('PREVISION.ERROR_GENERIC');
      }
    }
  }

  private noChangesAreMade(): boolean {
    let noChangesAreMade = true;
    if (this.defaultListPositionnement.length !== this.listPositionnementToDisplay.length) {
      noChangesAreMade = noChangesAreMade && false;
    }
    this.defaultListPositionnement.forEach((item, index) => {
      if (JSON.stringify(item) !== JSON.stringify(this.listPositionnementToDisplay[index])) {
        noChangesAreMade = noChangesAreMade && false;
      }
    });
    return noChangesAreMade;
  }

  private saveListPositionnements(changeCharte?: boolean) {
    this.notificationService.startLoader();
    this.positionnementService.saveListPositionnements(this.previousSelectedCharte.uuid, this.listPositionnementToSave).subscribe(
      (data: PositionnementModel[]) => {
        this.notificationService.stopLoader();
        if (changeCharte) {
          this.getAllPositionnementByCharte(this.selectedCharte);
        } else {
          this.defaultListPositionnement = [];
          this.listPositionnementToDisplay = data;
          this.listPositionnementToDisplay.forEach(item => {
            this.defaultListPositionnement.push(JSON.parse(JSON.stringify(item)));
          });
        }
        // TODO notify of error
      }, (err: any) => {
        this.notificationService.stopLoader();
        console.log(err);
      }
      , () => {

        if (this.listPositionnementToSave.every(function (e) {
          return e.idPositionement < 0;
        })) {
          this.getListeCharteAndListePositionTravailProductif();
        }
        this.listPositionnementToSave = [];
        this.notificationService.showInfoMessage('CHARTEPOSITIONNEMENT.UP_TO_DATE_TABLE');
      }
    );
  }

  private checkIfPostTravTries(): boolean {
    let canSave = true;
    this.resetErreurs();
    for (let i = 0; i < this.listPositionnementToDisplay.length; i++) {
      const erreurCA = this.comparerCA(i);
      const erreurEffectif = this.comparerEffectif(i);
      this.listPositionnementToDisplay[i].hasWrongValue = ((!erreurEffectif) || (!erreurCA));
      canSave = canSave && (!this.listPositionnementToDisplay[i].hasWrongValue);
    }
    return canSave;
  }

  private comparerEffectif(index: number): boolean {
    let pass = true;
    let found = false;
    if (index !== this.listPositionnementToDisplay.length - 1) {
      pass = pass && this.comparerEffectifTotal(index);
    }
    this.listPositionnementToDisplay[index].positionementPositionTravails.forEach(item => {
      let passEffectifPost = true;
      found = false;
      if (index === 0 && index !== this.listPositionnementToDisplay.length - 1) {
        const nextIndex = this.doesPositionnementHavePositionTravail(this.listPositionnementToDisplay[index + 1], item.positionnementPositionTravailID.idPositionPK);
        if (nextIndex === -1) {
          if (item.valeur === 0) {
            item.erreurEffectif = false;
            pass = pass && true;
          } else {
            item.erreurEffectif = true;
            pass = pass && false;
          }
        } else {
          passEffectifPost = this.listPositionnementToDisplay[index + 1].positionementPositionTravails[nextIndex].valeur >= item.valeur;
          pass = pass && passEffectifPost;
          item.erreurEffectif = !passEffectifPost;
        }
      } else if (index === this.listPositionnementToDisplay.length - 1 && index !== 0) {
        const previousIndex = this.doesPositionnementHavePositionTravail(this.listPositionnementToDisplay[index - 1], item.positionnementPositionTravailID.idPositionPK);
        if (previousIndex === -1) {
          pass = pass && true;
          item.erreurEffectif = false;
        } else {
          passEffectifPost = this.listPositionnementToDisplay[index - 1].positionementPositionTravails[previousIndex].valeur <= item.valeur;
          pass = pass && passEffectifPost;
          item.erreurEffectif = !passEffectifPost;
        }
      } else if (index === 0 && index === this.listPositionnementToDisplay.length - 1) {
        pass = pass && true;
        item.erreurEffectif = false;
      } else {
        const nextIndex = this.doesPositionnementHavePositionTravail(this.listPositionnementToDisplay[index + 1], item.positionnementPositionTravailID.idPositionPK);
        const previousIndex = this.doesPositionnementHavePositionTravail(this.listPositionnementToDisplay[index - 1], item.positionnementPositionTravailID.idPositionPK);
        if (nextIndex === -1) {
          if (item.valeur === 0) {
            item.erreurEffectif = false;
            pass = pass && true;
          } else {
            item.erreurEffectif = true;
            pass = pass && false;
          }
        } else {
          if (previousIndex === -1) {
            passEffectifPost = this.listPositionnementToDisplay[index + 1].positionementPositionTravails[nextIndex].valeur >= item.valeur;
            pass = pass && passEffectifPost;
            item.erreurEffectif = !passEffectifPost;
          } else {
            passEffectifPost = (this.listPositionnementToDisplay[index + 1].positionementPositionTravails[nextIndex].valeur >= item.valeur) && (this.listPositionnementToDisplay[index - 1].positionementPositionTravails[previousIndex].valeur <= item.valeur);
            pass = pass && passEffectifPost;
            item.erreurEffectif = !passEffectifPost;
          }
        }
      }
    });
    return pass;
  }


  private comparerEffectifTotal(index: number): boolean {
    let pass = true;
    const passTotalEffectif = this.listPositionnementToDisplay[index].effectif < this.listPositionnementToDisplay[index + 1].effectif;
    pass = pass && passTotalEffectif;
    if (!this.listPositionnementToDisplay[index].erreurTotalEffectif) {
      this.listPositionnementToDisplay[index].erreurTotalEffectif = !passTotalEffectif;
    }
    if (!this.listPositionnementToDisplay[index + 1].erreurTotalEffectif) {
      this.listPositionnementToDisplay[index + 1].erreurTotalEffectif = !passTotalEffectif;
    }

    return pass;
  }

  private resetErreurs() {
    this.emptyCA = false;
    this.listPositionnementToDisplay.forEach(item => {
      item.erreurCA = false;
      item.erreurTotalEffectif = false;
    });
  }

  private comparerCA(index: number): boolean {
    if (+(this.listPositionnementToDisplay[index].venteHoraire) === 0) {
      this.listPositionnementToDisplay[index].erreurCA = true;
      this.emptyCA = true;
      return false;
    } else {
      if (index !== this.listPositionnementToDisplay.length - 1) {
        const passCA = +(this.listPositionnementToDisplay[index].venteHoraire) < +(this.listPositionnementToDisplay[index + 1].venteHoraire);
        if (!this.listPositionnementToDisplay[index].erreurCA) {
          this.listPositionnementToDisplay[index].erreurCA = !passCA;
        }
        if (!this.listPositionnementToDisplay[index + 1].erreurCA) {
          this.listPositionnementToDisplay[index + 1].erreurCA = !passCA;
        }
        return passCA;
      } else if (this.listPositionnementToDisplay.length === 1) {
        this.listPositionnementToDisplay[index].erreurCA = false;
        return true;
      } else {
        return true;
      }
    }
  }

  private resetUniqueIdentifiers() {
    this.listPositionnementToDisplay.forEach(item => {
      if (isNaN(Number(item.idPositionement))) {
        item.idPositionement = 0;
        if (item.positionementPositionTravails.length > 0) {
          item.positionementPositionTravails.forEach(posTrav => {
            posTrav.positionnementPositionTravailID.idPostitionementPK = 0;
          });
        }
      }
    });
  }

  private onConfirmDeletePositionnement(positionnement: PositionnementModel) {
    const index = this.listPositionnementToDisplay.findIndex(item => item.idPositionement === positionnement.idPositionement);
    this.listPositionnementToDisplay.splice(index, 1);
    if (!(isNaN(Number(positionnement.idPositionement)))) {
      positionnement.idPositionement = positionnement.idPositionement * -1;
      this.listPositionnementToSave.push(positionnement);
      if (this.isGraphicMode) {
        this.selectedPositionnement = null;
        this.listPositionnementToDisplay = [...this.listPositionnementToDisplay];
      }
    }
    this.notificationService.showSuccessMessage('CHARTEPOSITIONNEMENT.SUPPSUCCESS');

  }

  private onConfirmUpdatePositionnement(object: any, updateOthers: boolean) {
    if (object.newElement) {
      // add new Element to list positionnement
      this.createNewPositionnementPositionTravail(+(object.idPositionTravail), object.positionnement, +(object.newValue), updateOthers);
    } else {
      // update Element
      this.updatePositionnement(object, updateOthers);
    }
    this.listPositionnementToDisplay = [...this.listPositionnementToDisplay];
  }

  private createNewPositionnementPositionTravail(idPositionTravail: number, positionnement: PositionnementModel, newValue: number, updateOthers: boolean) {
    const key = new PositionnementPositionTravailPKModel();
    const indexPositionTravail = this.listePositionTravailProductif.findIndex(item => item.idPositionTravail === idPositionTravail);
    key.idPositionPK = this.listePositionTravailProductif[indexPositionTravail].idPositionTravail;
    key.idPostitionementPK = positionnement.idPositionement;
    const newElement = new PositionnementPositionTravailModel();
    newElement.positionnementPositionTravailID = key;
    newElement.valeur = newValue;
    positionnement.positionementPositionTravails.push(newElement);
    this.updatePositionnementEffectif(positionnement);
    if (updateOthers) {
      // update other values()
      this.updateOtherPositionnement(newValue, positionnement.idPositionement, idPositionTravail);
    }

  }

  private updatePositionnement(object: any, updateOthers: boolean) {
    let ecart = 0;
    object.positionnement.positionementPositionTravails.forEach(item => {
      if (item.positionnementPositionTravailID.idPositionPK === object.idPositionTravail) {
        ecart = +(object.newValue) - +(item.valeur);
        item.valeur = object.newValue;
      }
    });
    this.updatePositionnementEffectif(object.positionnement);
    if (updateOthers) {
      // update other values()
      this.updateOtherPositionnement(ecart, object.positionnement.idPositionement, +(object.idPositionTravail));
    }
  }

  private updatePositionnementEffectif(positionnement: PositionnementModel) {
    let totalEffectif = 0;
    positionnement.positionementPositionTravails.forEach(item => {
      if (item.valeur === null) {
        item.valeur = 0;
      }
      totalEffectif += +item.valeur;
    });
    positionnement.effectif = +totalEffectif;
    this.updatePositionnementProductivite(positionnement);
  }

  private updatePositionnementProductivite(positionnement: PositionnementModel) {
    if (+positionnement.effectif === 0) {
      positionnement.productivite = 0;
    } else {
      positionnement.productivite = +(((+positionnement.venteHoraire) / (+positionnement.effectif)).toFixed(2));
    }
    this.updatePourcentageColEmpl(positionnement);
  }

  private updatePourcentageColEmpl(positionnement: PositionnementModel) {
    if (+(positionnement.venteHoraire) === 0) {
      positionnement.pourcentageCol = 0;
    } else {
      positionnement.pourcentageCol = +(((((+(positionnement.effectif) * (+this.tauxMoyen))) / (+(positionnement.venteHoraire))) * 100).toFixed(2));
    }
  }

  private updateOtherPositionnement(ecart: number, idPositionement: number, idPositionTravail: number) {
    const positionnementIndex = this.listPositionnementToDisplay.findIndex(item => item.idPositionement === idPositionement);
    for (let i = positionnementIndex + 1; i < this.listPositionnementToDisplay.length; i++) {
      let found = false;
      this.listPositionnementToDisplay[i].positionementPositionTravails.forEach(item => {
        if (item.positionnementPositionTravailID.idPositionPK === idPositionTravail) {
          found = true;
          item.valeur = (+item.valeur) + ecart;
          this.updatePositionnementEffectif(this.listPositionnementToDisplay[i]);
        }
      });
      if (!found) {
        this.createNewPositionnementPositionTravail(idPositionTravail, this.listPositionnementToDisplay[i], ecart, false);
        this.updatePositionnementEffectif(this.listPositionnementToDisplay[i]);
      }
    }
  }

  private nextPosHaveTheSameValueOrBigger(object: any) {
    let haveTheSameValueOrBigger = false;
    let addedNewValue = 0;
    let found = false;
    const index = this.listPositionnementToDisplay.findIndex(item => item.idPositionement === object.positionnement.idPositionement);
    const postTravailIndex = object.positionnement.positionementPositionTravails.findIndex(item => item.positionnementPositionTravailID.idPositionPK === object.idPositionTravail);
    if (postTravailIndex !== -1) {
      addedNewValue = +(object.newValue);
    } else {
      addedNewValue = 0;
    }
    if (index !== this.listPositionnementToDisplay.length - 1) {
      const nextPositionnement = this.listPositionnementToDisplay[index + 1];
      nextPositionnement.positionementPositionTravails.forEach(item => {
        if (item.positionnementPositionTravailID.idPositionPK === object.idPositionTravail) {
          found = true;
          if (addedNewValue >= item.valeur) {
            haveTheSameValueOrBigger = true;
          }
        }
      });
      if (!found) {
        return (+(object.newValue) !== 0);
      } else {
        return haveTheSameValueOrBigger;
      }
    } else {
      return false;
    }

  }


  private doesPositionnementHavePositionTravail(positionnement: PositionnementModel, idPositionTravail: number): number {
    return positionnement.positionementPositionTravails.findIndex(item => item.positionnementPositionTravailID.idPositionPK === idPositionTravail);
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    return this.noChangesAreMade();
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.performSaveChanges();
        if (this.canSave) {
          setTimeout(() => this.navigateAway.next(true), 1500);
        } else {
          this.navigateAway.next(false);
        }
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }


  /**
   * Cette methode permet de redireger vers la page du decoupage horaire
   */
  public goToDecoupageHoraire(): void {
    this.notificationService.startLoader();
    this.router.navigate([this.rhisRoutingService.getRoute('HOME_PLANNING_CONFIGURATION_DECOUPAGE_HORAIRE')]);
  }
}
