import {Injectable} from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import {RhisTranslateService} from '../../../../../../../shared/service/rhis-translate.service';
import {WorkSheet} from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  fileName = this.rhisTranslateService.translate('Acceuil.performances') + '.xlsx';

  constructor(private rhisTranslateService: RhisTranslateService) {
  }

  public generateExcel(formattedDates: string[], perfValues: any, ecart: number[]) {
    const header = ['', this.tl('PERFORMANCES.DATE')].concat(formattedDates);
    const data = [
      [this.tl('PERFORMANCES.CHIFFRE_AFFAIRE'), this.tl('PERFORMANCES.CA_PREV')].concat(perfValues.caPrevisionnel.map(cap => cap.value + ' €')),
      ['', this.tl('PERFORMANCES.CA_REEL')].concat(perfValues.caReel.map(car => car.value + ' €')),
      ['', this.tl('PERFORMANCES.ANALYSE_ECART')].concat(ecart.map(e => e.toString() + ' %')),
      [],
      [this.tl('PERFORMANCES.PROD'), this.tl('PERFORMANCES.PROD_PREV')].concat(perfValues.prodPrevisionnel.map(pp => pp.value + ' €')),
      ['', this.tl('PERFORMANCES.PROD_REEL')].concat(perfValues.prodReel.map(pr => pr.value + ' €')),
      ['', this.tl('PERFORMANCES.PROD_REEL_12_14')].concat(perfValues.prodReelMidi.map(prm => prm.value + ' €')),
      ['', this.tl('PERFORMANCES.PROD_REEL_18_20')].concat(perfValues.prodReelSoir.map(prs => prs.value + ' €')),
      [],
      [this.tl('PERFORMANCES.MOE'), this.tl('PERFORMANCES.MOE_PREV')].concat(perfValues.moePrevisionnel.map(moep => moep.value + ' %')),
      ['', this.tl('PERFORMANCES.MOE_REEL')].concat(perfValues.moeReel.map(moer => moer.value + ' %')),
      ['', this.tl('PERFORMANCES.MOE_MANAGER_REEL')].concat(perfValues.moeReelManager.map(moerm => moerm.value + ' %')),
      ['', this.tl('PERFORMANCES.MOE_EQUIP_REEL')].concat(perfValues.moeReelEquipier.map(moere => moere.value + ' %')),
      [],
      [this.tl('PERFORMANCES.H_COMP'), this.tl('PERFORMANCES.CP10')].concat(perfValues.cp10.map(cp10 => cp10.value ? this.formatHeuresSuppComp(cp10.value) + ' h' : '')),
      ['', this.tl('PERFORMANCES.CP25')].concat(perfValues.cp25.map(cp25 => cp25.value ? this.formatHeuresSuppComp(cp25.value) + ' h' : '')),
      ['', this.tl('PERFORMANCES.SP25')].concat(perfValues.sp25.map(sp25 => sp25.value ? this.formatHeuresSuppComp(sp25.value) + ' h' : '')),
      ['', this.tl('PERFORMANCES.SP50')].concat(perfValues.sp50.map(sp50 => sp50.value ? this.formatHeuresSuppComp(sp50.value) + ' h' : '')),
      [],
      [this.tl('PERFORMANCES.ABS'), this.tl('PERFORMANCES.ABS_MATIN')].concat(perfValues.absenteismeMatin.map(absm => absm.value + ' %')),
      ['', this.tl('PERFORMANCES.ABS_SOIR')].concat(perfValues.absenteismeSoir.map(abss => abss.value + ' %')),
      ['', this.tl('PERFORMANCES.ABS_GLOBAL')].concat(perfValues.absenteismeGlobal.map(absg => absg.value + ' %')),
    ];
    const len = formattedDates.length + 2;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.tl('Acceuil.performances'));
    // Add Header Row
    const headerRow = worksheet.addRow(header);
    worksheet.addRow([]);
    headerRow.font = {bold: true };

    // Add Data and Conditional Formatting
    data.forEach(d => {
        const row = worksheet.addRow(d);
        row.getCell(2).font = {bold: true};
        row.getCell(len).font = {bold: true};
        if (d[1] === this.tl('PERFORMANCES.CA_REEL') || d[1] === this.tl('PERFORMANCES.PROD_REEL')
          || d[1] === this.tl('PERFORMANCES.MOE_REEL') || d[1] === this.tl('PERFORMANCES.ABS_GLOBAL')) {
          for (let i = 1; i <= len; i++) {
            row.getCell(i).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '9BBBDC' }
            };
          }
        }
      }
    );
    this.setColumnsWidth(worksheet);
    this.formatFirstColumn(worksheet, 'A3', 'A5');
    this.formatFirstColumn(worksheet, 'A7', 'A10');
    this.formatFirstColumn(worksheet, 'A12', 'A15');
    this.formatFirstColumn(worksheet, 'A17', 'A20');
    this.formatFirstColumn(worksheet, 'A22', 'A24');

    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, this.fileName);
    });
  }

  private tl(key: string): string {
    return this.rhisTranslateService.translate(key);
  }

  private formatHeuresSuppComp(value: number): string {
    if (value !== null) {
      return (value / 60).toFixed(2);
    }
    return null;
  }

  private formatFirstColumn(worksheet: WorkSheet, firstCell: string, lastCell: string): void {
    worksheet.mergeCells(firstCell + ':' + lastCell);
    worksheet.getCell(firstCell).alignment = {vertical: 'middle', horizontal: 'center'};
    worksheet.getCell(firstCell).font = { color: { argb: 'FFFFFF' }, bold: true};
    worksheet.getCell(firstCell).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '889ce3' }
    };
  }

  private setColumnsWidth(worksheet: WorkSheet) {
    worksheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength ) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 3;
    });
  }
}
