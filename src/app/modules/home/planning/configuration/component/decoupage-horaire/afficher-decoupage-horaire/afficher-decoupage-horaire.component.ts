import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DecoupageHoraireModel} from '../../../../../../../shared/model/decoupage.horaire.model';
import {DomControlService} from '../../../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-afficher-decoupage-horaire',
  templateUrl: './afficher-decoupage-horaire.component.html',
  styleUrls: ['./afficher-decoupage-horaire.component.scss']
})
export class AfficherDecoupageHoraireComponent {

  public listDecoupageHoraire: DecoupageHoraireModel[] = [];

  public listJours: any[] = [];

  public premierJour: number;

  public addNewLabel: string;

  public updateLabel: string;

  public buttonLabel: string;

  public showAddUpdateDecoupageHorairePopup = false;

  public ONE_DAY_AS_MILLISECONDS = (24 * 60 * 60 * 1000);

  public verificationNightIsRaised = false;


  @Output()
  public persistDecoupageHoraireToDataBaseEvent = new EventEmitter();

  @Output()
  public saveListDecoupageHoraireEvent = new EventEmitter();

  @Output()
  public errorValidation = new EventEmitter();

  private saveButtonClicked = false;

  @Input()
  set initListeDecoupageHoraire(listDecoupageHoraire: DecoupageHoraireModel[]) {
    this.listDecoupageHoraire = listDecoupageHoraire;
  }

  @Input()
  set initListeJours(listJours: any[]) {
    this.listJours = listJours;
  }

  @Input()
  set setPremierJourRestaurant(premierJour: number) {
    this.premierJour = premierJour;
  }

  @Input()
  set setAddNewLabel(addNewLabel: string) {
    this.addNewLabel = addNewLabel;
  }

  @Input()
  set setUpdateLabel(updateLabel: string) {
    this.updateLabel = updateLabel;
  }

  @Output()
  public showDeleteConfirmBox = new EventEmitter();

  public isNightValue: boolean;

  public newValueNightValue: boolean = null;

  @Output()
  public checkIfNightValueEvent = new EventEmitter();

  @Input()
  public set setNewValueNightValue(nightValue: boolean) {
    this.newValueNightValue = nightValue;
  }

