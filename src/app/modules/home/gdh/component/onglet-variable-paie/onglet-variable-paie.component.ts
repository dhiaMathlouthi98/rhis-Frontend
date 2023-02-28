import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {VariablesPayesModel} from '../../../../../shared/model/variables.payes.model';
import {PayeService} from '../../service/PayeService';
import {VariablePayeEnum} from '../../../../../shared/enumeration/variable.paye.enum';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';

@Component({
  selector: 'rhis-onglet-variable-paie',
  templateUrl: './onglet-variable-paie.component.html',
  styleUrls: ['./onglet-variable-paie.component.scss']
})
export class OngletVariablePaieComponent implements OnInit {

  @Output()
  private generateInterfacePayFile = new EventEmitter();
  public listVariablePaieByRestaurant: VariablesPayesModel[] = [];
  public defaultListVariablePaieByRestaurant: VariablesPayesModel[] = [];
  public listVariablePaieByRestaurantToDelete: number[] = [];
  private ecran = 'VAP';
  public isNewVariable = false;
  private heureSupPalier3Code = 'PALIER3_SUP';
  public variablePaieItemList = [{
    label: this.translator.translate('GDH.PAY.VARIABLE_HP'),
    value: VariablePayeEnum.HP
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_CP0'),
    value: VariablePayeEnum.CP0
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_CP10'),
    value: VariablePayeEnum.CP10
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_CP25'),
    value: VariablePayeEnum.CP25
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_SP0'),
    value: VariablePayeEnum.SP0
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_SP50'),
    value: VariablePayeEnum.SP50
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_N0'),
    value: VariablePayeEnum.N0
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_N1'),
    value: VariablePayeEnum.N1
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_N2'),
    value: VariablePayeEnum.N2
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_FERIE'),
    value: VariablePayeEnum.FERIE
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_FIRSTMAI'),
    value: VariablePayeEnum.FIRSTMAI
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_COUPURES'),
    value: VariablePayeEnum.COUPURES
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_REPAS'),
    value: VariablePayeEnum.REPAS
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_AVENANT'),
    value: VariablePayeEnum.AVENANT
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_CONTRAT'),
    value: VariablePayeEnum.CONTRAT
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_HN'),
    value: VariablePayeEnum.HN
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_ABS'),
    value: VariablePayeEnum.ABS_ES
  }, {
    label: this.translator.translate('GDH.PAY.VARIABLE_NBDAYCP'),
    value: VariablePayeEnum.NBDAYCP
  },
    {
    label: this.translator.translate('GDH.PAY.VARIABLE_DAY_NUMBER'),
    value: VariablePayeEnum.DAYNUMBER
  },
    {
      label: this.translator.translate('GDH.PAY.DOUBLE_SHIFT_MIN'),
      value: VariablePayeEnum.DOUBLE_SHIFT_MIN
    },
    {
      label: this.translator.translate('GDH.PAY.DOUBLE_SHIFT_MAX'),
      value: VariablePayeEnum.DOUBLE_SHIFT_MAX
    }];

  constructor(private paieService: PayeService,
              private translator: RhisTranslateService,
              private notificationService: NotificationService,
              private parametreGlobalService: ParametreGlobalService,
              private domControlService: DomControlService) {
  }

  ngOnInit() {
    this.getVariablePaieByRestaurant();
    this.getHeureSupConfig();
  }

