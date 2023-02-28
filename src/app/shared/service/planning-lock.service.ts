import {Injectable} from '@angular/core';
import {UtilisateurService} from '../../modules/admin/utilisateur/service/utilisateur.service';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from './rhis-translate.service';
import {SessionService} from './session.service';
import {MyRhisUserModel} from '../model/MyRhisUser.model';
import {PlanningEquipierService} from '../../modules/home/planning/planning-equipier/service/planning-equipier.service';
import {PlanningModel} from '../model/planning.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningLockService {

  constructor(private utilisateurService: UtilisateurService,
              private confirmationService: ConfirmationService,
              private rhisTranslateService: RhisTranslateService,
              private sessionService: SessionService,
              private planningService: PlanningEquipierService) {
  }

  public setPlanningLocker(NameLocker: string): void {
    localStorage.setItem('plgLocker', btoa(NameLocker));
  }

  public getPlanningLocker(): string {
    return atob(localStorage.getItem('plgLocker'));
  }


  public async checkLocker(lockeruuid: string): Promise<void> {
    if (localStorage.getItem('plgLocker') !== null) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_MESSAGE') + this.getPlanningLocker(),
        header: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_TITLE'),
        acceptVisible: false,
        rejectVisible: false
      });
    } else {
      this.showPopUpLocked(lockeruuid);
    }
  }

  public async checkLockerByDate(date): Promise<boolean> {
    try {
      const planningWeek = await this.planningService.checkIfPlanningIsLocked(date).toPromise();
      if (planningWeek.uuidUserCloture) {
        this.showPopUpLocked(planningWeek.uuidUserCloture);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }

  }

  /**
   * verifier si le planning est verouillé ( planning.uuidUserCloture is not null)
   * @param date
   */
  public async checkLockWithoutPopUp(date): Promise<{ planning: PlanningModel, locked: boolean }> {
    try {
      const planningWeek = await this.planningService.checkIfPlanningIsLocked(date).toPromise();
      if (planningWeek.uuidUserCloture) {
        const user: MyRhisUserModel = await this.utilisateurService.getUserByUuid(planningWeek.uuidUserCloture).toPromise();
        this.setPlanningLocker(user.nom + ' ' + user.prenom);
        return {
          planning: planningWeek,
          locked: true
        };
      } else {
        return {
          planning: planningWeek,
          locked: false
        };
      }
    } catch (e) {
      return {
        planning: null,
        locked: false
      };
    }

  }

  private async showPopUpLocked(lockeruuid: string): Promise<void> {
    const user: MyRhisUserModel = await this.utilisateurService.getUserByUuid(lockeruuid).toPromise();
    this.setPlanningLocker(user.nom + ' ' + user.prenom);
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_MESSAGE') + user.nom + ' ' + user.prenom,
      header: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_TITLE'),
      acceptVisible: false,
      rejectVisible: false,
    });
  }

  public showPopOfLockedWeek(): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_MESSAGE') + this.getPlanningLocker(),
      header: this.rhisTranslateService.translate('PLANNING_HOME.LOCKED_TITLE'),
      acceptVisible: false,
      rejectVisible: false
    });
  }

}
