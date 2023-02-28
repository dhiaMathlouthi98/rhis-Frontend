import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ContratModel} from '../../../../../../shared/model/contrat.model';
import {ContratService} from '../../../service/contrat.service';
import {DateService} from '../../../../../../shared/service/date.service';
import {EmployeeService} from '../../../service/employee.service';
import {SharedEmployeeService} from '../../../service/sharedEmployee.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {RepartitionTimeModel} from '../../../../../../shared/model/repartition.time.model';
import {ContratPrimaryModel} from '../../../../../../shared/model/contrat.primary.model';
import {EmployeeModel} from '../../../../../../shared/model/employee.model';
import * as moment from 'moment';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';
import {RestaurantService} from '../../../../../../shared/service/restaurant.service';
import {RepartitionModel} from '../../../../../../shared/model/repartition.model';
import {ConfirmationService} from 'primeng/api';
import {JourDisponibiliteModel} from '../../../../../../shared/model/jourDisponibilite.model';
import {ContratUtilitiesService} from '../../../service/contrat-utilities.service';
import {DisponibiliteModel} from '../../../../../../shared/model/disponibilite.model';
import {JourDisponibiliteService} from '../../../service/jour-disponibilite.service';
import {ScrollToBlockService} from '../../../../../../shared/service/scroll-to-block.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import * as rfdc from 'rfdc';


