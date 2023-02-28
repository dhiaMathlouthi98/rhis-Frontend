import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DateService} from '../../../../service/date.service';
import {ValidationContrainteSocialeModel} from '../../../../enumeration/validationContrainteSociale.model';
import {PeriodiciteModel} from '../../../../model/periodicite.model';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'rhis-modification-loi-restaurant',
  templateUrl: './modification-loi-restaurant.component.html',
  styleUrls: ['./modification-loi-restaurant.component.scss']
})
export class ModificationLoiRestaurantComponent {

  constructor(private dateSevice: DateService) {

  }

  public numbersOnlyPattern = new RegExp('^[0-9]+$');

  public selectedLoi: any;

  public listPeriodicite: PeriodiciteModel[] = [];
  public listPeriodiciteItem: SelectItem[];
  public updateLoiPopupTitle: string;


  @Input()
  set initListePeriodicite(listPeriodicite: PeriodiciteModel[]) {
    this.listPeriodicite = listPeriodicite;
  }

  @Input()
  set initLoiRestaurant(loi: any) {
    this.selectedLoi = JSON.parse(JSON.stringify(loi));
    if (!this.numbersOnlyPattern.test(this.selectedLoi.valeurMajeurAfficher) && (!this.selectedLoi.isTime)
      && ((this.selectedLoi.valeurMajeurAfficher !== 'true')) && ((this.selectedLoi.valeurMajeurAfficher !== 'false'))
      && (this.selectedLoi.valeurMineurAfficher !== '-') && (this.selectedLoi.valeurMajeurAfficher !== '-')) {
      this.selectedLoi.isPeriod = true;
      this.setListPeriodiciteItem();
    }
    this.setStringToBooleanValue();
    if (this.selectedLoi.valeurMajeurAfficher === '-') {
      this.selectedLoi.valeurMajeurAfficher = null;
    }
    if (this.selectedLoi.valeurMineurAfficher === '-') {
      this.selectedLoi.valeurMineurAfficher = null;
    }

    if (this.selectedLoi.valeurMajeurPointeuseAfficher === '-') {
      this.selectedLoi.valeurMajeurPointeuseAfficher = null;
    }
    if (this.selectedLoi.valeurMineurPointeuseAfficher === '-') {
      this.selectedLoi.valeurMineurPointeuseAfficher = null;
    }

  }

  @Input()
  set initTitle(title: string) {
    this.updateLoiPopupTitle = title;
  }

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public updateLoiEvent = new EventEmitter();

  public wrongMajeurValue = false;
  public wrongMineurValue = false;

  public wrongMajeurPointeuseValue = false;
  public wrongMineurPointeuseValue = false;

  public updateLoiRestaurant(): void {
    if (this.validChangementPointeuse() && this.validChangement()) {
      this.updateLoiEvent.emit(this.selectedLoi);
    }
  }

  /**
   * Cette methode permet de convertir le string recuperer de la base de donnes en une date pour l affichage
   * @param : param
   */
  public setMinMaxTimeValue(param): Date {
    return this.dateSevice.setTimeFormatHHMM(param);
  }

  /**
   * Permet de changer le type du champ (de date vers string) pour le sauvegarde dans la base de donnees
   */
  public validTimeToDisplay(item: any): void {
    if (item.valeurMajeurAfficher instanceof Date) {
      item.valeurMajeurAfficher = this.dateSevice.setStringFromDate(item.valeurMajeurAfficher);
    }
    if (item.valeurMineurAfficher instanceof Date) {
      item.valeurMineurAfficher = this.dateSevice.setStringFromDate(item.valeurMineurAfficher);
    }

    if (item.valeurMajeurPointeuseAfficher instanceof Date) {
      item.valeurMajeurPointeuseAfficher = this.dateSevice.setStringFromDate(item.valeurMajeurPointeuseAfficher);
    }
    if (item.valeurMineurPointeuseAfficher instanceof Date) {
      item.valeurMineurPointeuseAfficher = this.dateSevice.setStringFromDate(item.valeurMineurPointeuseAfficher);
    }
  }

