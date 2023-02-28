import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AbstractValueAccessor, MakeProvider} from '../../../../../../shared/class/abstract-value.accessor';
import {RhisTranslateService} from '../../../../../../shared/service/rhis-translate.service';
import {Sexe} from '../../../../../../shared/enumeration/Sexe.model';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {SharedEmployeeService} from '../../../service/sharedEmployee.service';
import {DpaeService} from '../../../service/dpae.service';
import {DPAEStateEnum, DpaeStatut} from '../../../../../../shared/model/gui/dpae.model';
import {ParametreModel} from '../../../../../../shared/model/parametre.model';
import {ParametreGlobalService} from '../../../../configuration/service/param.global.service';
import {NotificationService} from '../../../../../../shared/service/notification.service';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';


declare var $: any;

@Component({
  selector: 'rhis-coordonnees',
  templateUrl: './coordonnees.component.html',
  styleUrls: ['./coordonnees.component.scss'],
  providers: [
    ...MakeProvider(CoordonneesComponent)
  ]
})
export class CoordonneesComponent extends AbstractValueAccessor implements OnInit, OnChanges {
  public maxDateNaissance;
  public pays;
  public sexEnum;
  @Input() statutAutoTravailTitreSejour;
  @Input() listBadge;
  @Input() listPays;

  @Input() onSubmit;

  // lors de clique sur le buttin save employe
  @Input() set Submit(data: boolean) {
    if (data) {
      if (this.isDPAEActif) {
        this.notificationService.startLoader();
        this.dpaeService.checkStatut(this.sharedEmployeeService.selectedEmployee.uuid).subscribe((newData: DpaeStatut) => {
          this.dpaeStatut = newData;
          this.notificationService.stopLoader();
        });
      }
    }
  }

  @Input() unicite;
  @Input() hiddenBadge;
  @Output() apiResponse = new EventEmitter();
  public mailAdess: String;
  public dateSaisie: Date;
  public debutCodeMatricule: string;
  public dpaeStatut = {} as DpaeStatut;
  public popupVisibility = false;
  public pop_up_dape_title = '';
  public popUpStyle = {
    height: 700,
    width: 450
  };
  public DPAE_PARAMETRE = 'DPAE';
  public isDPAEActif = false;
  public ecran = 'ELE';
  /**
   * Css class selectors for styling in error case
   */
  public selectors = {
    calendarSelector: '.ui-inputtext.ui-widget',
    dropDownSelector: '.ui-dropdown',
    checkboxSelector: '.ui-chkbox-box.ui-widget '
  };

  constructor(private rhisTranslateService: RhisTranslateService, private sharedEmployeeService: SharedEmployeeService
    , private dpaeService: DpaeService, private parametreService: ParametreGlobalService,
              private notificationService: NotificationService,
              private domControlService: DomControlService ) {
    super();

  }


  public showButtonControl(): boolean {
    return this.domControlService.showControl(this.ecran);
  }


