import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PositionnementModel} from '../../../../../../shared/model/positionnement.model';
import {PositionnementPositionTravailPKModel} from '../../../../../../shared/model/positionnement.position.travail.PK.model';
import {PositionnementPositionTravailModel} from '../../../../../../shared/model/positionnement.position.travail.model';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';


@Component({
  selector: 'rhis-vue-tableau',
  templateUrl: './vue-tableau.component.html',
  styleUrls: ['./vue-tableau.component.scss']
})
export class VueTableauComponent implements OnInit, AfterViewChecked {

  public listPositionnementToDisplay: PositionnementModel[] = [];

  public listPositionnementToAdd: PositionnementModel[] = [];

  public selectedPositionnement: PositionnementModel = new PositionnementModel();

  public columnPositionTravail: any[] = [];

  public tauxMOByRestaurant = 0.0;

  public heightInterface: any;

  public calculWidth: any;

  public newPostionnementSpanId = 'newPostionnementSpan';

  public emptyValuePositionnementSpanId = 'emptyValuePositionnementSpan';

  private ecran = 'GCP';

  public targetScroll: any;

  @Input()
  set initListePositionnement(listPositionnementToDisplay: PositionnementModel[]) {
    this.listPositionnementToDisplay = listPositionnementToDisplay;
  }

  @Input()
  set initListePositionTravailProductif(columnPositionTravail: any[]) {
    this.columnPositionTravail = columnPositionTravail;
  }

  @Input()
  set initTauxMOByRestaurant(tauxMOByRestaurant: any) {
    this.tauxMOByRestaurant = (+tauxMOByRestaurant);
  }

  @Output()
  public deletePositionnementEvent = new EventEmitter();

