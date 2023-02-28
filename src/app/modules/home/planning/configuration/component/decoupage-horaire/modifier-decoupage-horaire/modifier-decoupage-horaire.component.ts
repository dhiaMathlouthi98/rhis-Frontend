import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DecoupageHoraireModel} from '../../../../../../../shared/model/decoupage.horaire.model';

@Component({
  selector: 'rhis-modifier-decoupage-horaire',
  templateUrl: './modifier-decoupage-horaire.component.html',
  styleUrls: ['./modifier-decoupage-horaire.component.scss']
})
export class ModifierDecoupageHoraireComponent implements OnInit {

  public buttonTitle: string;

  public listJours: any[] = [];

  public newDecoupageHoraire: DecoupageHoraireModel;

  public firstDayAsInteger: number;

  public listDecoupageHoraire: DecoupageHoraireModel[] = [];

  public libellePhaseError = false;
  public libellePhaseErrorMessage = '';

  public timeConfendueDecoupageHoraireError = false;
  public timeConfendueDecoupageHoraireErrorMessage = '';

  public ONE_DAY_AS_MILLISECONDS = (24 * 60 * 60 * 1000);


  @Input()
  set initListeDecoupageHoraire(listDecoupageHoraire: DecoupageHoraireModel[]) {
    this.listDecoupageHoraire = listDecoupageHoraire;
  }

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  set initListeJours(listJours: any[]) {
    this.listJours = listJours;
  }

  @Input()
  set setPremierJourRestaurant(premierJour: number) {
    this.firstDayAsInteger = premierJour;
  }

  @Input()
  public set initDuplicatedLibelle(isDuplicated: boolean) {
    if (isDuplicated) {
      this.libellePhaseError = true;
      this.libellePhaseErrorMessage = 'PHASE.EXIST_ERROR';
    } else {
      this.libellePhaseError = false;
      this.libellePhaseErrorMessage = '';
    }
  }

  @Input()
  public set initConfendues(isConfendues: boolean) {
    if (isConfendues) {
      this.timeConfendueDecoupageHoraireError = true;
      this.timeConfendueDecoupageHoraireErrorMessage = 'PHASE.CONFENDUES_ERROR';
    } else {
      this.timeConfendueDecoupageHoraireError = false;
      this.timeConfendueDecoupageHoraireErrorMessage = '';
    }
  }

  @Output()
  public addNewDecoupageHoraireEvent = new EventEmitter();

  @Output()
  public checkIfNightValueEvent = new EventEmitter();

  public choosenFiledName: string;

