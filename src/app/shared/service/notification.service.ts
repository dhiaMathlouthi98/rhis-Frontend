import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';
import {RhisTranslateService} from './rhis-translate.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public displaySpinner = false;

  constructor(public messageService: MessageService,
              private rhisTranslateService: RhisTranslateService) {
  }

  public startLoader() {
    this.displaySpinner = true;
  }

  public stopLoader() {
    this.displaySpinner = false;
  }

  /**
   * Show success notification message
   * @param: headerMessage
   * @param: bodyMessage
   */
  public showSuccessMessage(bodyMessage: string, headerMessage?: string) {
    this.showMessage('success', bodyMessage, headerMessage);
  }

  /**
   * Display a notification message
   * @param: severity
   * @param: bodyMessage
   * @param: headerMessage
   */
  public showMessage(severity: string, bodyMessage: string, headerMessage?: string) {
    this.messageService.add({
      severity: severity,
      summary: headerMessage ? this.rhisTranslateService.translate(headerMessage) : '',
      detail: this.rhisTranslateService.translate(bodyMessage),
    });
  }

  /**
   * Display a notification message with toast key
   * @param: severity
   * @param: bodyMessage
   * @param: headerMessage
   * @param: key
   */
  public showMessageWithToastKey(severity: string, bodyMessage: string, key: string, headerMessage?: string) {
    this.messageService.add({
      severity: severity,
      summary: headerMessage ? this.rhisTranslateService.translate(headerMessage) : '',
      detail: this.rhisTranslateService.translate(bodyMessage),
      key: key
    });
  }

  /**
   * Display a notification message
   * @param: severity
   * @param: bodyMessage
   * @param: extraOption
   * @param: headerMessage
   */
  private showMessageWithExtraOption(severity: string, bodyMessage: string, extraOption: number | string, headerMessage?: string) {
    this.messageService.add({
      severity: severity,
      summary: headerMessage ? this.rhisTranslateService.translate(headerMessage) : '',
      detail: this.rhisTranslateService.translate(bodyMessage) + extraOption,
    });
  }

  /**
   * Display a notification message without translate service
   * @param: severity
   * @param: bodyMessage
   * @param: headerMessage
   */
  public showMessageWithoutTranslateService(severity: string, bodyMessage: string, headerMessage?: string) {
    this.messageService.add({
      severity: severity,
      summary: headerMessage ? headerMessage : '',
      detail: bodyMessage,
    });
  }

  /**
   * Show error notification message
   * @param: headerMessage
   * @param: bodyMessage
   */
  public showErrorMessage(bodyMessage: string, headerMessage?: string) {
    this.showMessage('error', bodyMessage, headerMessage);
  }

  /**
   * Show error notification message
   * @param: headerMessage
   * @param: bodyMessage
   * @param: extraOption
   */
  public showErrorMessageWithExtraOption(bodyMessage: string, extraOption: string | number, headerMessage?: string) {
    this.showMessageWithExtraOption('error', bodyMessage, extraOption, headerMessage);
  }

  /**
   * Show info notification message
   * @param: headerMessage
   * @param: bodyMessage
   */
  public showInfoMessage(bodyMessage: string, headerMessage?: string) {
    this.showMessage('info', bodyMessage, headerMessage);
  }
}