  async ngOnInit() {
    this.sexEnum = [
      {
        label: this.rhisTranslateService.translate('LABELS.MALE'),
        value: Sexe.MASCULIN
      }, {
        label: this.rhisTranslateService.translate('LABELS.FEMALE'),
        value: Sexe.FEMININ
      },
    ];

    this.formGroup = new FormGroup(
      {
        nom: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
        prenom: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
        dateNaissance: new FormControl('', [Validators.required]),
        sexe: new FormControl('', [Validators.required]),
        matricule: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
        email: new FormControl('', [Validators.pattern('(^$|(?:[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\]))')]),
        badge: new FormControl(''),
        dateEntree: new FormControl(null, [Validators.required]),
        requiredDateAnciennete: new FormControl(false),
        numTelephone: new FormControl('', [Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$'), Validators.maxLength(20)]),
        nationalite: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
        finValiditeSejour: new FormControl(''),
        adresse: new FormControl(''),
        complAdresse: new FormControl(''),
        codePostal: new FormControl(''),
        ville: new FormControl(''),
        finValiditeAutorisationTravail: new FormControl(''),
        nomPermisTravailCarteSejour: new FormControl('', [Validators.maxLength(30)]),
        numPermisTravailCarteSejour: new FormControl('', [Validators.maxLength(30)]),
        villeNaissance: new FormControl('', [Validators.maxLength(30)]),
        paysNaissance: new FormControl(''),
        codePostalNaissance: new FormControl('', [Validators.maxLength(30)]),
        handicap: new FormControl(''),

      });
    if (!this.sharedEmployeeService.selectedEmployee.idEmployee) {
      this.formGroup.controls['dateEntree'].clearValidators();
    }

    // l'employe doit etre superieure a 16 ans
    const date = new Date();
    const year = date.getFullYear() - 16;
    const month = date.getMonth() + 1; // January is 0
    const day = date.getDate();
    this.maxDateNaissance = new Date();
    this.maxDateNaissance.setFullYear(year);
    this.maxDateNaissance.setMonth(month);
    this.maxDateNaissance.setDate(day);
    const dateField = this.formGroup.controls['dateNaissance'];
    dateField.valueChanges.subscribe(value => {
      if (value && (value > this.maxDateNaissance)) {
        this.formGroup.controls['dateNaissance'].setErrors({'maxDate': true});
      }
    });

    // check for DPAE
    if (await this.checkParametreDPAE()) {
      if (this.sharedEmployeeService.selectedEmployee.uuid) {
        this.notificationService.startLoader();
        this.dpaeService.checkStatut(this.sharedEmployeeService.selectedEmployee.uuid).subscribe((data: DpaeStatut) => {
          this.dpaeStatut = data;
          this.notificationService.stopLoader();
        }, err => {
          this.notificationService.stopLoader();
        });
      }
    }
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.listBadge) {
      this.listBadge = changes.listBadge.currentValue.sort((a, b) => +a.code - b.code);
    }
    if (changes.listPays) {
      this.listPays = changes.listPays.currentValue;
      if (this.listPays) {
        this.listPays.forEach(pays => {
          pays.libellePays = pays.libelleFR;
        });
      }
    }
    if (changes.unicite) {
      this.unicite = changes.unicite.currentValue;
    }
    if (changes.statutAutoTravailTitreSejour) {
      this.statutAutoTravailTitreSejour = changes.statutAutoTravailTitreSejour.currentValue;
    }
  }

  /**
   * recuperer le sexe de l'employee
   ** @param :value
   */
  public setSex(state, value) {
    this.formGroup.patchValue({
      sexe: [state ? value : this.getOtherValue(value)]
    });
  }

  public getOtherValue(value): string {
    return value === Sexe.FEMININ ? Sexe.MASCULIN : Sexe.FEMININ;
  }

  /* selon la nationalite l"employee doit avoir un titre de sejour ou autorisation de trail ou le deux en meme temps
   */
  onSelectNationalite() {
    this.pays = this.formGroup.value['nationalite'];
    this.statutAutoTravailTitreSejour.autorisationTravail = false;
    this.statutAutoTravailTitreSejour.titreSejour = false;
    if (this.pays.titreSejour && this.pays.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = true;
      this.statutAutoTravailTitreSejour.titreSejour = true;
    }
    if (!this.pays.titreSejour && this.pays.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = true;
      this.statutAutoTravailTitreSejour.titreSejour = false;
    }
    if (this.pays.titreSejour && !this.pays.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = false;
      this.statutAutoTravailTitreSejour.titreSejour = true;
    }
    this.apiResponse.emit(this.statutAutoTravailTitreSejour);
  }

  async checkParametreDPAE() {
    const paramList: ParametreModel[] = await this.parametreService.getParamRestaurantByCodeNames(this.DPAE_PARAMETRE).toPromise();
    const index = paramList.findIndex((param: ParametreModel) => param.param === this.DPAE_PARAMETRE);
    if (index !== -1) {
      this.isDPAEActif = paramList[index].valeur !== 'false';
      return this.isDPAEActif;
    }
    return false;
  }

  showDPAE_popup(): void {
    this.popupVisibility = true;
    if (this.dpaeStatut.statut === DPAEStateEnum.NOT_YET_WITH_COMPLETE_INFOS
      || (this.dpaeStatut.statut === DPAEStateEnum.REJECTED
        && this.dpaeStatut.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
      this.pop_up_dape_title = this.rhisTranslateService.translate('DPAE.TITLE_RECAP');
    }

    if (this.dpaeStatut.statut === DPAEStateEnum.NOT_YET_WITH_MISSED_INFOS
      || (this.dpaeStatut.statut === DPAEStateEnum.REJECTED && !this.dpaeStatut.dpaeFieldsStateDto.allRequiredFieldsPresent)) {
      this.pop_up_dape_title = this.rhisTranslateService.translate('DPAE.TITLE_MANQUANT');
    }
  }

  updateDPAE(event: DpaeStatut): void {
    this.dpaeStatut = event;
  }
}