  public currentFieldIndex: number;

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null && this.choosenFiledName) {
      if (nightValue) {
        if (!this.newDecoupageHoraire[this.choosenFiledName + 'IsNight']) {
          this.newDecoupageHoraire[this.choosenFiledName + 'IsNight'] = true;
          this.newDecoupageHoraire[this.choosenFiledName].setDate(this.newDecoupageHoraire[this.choosenFiledName].getDate() + 1);
        }
      } else {
        if (this.newDecoupageHoraire[this.choosenFiledName + 'IsNight']) {
          this.newDecoupageHoraire[this.choosenFiledName].setDate(this.newDecoupageHoraire[this.choosenFiledName].getDate() - 1);
        }
        this.newDecoupageHoraire[this.choosenFiledName + 'IsNight'] = false;
      }
    }
  }

  ngOnInit(): void {
    this.newDecoupageHoraire = new DecoupageHoraireModel();
    const dateParserValue1 = new Date();
    const dateParserValue2 = new Date(new Date().getTime() + this.ONE_DAY_AS_MILLISECONDS);
    const dateParserValue3 = new Date(new Date().getTime() + (2 * this.ONE_DAY_AS_MILLISECONDS));
    const dateParserValue4 = new Date(new Date().getTime() + (3 * this.ONE_DAY_AS_MILLISECONDS));
    const dateParserValue5 = new Date(new Date().getTime() + (4 * this.ONE_DAY_AS_MILLISECONDS));
    const dateParserValue6 = new Date(new Date().getTime() + (5 * this.ONE_DAY_AS_MILLISECONDS));
    const dateParserValue7 = new Date(new Date().getTime() + (6 * this.ONE_DAY_AS_MILLISECONDS));

    const jourValues = [];

    jourValues.push(dateParserValue1);
    jourValues.push(dateParserValue2);
    jourValues.push(dateParserValue3);
    jourValues.push(dateParserValue4);
    jourValues.push(dateParserValue5);
    jourValues.push(dateParserValue6);
    jourValues.push(dateParserValue7);

    let index = 0 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurDimanche = jourValues[index];
    if (this.newDecoupageHoraire.valeurDimancheIsNight) {
      this.newDecoupageHoraire.valeurDimanche.setDate(this.newDecoupageHoraire.valeurDimanche.getDate() + 1);
    }
    index = 1 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurLundi = jourValues[index];
    if (this.newDecoupageHoraire.valeurLundiIsNight) {
      this.newDecoupageHoraire.valeurLundi.setDate(this.newDecoupageHoraire.valeurLundi.getDate() + 1);
    }
    index = 2 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurMardi = jourValues[index];
    if (this.newDecoupageHoraire.valeurMardiIsNight) {
      this.newDecoupageHoraire.valeurMardi.setDate(this.newDecoupageHoraire.valeurMardi.getDate() + 1);
    }
    index = 3 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurMercredi = jourValues[index];
    if (this.newDecoupageHoraire.valeurMercrediIsNight) {
      this.newDecoupageHoraire.valeurMercredi.setDate(this.newDecoupageHoraire.valeurMercredi.getDate() + 1);
    }

    index = 4 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurJeudi = jourValues[index];
    if (this.newDecoupageHoraire.valeurJeudiIsNight) {
      this.newDecoupageHoraire.valeurJeudi.setDate(this.newDecoupageHoraire.valeurJeudi.getDate() + 1);
    }

    index = 5 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurVendredi = jourValues[index];
    if (this.newDecoupageHoraire.valeurVendrediIsNight) {
      this.newDecoupageHoraire.valeurVendredi.setDate(this.newDecoupageHoraire.valeurVendredi.getDate() + 1);
    }

    index = 6 - this.firstDayAsInteger;
    if (index < 0) {
      index = index + 7;
    }
    this.newDecoupageHoraire.valeurSamedi = jourValues[index];
    if (this.newDecoupageHoraire.valeurSamediIsNight) {
      this.newDecoupageHoraire.valeurSamedi.setDate(this.newDecoupageHoraire.valeurSamedi.getDate() + 1);
    }
  }

  public addNewDecoupageHoraire() {
    this.listJours.forEach((item: any, index: number) => {
      if (index === 6) {
        this.setCorrectDate('valeur' + (this.listJours[index].val), 'valeur' + (this.listJours[0].val), index);
      } else {
        this.setCorrectDate('valeur' + (this.listJours[index].val), 'valeur' + (this.listJours[index + 1].val), index);
      }
    });
    if (this.canAddNewDecoupage()) {
      this.newDecoupageHoraire.canDelete = true;
      this.newDecoupageHoraire.phase.libelle = this.newDecoupageHoraire.phase.libelle.trim();
      this.addNewDecoupageHoraireEvent.emit(this.newDecoupageHoraire);
    }
  }

  private canAddNewDecoupage() {
    this.resetErrorMessages();
    let canAdd = true;
    canAdd = canAdd && this.validLibellePhase();

    return canAdd;
  }

  private resetErrorMessages() {
    this.libellePhaseError = false;
    this.libellePhaseErrorMessage = '';

    this.timeConfendueDecoupageHoraireError = false;
    this.timeConfendueDecoupageHoraireErrorMessage = '';
  }

  private validLibellePhase(): boolean {
    if (this.newDecoupageHoraire.phase.libelle.trim().length === 0) {
      this.libellePhaseError = true;
      this.libellePhaseErrorMessage = 'PERIODE_MANAGER.REQUIRED';
      return false;
    } else {
      return true;
    }
  }

  public verificationNightValue(currentFieldName: string, nextFieldName: string, currentFieldIndex: number) {
    if (this.newDecoupageHoraire[currentFieldName] && this.newDecoupageHoraire[currentFieldName] !== '') {
      if (this.newDecoupageHoraire[currentFieldName].getHours() >= 0 && this.isDate1LessOrEqualDate2(this.newDecoupageHoraire[currentFieldName], this.listDecoupageHoraire[this.listDecoupageHoraire.length - 1][currentFieldName])) {
        this.choosenFiledName = currentFieldName;
        this.currentFieldIndex = currentFieldIndex;
        // this.checkIfNightValueEvent.emit();
        this.newDecoupageHoraire[currentFieldName].setDate(this.newDecoupageHoraire[currentFieldName].getDate() + 1);
        this.newDecoupageHoraire[currentFieldName + 'IsNight'] = true;
      } else {
        if (this.newDecoupageHoraire[currentFieldName + 'IsNight']) {
          this.newDecoupageHoraire[currentFieldName].setDate(this.newDecoupageHoraire[currentFieldName].getDate() - 1);
        }
        this.newDecoupageHoraire[currentFieldName + 'IsNight'] = false;
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

  public setCorrectDate(currentFieldName: string, nextFieldName: string, currentFieldIndex: number) {
    this.newDecoupageHoraire[currentFieldName].setDate(new Date().getDate());
    this.newDecoupageHoraire[currentFieldName].setYear(new Date().getFullYear());
    this.newDecoupageHoraire[currentFieldName].setMonth(new Date().getMonth());
    this.newDecoupageHoraire[currentFieldName] = new Date(this.newDecoupageHoraire[currentFieldName].getTime() + (currentFieldIndex * this.ONE_DAY_AS_MILLISECONDS));
    this.verificationNightValue(currentFieldName, nextFieldName, currentFieldIndex);
  }
}
