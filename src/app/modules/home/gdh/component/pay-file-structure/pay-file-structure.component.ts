import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ParametreGlobalService} from '../../../configuration/service/param.global.service';
import {ParametreModel} from '../../../../../shared/model/parametre.model';
import {PayeService} from '../../service/PayeService';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../../shared/service/date.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {PathService} from '../../../../../shared/service/path.service';
import {ParametersPayInterfaceEnum} from '../../../../../shared/enumeration/parameters-pay-interface.enum';
import {RubriqueParametreEnum} from '../../../../../shared/enumeration/rubrique-parametre.enum';
import {EncodageType} from '../../../../../shared/enumeration/encodage.enum';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-pay-file-structure',
  templateUrl: './pay-file-structure.component.html',
  styleUrls: ['./pay-file-structure.component.scss']
})
export class PayFileStructureComponent implements OnInit {
  public listEncodage: SelectItem[] = [
    {label: 'UTF-8', value: EncodageType.UTF_8},
    {label: 'UTF-16', value: EncodageType.UTF_16},
    {label: 'ISO-8859-1', value: EncodageType.ISO_8859_1},
    {label: 'ISO-8859-15', value: EncodageType.ISO_8859_15},
    {label: 'WINDOWS-1252', value: EncodageType.ANSI}
  ];
  public chosenSystem: string;
  public previousChoseSystem: string;
  public systems: SelectItem[] = [];
  public showFirstSystem = false;
  public schema: string;
  public schemaType: string;
  public listeParametres: ParametreModel[] = [];
  public defaultListeParametres: ParametreModel[] = [];
  public idRestaurant: any;
  public heightInterface: any;
  public header: { title: string; field: string; class: string }[];
  public showSchemaGenerator = false;
  private ecran = 'SFP';

  @Output()
  public changesDetector = new EventEmitter();
  public schemaTitle: string;

  constructor(private paramService: ParametreGlobalService,
              private payeService: PayeService,
              private rhisTranslateService: RhisTranslateService,
              private dateService: DateService,
              private pathService: PathService,
              private notificationService: NotificationService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService) {
  }

  /**
   * Create restaurant parameters table header
   */
  private initializeHeader(): void {
    this.header = [
      {title: this.rhisTranslateService.translate('PARAMS_GLOBAL.RUBRIQUE_LABEL'), field: 'rubrique', class: 'rubrique'},
      {title: this.rhisTranslateService.translate('PARAMS_GLOBAL.PARAM_LABEL'), field: 'param', class: 'param'},
      {title: this.rhisTranslateService.translate('PARAMS_GLOBAL.VALUE_LABEL'), field: 'valeur', class: 'value'}
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.idRestaurant = this.pathService.getIdRestaurant();
    this.initializeHeader();
    await this.getParams();
    await this.getSystemPaySystemParams();
    this.setSelectedPaySystem();
  }

  private setSelectedPaySystem(): void {
    const defaultPaySystemParam: ParametreModel = this.listeParametres.find((parameter: ParametreModel) => parameter.param === ParametersPayInterfaceEnum.NOMEDITEUR);
    if (defaultPaySystemParam) {
      const index = this.systems.findIndex((system: { label: string, value: string }) => system.value === defaultPaySystemParam.valeur);
      if (index !== -1) {
        const chosen = this.systems.splice(index, 1);
        this.systems = [...chosen, ...this.systems];
        this.chosenSystem = this.systems[0].label;
        this.previousChoseSystem = this.chosenSystem;
        this.showFirstSystem = true;
      }
    }
  }

  public showMenuControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }

  public updateListControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  public async updateRestaurantPaySystemParams(): Promise<void> {
    if (!this.isSameList()) {
      const newNomEditeurParameter = {
        rubrique: RubriqueParametreEnum.INTERFACEPAYE,
        valeur: this.chosenSystem,
        param: ParametersPayInterfaceEnum.NOMEDITEUR
      } as ParametreModel;
      const entrepriseParam: ParametreModel = await this.paramService.getParameterByRestaurantIdAndCodeParameter('ENTREPRISE').toPromise();
      this.listeParametres = this.replaceParamFromBy('ENTREPRISE', this.listeParametres, entrepriseParam);
      await this.paramService.updateParametersValuesByIdRestaurantAndParamAndRubrique([newNomEditeurParameter, ...this.listeParametres], RubriqueParametreEnum.INTERFACEPAYE);
      this.defaultListeParametres = JSON.parse(JSON.stringify(this.listeParametres));
      this.notificationService.showMessageWithToastKey('success', 'GDH.PAY.FILE_STRUCTURE_UPDATED', 'globalToast');
    }
  }

