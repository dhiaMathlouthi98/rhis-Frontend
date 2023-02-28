import { DatePipe } from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import { forkJoin } from 'rxjs';
import { EnvoiService } from 'src/app/modules/parc/services/envoi.service';
import { RapportPaieEnum } from 'src/app/shared/model/parametreRapport';
import { RhisTranslateService } from 'src/app/shared/service/rhis-translate.service';
import { ParametreGlobalService } from '../../../configuration/service/param.global.service';
import { ValidationPaieService } from '../../service/validation-paie.service';

@Component({
  selector: 'rhis-onglet-validation',
  templateUrl: './onglet-validation.component.html',
  styleUrls: ['./onglet-validation.component.scss']
})
export class OngletValidationComponent implements OnInit , OnChanges, OnDestroy {
public envoiParamExists = true;
@Input() public paramEnvoiUuid: string;
@Input() public selectedPeriodFrom: Date;
@Input() public selectedPeriodTo: Date;
@Output() public checkDeltaAndValidatePaye = new EventEmitter();
@Output() public sendChosenReports = new EventEmitter<any[]>();
@Output() public downloadChosenReports = new EventEmitter<any[]>();
public isPeriodValidated = true;
public reportList = [
  {name: this.rhisTranslateService.translate('GDH.PAY.WEEK_VIEW_REPORT'),code : RapportPaieEnum.GDH_WEEK_VIEW,  disabled: false, value:false},
  {name: this.rhisTranslateService.translate('GDH.PAY.PERIOD_VIEW_REPORT'),code : RapportPaieEnum.GDH_PERIOD_VIEW, disabled: false, value:false},
  {name: this.rhisTranslateService.translate('GDH.PAY.ACTIF_EMPLOYEES_REPORT'),code : RapportPaieEnum.ACTIF_EMPLOYEES_LIST, disabled: false, value:false}
];
public chosenReports : any[];
public reportListDisplay: any[];
public systemParam: string;
private readonly NOMEDITEUR_CODE = 'NOMEDITEUR';

  constructor(private rhisTranslateService: RhisTranslateService,
    private validationPayService: ValidationPaieService,
    private datePipe: DatePipe,
    private envoiParamService: EnvoiService,
    private parametreGlobalService: ParametreGlobalService) { }

   ngOnInit() {

  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if(changes.selectedPeriodFrom && changes.selectedPeriodFrom.currentValue){
      this.selectedPeriodFrom = changes.selectedPeriodFrom.currentValue;
      this.selectedPeriodTo = changes.selectedPeriodTo.currentValue;
      this.requestFromMultipleSources();
    }

  }
  private  requestFromMultipleSources(): void{
    const startDate = this.datePipe.transform(this.selectedPeriodFrom, 'dd-MM-yyyy');
    const endDate = this.datePipe.transform(this.selectedPeriodTo, 'dd-MM-yyyy');
    const parametreRapport = this.envoiParamService.checkParametreEnvoiWithValidationFrequency();
    const isPeriodValidated =  this.validationPayService.checkPeriodPaieValidated(startDate, endDate);
    forkJoin([parametreRapport, isPeriodValidated])
      .subscribe(async responseList => {
        this.isPeriodValidated = responseList[1];
        this.systemParam = (await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.NOMEDITEUR_CODE).toPromise()).valeur;
        if(this.systemParam && !this.reportList.find(report=> report.code === RapportPaieEnum.PAYROLL_INTEGRATION)){
          this.reportList.splice(2,0, {name: this.rhisTranslateService.translate('GDH.PAY.PAY_INTEGRATION_REPORT'), code : RapportPaieEnum.PAYROLL_INTEGRATION, disabled: false, value:false});
        }
        if(responseList[0] && responseList[0].rapportPaieEnum.length){
            this.reportList.forEach((report: any)=>{
              report.disabled = true;
              if(responseList[0].rapportPaieEnum.find((val: any)=>val === report.code)){
                report.value = true;
              }
            });
            this.paramEnvoiUuid = responseList[0].uuid;
          } else {
            this.paramEnvoiUuid = null;
          }
        this.reportListDisplay = this.reportList;
        this.chosenReports = this.reportListDisplay.filter((report : any)=> report.value);
      }, async error=>{
        console.log(error);
        this.systemParam = (await this.parametreGlobalService.getParameterByRestaurantIdAndCodeParameter(this.NOMEDITEUR_CODE).toPromise()).valeur;
        if(this.systemParam && !this.reportList.find(report=> report.code === RapportPaieEnum.PAYROLL_INTEGRATION)){
          this.reportList.splice(2,0, {name: this.rhisTranslateService.translate('GDH.PAY.PAY_INTEGRATION_REPORT'), code : RapportPaieEnum.PAYROLL_INTEGRATION, disabled: false, value:false});
        }
        this.reportListDisplay = this.reportList;
      });
  }

  public downloadReports(): void {
    this.downloadChosenReports.emit(this.chosenReports);
  }

  public changeReportValue(): void {
    this.chosenReports = this.reportListDisplay.filter((report: any) => report.value);
    this.sendChosenReports.emit(this.chosenReports);
  }
  public validatePaye(): void{
    // Check delta and send chosen reports report
    this.checkDeltaAndValidatePaye.emit({paramEnvoiUuid : this.paramEnvoiUuid, chosenReports: this.chosenReports});
  }

  public ngOnDestroy(): void {
    this.isPeriodValidated = true;
  }

}