  @Input()
  public set setDuplicatedValue(isDuplicated: boolean) {
    this.isDuplicated = isDuplicated;
    if (this.isDuplicated === false && this.newDecoupageHoraire) {
      this.checkThatDecoupageConfendues();
    }
  }

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null) {
      this.isNightValue = nightValue;
      if (this.isNightValue) {
        if (!this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName + 'IsNight']) {
          this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName + 'IsNight'] = true;
          this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName].setDate(this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName].getDate() + 1);
        }
      } else {
        if (this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName + 'IsNight']) {
          this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName].setDate(this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName].getDate() - 1);
        }
        this.listDecoupageHoraire[this.choosenIndex][this.choosenFiledName + 'IsNight'] = false;
      }
      if (this.verificationNightIsRaised) {
        this.verificationNightIsRaised = false;
      }
      if (this.saveButtonClicked) {
        this.saveListDecoupageHoraire();
      }
    }
  }

  @Output()
  public checkIfNightValueNewDecoupageEvent = new EventEmitter();

  @Output()
  public checkThatLibelleExistEvent = new EventEmitter();

  @Output()
  public showErrorInValues = new EventEmitter();

  public choosenIndex: number;

  public choosenFiledName: string;

  public currentFieldIndex: number;

  public isDuplicated: boolean;

  public isConfendues: boolean;

  public newDecoupageHoraire: DecoupageHoraireModel;
  private ecran = 'EDH';

  // Paramètres du popup
  public popUpStyle = {width: 500};

  constructor(private domControlService: DomControlService) {
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public deleteDecoupageHoraire(index: number): void {
    this.showDeleteConfirmBox.emit(index);
  }

  public openAddNewDecoupageHorairePopup(): void {
    this.isDuplicated = false;
    this.isConfendues = false;
    this.buttonLabel = this.addNewLabel;
    this.showAddUpdateDecoupageHorairePopup = true;
  }

  public closePopup(): void {
    this.showAddUpdateDecoupageHorairePopup = false;
  }

  public setNewValue(fieldName: string, i: number): void {
    if (this.listDecoupageHoraire[i][fieldName] == null) {
      this.listDecoupageHoraire[i][fieldName + 'IsNew'] = true;
    }
  }

  public verificationNightValue(currentFieldName: string, nextFieldName: string, index: number, currentFieldIndex: number) {
    if (this.listDecoupageHoraire[index][currentFieldName].getDay() === new Date().getDay()) {
      this.listDecoupageHoraire[index][currentFieldName].setDate(this.listDecoupageHoraire[index][currentFieldName].getDate() + currentFieldIndex);
    }
    if (this.listDecoupageHoraire[index][currentFieldName] && this.listDecoupageHoraire[index][currentFieldName] !== '') {
      if (this.listDecoupageHoraire[index][currentFieldName].getHours() >= 0 && this.isDate1LessOrEqualDate2(this.listDecoupageHoraire[index][currentFieldName], this.listDecoupageHoraire[0][nextFieldName])) {
        this.choosenIndex = index;
        this.choosenFiledName = currentFieldName;
        this.currentFieldIndex = currentFieldIndex;
        this.verificationNightIsRaised = true;
        this.checkIfNightValueEvent.emit();
      } else {
        if (this.listDecoupageHoraire[index][currentFieldName + 'IsNight']) {
          this.listDecoupageHoraire[index][currentFieldName].setDate(this.listDecoupageHoraire[index][currentFieldName].getDate() - 1);
        }
        this.listDecoupageHoraire[index][currentFieldName + 'IsNight'] = false;
      }
    }
  }

  private isDate1LessOrEqualDate2(date1: Date, date2: Date): boolean {
    const date11 = new Date(+0);
    date11.setSeconds(0);
    date11.setMilliseconds(0);
    date11.setHours(date1.getHours());
    date11.setMinutes(date1.getMinutes());

    const date22 = new Date(+0);
    date22.setSeconds(0);
    date22.setMilliseconds(0);
    date22.setHours(date2.getHours());
    date22.setMinutes(date2.getMinutes());

    return (date11 <= date22);
  }

  public saveListDecoupageHoraire(): void {
    this.saveButtonClicked = true;
    setTimeout(() => {
      if (!this.verificationNightIsRaised) {
        this.saveButtonClicked = false;
        this.correctDateValues();
        const midNightIndex = this.listDecoupageHoraire.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.length === 0);
        const tmpListDecoupageHoraire = [...this.listDecoupageHoraire];
        tmpListDecoupageHoraire.splice(midNightIndex, 1);
        if (this.checkCorrectOrder(tmpListDecoupageHoraire)) {
          this.listDecoupageHoraire.sort((a: DecoupageHoraireModel, b: DecoupageHoraireModel) => a.valeurDimanche - b.valeurDimanche);
          const journeeMoreThanADay = this.checkIfJourneeIsMoreThanADay();
          const fieldValidation = this.validation();
          if (fieldValidation.validate && !journeeMoreThanADay.moreThanADay) {
            this.saveListDecoupageHoraireEvent.emit(this.listDecoupageHoraire);
          } else {
            if (!fieldValidation.validate) {
              // TODO notify of error
              this.errorValidation.emit({
                moreThanDay: false,
                order: false,
                other: true,
                day: fieldValidation.day,
                phaseName: fieldValidation.phaseName
              });
            } else {
              // TODO notify of error
              this.errorValidation.emit({
                moreThanDay: journeeMoreThanADay.moreThanADay,
                order: false,
                other: !journeeMoreThanADay.moreThanADay,
                day: journeeMoreThanADay.day,
                phaseName: ''
              });
            }

          }
        } else {
          // TODO notify of error
          this.errorValidation.emit({
            moreThanDay: false,
            order: true,
            other: false,
            day: ''
          });
          return;
        }
      }
    }, 500);


  }

  private otherFieldsAreNull(currentFieldIndex: number, index: number) {
    let returnedValue = true;
    this.listJours.forEach((item, itemIndex) => {
      if (currentFieldIndex !== itemIndex) {
        returnedValue = returnedValue && (this.listDecoupageHoraire[index]['valeur' + (this.listJours[itemIndex].val)] === null);
      }
    });
    return returnedValue;
  }


  private showError(index: number, currentFieldName: string) {
    const phaseLabel = this.listDecoupageHoraire[index].phase.libelle;
    this.showErrorInValues.emit({
      phaseName: phaseLabel,
      fieldName: currentFieldName
    });
  }

  public addNewDecoupageHoraire(decoupage: DecoupageHoraireModel) {
    decoupage.phase.libelle = decoupage.phase.libelle.trim();
    this.newDecoupageHoraire = decoupage;
    this.checkThatLibelleExist();
  }

  private checkThatDecoupageConfendues() {
    this.isConfendues = false;
    if (this.newDecoupageHoraire) {
      for (let i = 0; i < this.listDecoupageHoraire.length - 1; i++) {
        if ((this.listDecoupageHoraire[i]['valeur' + this.listJours[0].val] <= this.newDecoupageHoraire['valeur' + this.listJours[0].val]) && (this.listDecoupageHoraire[i + 1]['valeur' + this.listJours[0].val] > this.newDecoupageHoraire['valeur' + this.listJours[0].val])) {

          const tmpValeurSup = this.listDecoupageHoraire[i + 1];
          const tmpValeurMin = this.listDecoupageHoraire[i];
          this.listJours.forEach(item => {
            if (!((this.newDecoupageHoraire['valeur' + item.val] >= tmpValeurMin['valeur' + item.val]) && (this.newDecoupageHoraire['valeur' + item.val] <= tmpValeurSup['valeur' + item.val]))) {
              // error
              this.isConfendues = true;
            }
          });
        }
      }
      if (!this.isConfendues) {
        this.persistDecoupageHoraireToDataBaseEvent.emit(this.newDecoupageHoraire);
        this.showAddUpdateDecoupageHorairePopup = false;
      }
    }
  }

  private checkThatLibelleExist() {
    this.checkThatLibelleExistEvent.emit(this.newDecoupageHoraire.phase.libelle);
  }

  public emitNightValueEvent() {
    this.checkIfNightValueNewDecoupageEvent.emit();
  }

  private validationValue(currentFieldName: string, index: number, currentFieldIndex: number): boolean {
    if (this.listDecoupageHoraire[index][currentFieldName] && this.listDecoupageHoraire[index][currentFieldName] !== '') {
      if (!this.listDecoupageHoraire[index].isVisited || this.otherFieldsAreNull(currentFieldIndex, index)) {
        return true;
      } else {
        const tmpValeurSup = this.listDecoupageHoraire[index + 1];
        const tmpCurrentValue = this.listDecoupageHoraire[index];
        const tmpValeurMin = this.listDecoupageHoraire[index - 1];
        if (index === 0) {
          if (tmpCurrentValue[currentFieldName] <= tmpValeurSup[currentFieldName]) {
            this.listDecoupageHoraire[index].hasCorrectValue = true;
          } else {
            this.listDecoupageHoraire[index].hasCorrectValue = false;
            this.showError(index, currentFieldName);
            return false;
          }
        } else if (index === this.listDecoupageHoraire.length - 1) {
          if (tmpCurrentValue[currentFieldName] >= tmpValeurMin[currentFieldName]) {
            this.listDecoupageHoraire[index].hasCorrectValue = true;
          } else {
            this.listDecoupageHoraire[index].hasCorrectValue = false;
            this.showError(index, currentFieldName);
            return false;
          }
        } else {
          if ((tmpCurrentValue[currentFieldName] >= tmpValeurMin[currentFieldName]) && (tmpCurrentValue[currentFieldName] <= tmpValeurSup[currentFieldName])) {
            this.listDecoupageHoraire[index].hasCorrectValue = true;
          } else {
            this.listDecoupageHoraire[index].hasCorrectValue = false;
            this.showError(index, currentFieldName);
            return false;

          }
        }
        return true;
      }
    }
  }

  private validation(): { validate: boolean, phaseName: string, day: string } {
    let validationValue = true;
    for (let i = 1; i < this.listJours.length - 1; i++) {
      if (this.listDecoupageHoraire[0]['valeur' + this.listJours[i].val] < this.listDecoupageHoraire[this.listDecoupageHoraire.length - 1]['valeur' + this.listJours[i - 1].val]) {
        validationValue = false;
      }
    }
    const fieldValiadtion = this.validateFileds();
    fieldValiadtion.validate = fieldValiadtion.validate && validationValue;
    return fieldValiadtion;
  }

  private validateFileds(): { validate: boolean, phaseName: string, day: string } {
    let phaseName = '';
    let day = '';
    let validationField = true;
    const midNightIndex = this.listDecoupageHoraire.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.length === 0);
    const tmpMidNight = this.listDecoupageHoraire[midNightIndex];
    this.listDecoupageHoraire.splice(midNightIndex, 1);
    this.listDecoupageHoraire.forEach((item, index) => {
      item.hasCorrectValue = true;
      const tmpValeurSup = this.listDecoupageHoraire[index + 1];
      const tmpCurrentValue = this.listDecoupageHoraire[index];
      const tmpValeurMin = this.listDecoupageHoraire[index - 1];
      this.listJours.forEach((jour: any) => {
        if (index === 0) {
          if (tmpCurrentValue['valeur' + jour.val] <= tmpValeurSup['valeur' + jour.val]) {
            item.hasCorrectValue = item.hasCorrectValue && true;
          } else {
            item.hasCorrectValue = item.hasCorrectValue && false;
            phaseName = tmpCurrentValue.phase.libelle + ', ' + tmpValeurSup.phase.libelle;
            day = jour.val;
          }
        } else if (index === this.listDecoupageHoraire.length - 1) {
          if (tmpCurrentValue['valeur' + jour.val] >= tmpValeurMin['valeur' + jour.val]) {
            item.hasCorrectValue = item.hasCorrectValue && true;
          } else {
            item.hasCorrectValue = item.hasCorrectValue && false;
            phaseName = tmpCurrentValue.phase.libelle + ', ' + tmpValeurMin.phase.libelle;
            day = jour.val;
          }
        } else {
          if ((tmpCurrentValue['valeur' + jour.val] >= tmpValeurMin['valeur' + jour.val]) && (tmpCurrentValue['valeur' + jour.val] <= tmpValeurSup['valeur' + jour.val])) {
            item.hasCorrectValue = item.hasCorrectValue && true;
          } else {
            item.hasCorrectValue = item.hasCorrectValue && false;
            phaseName = tmpValeurMin.phase.libelle + ', ' + tmpCurrentValue.phase.libelle + ', ' + tmpValeurSup.phase.libelle;
            day = jour.val;
          }
        }
      });
    });
    this.listDecoupageHoraire.forEach((item: DecoupageHoraireModel) => {
      validationField = validationField && item.hasCorrectValue;
    });
    this.listDecoupageHoraire.splice(midNightIndex, 0, tmpMidNight);
    return {validate: validationField, phaseName: phaseName, day: day};
  }

  private checkIfJourneeIsMoreThanADay(): { moreThanADay: boolean, day: string } {
    let day = '';
    let moreThanADay = false;
    const firstItem = this.listDecoupageHoraire[0];
    const lastItem = this.listDecoupageHoraire[this.listDecoupageHoraire.length - 1];
    this.listJours.forEach(jour => {
      if (this.compareTwoDateAreMoreThanDay(firstItem['valeur' + jour.val], lastItem['valeur' + jour.val])) {
        day = jour.val;
        moreThanADay = moreThanADay || true;
      } else {
        moreThanADay = moreThanADay || false;
      }
    });
    return {moreThanADay: moreThanADay, day: day};
  }

  private compareTwoDateAreMoreThanDay(startDate: Date, endDate: Date) {
    this.resetDateSeconds(startDate);
    this.resetDateSeconds(endDate);

    return (((+endDate - +startDate) / this.ONE_DAY_AS_MILLISECONDS) > 1);
  }

  private resetDateSeconds(date: Date) {
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  private correctDateValues(): void {
    const midNightIndex = this.listDecoupageHoraire.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.length === 0);
    // l'index du decoupage horaire dont le nom du phase est debut journee activite
    const djaIndex = this.listDecoupageHoraire.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.toUpperCase() === 'Début de journée d\'activité'.toUpperCase());
    // l'index du decoupage horaire dont le nom du phase est fin journee activite
    const fjaIndex = this.listDecoupageHoraire.findIndex((item: DecoupageHoraireModel) => item.phase.libelle.toUpperCase() === 'Fin de journée d\'activité'.toUpperCase());
    if (midNightIndex !== -1) {
      for (let index = 0; index < midNightIndex; index++) {
        this.listJours.forEach((itemJour: any, indexJour: number) => {
          const correctDatevalue = new Date();
          correctDatevalue.setDate(correctDatevalue.getDate() + indexJour);
          const hours = this.listDecoupageHoraire[index]['valeur' + itemJour.val].getHours();
          const minutes = this.listDecoupageHoraire[index]['valeur' + itemJour.val].getMinutes();
          correctDatevalue.setMilliseconds(0);
          correctDatevalue.setSeconds(0);
          correctDatevalue.setHours(hours);
          correctDatevalue.setMinutes(minutes);
          this.listDecoupageHoraire[index]['valeur' + itemJour.val] = correctDatevalue;
        });
      }
      for (let index = 0; index < midNightIndex; index++) {
        this.listJours.forEach((itemJour: any) => {
          if (this.listDecoupageHoraire[index]['valeur' + itemJour.val] < this.listDecoupageHoraire[djaIndex]['valeur' + itemJour.val]) {
            this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = true;
            this.listDecoupageHoraire[index]['valeur' + itemJour.val].setDate(this.listDecoupageHoraire[index]['valeur' + itemJour.val].getDate() + 1);
          } else {
            this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = false;
          }
        });
      }


      for (let index = midNightIndex + 1; index < this.listDecoupageHoraire.length; index++) {
        this.listJours.forEach((itemJour: any, indexJour: number) => {
          this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = true;
          const correctDatevalue = new Date();
          correctDatevalue.setDate(correctDatevalue.getDate() + indexJour + 1);
          const hours = this.listDecoupageHoraire[index]['valeur' + itemJour.val].getHours();
          const minutes = this.listDecoupageHoraire[index]['valeur' + itemJour.val].getMinutes();
          correctDatevalue.setMilliseconds(0);
          correctDatevalue.setSeconds(0);
          correctDatevalue.setHours(hours);
          correctDatevalue.setMinutes(minutes);
          this.listDecoupageHoraire[index]['valeur' + itemJour.val] = correctDatevalue;
        });
      }
      for (let index = midNightIndex + 1; index < this.listDecoupageHoraire.length; index++) {
        this.listJours.forEach((itemJour: any, indexJour: number) => {
          let nextDayIndex = indexJour + 1;
          if (indexJour === this.listJours.length - 1) {
            nextDayIndex = 0;
            if (this.listDecoupageHoraire[index]['valeur' + itemJour.val] > (new Date(this.listDecoupageHoraire[djaIndex]['valeur' + this.listJours[nextDayIndex].val]).getTime() + (7 * this.ONE_DAY_AS_MILLISECONDS))) {
              this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = false;
              this.listDecoupageHoraire[index]['valeur' + itemJour.val].setDate(this.listDecoupageHoraire[index]['valeur' + itemJour.val].getDate() - 1);
            } else {
              this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = true;
            }
          } else {
            if (this.listDecoupageHoraire[index]['valeur' + itemJour.val] > this.listDecoupageHoraire[djaIndex]['valeur' + this.listJours[nextDayIndex].val]) {
              this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = false;
              this.listDecoupageHoraire[index]['valeur' + itemJour.val].setDate(this.listDecoupageHoraire[index]['valeur' + itemJour.val].getDate() - 1);
            } else {
              this.listDecoupageHoraire[index]['valeur' + itemJour.val + 'IsNight'] = true;
            }
          }
        });
      }
    }
  }

  private checkCorrectOrder(listDecoupageHoraire: DecoupageHoraireModel[]): boolean {
    listDecoupageHoraire.sort((a: DecoupageHoraireModel, b: DecoupageHoraireModel) => a.valeurDimanche - b.valeurDimanche);
    return ((listDecoupageHoraire[0].phase.libelle.toUpperCase() === 'Début de journée d\'activité'.toUpperCase()) && (listDecoupageHoraire[listDecoupageHoraire.length - 1].phase.libelle.toUpperCase() === 'Fin de journée d\'activité'.toUpperCase()));
  }
}