@Component({
  selector: 'rhis-avenants',
  templateUrl: './avenants.component.html',
  styleUrls: ['./avenants.component.scss']
})
export class AvenantsComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() listGroupTravail;
  @Input() listTypeContrat;
  @Input() public nbrHeuresTitle;
  @Input() public totalHebdoTitle;
  @Input() public nbrHeuresSections;
  @Input() public RepartitionSections;
  @Input() dateFinContrat;
  @Input() dateEffectiveContrat;
  @Input() employee;
  @Input() contratId;
  @Input() uuidContrat: string;
  @Input() avenantUpdateId;
  @Input() contratAvenant;
  @Input() arrondiContratMensuel;
  @Input() paramMonthWeek;
  @Input() ouvrableParama;
  @Input()
  public sections: [{ sectionTitle: string, formControlName: string }];
  @Input()
  public title;
  @Input() avenant;
  public hidenGroupTravail = false;

  @Input()
  openHours: any [];
  @Input()
  closeHours: any [];
  @Input()
  disponibiliteConfig: any;

  @Output()
  public setUpdateAvenantId = new EventEmitter();
  @Output() resetAvenantContrat = new EventEmitter();
  @Output() deleteAvenantContrat = new EventEmitter();


  @Output()
  public setNewAvenantContratOrUpdateAvenantInListContrat = new EventEmitter();
  @Output() setAvenantContratDefault = new EventEmitter();
  public avenantActif = {} as ContratModel;
  public newAvenant = {} as ContratModel;
  public hiddenDeleteAvenant = true;
  // disable groupe de traval en cas d'ajouter un nouveau avenant
  public disablGroupTravail = true;
  // pour que la date effective ne doit pas etre inf a la date effective de contrat
  public minDateEffectifAvenant: Date;
  // pour que la date fin ne doit pas etre sup a la date fin de contrat
  public maxDateFinAvenant: Date;
  // pour que la date effective ne doit pas etre inf a la date fin de contrat
  public maxDateEffectiveAvenant: Date;
  public disponibilite;
  @Input() public avenantUpdate = {} as ContratModel;
  // contrat par default lors de clique sur le button annuler
  public avenantDefault = {} as ContratModel;
  // les info principal de avenant
  public avenantInfo = {} as ContratModel;
  // le repatition de contrat
  public avenantRepartition = {} as ContratModel;
  // les autre s informatios du avenant tel que hebdo le temps partiel l compl le taux horaire ,le mens
  public avenantTime = {} as ContratModel;
  // verification que la somme de repartition doit egal la valeur hebdo d'avenant
  public istotalHeuresEquals = true;
  // verification les chmaps qui sont obligatoire
  public dateConstraints = true;
  public isSubmitSave = false;
  public clone = rfdc();

  private restaurant = {} as RestaurantModel;
  public totalRepartition: number;
  public contrat = {} as ContratModel;
  // la repartition apres la sauvgared ou lors de recuperation de l'avenant
  public repartitionTimeDefault;
  // index avenant et contrat
  @Input() indexContrat;
  @Input() indexAvenant;
  public totalDays: number;
  public ecran = 'GDC';


  constructor(private contratService: ContratService,
              private dateService: DateService,
              private employeeService: EmployeeService,
              private sharedEmployee: SharedEmployeeService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private rhisTranslateService: RhisTranslateService,
              private restaurantService: RestaurantService,
              private contratUtilitiesService: ContratUtilitiesService,
              private jourDisponibiliteService: JourDisponibiliteService,
              private cdRef: ChangeDetectorRef,
              private scrollToBlockService: ScrollToBlockService,
              private domControlService: DomControlService
  ) {
  }

  ngOnInit() {
    this.getRestaurant();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.employee) {
      this.employee = changes.employee.currentValue;
    }
    if (changes.avenantUpdate) {
      this.avenantUpdate = changes.avenantUpdate.currentValue;
    }
    if (changes.contratAvenant) {
      this.contratAvenant = changes.contratAvenant.currentValue;
    }
    if (changes.contratId) {
      this.contratId = changes.contratId.currentValue;
    }
    if (changes.uuidContrat) {
      this.uuidContrat = changes.uuidContrat.currentValue;
    }
    if (changes.avenantUpdateId && changes.avenantUpdateId.currentValue) {
      this.avenantUpdateId = changes.avenantUpdateId.currentValue;

    }
    if (changes.listTypeContrat) {
      this.listTypeContrat = changes.listTypeContrat.currentValue;
    }
    if (changes.listGroupTravail) {
      this.listGroupTravail = changes.listGroupTravail.currentValue;
    }
    if (changes.dateFinContrat) {
      this.dateFinContrat = changes.dateFinContrat.currentValue;
      if (this.dateFinContrat) {
        this.setIntervaleOfdateFinAndDateEffectif();
      }

    }
    if (changes.dateEffectiveContrat) {
      this.dateEffectiveContrat = changes.dateEffectiveContrat.currentValue;
      if (this.dateEffectiveContrat) {
        this.setIntervaleOfdateFinAndDateEffectif();
      }

    }
    if (changes.avenant) {
      this.avenant = changes.avenant.currentValue;

      if (this.avenant.idContrat) {
        this.setIntervaleOfdateFinAndDateEffectif();
        if (moment(new Date()).isBefore(this.avenant) || this.avenant.actif) {
          this.hiddenDeleteAvenant = false;
        } else {
          this.hiddenDeleteAvenant = true;
        }
        this.hidenGroupTravail = true;
        this.setHeaderToNewAvenant(this.avenant);
        this.avenantIsActive();
        this.setRepartitionAndTime(this.avenant);
        this.setContratPrimary(this.avenant);
        if (this.avenantUpdate.idContrat === this.avenant.idContrat) {
          this.avenantUpdate.selectedAccordion = true;

        }
      } else {
        // nouveau avenantthis.contratService.getActifAvenantContratByEmployee
        this.avenant.updateContratBoolean = false;
        this.contrat = JSON.parse(JSON.stringify(this.avenant));
        this.contrat.idContrat = this.contratId;
        this.contrat.uuid = this.uuidContrat;
        this.setHeaderToNewAvenant(this.avenant);
        this.setDisponibilteToAvenant();
        this.newAvenant = JSON.parse(JSON.stringify(this.avenant));
        this.setIntervaleOfdateFinAndDateEffectif();
        this.hiddenDeleteAvenant = true;
      }
    }

  }

  /**
   * get full avenant(groupe travail,type contra, disponiblite,repartition)
   * @param :avenant
   * @param: event
   */
  public getFullAvenant(avenant: ContratModel, event) {
    if (event === true && !avenant.contratPrincipale) {
      this.contratService.getFullAvenantContratByIdContrat(avenant.uuid).subscribe(
        (data: ContratModel) => {
          if (data != null) {
            if (avenant.idContrat === this.avenant.idContrat) {
              this.avenant = data;

              if (this.avenant.contratPrincipale) {
                this.hidenGroupTravail = true;
              }

              this.setFullAvenantContratListContrat(this.avenant);
              this.setAvenantContratDefault.emit({avenant: this.avenant, idContrat: this.contratId});
            }

          }
        }
      );
    }
    if (avenant.contratPrincipale) {
      this.setAvenantContratDefault.emit({avenant: this.avenant, idContrat: this.contratId});

    }

  }

  /**
   * annuler la modification du contrat
   * on clique sur le button reset ou par pupup de confirmation de modification
   */
  public resetAvenant(resetUpdateAvenant: boolean, avenantEvent?: any) {
    // restaurer le contrat  qui a deja non sauvegarder par le button reset
    if (this.avenantUpdate.idContrat || this.newAvenant.groupeTravail && !resetUpdateAvenant) {
      this.resetAvenantContrat.emit({
        avenantContrat: this.contratAvenant,
        contratId: this.contratId,
        avenant: this.avenant
      });
    }
    if (resetUpdateAvenant) {
      // annuler la modification d'avenant en cours par le popup de confirmation
      this.resetAvenantContrat.emit({
        avenantContrat: this.contratAvenant,
        contratId: this.contratId,
        avenant: this.avenantUpdate
      });

    }
    // mis a jour de l'avenant  qui sera modifier
    if (avenantEvent) {

      this.updateOtherAvenant(avenantEvent);
      this.setUpdateAvenantId.emit({
        idAvenant: this.avenantUpdateId,
        avenantUpdate: this.avenantUpdate,
        contratId: this.contratId
      });
    }
  }

  /**
   * set session repartituion
   * @param :contrat
   */
  private setRepartitionAndTime(avenant: ContratModel) {
    avenant.repartitionTime = {} as RepartitionTimeModel;

    avenant.repartitionTime.annee = avenant.annee;
    avenant.repartitionTime.mens = avenant.mens;
    avenant.repartitionTime.compt = avenant.compt;
    avenant.repartitionTime.txHoraire = avenant.txHoraire;
    avenant.repartitionTime.tempsPartiel = avenant.tempsPartiel;
    avenant.repartitionTime.hebdo = avenant.hebdo;
    avenant.repartitionTime.jourReposConsecutifs = avenant.jourReposConsecutifs;
    avenant.repartitionTime.repartition = avenant.repartition;
    avenant.repartitionTime.salaire = avenant.salaire;
    this.repartitionTimeDefault = JSON.parse(JSON.stringify(avenant.repartitionTime));

  }

  /**
   * set section contrat primary
   * @param: contrat
   */
  private setContratPrimary(avenant: ContratModel) {
    avenant.contratInfoPrimary = {} as ContratPrimaryModel;
    avenant.contratInfoPrimary.employee = {} as EmployeeModel;
    avenant.contratInfoPrimary.dateEffective = new Date(avenant.dateEffective);
    avenant.contratInfoPrimary.level = avenant.level;
    avenant.contratInfoPrimary.echelon = avenant.echelon;
    avenant.contratInfoPrimary.coefficient = avenant.coefficient;

    if (avenant.datefin) {
      avenant.contratInfoPrimary.datefin = new Date(avenant.datefin);
    }
    avenant.contratInfoPrimary.groupeTravail = avenant.groupeTravail;
    avenant.contratInfoPrimary.typeContrat = avenant.typeContrat;
    avenant.contratInfoPrimary.idContrat = avenant.idContrat;
    avenant.contratInfoPrimary.actif = avenant.actif;
    this.setIntervaleOfdateFinAndDateEffectif();

  }

  /**
   * tester si avenant est actif ou nn
   */
  avenantIsActive() {
    let today = new Date();
    this.avenant.datefin = this.dateService.setTimeNull(this.avenant.datefin);

    this.avenant.dateEffective = this.dateService.setTimeNull(this.avenant.dateEffective);
    today = this.dateService.setTimeNull(today);
    if ((moment(today).isSameOrAfter(this.avenant.dateEffective)) &&
      (moment(today).isSameOrBefore(this.avenant.datefin)) && !moment(this.avenant.dateEffective).isSame(this.avenant.datefin)) {
      this.avenant.selectedAccordion = true;
      this.hidenGroupTravail = true;
      this.avenant.actif = true;
      this.avenant.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_EN_COURS');
      this.setIntervaleOfdateFinAndDateEffectif();

      if (!this.avenant.contratPrincipale) {
        this.getAvenantContratActif();

      }
    } else {
      this.avenant.actif = false;
      if (moment(today).isAfter(this.avenant.datefin)) {
        this.hiddenDeleteAvenant = true;
      }
    }
  }

  /**
   * converture la date time en date seulement
   * @param: date
   */
  setTimeNull(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;

  }

  /**
   * recuperation  restaurant
   */
  getRestaurant() {
    this.restaurantService.getRestaurantById().subscribe(
      (data: RestaurantModel) => {
        this.restaurant = data;
      }
    );
  }

  /**
   * recuperation du avenant contrat actif de l employe et ajouter au début du listContratDisplay
   */
  getAvenantContratActif() {
    this.contratService.getActifAvenantContratByEmployee(new Date(), this.uuidContrat).subscribe(
      (data: ContratModel) => {
        if (data != null) {
          this.avenant = data;
          if (this.avenant.contratPrincipal) {
            this.hidenGroupTravail = true;
          }
          this.avenant.selectedAccordion = true;
          this.avenant.updateContratBoolean = false;
          this.avenant.istotalHeuresEquals = true;
          this.avenant.selectedAccordion = true;
          this.avenant.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_EN_COURS');
          this.setIntervaleOfdateFinAndDateEffectif();
          this.setContratPrimary(data);
          this.avenant.contratInfoPrimary.employee.statut = true;
          this.setRepartitionAndTime(data);
          // enregistrer avenant dans dans une list par default
          this.setAvenantContratDefault.emit({avenant: data, idContrat: this.contratId});

        }
      }
    );
  }

  /**
   * pour l'avenant ne passe pas l'interval date[date fin, date effectif) de son contrat
   *
   */
  private setIntervaleOfdateFinAndDateEffectif() {
    let minDateEffective;
    let maxDateFin;
    let maxDateEffectifAvenant;
    if (!this.avenant.idContrat) {
      minDateEffective = JSON.parse(JSON.stringify(this.avenant.dateEffective));
      if (this.dateFinContrat) {
        maxDateFin = JSON.parse(JSON.stringify(this.dateFinContrat));
        // pour que la date effectife ne depasse pas la date fin de l'avenant
        maxDateEffectifAvenant = JSON.parse(JSON.stringify(this.dateFinContrat));
      }
    } else if (this.avenant.contratPrincipale) {
      minDateEffective = JSON.parse(JSON.stringify(this.dateEffectiveContrat));
      maxDateFin = JSON.parse(JSON.stringify(this.dateFinContrat));
      maxDateEffectifAvenant = JSON.parse(JSON.stringify(this.dateFinContrat));
    }
    minDateEffective = new Date(Date.parse(minDateEffective));
    this.minDateEffectifAvenant = minDateEffective;
    if (this.avenant.datefin) {
      maxDateFin = new Date(Date.parse(maxDateFin));
      this.maxDateFinAvenant = maxDateFin;
      // pour que la date effectif est inf al date fin d'avenant
      maxDateEffectifAvenant = new Date(Date.parse(maxDateEffectifAvenant));
      maxDateEffectifAvenant.setDate(maxDateEffectifAvenant.getDate() - 1);
      this.maxDateEffectiveAvenant = maxDateEffectifAvenant;
    }
  }

  /**
   * recupere total hebdo
   * @param :event
   */
  public calculeTotalHebdo(event) {
    this.totalRepartition = event;
  }

  /**
   * Envoyer nombre d'heure vers le contrat
   * @param :nbHeure
   */
  public saveNbHeureAvenant(avanantNbreHeure: ContratModel) {
    if (avanantNbreHeure['idAvenant']) {
      if (this.avenant.idContrat === avanantNbreHeure['idAvenant']) {
        this.avenantTime = avanantNbreHeure;
        this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        this.avenantUpdateId = this.avenantUpdate.idContrat;
        this.avenantUpdate = {...this.avenantUpdate, ...avanantNbreHeure['InfoValue']};
        if (avanantNbreHeure['tempsPartiel'] !== undefined) {
          this.avenantUpdate.tempsPartiel = avanantNbreHeure['tempsPartiel'];
        }
        // conserver la valeur modifier des info   principal
        if (this.avenantInfo['idAvenant'] === avanantNbreHeure['idAvenant']) {
          this.avenantUpdate = {...this.avenantUpdate, ...this.avenantInfo['InfoValue']};
        }
        // conserver la valeur modifier de repartition
        if (this.avenantRepartition.repartition) {
          if (this.avenantRepartition.repartition['idAvenant'] === avanantNbreHeure['idAvenant']) {
            this.avenantUpdate.repartition = this.avenantRepartition.repartition['InfoValue'];
          }
        }
        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
        this.avenant.updateContratBoolean = true;
        this.setUpdateAvenantId.emit({idAvenant: this.avenantUpdateId, avenantUpdate: this.avenantUpdate});

      }

      if (this.isSubmitSave) {
        this.avenantUpdate.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    } else {
      this.newAvenant = {...this.newAvenant, ...avanantNbreHeure};
      if (this.isSubmitSave) {
        this.newAvenant.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    }
  }

  public getFieldValue(field: string, avenant: ContratModel) {
    let value;
    if (this.newAvenant[field] !== undefined) {
      value = this.newAvenant[field];
    } else {
      if (this.avenantUpdate.idContrat === avenant.idContrat) {
        value = this.avenantUpdate[field];
      } else {
        value = avenant[field];
      }
    }
    return value;
  }

  /**
   * recupere total hebdo
   * @param :event
   */
  public calculeTotalHebdoAvenant(event) {
    this.totalRepartition = event;
  }

  /**
   * Envoyer total hebdo vers le contrat
   * @param: totalHebdo
   */
  public saveRepartitionAvenant(totalHebdo: RepartitionModel) {
    if (totalHebdo['idAvenant']) {
      if (this.avenant.idContrat === totalHebdo['idAvenant']) {
        this.avenantRepartition.repartition = totalHebdo;

        this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        this.avenantUpdate.idContrat = this.avenant.idContrat;
        this.avenantUpdateId = this.avenantUpdate.idContrat;
        this.avenantUpdate.repartition = {...this.avenantUpdate.repartition, ...totalHebdo['InfoValue']};
        // conserver la valeur modifier des info   principal
        if (this.avenantInfo['idAvenant'] === totalHebdo['idAvenant']) {
          this.avenantUpdate = {...this.avenantUpdate, ...this.avenantInfo['InfoValue']};
        }
        if (this.avenantTime['idAvenant'] === totalHebdo['idAvenant']) {
          this.avenantUpdate = {...this.avenantUpdate, ...this.avenantTime['InfoValue']};
          if (this.avenantTime['tempsPartiel'] !== undefined) {
            this.avenantUpdate.tempsPartiel = this.avenantTime['tempsPartiel'];
          }
        }
        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
        this.avenant.updateContratBoolean = true;
        this.setUpdateAvenantId.emit({idAvenant: this.avenantUpdateId, avenantUpdate: this.avenantUpdate});

      }

      if (this.isSubmitSave) {
        this.avenantUpdate.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    } else {
      this.newAvenant.repartition = totalHebdo['InfoValue'];

      if (this.isSubmitSave) {
        this.newAvenant.istotalHeuresEquals = this.istotalHeuresEquals;
        if (!this.istotalHeuresEquals) {
          this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
        }
      }
    }
  }

  /**
   * Envoyer total contratInfoPrimary vers le contrat
   * @param: contratInfoPrimary
   */
  public saveInfoPrimaryAvenant(contratInfoPrimary: ContratModel) {
    if (contratInfoPrimary['idAvenant']) {
      if (this.avenant.idContrat === contratInfoPrimary['idAvenant']) {
        this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        this.avenantUpdateId = this.avenantUpdate.idContrat;
        this.avenantInfo = contratInfoPrimary;
        this.avenantUpdate = {...this.avenantUpdate, ...contratInfoPrimary['InfoValue']};
        // conserver la valeur modifier de repartition
        if (this.avenantRepartition.repartition) {
          if (this.avenantRepartition.repartition['idAvenant'] === contratInfoPrimary['idAvenant']) {
            this.avenantUpdate.repartition = this.avenantRepartition.repartition['InfoValue'];
          }
        }
        if (this.avenantTime['idAvenant'] === contratInfoPrimary['idAvenant']) {
          this.avenantUpdate = {...this.avenantUpdate, ...this.avenantTime['InfoValue']};
          if (this.avenantTime['tempsPartiel'] !== undefined) {
            this.avenantUpdate.tempsPartiel = this.avenantTime['tempsPartiel'];
          }
        }
        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
        this.avenantDefault.dateEffective = new Date(this.avenantDefault.dateEffective);
        if (this.avenantDefault.datefin) {
          this.avenantDefault.datefin = new Date(this.avenantDefault.datefin);
        }
        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
        this.avenant.updateContratBoolean = true;
        this.setUpdateAvenantId.emit({idAvenant: this.avenantUpdateId, avenantUpdate: this.avenantUpdate});

      }
    } else if (!contratInfoPrimary['idAvenant']) {
      this.newAvenant = {...this.newAvenant, ...contratInfoPrimary['InfoValue']};
    }
  }

  /**
   * update disponibilite in the list of avenants
   * @param: disponibilite
   */
  public saveDisponibilite(disponibilite) {
    if (disponibilite['idAvenant']) {
      if (this.avenant.idContrat === disponibilite['idAvenant']) {
        if (!this.avenantUpdate.disponibilite) {
          this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        }
        this.avenantUpdate = this.contratUtilitiesService.updateDisponibilite(this.avenantUpdate, disponibilite['dispo'], disponibilite['alternate']);
        this.avenantUpdateId = this.avenantUpdate.idContrat;
        this.avenantInfo = disponibilite;
        this.updateOtherThanDispo(disponibilite);
      }
    } else {
      if (!this.newAvenant.disponibilite) {
        const dispo = new DisponibiliteModel();
        dispo.jourDisponibilites = disponibilite['dispo'];
        this.newAvenant = {...this.newAvenant, disponibilite: dispo};
      } else {
        this.newAvenant = this.contratUtilitiesService.updateDisponibilite(this.newAvenant, disponibilite['dispo'], disponibilite['alternate']);
      }
    }
  }

  /**
   * Update other avenant parts rather than availability
   * @param: dispo
   * @param: data
   */
  private updateOtherThanDispo(dispo: any) {
    // conserver la valeur modifier de repartition
    if (this.avenantRepartition.repartition) {
      if (this.avenantRepartition.repartition['idAvenant'] === dispo['idAvenant']) {
        this.avenantUpdate.repartition = this.avenantRepartition.repartition['InfoValue'];
      }
    }
    if (this.avenantTime['idAvenant'] === dispo['idAvenant']) {
      this.avenantUpdate = {...this.avenantUpdate, ...this.avenantTime['InfoValue']};
      if (this.avenantTime['tempsPartiel'] !== undefined) {
        this.avenantUpdate.tempsPartiel = this.avenantTime['tempsPartiel'];
      }
    }
    this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
    this.avenantDefault.dateEffective = new Date(this.avenantDefault.dateEffective);
    if (this.avenantDefault.datefin) {
      this.avenantDefault.datefin = new Date(this.avenantDefault.datefin);
    }
    this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
    this.avenant.updateContratBoolean = true;
    this.setUpdateAvenantId.emit({idAvenant: this.avenantUpdateId, avenantUpdate: this.avenantUpdate});
  }

  /**
   * Update the alternate state of avenant
   * @param: dispo
   */
  public saveAlternate(dispo) {
    if (dispo['idAvenant']) {
      if (this.avenant.idContrat === dispo['idAvenant']) {
        if (!this.avenantUpdate.disponibilite) {
          this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        }

        this.avenantUpdate = this.contratUtilitiesService.updateAlternateProperty(this.avenantUpdate, dispo['alternate'], this.disponibiliteConfig);
        this.avenantUpdate.idContrat = dispo['idAvenant'];
        this.updateOtherThanDispo(dispo);
      }
    } else {
      if (!this.newAvenant.disponibilite) {
        const disponibilite = new DisponibiliteModel();
        disponibilite.jourDisponibilites = [];
        disponibilite.alternate = dispo['alternate'];
        this.newAvenant = {...this.newAvenant, disponibilite: disponibilite};
      } else {
        this.newAvenant = this.contratUtilitiesService.updateAlternateProperty(this.newAvenant, dispo['alternate'], this.disponibiliteConfig);
      }
    }
  }

  /**
   * enregistrer avenant ou modifier
   */
  public saveAvenant() {
    if (this.newAvenant.groupeTravail) {
      this.saveNewAvenant();
    }
    if (this.avenantUpdate.idContrat) {
      this.onUpdateAvenant();
    }
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
  private checkAvenantActif(avenant: ContratModel): boolean{
    let dateNow = new Date();
    dateNow = this.dateService.setTimeNull(dateNow);
    let checkActif = false;
    let checkFoundAvenant = false;
    const listAvenantInactif = [];
    this.contratAvenant.forEach((avenantDisplay, index) => {
      if (avenantDisplay.idContrat && avenantDisplay.actif) {
        this.avenantActif = avenantDisplay;
      } else if( moment(this.dateService.setTimeNull(avenantDisplay.dateEffective)).isAfter(dateNow)) {
        listAvenantInactif.push(avenantDisplay);
      }
    });
    checkFoundAvenant =  !listAvenantInactif.length || listAvenantInactif.some((item: ContratModel) => (avenant.datefin &&
      moment( this.dateService.setTimeNull(avenant.datefin)).isSameOrBefore(this.dateService.setTimeNull(item.dateEffective))) );

    if(this.avenantActif && moment(this.dateService.setTimeNull(this.avenantActif.dateEffective)).isBefore(this.dateService.setTimeNull(avenant.dateEffective)) && checkFoundAvenant) {
          checkActif = true;
      }

    return checkActif;
  }
  /**
   * affichage de message de confirmation de suppression
   * @param :groupTravail
   * @param :filter
   */
  showConfirmAddActifContrat(avenant: ContratModel) {
    const messageView = this.viewMessageConfirmationOfAddContrat(avenant);
    this.confirmationService.confirm({
      message: messageView,
      header: this.rhisTranslateService.translate('AVENANT_CONTRAT.AVENANT_ACTIF'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.saveNewAvenant(true, true) ;
      },
      reject: () => {
        this.saveNewAvenant(true, false) ;
      }
    });
  }
  private viewMessageConfirmationOfAddContrat(avenant: ContratModel): string {
    let messageView;
    const contrat = JSON.parse(JSON.stringify(this.avenantActif));
    contrat.datefin = moment(contrat.dateEffective).isSame(avenant.dateEffective) ?
      contrat.dateEffective :  moment(avenant.dateEffective).subtract(1, 'days').toDate();
    contrat.dateEffective = new Date(contrat.dateEffective);
    contrat.contratInfoPrimary['dateEffective'] = new Date(contrat.dateEffective);
    messageView = this.rhisTranslateService.translate('AVENANT_CONTRAT.AVENANT')
      + ' ' + contrat.typeContrat.libelle + ' ' + this.rhisTranslateService.translate('AVENANT_CONTRAT.DU')
      + ' ' + this.dateService.formatDate(contrat.dateEffective) + ' , ' +
      this.rhisTranslateService.translate('AVENANT_CONTRAT.DISACTIVATE_CONTRAT') + ' ' + this.dateService.formatDate(contrat.datefin ) + '?';

    return messageView;
  }
  public setDateFinOfAvenantActif() {
      this.avenantUpdate = this.clone(this.avenantActif);
    this.avenantActif = {} as ContratModel;
    if (this.avenantUpdate.actif) {
      this.avenantUpdate.actif = false;
      this.avenantUpdate.dateEffective = this.dateService.setTimeNull(this.avenantUpdate.dateEffective);
      this.newAvenant.dateEffective = this.dateService.setTimeNull(this.newAvenant.dateEffective);
      this.avenantUpdate.datefin = moment(this.dateService.setTimeNull(this.avenantUpdate.dateEffective)).isSame(this.dateService.setTimeNull(this.newAvenant.dateEffective)) ?
        this.clone(this.avenantUpdate.dateEffective) : moment(this.newAvenant.dateEffective).subtract(1, 'days').toDate();
    }
  }
  /**
   * enregistrer un avenant
   */
  private saveNewAvenant(fromActifAvenant?: boolean, disactivatAvenantActif?: boolean) {
    if (this.checkAvenantActif(this.newAvenant) && !fromActifAvenant) {
        this.showConfirmAddActifContrat(this.newAvenant);

    } else {
      const disactivatAvenantDisplay = disactivatAvenantActif ? 1 : 0 ;
      this.isSubmitSave = true;


      this.setContratBeforeSave(this.newAvenant);
      this.calculeRepartitionOfAvenant(this.newAvenant);
      if (this.checkAvenantValidite(this.newAvenant)) {
        const isTotalDispoCorrectComparedToHebdo = this.contratUtilitiesService.isTotalDispoCorrect(this.newAvenant);
        const isMaxDispoValid = this.contratUtilitiesService.isTotalDispoDayAndWeekCorrect(this.newAvenant, this.disponibiliteConfig.maxDispoDay, this.disponibiliteConfig.maxDispoWeek);
        if (isTotalDispoCorrectComparedToHebdo && isMaxDispoValid) {
          this.contratService.persistAvenant(this.newAvenant, this.arrondiContratMensuel, disactivatAvenantDisplay).subscribe(
            (data: ContratModel) => {
              this.newAvenant.mens = data.mens;
              this.newAvenant.uuid = data.uuid;
              this.newAvenant.idContrat = data.idContrat;
              this.setFullAvenantContratListContrat(this.newAvenant, data.idContrat, disactivatAvenantActif);

              this.newAvenant = {} as ContratModel;

            }, (err: any) => {
              if (err.error === 'RHIS_AVENANT_IS_EXIST') {
                this.newAvenant.contratExistInfoPrimary = true;
                this.avenant.contratExistInfoPrimary = true;
              }

            }
          );
        } else {
          if (!isTotalDispoCorrectComparedToHebdo) {
            this.notificationService.showErrorMessage('EMPLOYEE.TOTAL_DISPONIBILITE_MESSAGE_ERROR');
            this.scrollToBlockService.scrollToElementHasError('div.avenant-' + this.indexAvenant + '-contrat-' + this.indexContrat);
          } else {
            this.scrollToBlockService.scrollToElementHasError('.max-dispo.red');
          }
        }
      }
    }
  }

  /**
   * set full contrat  in list contrat
   * @param: data
   */
  private  async setFullAvenantContratListContrat(data: ContratModel, idAvenant?, disactivatAvenantActif?: boolean) {
    data.istotalHeuresEquals = true;
    data.selectedAccordion = true;
    data.contratExistInfoPrimary = false;
    this.disablGroupTravail = true;
    this.setContratPrimary(data);
    this.setRepartitionAndTime(data);
    data.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_DU')
      + ' ' + this.dateService.formatDate(data.dateEffective) + ' ' +
      this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(data.datefin);
    data.selectedAccordion = true;
    const contratDisplay = this.clone({contrat: this.contrat, avenant: data, idAvenant: idAvenant});
    if (idAvenant && !disactivatAvenantActif) {
      this.setNewAvenantContratOrUpdateAvenantInListContrat.emit({
        contrat: this.contrat,
        avenant: data,
        idAvenant: idAvenant
      });
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.SAVED_AVENANT'));
    }
       if(disactivatAvenantActif) {
      this.setDateFinOfAvenantActif();
       await this.onUpdateAvenant();
         this.setNewAvenantContratOrUpdateAvenantInListContrat.emit({
           contrat: contratDisplay.contrat,
           avenant: contratDisplay.avenant,
           idAvenant: contratDisplay.idAvenant
         });
    }
  }

  /**
   * set value to new avenant before save
   * @param: avenant
   */
  private setContratBeforeSave(avenant: any) {
    avenant.dateEffective = new Date(avenant.dateEffective);
    if (avenant.datefin) {
      avenant.datefin = new Date(avenant.datefin);
    }
    delete avenant.contratInfoPrimary;
    delete avenant.repartitionTime;
    avenant.actif = true;
    avenant.employee = this.employee;
    this.dateService.setCorrectDate(avenant.dateEffective);
    if (avenant.datefin) {
      this.dateService.setCorrectDate(avenant.datefin);
    }
    if (!avenant.idContrat) {
      avenant.contratPrincipale = this.contrat;
      delete avenant.avenantContrats;
      avenant.repartition.idRepartition = 0;
      delete avenant.repartition.uuid;
    }
    avenant.motifSortie = null;
  }

  /**
   * calcule la somme de repartition pour le contrat modifié
   */
  public calculeRepartitionOfAvenant(avenant) {
    this.totalRepartition = 0;
    this.totalDays = 0;
    if (avenant.repartition) {
      const valeurSem = ['valeurDimanche', 'valeurLundi', 'valeurMardi', 'valeurMercredi', 'valeurJeudi', 'valeurVendredi', 'valeurSamedi'];
      for (const valeur of valeurSem) {
        this.totalRepartition += +avenant.repartition[valeur];
        if (+avenant.repartition[valeur]) {
          this.totalDays++;
        }
      }
    }
  }

  /**
   * verification de l'avenant valide ou nn pour enregistrer
   * @param :contrat
   */
  public checkAvenantValidite(avenant: ContratModel): boolean {
    let validOuvrable = true;
    avenant.ouvrable = false;
    avenant.ouvre = false;
    this.avenant.ouvrable = false;
    this.avenant.ouvre = false;
    if (avenant.hebdo === undefined) {
      avenant.hebdo = 0;
    }
    if (avenant.txHoraire === undefined) {
      avenant.txHoraire = 0;
    }
    if (avenant.compt === undefined) {
      avenant.compt = 0;
    }
    if (this.totalDays > 5 && !this.ouvrableParama) {
      validOuvrable = false;
      avenant.ouvre = true;
      this.avenant.ouvre = avenant.ouvre;
      this.scrollToBlockService.scrollToElementHasErrorOneParent('span.form-item-error');

    } else if (this.totalDays > 6 && this.ouvrableParama) {
      avenant.ouvrable = true;
      this.avenant.ouvrable = avenant.ouvrable;
      this.scrollToBlockService.scrollToElementHasErrorOneParent('span.form-item-error');
      validOuvrable = false;
    }
    avenant.istotalHeuresEquals = +avenant.hebdo === this.totalRepartition;
    const validEchelonLevelCoefficient = this.contratUtilitiesService.validEchelonLevelCoefficient(avenant);
    if (!avenant.istotalHeuresEquals || !validEchelonLevelCoefficient) {
      this.scrollToBlockService.scrollToElementHasErrorOneParent('span.form-item-error');
    }
    this.dateConstraints = avenant.dateEffective && avenant.hebdo.toString() && avenant.txHoraire.toString() && avenant.compt.toString() && avenant.datefin;
    if (!this.dateConstraints || !validEchelonLevelCoefficient) {
      this.dateConstraints = false;
    }
    this.avenant.istotalHeuresEquals = avenant.istotalHeuresEquals;
    return avenant.istotalHeuresEquals && this.dateConstraints && validOuvrable;
  }

  /**
   * reset message de erreur pour la  date effectif et date fin pour info principal
   */
  resetErrorMessagesDateEffectifAndDateFinInfoPrimary() {

    this.avenant.contratExistInfoPrimary = false;
    this.newAvenant.contratExistInfoPrimary = false;
  }

  /**
   * ajouter header à l'avenant
   * @param :avenant
   */
  private setHeaderToNewAvenant(avenant) {
    if (avenant.datefin) {
      avenant.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_DU')
        + ' ' + this.dateService.formatDate(avenant.dateEffective) + ' ' +
        this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(avenant.datefin);
    } else {
      avenant.header = this.rhisTranslateService.translate('CONTRAT.AVENANT_DU')
        + ' ' + this.dateService.formatDate(avenant.dateEffective);
    }
  }

  /**
   * set disponiblite to new contrat
   */
  private setDisponibilteToAvenant() {
    this.avenant.disponibilite.idDisponibilite = null;
    delete this.avenant.disponibilite.uuid;
    this.avenant.disponibilite.jourDisponibilites.forEach((jourDisponibilite: JourDisponibiliteModel) => {
      jourDisponibilite.idJourDisponibilite = null;
      delete jourDisponibilite.uuid;
    });
  }

  /**
   * modifier contrat et sauvegarder dans la bd
   * @param :contratEvent
   */
  private async onUpdateAvenant(avenantEvent?) {
    this.isSubmitSave = true;
    this.calculeRepartitionOfAvenant(this.avenantUpdate);
    if (this.checkAvenantValidite(this.avenantUpdate)) {
      this.setContratBeforeSave(this.avenantUpdate);
      const isTotalDispoCorrectComparedToHebdo = this.contratUtilitiesService.isTotalDispoCorrect(this.avenantUpdate);
      const isMaxDispoValid = this.contratUtilitiesService.isTotalDispoDayAndWeekCorrect(this.avenantUpdate, this.disponibiliteConfig.maxDispoDay, this.disponibiliteConfig.maxDispoWeek);
      if (isTotalDispoCorrectComparedToHebdo && isMaxDispoValid) {
        if (!this.avenantUpdate.disponibilite.alternate && this.avenantUpdate.disponibilite.idDisponibilite) {

          await this.jourDisponibiliteService.removeOddByDisponibiliteId(this.avenantUpdate.disponibilite.uuid).toPromise();

         await this.sendAvenantToBeUpdated(avenantEvent);
        } else {
          await this.sendAvenantToBeUpdated(avenantEvent);
        }
      } else {
        if (!isTotalDispoCorrectComparedToHebdo) {
          this.notificationService.showErrorMessage('EMPLOYEE.TOTAL_DISPONIBILITE_MESSAGE_ERROR');
          this.scrollToBlockService.scrollToElementHasError('div.avenant-' + this.indexAvenant + '-contrat-' + this.indexContrat);
        } else {
          this.scrollToBlockService.scrollToElementHasError('.max-dispo.red');
        }
      }
    } else {
      if (avenantEvent) {
        this.setUpdateAvenantId.emit({
          idAvenant: this.avenantUpdateId,
          avenantUpdate: this.avenantUpdate,
          contratId: this.contratId
        });
      }
    }

  }

  /**
   * Send Avenant to be updated to the backend
   * @param: avenantEvent
   */
  private async sendAvenantToBeUpdated(avenantEvent?) {
    try{
      const data: ContratModel = await this.contratService.updateAvenant(this.avenantUpdate, this.arrondiContratMensuel).toPromise();

      this.avenantUpdate.mens = data.mens;
      this.avenantUpdate.disponibilite = data.disponibilite;
      this.contratAvenant = this.contratAvenant.filter((value: any) => value.idContrat);
      this.contratUtilitiesService.setAvenantParam({
        avenantContrat: this.contratAvenant,
        avenantUpdate: this.avenantUpdate,
        idContrat: this.contratId,
        avenantEvent: avenantEvent
      });
      this.avenantUpdate.selectedAccordion = true;
      this.avenantUpdate.updateContratBoolean = false;
      this.avenantUpdate = {} as ContratModel;
      this.hidenGroupTravail = true;
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.UPDATE_AVENANT'));
      if (avenantEvent) {
        this.updateOtherAvenant(avenantEvent);
        this.setUpdateAvenantId.emit({
          idAvenant: this.avenantUpdateId,
          avenantUpdate: this.avenantUpdate,
          contratId: this.contratId
        });

      } else {
        this.avenantUpdate.selectedAccordion = true;
        this.avenantUpdate.updateContratBoolean = false;
        this.avenantUpdate = {} as ContratModel;
        this.avenantUpdateId = 0;
        this.setUpdateAvenantId.emit({idAvenant: this.avenantUpdateId, avenantUpdate: this.avenantUpdate});

      }
    } catch (err) {
      if (err.error === 'RHIS_AVENANT_IS_EXIST') {
        this.avenantUpdate.contratExistInfoPrimary = true;

      }
      if (avenantEvent) {
        this.setUpdateAvenantId.emit({
          idAvenant: this.avenantUpdateId,
          avenantUpdate: this.avenantUpdate,
          contratId: this.contratId
        });
      } else {
        this.avenant.contratExistInfoPrimary = true;

      }
    }



  }

  /**
   * lors de modifier un autre contrat et sauvegarder l'ancien contrat modifié
   * @param; contratEvent
   */
  private updateOtherAvenant(avenantEvent) {
    if (avenantEvent['idAvenant']) {
      if (this.avenant.idContrat === avenantEvent['idAvenant']) {
        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
        this.avenantDefault.dateEffective = new Date(this.avenantDefault.dateEffective);
        if (this.avenantDefault.datefin) {
          this.avenantDefault.datefin = new Date(this.avenantDefault.datefin);
        }
        this.avenantUpdate = JSON.parse(JSON.stringify(this.avenant));
        this.avenantUpdateId = this.avenantUpdate.idContrat;

        // permet de verifier si la valeur recuperer est de repartition
        if (avenantEvent['repartition'] === true) {
          this.avenantUpdate.repartition = avenantEvent['InfoValue'];
          this.avenantRepartition.repartition = avenantEvent;
        } else if (avenantEvent['disponibilite'] === true) {
          this.avenantUpdate.disponibilite.jourDisponibilites = [...avenantEvent['dispo']];
        } else if (avenantEvent['alternate']) {
          this.avenantUpdate.disponibilite.alternate = avenantEvent['alternateVal'];
        } else {
          // permet de verifier si la valeur recuperer est de info principal
          if (avenantEvent['info'] === true) {
            this.avenantInfo = avenantEvent;
            this.avenantUpdate = {...this.avenantUpdate, ...avenantEvent['InfoValue']};

            // permet de verifier si la valeur recuperer est section heure
          }
          if (avenantEvent['hebdo'] === true) {
            this.avenantTime = avenantEvent;
            this.avenantUpdate = {...this.avenantUpdate, ...avenantEvent['InfoValue']};

            //  permet de verifier si la valeur recuperer est section temps partiel
          }
          if ((avenantEvent['InfoValue']['tempsPartiel'] === true || avenantEvent['InfoValue']['tempsPartiel'] === false) && avenantEvent['hebdo'] === false) {
            this.avenantTime = avenantEvent;
            this.avenantUpdate = {...this.avenantUpdate, ...avenantEvent['InfoValue']};

          }
        }
        if (avenantEvent['tempsPartiel'] !== undefined) {
          this.avenantUpdate.tempsPartiel = avenantEvent['tempsPartiel'];
        }

        this.avenantUpdate.selectedAccordion = true;
        this.avenantUpdate.updateContratBoolean = true;
        this.hidenGroupTravail = true;
        this.setContratPrimary(this.avenantUpdate);
        this.setRepartitionAndTime(this.avenantUpdate);

        this.avenantDefault = JSON.parse(JSON.stringify(this.avenant));
      }

    }
  }


  /**
   * affichage de message de confirmation de modification
   * @param :groupTravail
   * @param :filter
   */
  public showConfirmUpdateAvenant(event) {
    if (this.avenantUpdate.idContrat) {
      const messageView = this.viewMessageConfirmationOfUpdateContrat();
      this.confirmationService.confirm({
        message: messageView,
        header: this.rhisTranslateService.translate('CONTRAT.VALIDATE'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.onUpdateAvenant(event);
        },
        reject: () => {
          this.resetAvenant(true, event);
        }
      });
    }
  }

  /**
   * afficher le message de confirmation modifier le contrat courant
   */
  private viewMessageConfirmationOfUpdateContrat(): string {
    let messageView;
    const avenant = JSON.parse(JSON.stringify(this.avenantUpdate));
    if (avenant.datefin) {
      avenant.datefin = new Date(avenant.datefin);
      avenant.dateEffective = new Date(avenant.dateEffective);
      messageView = this.rhisTranslateService.translate('CONTRAT.SHOW_CONFIRMATION_AVENANT')
        + ' ' + this.dateService.formatDate(avenant.dateEffective) + ' ' +
        this.rhisTranslateService.translate('CONTRAT.AU') + ' ' + this.dateService.formatDate(avenant.datefin);
    }
    return messageView;
  }

  /**
   * affichage de message de confirmation de suppression
   * @param :idAvenant
   */
  public showConfirmDeleteAvenant(idAvenant: number, uuidAvenant: string) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('CONTRAT.WAR_SUPPRESSION'),
      header: this.rhisTranslateService.translate('CONTRAT.TEXT_SUPPRESSION_AVENANT') + ' ' + this.dateService.formatDateTo(this.avenant.dateEffective, 'DD/MM/YY'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.onConfirmDeleteAvenant(idAvenant, uuidAvenant);
      },
      reject: () => {
      }
    });
  }

  /**
   * supprimer avenant
   * @param: idAvenant
   */
  private onConfirmDeleteAvenant(idAvenant: number, uuidAvenant: string) {

    this.contratService.deleteAvenant(uuidAvenant).subscribe(
      (data: number) => {
          // supprimer avenat de list contrat
          this.deleteAvenantContrat.emit({contratId: this.contratId, avenantId: +idAvenant});
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('CONTRAT.DELETE_SUCCESS'));
      }
    );
  }

  /**
   * Expression Changed After it Has Been Checked Error
   */
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
