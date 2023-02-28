import {Component, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {ParametreNationauxComponent} from './parametre-nationaux/parametre-nationaux.component';
import { RhisTranslateService } from 'src/app/shared/service/rhis-translate.service';
import { DomControlService } from 'src/app/shared/service/dom-control.service';


@Component({
  selector: 'rhis-parametre-restaurant',
  templateUrl: './parametre-restaurant.component.html',
  styleUrls: ['./parametre-restaurant.component.scss']
})
export class ParametreRestaurantComponent {

  @ViewChild(ParametreNationauxComponent) parametreNationauxComponent;

  public parametreNationauxComponentNotChanged = false;

  public navigateAway: Subject<boolean> = new Subject<boolean>();

  public heightInterface: any;
  private ecran = 'GPN';
 

  constructor(private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService) {
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */
  public canDeactivate(): boolean {
    if (this.SaveButtonControl()) {
      this.parametreNationauxComponentNotChanged = this.parametreNationauxComponent.compareObjects();
    } else {
      this.parametreNationauxComponentNotChanged = true;
    }
    return this.parametreNationauxComponentNotChanged;

  }

  public SaveButtonControl(): boolean {
    return this.domControlService.updateListControl(this.ecran);
  }

  /**
   * Launch all updates for the restaurant parameters
   */
  private updateParametres() {
    if (!this.parametreNationauxComponentNotChanged) {
      this.parametreNationauxComponent.updateParamNat();
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateParametres();
        setTimeout(() => this.navigateAway.next(true), 1500);
      },
      reject: () => {
        this.navigateAway.next(true);
      }
    });
    return this.navigateAway;
  }
}
