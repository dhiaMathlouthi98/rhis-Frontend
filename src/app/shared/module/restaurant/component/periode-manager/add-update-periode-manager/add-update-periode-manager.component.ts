import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PeriodeManagerModel} from '../../../../../model/periode.manager.model';
import {ParametreModel} from '../../../../../model/parametre.model';
import {ParametreGlobalService} from '../../../../../../modules/home/configuration/service/param.global.service';

@Component({
  selector: 'rhis-add-update-periode-manager',
  templateUrl: './add-update-periode-manager.component.html',
  styleUrls: ['./add-update-periode-manager.component.scss']
})
export class AddUpdatePeriodeManagerComponent implements OnInit {

  public buttonTitle = '';

  public selectedPeriodeManager: PeriodeManagerModel;

  public limiteHeureDebut: Date;

  public limiteHeureFin: Date;

  public isNightValue: boolean;

  public checkHeureIsNight = '';
  private verificationNightIsRaised = false;
  private DISPLAY_MODE_CODE_NAME = 'MODE_24H';
  public modeAffichage = 0;
  public dateLimite = new Date();

  @Input()
  public set initPeriodeManager(periodeManager: PeriodeManagerModel) {
    this.selectedPeriodeManager = periodeManager;
  }

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  public set limitHeureDebut(limiteHeureDebut: Date) {
    this.limiteHeureDebut = limiteHeureDebut;
  }

  @Input()
  public set limitHeureFin(limiteHeureFin: Date) {
    this.limiteHeureFin = limiteHeureFin;
  }

  @Input()
  public set initDuplicatedLibelle(isDuplicated: boolean) {
    if (isDuplicated) {
      this.libellePeriodeManagerError = true;
      this.libellePeriodeManagerErrorMessage = 'PERIODE_MANAGER.EXIST';
    } else {
      this.libellePeriodeManagerError = false;
      this.libellePeriodeManagerErrorMessage = '';
    }
  }

  @Input()
  public set nightValue(nightValue: boolean) {
    if (nightValue !== null) {
      this.isNightValue = nightValue;
      this.verificationNightIsRaised = false;
      if (this.isNightValue) {
        if ((this.checkHeureIsNight === 'debut') && (!this.selectedPeriodeManager.dateDebutIsNight)) {
          this.selectedPeriodeManager.dateDebutIsNight = true;
        } else if ((this.checkHeureIsNight === 'fin') && (!this.selectedPeriodeManager.dateFinIsNight)) {
          this.selectedPeriodeManager.dateFinIsNight = true;
        }
      } else {
        if ((this.checkHeureIsNight === 'debut') && (this.selectedPeriodeManager.dateDebutIsNight)) {
          this.selectedPeriodeManager.dateDebutIsNight = false;
        } else if ((this.checkHeureIsNight === 'fin') && (this.selectedPeriodeManager.dateFinIsNight)) {
          this.selectedPeriodeManager.dateFinIsNight = false;
        }
      }
    }
  }

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdatePeriodeManagerEvent = new EventEmitter();

  @Output()
  public checkIfNightValueEvent = new EventEmitter();

  public libellePeriodeManagerError = false;
  public libellePeriodeManagerErrorMessage = '';

  public heureDebutPeriodeManagerError = false;
  public heureDebutPeriodeManagerErrorMessage = '';

  public heureFinPeriodeManagerError = false;
  public heureFinPeriodeManagerErrorMessage = '';

  constructor(private parametreService: ParametreGlobalService) {
  }

  ngOnInit() {
    this.getParamRestaurantByCodeNames();
    this.dateLimite.setHours(6);
    this.dateLimite.setMinutes(0);
    this.dateLimite.setSeconds(0);
    this.dateLimite.setMilliseconds(0);
  }

  public addOrUpdatePeriodeManager() {
    if (this.canAddUpdatePeriodeManager()) {
      this.addOrUpdatePeriodeManagerEvent.emit(this.selectedPeriodeManager);
    }
  }

  private getParamRestaurantByCodeNames(): void {
    const codeNamesAsArray = [this.DISPLAY_MODE_CODE_NAME];
    const codeNames = codeNamesAsArray.join(';');
    this.parametreService.getParamRestaurantByCodeNames(codeNames).subscribe(
      (data: ParametreModel[]) => {
        this.getDisplayMode24H(data);
      }
    );
  }

