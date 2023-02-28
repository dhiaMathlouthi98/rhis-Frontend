import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RhisTranslateService } from 'src/app/shared/service/rhis-translate.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';

@Component({
  selector: 'rhis-print-voucher',
  templateUrl: './print-voucher.component.html',
  styleUrls: ['./print-voucher.component.scss']
})
export class PrintVoucherComponent implements OnInit, OnChanges {
 
  public bonTitle: string;
  public bonContent: string;
  public actualDate: String;
  public actualTime: string;
  @Input()
  public bonInfo: any;
  constructor(private rhisTranslateService: RhisTranslateService, private route: ActivatedRoute, private datePipe: DatePipe) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.bonInfo && changes.bonInfo.currentValue) {
      this.bonInfo = changes.bonInfo.currentValue;
      this.actualDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
      this.actualTime  = this.datePipe.transform(new Date(), 'HH:mm');
      this.bonTitle = this.rhisTranslateService.translate(this.bonInfo.absenceType === 'Retard' ? 'GDH.PRINT_BON.BON_RETARD' : 'GDH.PRINT_BON.BON_DEPART');
      if(this.bonInfo.absenceType === 'Retard'){
        this.bonTitle =  this.rhisTranslateService.translate('GDH.PRINT_BON.BON_RETARD');
        this.bonContent =  this.rhisTranslateService.translate('GDH.PRINT_BON.TEXT4');
      } else {
        this.bonTitle = this.rhisTranslateService.translate('GDH.PRINT_BON.BON_DEPART');
        this.bonContent =  this.rhisTranslateService.translate('GDH.PRINT_BON.TEXT2');
      }
      setTimeout(() => {
        this.captureScreen();
      }, 3000);
    }
  }
  /**
   * Transformation en PDF
   */
  public async captureScreen(): Promise<void>{
       const pdf = new jspdf('p', 'mm', 'a4');
       const data_page1 = document.getElementById('voucher');
       await html2canvas(data_page1).then(async canvas => {
        const imgWidth = 194;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        pdf.addImage(contentDataURL, 'PNG', 10, 0, imgWidth, imgHeight);
        pdf.autoPrint({variant: 'non-conform'});
        window.open(pdf.output('bloburl'), '_blank');  
      });
  }
}
