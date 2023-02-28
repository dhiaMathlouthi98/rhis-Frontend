import {Component, Input, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import * as FileSaver from 'file-saver';
import {GenerateFilesService} from '../../../../../shared/service/generate.files.service';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {ConfirmationService} from 'primeng/api';
import {EmployeeService} from '../../service/employee.service';

@Component({
  selector: 'rhis-employee-fields-checkbox',
  templateUrl: './employee-fields-checkbox.component.html',
  styleUrls: ['./employee-fields-checkbox.component.scss']
})
export class EmployeeFieldsCheckboxComponent implements OnInit {

  public heightInterface = 200;


  public allThings = [];
  public fieldsToPrint = [];

  public displayConfirmDialog = true;

  public filterStatut = true;
  public filterStatut1 = true;
  public filterStatusFinal = 'Actif,Embauche';
  public filterName = '';

  @Input()
  set filterStatusFinalValue(filterStatut: string) {
    this.filterStatusFinal = filterStatut;
  }

  @Input()
  set filterStatusValue(filterStatut: boolean) {
    this.filterStatut = filterStatut;
  }

  @Input()
  set filterStatus1Value(filterStatut: boolean) {
    this.filterStatut1 = filterStatut;
  }

  @Input()
  set filterNameValue(filterName: string) {
    this.filterName = filterName;
  }


  constructor(private rhisTranslateService: RhisTranslateService, private generateFilesService: GenerateFilesService, private notificationService: NotificationService, private confirmationService: ConfirmationService, private employeeService: EmployeeService) {
  }

  ngOnInit() {
    this.fieldsToPrint = this.generateFilesService.fieldsToPrint;
    setTimeout(() => {
      this.selectInfo();
      this.openPersonalInfosBlock();
    }, 100);
  }

  private openPersonalInfosBlock(): void {
    this.displayHideSections('first-list-', this.fieldsToPrint[0].value, 1);
    this.displayHideSections('second-list-', this.fieldsToPrint[0].secondLevel[0].value, 1, 1);
  }

  /**
   * select les info à extraire dans le fichier excel
   */
  public selectInfo(): void {
    let nodeArray = (selector, parent = document) => [].slice.call(parent.querySelectorAll(selector));

    nodeArray = (selector, parent = document) => [].slice.call(parent.querySelectorAll(selector));


    this.fieldsToPrint.forEach((item: any) => {
      this.allThings.push(document.getElementById(item.value));
      if (item.secondLevel) {
        item.secondLevel.forEach((slv: any) => {
          this.allThings.push(document.getElementById(slv.value));
          if (slv.thirdLevel) {
            slv.thirdLevel.forEach((tlv: any) => {
              this.allThings.push(document.getElementById(tlv.value));
            });
          }
        });
      }
    });

    addEventListener('change', e => {
      let check = e.target as HTMLElement | any;

      if (this.allThings.indexOf(check) === -1) {
        return;
      }

      const children = nodeArray('input', check.parentElement);
      children.forEach(child => {
        child.indeterminate = false;
        child.checked = check.checked;
      });

      while (check) {
        const parent = (check.closest(['ul']).parentNode).querySelector('input');
        const siblings = nodeArray('input', parent.closest('li').querySelector(['ul']));
        const checkStatus = siblings.map(check => check.checked);
        const every = checkStatus.every(Boolean);
        const some = checkStatus.some(Boolean);
        parent.checked = every;
        parent.indeterminate = !every && every !== some;
        check = check !== parent ? parent : 0;
      }
    });
    this.setDefaultValues();
  }

  public generateExcelFileWithFields(opts?: { skip?: boolean, close?: boolean }): void {
    if (!opts) {
      const nom = document.getElementById('EMP.NOM') as HTMLInputElement;
      const prenom = document.getElementById('EMP.PRENOM') as HTMLInputElement;
      const matricule = document.getElementById('EMP.MATRICULE') as HTMLInputElement;
      const badge = document.getElementById('EMP.BADGE') as HTMLInputElement;
      if (!nom.checked && !prenom.checked && !matricule.checked && !badge.checked) {
        this.confirmationService.confirm({
          message: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONFIRMATION_MESSAGE'),
          header: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONFIRMATION_HEADER'),
          key: 'popupConfirmation',
          icon: 'pi pi-info-circle',
        });
        return;
      }
    }
    this.displayConfirmDialog = false;
    setTimeout(() => this.displayConfirmDialog = true, 100);
    if (opts && opts.close) {
      return;
    }
    this.notificationService.startLoader();
    const currentLangue = this.rhisTranslateService.currentLang;
    this.generateFilesService.generateExcelFileFromFields(currentLangue, {
      filterStatut: this.filterStatusFinal,
      filterName: this.filterName
    }, true).subscribe((data: any) => {
      this.generateFilesService.getFileByFileNameFromEmployeeService(data).subscribe(
        (fileData: any) => {
          FileSaver.saveAs(fileData, data);
        },
        (err: any) => {
          console.log(err);
          this.notificationService.stopLoader();
          // TODO
        }, () => {
          this.notificationService.stopLoader();
          this.notificationService.showSuccessMessage('EMPLOYEE.LISTE_EMPLOYEE_SUCCESS_DOWNLOAD');
        }
      );
    }, (err: any) => {

    });
  }

  private setDefaultValues(): void {
    const nom = document.getElementById('EMP.NOM') as HTMLInputElement;
    nom.checked = true;

    const prenom = document.getElementById('EMP.PRENOM') as HTMLInputElement;
    prenom.checked = true;

    const matricule = document.getElementById('EMP.MATRICULE') as HTMLInputElement;
    matricule.checked = true;

    const infoEmployee = document.getElementById('Information employé') as HTMLInputElement;
    infoEmployee.indeterminate = true;

    const infoPersonnel = document.getElementById('Information personnel') as HTMLInputElement;
    infoPersonnel.indeterminate = true;
  }

  public displayHideSections(className: string, elementId: string, index: number, secondLevelIndex?: number) {
    let el;
    if (secondLevelIndex) {
      el = document.getElementsByClassName((className + index + '-' + secondLevelIndex));
    } else {
      el = document.getElementsByClassName((className + index));
    }
    el[0].lastElementChild.classList.toggle('displayOnClick');
    let childElements = this.fieldsToPrint.filter(firstLevel => firstLevel.value === elementId)[0];
    if (childElements) {
      childElements.isOpen = el[0].lastElementChild.classList.contains('displayOnClick');
    } else {
      childElements = this.fieldsToPrint.filter(firstLevel => firstLevel.secondLevel.filter(secondLevel => secondLevel.value === elementId))[0];
      const secondLevelElement = childElements.secondLevel.filter(secondLevel => secondLevel.value === elementId)[0];
      if (secondLevelElement) {
        secondLevelElement.isOpen = el[0].lastElementChild.classList.contains('displayOnClick');
      }
    }
  }

  private addElementToMap(item: any, firstLevel: Map<any, any>, thirdLevel: boolean): void {
    let secondLevelElement;
    if (thirdLevel) {
      secondLevelElement = document.getElementById(item.attributes['data-parent'].value).attributes['data-parent'].value;
    } else {
      secondLevelElement = item.attributes['data-parent'].value;
    }
    let secondLevelMap = firstLevel.get(secondLevelElement);
    if (!secondLevelMap) {
      secondLevelMap = new Map();
    }
    if (thirdLevel) {
      let collection = secondLevelMap.get(item.attributes['data-parent'].value);
      if (collection) {
        collection.set(item.id, true);
      } else {
        collection = new Map();
        collection.set(item.id, true);
        secondLevelMap.set(item.attributes['data-parent'].value, collection);
      }
    } else {
      secondLevelMap.set(item.id, new Map());
    }
    firstLevel.set(secondLevelElement, secondLevelMap);
  }

}
