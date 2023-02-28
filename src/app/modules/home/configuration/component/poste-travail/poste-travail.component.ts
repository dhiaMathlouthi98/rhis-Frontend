import {Component, ViewChild} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {ConfirmationService} from 'primeng/api';
import {GestionPosteTravailComponent} from './gestion-poste-travail/gestion-poste-travail.component';
import {Observable, Subject} from 'rxjs';
import {AccordionTab} from 'primeng/primeng';
import {DomControlService} from '../../../../../shared/service/dom-control.service';

@Component({
  selector: 'rhis-poste-travail',
  templateUrl: './poste-travail.component.html',
  styleUrls: ['./poste-travail.component.scss']
})
export class PosteTravailComponent {

  @ViewChild(GestionPosteTravailComponent) gestionPosteTravailComponent;
  public navigateAway: Subject<boolean> = new Subject<boolean>();

  @ViewChild('positionTab') positionTab: AccordionTab;
  @ViewChild('groupementTab') groupementTab: AccordionTab;

  public goToGroupement = false;

  public posteTravail = 'EPT';
  public groupementPosteTravail = 'GGP';
  public heightInterface: any;

  constructor(private rhisTranslateService: RhisTranslateService,
              private confirmationService: ConfirmationService,
              private domControlService: DomControlService) {

  }

  public showAllowed(ecran: string): boolean {
    return this.domControlService.showControl(ecran);
  }

  /**
   * Check if deactivation can be launched or not based on data modification
   */


  public canDeactivate(): boolean {
    // the problem was that even when the 'groupement' tab is selected it tests if it is the same list or not (list of position travail)
    // in that case the 'GestionPosteTravailComponent' will be undefined and the isSameList() could not be launched
    // To solve that we already have the goToGroupement field which indicates TRUE if the 'groupement' tab is selected and false otherwise
    // We only should test the changes in the list of position travail only if the 'positionTab' is selected
    if (!this.goToGroupement) {
      return this.gestionPosteTravailComponent.isSameList();
    } else {
      return true;
    }
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(internChange?: any): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: async () => {
        await this.gestionPosteTravailComponent.updateAllListePositionTravail();
        if (internChange) {
          this.positionTab.selected = false;
          this.groupementTab.selected = internChange.openGroupementTab;
          this.goToGroupement = internChange.openGroupementTab;
        } else {
          this.navigateAway.next(true);
        }
      },
      reject: () => {
        if (internChange) {
          this.positionTab.selected = false;
          this.groupementTab.selected = internChange.openGroupementTab;
          this.goToGroupement = internChange.openGroupementTab;
        } else {
          this.navigateAway.next(true);
        }
      }
    });
    return this.navigateAway;
  }

  public openTab(indexTab: number) {
    if (indexTab === 1 && this.positionTab.selected) {
      if (!this.gestionPosteTravailComponent.isSameList()) {
        this.positionTab.selected = true;
        this.groupementTab.selected = false;
        this.saveContentBeforeDeactivation({
          'openGroupementTab': true
        });
      } else {
        this.positionTab.selected = false;
        this.groupementTab.selected = true;
        this.goToGroupement = true;
      }
    }
    if (indexTab === 0) {
      this.groupementTab.selected = false;
      this.goToGroupement = true;
      this.goToGroupement = false;
    }
    if (indexTab === 1 && !this.positionTab.selected) {
      this.groupementTab.selected = true;
      this.goToGroupement = true;
    }
  }

  public closeTab(indexTab: number) {
    if (indexTab === 0) {
      if (!this.gestionPosteTravailComponent.isSameList()) {
        this.positionTab.selected = true;
        this.saveContentBeforeDeactivation({
          'openGroupementTab': false
        });
      }
    }
  }

}