  private async getHeureSupConfig(): Promise<void> {
    const isHeureSupSecondModeApplied = (+(await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.heureSupPalier3Code).toPromise()).valeur) > 0;
    if (isHeureSupSecondModeApplied ) {
      this.variablePaieItemList.splice(5, 0,
          {
            label: this.translator.translate('GDH.PAY.VARIABLE_SP10'),
            value: VariablePayeEnum.SP10
          },
          {
            label: this.translator.translate('GDH.PAY.VARIABLE_SP20'),
            value: VariablePayeEnum.SP20
          }
      );
    } else {
      this.variablePaieItemList.splice(5, 0,
          {
            label: this.translator.translate('GDH.PAY.VARIABLE_SP25'),
            value: VariablePayeEnum.SP25
          }
      );
    }
  }

  public showMenuControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  public addControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateListControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }


  public deleteVariablePaie(index: number): void {
    if (!isNaN(Number(this.listVariablePaieByRestaurant[index].idVariablesPayes))) {
      this.listVariablePaieByRestaurantToDelete.push(Number(this.listVariablePaieByRestaurant[index].idVariablesPayes));
    }
    this.listVariablePaieByRestaurant.splice(index, 1);
  }

  public addVariablePaie(): void {
    const newVariablePaye = new VariablesPayesModel();
    newVariablePaye.newVariable = true;
    this.makeUniqueId(newVariablePaye);
    this.isNewVariable = true;
    this.listVariablePaieByRestaurant.push(newVariablePaye);

  }

  public generateFile(): void {
    this.generateInterfacePayFile.emit();
  }

  public updateListVariablePaye(skipCheck: boolean, displayMessage?: boolean): void {
    if (!this.isSameList()) {
      if (skipCheck) {
        this.listVariablePaieByRestaurant.forEach(item => {
          if (isNaN(Number(item.idVariablesPayes))) {
            item.idVariablesPayes = 0;
          }
        });
        this.deleteListVariablePaie(displayMessage);
      } else {
        if (this.canUpdateListVariablePaye()) {
          this.updateListVariablePaye(true, true);
          this.isNewVariable = false;
        }
      }
    }
  }

  public canUpdateListVariablePaye(): boolean {
    this.resetErrorMessages();
    return this.checkEmptyValues() && this.checkDuplicatedVariablePaye();
  }

  public isSameList(): boolean {
    if (this.defaultListVariablePaieByRestaurant.length !== this.listVariablePaieByRestaurant.length) {
      return false;
    }
    let same = true;
    this.defaultListVariablePaieByRestaurant.forEach((item, index) => {
      if (JSON.stringify(this.listVariablePaieByRestaurant[index]) !== JSON.stringify(this.defaultListVariablePaieByRestaurant[index])) {
        same = false;
      }
    });
    return same;
  }

  private getVariablePaieByRestaurant(): void {
    this.paieService.getVariablePaieByRestaurant().subscribe(
      (data: VariablesPayesModel[]) => {
        if (this.showMenuControl()) {
          this.listVariablePaieByRestaurant = data;
        }
        this.defaultListVariablePaieByRestaurant = JSON.parse(JSON.stringify(this.listVariablePaieByRestaurant));

      }, (err: any) => {
        console.log('error ', err);
      }
    );
  }

  private deleteListVariablePaie(displayMessage?: boolean): void {
    if (this.listVariablePaieByRestaurantToDelete.length === 0) {
      this.saveListVariablePaie(displayMessage);
    } else {
      this.paieService.deleteListeVariablePaie(this.listVariablePaieByRestaurantToDelete).subscribe(
        () => {
          this.saveListVariablePaie(displayMessage);
        }, (err: any) => {
          console.log('error ', err);
        }
      );
    }
  }

  private saveListVariablePaie(displayMessage?: boolean): void {
    this.paieService.updateVariablePaieByRestaurant(this.listVariablePaieByRestaurant).subscribe(
      (data: VariablesPayesModel[]) => {
        this.listVariablePaieByRestaurant = data;
        this.defaultListVariablePaieByRestaurant = JSON.parse(JSON.stringify(this.listVariablePaieByRestaurant));
      }, (err: any) => {
        console.log('error ', err);
      }, () => {
        if (displayMessage) {
          this.notificationService.showSuccessMessage('GDH.PAY.VARIABLE_LIST_UPDATED');
        }
      }
    );
  }

  private resetErrorMessages(): void {
    this.listVariablePaieByRestaurant.forEach(item => {
      item.wrongValueEmpty = false;
      item.wrongValueDuplicated = false;
    });
  }

  private checkDuplicatedVariablePaye(): boolean {
    let noDuplicatedValues = true;
    this.listVariablePaieByRestaurant.forEach(item => {
      this.listVariablePaieByRestaurant.forEach(variablePaie => {
        if ((item.idVariablesPayes !== variablePaie.idVariablesPayes) && (item.codePaye && variablePaie.codePaye) && (item.codePaye.toUpperCase() === variablePaie.codePaye.toUpperCase())) {
          item.wrongValueDuplicated = true;
          item.wrongValueEmpty = false;
          noDuplicatedValues = false;
        }
      });
    });
    return noDuplicatedValues;
  }

  private checkEmptyValues(): boolean {
    let noEmptyValues = true;
    this.listVariablePaieByRestaurant.forEach(item => {
      if (!item.codeMyRhis) {
        item.codeMyRhis = this.variablePaieItemList[0].value;
      }
      if (item.codePaye.trim().length === 0) {
        item.wrongValueEmpty = true;
        item.wrongValueDuplicated = false;
        noEmptyValues = false;
      }
    });

    return noEmptyValues;
  }

  /**
   * Cette méthode permet de générer un id unique pour une nouvelle variable ajouté
   */
  private makeUniqueId(variablePaye: VariablesPayesModel): void {
    variablePaye.idVariablesPayes = this.createString();
    const index = this.listVariablePaieByRestaurant.findIndex(variablePayes => variablePaye.idVariablesPayes === variablePayes.idVariablesPayes);
    if (index !== -1) {
      this.makeUniqueId(variablePaye);
    }
  }

  private createString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }
}