  /**
   * Cette methode permet de vérifier si les loi du restaurant sont valide ou non (par rapport au lois du pays)
   */
  private validChangement(): boolean {
    let returnedValue = true;
    if (!this.selectedLoi.isTime) {
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
        if (!this.selectedLoi.loiRef.majeurForbiddenChanges) {
          if (+this.selectedLoi.valeurMajeurAfficher <= +this.selectedLoi.loiRef.valeurMajeurAfficher) {
            this.wrongMajeurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurAfficher === '-') {
              this.wrongMajeurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurForbiddenChanges) {
          if (+this.selectedLoi.valeurMineurAfficher <= +this.selectedLoi.loiRef.valeurMineurAfficher) {
            this.wrongMineurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurAfficher === '-') {
              this.wrongMineurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
        if (!this.selectedLoi.loiRef.majeurForbiddenChanges) {
          if (+this.selectedLoi.valeurMajeurAfficher >= +this.selectedLoi.loiRef.valeurMajeurAfficher) {
            this.wrongMajeurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurAfficher === '-') {
              this.wrongMajeurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurForbiddenChanges) {
          if (+this.selectedLoi.valeurMineurAfficher >= +this.selectedLoi.loiRef.valeurMineurAfficher) {
            this.wrongMineurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurAfficher === '-') {
              this.wrongMineurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.VIDE) {
        // NOTING TO BE DONE
        returnedValue = returnedValue && true;
      }
    } else {
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
        if (!this.selectedLoi.loiRef.majeurForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMajeurAfficher) <= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMajeurAfficher)) {
            this.wrongMajeurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurAfficher === '-') {
              this.wrongMajeurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMineurAfficher) <= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMineurAfficher)) {
            this.wrongMineurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurAfficher === '-') {
              this.wrongMineurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
        if (!this.selectedLoi.loiRef.majeurForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMajeurAfficher) >= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMajeurAfficher)) {
            this.wrongMajeurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurAfficher === '-') {
              this.wrongMajeurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMineurAfficher) >= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMineurAfficher)) {
            this.wrongMineurValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurAfficher === '-') {
              this.wrongMineurValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.VIDE) {
        // NOTING TO BE DONE
        returnedValue = returnedValue && true;
      }
    }
    return returnedValue;
  }

  /**
   * @param
   */
  private validChangementPointeuse(): boolean {
    let returnedValue = true;
    if (!this.selectedLoi.isTime) {
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
        if (!this.selectedLoi.loiRef.mineurPointeuseForbiddenChanges) {
          if (+this.selectedLoi.valeurMajeurPointeuseAfficher <= +this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher) {
            this.wrongMajeurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurMajeurAfficher === '-') {
              this.wrongMajeurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurPointeuseForbiddenChanges) {
          if (+this.selectedLoi.valeurMineurPointeuseAfficher <= +this.selectedLoi.loiRef.valeurMineurPointeuseAfficher) {
            this.wrongMineurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurPointeuseAfficher === '-') {
              this.wrongMineurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
        if (!this.selectedLoi.loiRef.majeurPointeuseForbiddenChanges) {
          if (+this.selectedLoi.valeurMajeurPointeuseAfficher >= +this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher) {
            this.wrongMajeurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher === '-') {
              this.wrongMajeurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurPointeuseForbiddenChanges) {
          if (+this.selectedLoi.valeurMineurPointeuseAfficher >= +this.selectedLoi.loiRef.valeurMineurPointeuseAfficher) {
            this.wrongMineurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurPointeuseAfficher === '-') {
              this.wrongMineurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.VIDE) {
        // NOTING TO BE DONE
        returnedValue = returnedValue && true;
      }
    } else {
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
        if (!this.selectedLoi.loiRef.majeurPointeuseForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMajeurPointeuseAfficher) <= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher)) {
            this.wrongMajeurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher === '-') {
              this.wrongMajeurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurPointeuseForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMineurPointeuseAfficher) <= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMineurPointeuseAfficher)) {
            this.wrongMineurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurPointeuseAfficher === '-') {
              this.wrongMineurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
        if (!this.selectedLoi.loiRef.majeurPointeuseForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMajeurPointeuseAfficher) >= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher)) {
            this.wrongMajeurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMajeurPointeuseAfficher === '-') {
              this.wrongMajeurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMajeurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
        if (!this.selectedLoi.loiRef.mineurPointeuseForbiddenChanges) {
          if (this.dateSevice.setTimeFormatHHMM(this.selectedLoi.valeurMineurPointeuseAfficher) >= this.dateSevice.setTimeFormatHHMM(this.selectedLoi.loiRef.valeurMineurPointeuseAfficher)) {
            this.wrongMineurPointeuseValue = false;
            returnedValue = returnedValue && true;
          } else {
            if (this.selectedLoi.loiRef.valeurMineurPointeuseAfficher === '-') {
              this.wrongMineurPointeuseValue = false;
              returnedValue = returnedValue && true;
            } else {
              this.wrongMineurPointeuseValue = true;
              returnedValue = returnedValue && false;
            }
          }
        }
      }
      if (this.selectedLoi.validationContrainteSociale === ValidationContrainteSocialeModel.VIDE) {
        // NOTHING TO BE DONE
        returnedValue = returnedValue && true;
      }
    }
    return returnedValue;
  }

  private setListPeriodiciteItem(): void {
    this.listPeriodiciteItem = [];
    this.listPeriodicite.forEach(item => {
      this.listPeriodiciteItem.push({label: item.libelle, value: item.libelle});
    });
  }

  public setStringToBooleanValue(): void {
    if (this.selectedLoi.valeurMajeurAfficher === 'true' || this.selectedLoi.valeurMajeurAfficher === 'false') {
      this.selectedLoi.majeurBooleanValue = this.selectedLoi.valeurMajeurAfficher === 'true';
    }
    if (this.selectedLoi.valeurMineurAfficher === 'true' || this.selectedLoi.valeurMineurAfficher === 'false') {
      this.selectedLoi.mineurBooleanValue = this.selectedLoi.valeurMineurAfficher === 'true';
    }

    if (this.selectedLoi.valeurMajeurPointeuseAfficher === 'true' || this.selectedLoi.valeurMajeurPointeuseAfficher === 'false') {
      this.selectedLoi.majeurBooleanPointeuseValue = this.selectedLoi.valeurMajeurPointeuseAfficher === 'true';
    }
    if (this.selectedLoi.valeurMineurPointeuseAfficher === 'true' || this.selectedLoi.valeurMineurPointeuseAfficher === 'false') {
      this.selectedLoi.mineurBooleanPointeuseValue = this.selectedLoi.valeurMineurPointeuseAfficher === 'true';
    }
  }

  public setBooleanToStringValue(majeurValue: boolean, pointeuse: boolean): void {
    if (majeurValue) {
      if (pointeuse) {
        this.selectedLoi.valeurMajeurPointeuseAfficher = this.selectedLoi.valeurMajeurPointeuseAfficher === 'true' ? 'false' : 'true';
      } else {
        this.selectedLoi.valeurMajeurAfficher = this.selectedLoi.valeurMajeurAfficher === 'true' ? 'false' : 'true';
      }
    } else {
      if (pointeuse) {
        this.selectedLoi.valeurMineurPointeuseAfficher = this.selectedLoi.valeurMineurPointeuseAfficher === 'true' ? 'false' : 'true';
      } else {
        this.selectedLoi.valeurMineurAfficher = this.selectedLoi.valeurMineurAfficher === 'true' ? 'false' : 'true';
      }
    }

  }
}