  public getDisplayMode24H(paramList: ParametreModel[]): void {
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DISPLAY_MODE_CODE_NAME);
    if (index !== -1) {
      this.modeAffichage = +paramList[index].valeur;
    }
  }

  private canAddUpdatePeriodeManager(): boolean {
    this.resetErrorMessages();
    this.setHoursInCorrectFormat();
    let canAddUpdate = true;
    if (this.modeAffichage === 0) {
      canAddUpdate = canAddUpdate && this.validLibellePeriodeManager() && this.validHeureDebutPeriodeManager() && this.validHeureFinPeriodeManager();
    } else {
      canAddUpdate = canAddUpdate && this.validLibellePeriodeManager() && this.setHeuresMode24();

    }

    return canAddUpdate;
  }

  private validLibellePeriodeManager(): boolean {
    if (this.selectedPeriodeManager.libelle.trim().length === 0) {
      this.libellePeriodeManagerError = true;
      this.libellePeriodeManagerErrorMessage = 'PERIODE_MANAGER.REQUIRED';
      return false;
    } else {
      return true;
    }
  }

  private validHeureDebutPeriodeManager(): boolean {
    if (this.selectedPeriodeManager.dateDebut) {
      if (this.selectedPeriodeManager.dateDebut > this.selectedPeriodeManager.dateFin) {
        this.heureDebutPeriodeManagerError = true;
        this.heureDebutPeriodeManagerErrorMessage = 'PERIODE_MANAGER.ERROR_heuredeb';
        return false;
      } else if (this.selectedPeriodeManager.dateDebut < this.limiteHeureDebut) {
        this.heureDebutPeriodeManagerError = true;
        this.heureDebutPeriodeManagerErrorMessage = 'PERIODE_MANAGER.ERROR_heuredebact';
        return false;
      } else {
        return true;
      }
    } else {
      this.heureDebutPeriodeManagerError = true;
      this.heureDebutPeriodeManagerErrorMessage = 'PERIODE_MANAGER.REQUIRED';
      return false;
    }
  }

  private setHeuresMode24(): boolean {
    if (this.selectedPeriodeManager.dateFin) {
      if (this.selectedPeriodeManager.dateDebut) {
        if (this.selectedPeriodeManager.dateDebut < this.dateLimite && this.selectedPeriodeManager.dateDebutIsNight) {
          this.selectedPeriodeManager.dateFinIsNight = true;
          return true;
        } else if (this.selectedPeriodeManager.dateDebut > this.selectedPeriodeManager.dateFin) {
          this.selectedPeriodeManager.dateFinIsNight = true;
          return true;
        } else {
          return true;
        }
      } else {
        this.heureDebutPeriodeManagerError = true;
        this.heureDebutPeriodeManagerErrorMessage = 'PERIODE_MANAGER.REQUIRED';
        return false;
      }
    } else {
      this.heureFinPeriodeManagerError = true;
      this.heureFinPeriodeManagerErrorMessage = 'PERIODE_MANAGER.REQUIRED';
      return false;
    }
  }

  private validHeureFinPeriodeManager(): boolean {
    if (this.selectedPeriodeManager.dateFin) {
      if (this.selectedPeriodeManager.dateFin < this.selectedPeriodeManager.dateDebut) {
        this.heureFinPeriodeManagerError = true;
        this.heureFinPeriodeManagerErrorMessage = 'PERIODE_MANAGER.ERROR_heuredeb';
      } else if (this.selectedPeriodeManager.dateFin > this.limiteHeureFin) {
        this.heureFinPeriodeManagerError = true;
        this.heureFinPeriodeManagerErrorMessage = 'PERIODE_MANAGER.ERROR_heurefinact';
      } else {
        return true;
      }
    } else {
      this.heureFinPeriodeManagerError = true;
      this.heureFinPeriodeManagerErrorMessage = 'PERIODE_MANAGER.REQUIRED';
      return false;
    }

  }

  private resetErrorMessages() {
    this.libellePeriodeManagerError = false;
    this.libellePeriodeManagerErrorMessage = '';

    this.heureDebutPeriodeManagerError = false;
    this.heureDebutPeriodeManagerErrorMessage = '';

    this.heureFinPeriodeManagerError = false;
    this.heureFinPeriodeManagerErrorMessage = '';
  }

  public validerHeureNuit(heureDebut: boolean) {
    if (this.modeAffichage === 0) {
      let heureToVerify: Date;
      if (heureDebut) {
        this.checkHeureIsNight = 'debut';
        heureToVerify = this.selectedPeriodeManager.dateDebut;
      } else {
        this.checkHeureIsNight = 'fin';
        heureToVerify = this.selectedPeriodeManager.dateFin;
      }
      if (heureToVerify.getHours() >= 0 && (heureToVerify.getHours() <= this.limiteHeureFin.getHours() && ((heureToVerify.getHours() < this.limiteHeureDebut.getHours()) || this.limiteHeureFin.getHours() === this.limiteHeureDebut.getHours()))) {
        if (!this.verificationNightIsRaised) {
          this.verificationNightIsRaised = true;
          this.checkIfNightValueEvent.emit();
        }
      } else {
        if (heureDebut) {
          if (this.selectedPeriodeManager.dateDebutIsNight) {
            this.selectedPeriodeManager.dateDebut.setDate(this.selectedPeriodeManager.dateDebut.getDate() - 1);
          }
          this.selectedPeriodeManager.dateDebutIsNight = false;
        } else {
          if (this.selectedPeriodeManager.dateFinIsNight) {
            this.selectedPeriodeManager.dateFin.setDate(this.selectedPeriodeManager.dateFin.getDate() - 1);
          }
          this.selectedPeriodeManager.dateFinIsNight = false;
        }
      }
    } else {
      this.validerHeureNuitMode24(heureDebut);
    }
  }

  public validerHeureNuitMode24(heureDebut: boolean) {
    let heureToVerify: Date;
    if (heureDebut) {
      this.checkHeureIsNight = 'debut';
      heureToVerify = this.selectedPeriodeManager.dateDebut;
    } else {
      this.checkHeureIsNight = 'fin';
      heureToVerify = this.selectedPeriodeManager.dateFin;
    }

    if (heureToVerify.getHours() >= 0 && (heureToVerify.getHours() < this.dateLimite.getHours())) {
      if (!this.verificationNightIsRaised) {
        this.verificationNightIsRaised = true;
        this.checkIfNightValueEvent.emit();
      }
    } else {
      if (heureDebut) {
        if (this.selectedPeriodeManager.dateDebutIsNight) {
          this.selectedPeriodeManager.dateDebut.setDate(this.selectedPeriodeManager.dateDebut.getDate() - 1);
        }
        this.selectedPeriodeManager.dateDebutIsNight = false;
      } else {
        if (this.selectedPeriodeManager.dateFinIsNight) {
          this.selectedPeriodeManager.dateFin.setDate(this.selectedPeriodeManager.dateFin.getDate() - 1);
        }
        this.selectedPeriodeManager.dateFinIsNight = false;
      }
    }
  }

  private setHoursInCorrectFormat(): void {
    const correctDateDebut = new Date();
    correctDateDebut.setHours(this.selectedPeriodeManager.dateDebut.getHours());
    correctDateDebut.setMinutes(this.selectedPeriodeManager.dateDebut.getMinutes());
    correctDateDebut.setSeconds(0);
    correctDateDebut.setMilliseconds(0);

    const correctDateFin = new Date();
    correctDateFin.setHours(this.selectedPeriodeManager.dateFin.getHours());
    correctDateFin.setMinutes(this.selectedPeriodeManager.dateFin.getMinutes());
    correctDateFin.setSeconds(0);
    correctDateFin.setMilliseconds(0);


    if (this.selectedPeriodeManager.dateDebutIsNight) {
      correctDateDebut.setDate(correctDateDebut.getDate() + 1);
    }
    if (this.selectedPeriodeManager.dateFinIsNight) {
      correctDateFin.setDate(correctDateFin.getDate() + 1);
    }
    this.selectedPeriodeManager.dateDebut = correctDateDebut;
    this.selectedPeriodeManager.dateFin = correctDateFin;

  }
}
