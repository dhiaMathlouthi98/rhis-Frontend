import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractValueAccessor, MakeProvider} from '../../../../class/abstract-value.accessor';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../validator/trim-validators';
import {GlobalSettingsService} from '../../../../service/global-settings.service';
import {RhisTranslateService} from "../../../../service/rhis-translate.service";

@Component({
  selector: 'rhis-add-form-restaurant',
  templateUrl: './add-form-restaurant.component.html',
  styleUrls: ['./add-form-restaurant.component.scss'],
  providers: [
    ...MakeProvider(AddFormRestaurantComponent)
  ]
})
export class AddFormRestaurantComponent extends AbstractValueAccessor implements OnInit, OnChanges {
  public nombreBadge: FormControl;
  public decalMoisJourControl: FormControl;
  @Input()
  public formConfig = {
    showNumBadgeField: true,
    readOnlyPays: false,
    readOnlyFranchise: false,
  };
  @Input()
  public badgeNumber;
  @Input()
  public decalMoisJourSign;
  @Input()
  public isFormSubmitted: boolean;
  @Input()
  public isLibelleExist;
  @Input()
  public isMatriculteExist;
  @Input()
  public isCodePointeuseExist;
  @Input()
  public listPays;
  @Input()
  public listFranchise;
  @Input()
  public currentLanguage;
  @Input()
  public societes;
  @Input()
  public franchises;
  @Input()
  public listTypeRestaurant;
  @Input()
  public listPeriodeRestaurant;
  @Input()
  public periodeRestaurantMoisDecale;
  @Input()
  public periodeRestaurantSemaineCompleteDecale;
  @Input()
  public societeConfig = {showFirst: false, readOnly: false};
  @Input()
  public franchiseConfig = {showFirst: false, readOnly: false};
  @Output()
  setDecalMoisJourSign = new EventEmitter<boolean>();
  @Output()
  setBadgeNumber = new EventEmitter<number>();

  public heightInterface: any;
  public dispoScrollable = false;
  public menuState = false;

  @Input()
  public listRestaurants;
  @Input()
  public displayFranchisePopup: boolean;
  @Output()
  public closeFranchisePopup = new EventEmitter<boolean>();
  @Output()
  public submitFranchisePopup = new EventEmitter<any>();

  public submitButtonText = '';
  public popupTitle = '';

  public firstLineText = '';
  public secondLineText = '';
  public errorText = '';


  constructor(private globalSettingsService: GlobalSettingsService, private rhisTranslateService: RhisTranslateService) {
    super();
  }