  @Output()
  public displayProveUpdateMessage = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private domControlService: DomControlService) {
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

  ngOnInit() {
    this.listPositionnementToAdd.push(new PositionnementModel());
  }

  public selectRow(positionnement: PositionnementModel) {
    if (this.selectedPositionnement) {
      this.selectedPositionnement.isSelected = false;
    }
    this.selectedPositionnement = positionnement;
    this.selectedPositionnement.isSelected = true;
  }

  public deletePositionnement(positionnement: PositionnementModel) {
    this.deletePositionnementEvent.emit(positionnement);
  }

  public verificationPositionTravailPositionnement(index: number, positionnement: PositionnementModel, newElement: boolean, input: any) {
    let value = +(input.target.textContent);
    if (newElement) {
      if (value && (+value) !== 0) {
        this.displayProveUpdateMessage.emit({
          newElement: true,
          positionnement: positionnement,
          // newValue: +input.value,
          newValue: value,
          idPositionTravail: this.columnPositionTravail[index].idPositionTravail
        });
      }
    } else {
      if (!value) {
        value = 0;
      }
      if ((+value) !== positionnement.positionementPositionTravails[index].valeur) {
        // display update
        this.displayProveUpdateMessage.emit({
          newElement: false,
          positionnement: positionnement,
          // newValue: +input.value,
          newValue: value,
          idPositionTravail: positionnement.positionementPositionTravails[index].positionnementPositionTravailID.idPositionPK

        });
      }
    }
  }

  public positionnementHasPositionTravail(positionnement: PositionnementModel, index: number): boolean {
    let found = false;
    positionnement.positionementPositionTravails.forEach(item => {
      if (item.positionnementPositionTravailID.idPositionPK === this.columnPositionTravail[index].idPositionTravail) {
        found = true;
      }
    });
    return found;
  }

  public unselectPositionement() {
    if (this.selectedPositionnement) {
      const index = this.listPositionnementToDisplay.findIndex(item => item.idPositionement === this.selectedPositionnement.idPositionement);
      if (index !== -1) {
        this.listPositionnementToDisplay[index].isSelected = false;
      }
      this.selectedPositionnement = null;
    }
  }

  public updateValeurVenteHoraire(positionnement: PositionnementModel) {
    this.updatePositionnementProductivite(positionnement);
    this.orderListPositionnement();

    setTimeout(
      () => {
        this.targetScroll = document.getElementsByClassName('select-postionnement-rhis');
        this.scroll(this.targetScroll[0].previousElementSibling.previousElementSibling);
      }, 100);

  }

  public scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  public verificationNewPositionTravailPositionnement(index: number, positionnement: PositionnementModel, newValue: boolean, input: any) {
    if (!input.target.textContent) {
      input.target.textContent = 0;
    }
    if (newValue) {
      const key = new PositionnementPositionTravailPKModel();
      key.idPositionPK = this.columnPositionTravail[index].idPositionTravail;
      key.idPostitionementPK = positionnement.idPositionement;
      const newElement = new PositionnementPositionTravailModel();
      newElement.positionnementPositionTravailID = key;
      newElement.valeur = +(input.target.textContent);
      positionnement.positionementPositionTravails.push(newElement);
    } else {
      positionnement.positionementPositionTravails[index].valeur = +(input.target.textContent);
    }
    this.updatePositionnementEffectif(positionnement);
  }

  private updatePositionnementEffectif(positionnement: PositionnementModel) {
    let totalEffectif = 0;
    positionnement.positionementPositionTravails.forEach(item => {
      if (item.valeur === null) {
        item.valeur = 0;
      }
      totalEffectif += +item.valeur;
    });
    positionnement.effectif = totalEffectif;
    this.updatePositionnementProductivite(positionnement);
  }

  public addNewPositionnement() {
    const positionnement = {...this.listPositionnementToAdd[0]};
    this.listPositionnementToAdd[0] = new PositionnementModel();
    if (positionnement.venteHoraire === '') {
      positionnement.venteHoraire = 0;
    }
    this.setUniqueIdentifier(positionnement);
    this.listPositionnementToDisplay.push(positionnement);
    if (this.selectedPositionnement) {
      this.selectedPositionnement.isSelected = false;
    }
    this.selectedPositionnement = positionnement;
    this.selectedPositionnement.isSelected = true;
    this.orderListPositionnement();
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
      positionnement.pourcentageCol = +(((((+(positionnement.effectif) * this.tauxMOByRestaurant)) / (+(positionnement.venteHoraire))) * 100).toFixed(2));
    }
  }

  private orderListPositionnement() {
    this.listPositionnementToDisplay.sort((a, b) => a.venteHoraire - b.venteHoraire);
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

  private setUniqueIdentifier(positionnement: PositionnementModel) {
    const newId = this.makeString();
    if (this.listPositionnementToDisplay.findIndex(item => item.idPositionement === newId) !== -1) {
      this.setUniqueIdentifier(positionnement);
    }
    positionnement.idPositionement = newId;
  }

  /**
   * Run change detection explicitly after the change
   */
  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  public checkForWrongNumberFormat(event: any, positionnement: PositionnementModel, integerOnly: boolean, index?: number) {
    const specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight', 'Shift'];
    // Allow Backspace, tab, end, home, Delete, left,  and right  keys
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const twoDigitDecimalNumberRegex = new RegExp(/^\d+\.?\d{0,2}$/g);
    const digitDecimalNumberRegex = new RegExp(/^\d+$/g);

    let current = '';
    if (index) {
      current = String(positionnement.positionementPositionTravails[index].valeur);

    } else {
      current = String(positionnement.venteHoraire);
      if (positionnement.venteHoraire === null) {
        current = '';
      }
    }
    const next: string = current.concat(event.key);
    if (integerOnly) {
      if (next && !digitDecimalNumberRegex.test(next.toString())) {
        event.preventDefault();
      }
    } else {
      if (next && !twoDigitDecimalNumberRegex.test(next.toString())) {
        event.preventDefault();
      }
    }
  }

  public clearField(positionnement: PositionnementModel, index: number, insertedValue: boolean, newValue?: boolean) {
    if (index === null) {
      // clear vente horaire value
      if (+positionnement.venteHoraire === 0) {
        positionnement.venteHoraire = '';
      }
    } else {
      if (insertedValue) {
        if (newValue) {
          document.getElementById(this.newPostionnementSpanId + index).innerText = '';
        } else {
          document.getElementById(this.emptyValuePositionnementSpanId + positionnement.idPositionement + index).innerText = '';
        }
      } else {
        if (+positionnement.positionementPositionTravails[index].valeur === 0) {
          positionnement.positionementPositionTravails[index].valeur = '';
        }
      }

    }
  }

  public resetValue(positionnement: PositionnementModel, index: number, venteValue: boolean, emptyValue?: boolean) {
    if (venteValue) {
      if (positionnement.venteHoraire === null || positionnement.venteHoraire === '') {
        positionnement.venteHoraire = 0;
      }
    } else {
      if (emptyValue) {
        document.getElementById(this.emptyValuePositionnementSpanId + positionnement.idPositionement + index).innerText = '0';
      } else {
        if (positionnement.positionementPositionTravails[index].valeur === null || positionnement.positionementPositionTravails[index].valeur === '') {
          positionnement.positionementPositionTravails[index].valeur = 0;
        }
      }
    }
  }
}