  private replaceParamFromBy(paramCode: string, params: ParametreModel[], newParam: ParametreModel): ParametreModel[] {
    const indexEntrepriseParam = params.findIndex(param => param.param.toUpperCase() === paramCode && param.rubrique.toUpperCase() === 'INTERFACE_PAYE');
    if (indexEntrepriseParam !== -1) {
      params.splice(indexEntrepriseParam, 1, newParam);
    }
    return params;
  }

  private async getSystemPaySystemParams(): Promise<void> {
    const systems: String[] = await this.payeService.getPaySystems().toPromise();
    systems.forEach((system: string) => this.systems.push({label: system, value: system}));
  }

  private async getParams(): Promise<void> {
    this.listeParametres = await this.paramService.getRestaurantPaySystem().toPromise();
    this.defaultListeParametres = JSON.parse(JSON.stringify(this.listeParametres));
    this.sortListParam();
  }

  public async showSystem(paySystem: string): Promise<void> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('GDH.PAY.VALID_SELECTION_PAY_SYSTEM_TEXT') + ' ' + paySystem,
      header: this.rhisTranslateService.translate('GDH.PAY.VALID_SELECTION_PAY_SYSTEM_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: async () => {
        this.previousChoseSystem = this.chosenSystem;
        this.listeParametres = await this.payeService.getParameterByPaySystems(paySystem).toPromise();
        this.listeParametres.forEach((param: ParametreModel) => delete param['logicielPaye']);
        this.sortListParam();
      },
      reject: () => {
        this.chosenSystem = this.previousChoseSystem;
      }
    });
  }

  public generateSchema(parameter: ParametreModel): void {
    if ([ParametersPayInterfaceEnum.SCHEMA.toString(), ParametersPayInterfaceEnum.SCHEMAABS.toString()].includes(parameter.param)) {
      const schemaParameter: ParametreModel = this.listeParametres.find((p: ParametreModel) => p.param === parameter.param);
      this.showSchemaGenerator = true;
      this.schema = schemaParameter.valeur;
      this.schemaType = parameter.param;
      if (this.schemaType === 'SCHEMAABS') {
        this.schemaTitle = this.rhisTranslateService.translate('GDH.PAY.SCHEMA_ABS');
      } else {
        this.schemaTitle = this.rhisTranslateService.translate('GDH.PAY.SCHEMA');
      }
    }
  }

  public updateSchema(schema: string): void {
    const indexOfSchemaParameter = this.listeParametres.findIndex((p: ParametreModel) => p.param === this.schemaType);
    if (indexOfSchemaParameter !== -1) {
      this.listeParametres[indexOfSchemaParameter].valeur = schema;
      this.showSchemaGenerator = false;
    }
  }

  public getSchemaRepresentation(schema: string): string {
    const schemaTable = schema.split(';');
    const displayedSchemaSection = schemaTable.slice(0, 2);
    let displayedSchema = displayedSchemaSection[0];
    displayedSchemaSection.forEach((item: string, index: number) => {
      if (index !== 0) {
        displayedSchema = displayedSchema + ' / ' + item;
      }
    });
    return displayedSchema + (schemaTable.length > displayedSchemaSection.length ? ' ...' : '');
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des parametres
   */
  public isSameList(): boolean {
    let same = true;
    this.listeParametres.forEach((parameter: ParametreModel) => {
      const param = this.defaultListeParametres.find((defaultParameter: ParametreModel) => (defaultParameter.param === parameter.param) && (defaultParameter.valeur === parameter.valeur));
      if (!param) {
        same = false;
      }
    });
    return same;
  }

  public setBooleanValue(param: ParametreModel): void {
    if (this.updateListControl()) {
      param.valeur = (!(param.valeur === 'true')).toString();
    }
  }

  private sortListParam(): void {
    this.listeParametres.sort(function (a: ParametreModel, b: ParametreModel) {
      if (a.param.toLowerCase() < b.param.toLowerCase()) {
        return -1;
      }
      if (a.param.toLowerCase() > b.param.toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }

  public include(items: string[], filter: string): boolean {
    return items.includes(filter);
  }

}