  ngOnInit() {
    this.menuState = this.globalSettingsService.menuIsOpen;
    this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
    this.globalSettingsService.onToggleMenu().subscribe(menuState => {
      this.menuState = menuState;
      if (!this.menuState) {
        setTimeout(() => {
          this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
        }, 500);
      } else {
        this.dispoScrollable = this.menuState || (window.screen.width !== window.innerWidth);
      }
    });
    this.initForm();
    this.setDefaultToErrorControlVariables();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isFormSubmitted) {
      this.isFormSubmitted = changes.isFormSubmitted.currentValue;
    }
    if (changes.isLibelleExist) {
      this.isLibelleExist = changes.isLibelleExist.currentValue;
    }
    if (changes.isMatriculteExist) {
      this.isMatriculteExist = changes.isMatriculteExist.currentValue;
    }
    if (changes.formConfig) {
      this.formConfig = changes.formConfig.currentValue;
    }
    if (changes.badgeNumber && changes.badgeNumber.currentValue) {
      if (this.nombreBadge) {
        this.nombreBadge.setValue(changes.badgeNumber.currentValue);
      }
    }
    if (changes.decalMoisJourSign && changes.decalMoisJourSign.currentValue !== undefined && this.decalMoisJourControl) {
      this.decalMoisJourControl.setValue(changes.decalMoisJourSign.currentValue);
      this.decalMoisJourControl.valueChanges.subscribe(sign => this.setDecalMoisJourSign.emit(sign));
    }
    if (changes.displayFranchisePopup) {
      this.submitButtonText = this.rhisTranslateService.translate('FRANCHISE.POPUP_ADD_RESTAURANT_BUTTON_TEXT');
      if (this.formGroup && this.formGroup.get('franchise').value.nom) {
        this.popupTitle = this.rhisTranslateService.translate('FRANCHISE.POPUP_ADD_RESTAURANT_TITLE') + this.formGroup.get('franchise').value.nom;
      }

      this.firstLineText = this.rhisTranslateService.translate('FRANCHISE.POPUP_ADD_RESTAURANT_FIRST_LINE_TEXT');
      this.secondLineText = this.rhisTranslateService.translate('FRANCHISE.POPUP_ADD_RESTAURANT_SECOND_LINE_TEXT');
      this.errorText = this.rhisTranslateService.translate('FRANCHISE.POPUP_ADD_RESTAURANT_ERROR');
    }
  }

  /**
   * Create restaurant form
   */
  private initForm(): void {
    this.nombreBadge = new FormControl(null, Validators.min(1));
    this.decalMoisJourControl = new FormControl(null);
    this.formGroup = new FormGroup({
      libelle: new FormControl(null,
        [
          Validators.required,
          Validators.maxLength(255),
          TrimValidators.trimValidator
        ]
      ),
      matricule: new FormControl(null,
        [
          Validators.required,
          Validators.maxLength(10),
          TrimValidators.trimValidator
        ]
      ),
      codeRestaurantExterne: new FormControl(null,
        [
          Validators.maxLength(10)]
      ),
      societe: new FormControl(null, Validators.required),
      franchise: new FormControl(null),
      adresse: new FormControl(null, Validators.maxLength(255)),
      codePostal: new FormControl(null, Validators.min(0)),
      telephone: new FormControl(null,
        [Validators.maxLength(20), Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$')]
      ),
      telephone2: new FormControl(null,
        [Validators.maxLength(20), Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$')]
      ),
      codeDebutMatricule: new FormControl(null,
        [Validators.maxLength(10)]
      ),
      numTVA: new FormControl(null, Validators.maxLength(255)),
      siret: new FormControl(null, Validators.maxLength(255)),
      codeAPE: new FormControl(null, Validators.maxLength(255)),
      numURSSAF: new FormControl(null, Validators.maxLength(255)),
      centreURSSAF: new FormControl(null, Validators.maxLength(255)),
      pointRassemblement: new FormControl(null),
      periodeRestaurant: new FormControl(null, Validators.required),
      valeurDebutMois: new FormControl(1,
        [Validators.min(0),
          Validators.max(16)]
      ),
      typeRestaurant: new FormControl(null, Validators.required),
      pays: new FormControl(null, Validators.required),
      ville: new FormControl(null, Validators.maxLength(255)),
      codePointeuse: new FormControl(null, Validators.maxLength(255)),
      occupationalHealthServiceCode: new FormControl(null, this.customMaxLengthValidator(10)),
    });
  }

  private customMaxLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regExp = /[^A-Za-z0-9]/g;
      const notAccepted = regExp.test(control.value);
      return control.value && ((control.value.length > length) || notAccepted ? {max: true} : null);
    };
  }

  /**
   * Reset value for variables that control the uniqueness error of `libelle` and `matricule`
   */
  private setDefaultToErrorControlVariables(): void {
    this.formGroup.get('libelle').valueChanges.subscribe(libelle => {
      if (this.isLibelleExist && this.isFormSubmitted) {
        this.isLibelleExist = false;
      }
    });
    this.formGroup.get('matricule').valueChanges.subscribe(matricule => {
      if (this.isMatriculteExist && this.isFormSubmitted) {
        this.isMatriculteExist = false;
      }
    });
    this.decalMoisJourControl.valueChanges.subscribe(sign => this.setDecalMoisJourSign.emit(sign));
    this.nombreBadge.valueChanges.subscribe(badgeNumber => this.setBadgeNumber.emit(badgeNumber));
  }

  /**
   * Check if period is `mois decale` or `semaine complète décalé` not, so you show/hide month start after/before how many days
   */
  public get isDecale(): boolean {
    const choosenPeriode = this.formGroup.get('periodeRestaurant').value;
    return (choosenPeriode === this.periodeRestaurantMoisDecale || choosenPeriode === this.periodeRestaurantSemaineCompleteDecale);
  }

  public closePopup(): void {
    this.closeFranchisePopup.emit(false);
  }

  public submit(event: any): void {
    this.displayFranchisePopup = false;
    this.submitFranchisePopup.emit(event.selectedElement.value);
  }

}
