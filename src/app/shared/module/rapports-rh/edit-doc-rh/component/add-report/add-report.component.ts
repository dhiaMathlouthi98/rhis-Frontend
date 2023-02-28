import {Component, ElementRef, ViewChild} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {Router} from '@angular/router';
import {RhisTranslateService} from '../../../../../service/rhis-translate.service';

@Component({
  selector: 'rhis-add-report',
  templateUrl: './add-report.component.html',
  styleUrls: ['./add-report.component.scss']
})
export class AddReportComponent {

  private employeeUuid: string;
  public showExtraInfo;
  public wrongFileTpye;
  private wordTypes = ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  public restaurantUuid: string;

  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(private confirmationService: ConfirmationService,
              private rhisTranslateService: RhisTranslateService,
              private router: Router) {
    const currentNavigation = this.router.getCurrentNavigation();
    const state = currentNavigation.extras.state;
    if (currentNavigation && state) {
      this.employeeUuid = state.employeeUuid;
      this.restaurantUuid = state.restaurantUuid;
    }
  }

  public uploadFile(event): void {
    this.showExtraInfo = false;
    const files: FileList = event.target.files;
    this.verifyReportImport(files.item(0));
    this.fileInput.nativeElement.value = '';
  }

  public getFilesFromDragAndDrop(file: File): void {
    this.showExtraInfo = false;
    if (this.checkFileType(file.type)) {
      this.verifyReportImport(file);
    }
  }

  private checkFileType(type: string): boolean {
    if (!this.wordTypes.includes(type)) {
      this.wrongFileTpye = true;
      this.showExtraInfo = true;
      return false;
    }
    return true;
  }

  public showUploadFileMessage(state: boolean): void {
    this.wrongFileTpye = false;
    this.showExtraInfo = state;
  }

  public verifyReportImport(file: File): void {
    this.confirmationService.confirm({
      header: this.rhisTranslateService.translate('REPORT.REPORT_IMPORT'),
      message: this.rhisTranslateService.translate('REPORT.IMPORT_REQUEST') +
        file.name + this.rhisTranslateService.translate('REPORT.TO_CREATE_REPORT'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      key: 'edit-doc',
      accept: () => {
        if (this.restaurantUuid) {
          this.router.navigate([`/parc/edit-doc-rh/newReport/${this.restaurantUuid}`], {state: {file: file}});
        } else {
          this.router.navigate([`/home/edit-doc-rh/employee/${this.employeeUuid}/new`], {state: {file: file}});
        }
      }
    });
  }
}
