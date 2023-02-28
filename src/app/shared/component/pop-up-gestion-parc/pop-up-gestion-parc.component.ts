import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ConfirmationService} from 'primeng/api';
import {RhisTranslateService} from 'src/app/shared/service/rhis-translate.service';

@Component({
  selector: 'rhis-pop-up-gestion-parc',
  templateUrl: './pop-up-gestion-parc.component.html',
  styleUrls: ['./pop-up-gestion-parc.component.scss']
})
export class PopUpGestionParcComponent implements OnInit, OnChanges {
  @Input() resourceName = '';
  @Input() restaurantSource = '';
  @Input() title = '';
  @Input() text1 = '';
  @Input() text2 = '';
  @Input() submitButtonText: string;
  @Input() errorMessage = '';
  @Input() dropdownListData: any;
  @Input() optionLabel: string;
  @Input() showPopUp = false;
  @Output() private closeEvent = new EventEmitter();
  @Output() public submitDataEvent = new EventEmitter();
  @Input() public height: string;
  @Input() public width: string;
  @Input() public maxHeight: string;
  @Input() public displayText1 = false;
  @Input() public displayText2 = false;
  @Input() public ecraserMsg = false;
  public formGroup: FormGroup;
  public isSubmitted = false;
  public selectAll = true;
  public selectedRestaurants = [];
  public labelSelect = '';
  public defaultLabel = this.translateService.translate('GESTION_PARC_RAPPORT.CHOOSE');
  public msgRadioSelectAll = this.translateService.translate('GESTION_PARC_RAPPORT.SAVE_CHANGES_ALL_RESTAURANTS');

  public isDeleteRapport: Boolean = false;

  @Input() set deleteRapport(deleteRapport: Boolean) {
    this.isDeleteRapport = deleteRapport;

    if (this.isDeleteRapport && this.dropdownListData.length === 1) {
      this.labelSelect = this.translateService.translate('GESTION_PARC_RAPPORT.AUCUN_RESTAURANT');
      this.msgRadioSelectAll = this.translateService.translate('GESTION_PARC_RAPPORT.DELETE_FOR_ALL_RESTAURANTS');
    }
    if (this.isDeleteRapport && this.dropdownListData.length > 1) {
      this.defaultLabel = this.translateService.translate('GESTION_PARC_RAPPORT.CHOOSE');
      this.msgRadioSelectAll = this.translateService.translate('GESTION_PARC_RAPPORT.DELETE_FOR_ALL_RESTAURANTS');
    }
    if (!this.isDeleteRapport) {
      this.defaultLabel = this.translateService.translate('GESTION_PARC_RAPPORT.CHOOSE');
    }
  }

  @Input() set getSelectedRestaurant(selectedResto: any) {
    this.selectedRestaurant = selectedResto;
    if (this.isDeleteRapport || this.docEditMode) {
      this.selectedRestaurants.unshift(this.selectedRestaurant);
      this.dropdownListData.length === 1 && this.isDeleteRapport ? this.selectAll = true : this.selectAll = false;
    }

  }

  @Input() public selectedRestosBeforeEdit = [];
  @Input() public docEditMode = false;
  @Input() public oldName = '';
  @Input() public newName = '';
  @Output() public submitAfterNameChanged = new EventEmitter();
  public editButtonHidden = false;
  public messageIfEditButtonIsHidden = '';

  @Input() public selectedRestaurant: any;
  @Input() public rapportModule = false;

  constructor(private translateService: RhisTranslateService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
  }

  public initForm(): void {
    if (this.dropdownListData) {
      this.formGroup = new FormGroup({
        selectedElement: new FormControl(this.dropdownListData[0], Validators.required)
      });
    } else {
      this.formGroup = new FormGroup({
        selectedElement: new FormControl(null, Validators.required)
      });
    }
// preselectionne la liste des restaurants qui ont deja le rapport
    if (this.docEditMode) {
      this.selectedRestaurants = [...this.selectedRestosBeforeEdit];
      this.selectedRestaurants.unshift(this.selectedRestaurant);
      if (this.selectedRestaurants.length > 0 && this.selectedRestaurants.length !== this.dropdownListData.length) {
        this.selectAll = false;
      }
    }
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.title) {
      this.title = changes.title.currentValue;
    }
    if (changes.showPopUp) {

      this.showPopUp = changes.showPopUp.currentValue;
      this.initForm();
      this.isSubmitted = false;

    }
  }

  public async submitMethod() {
    this.isSubmitted = true;
    if (this.docEditMode && this.oldName !== this.newName && !await this.checkIfListRestoExist(this.selectedRestaurants, this.selectedRestosBeforeEdit)) {
      this.submitAfterNameChanged.emit(this.createEditObject());
    } else {
      if (this.ecraserMsg) {
        this.confirmCopie();
      } else if (this.resourceName === 'ajout_rapport' || this.resourceName === 'ajout_restaurant') {
        this.confirmCopie();
      } else {
        this.confirmCopieReports();
      }
    }
  }

  public closePopUp() {
    this.closeEvent.emit();
  }

  public confirmCopieReports(): void {
    this.confirmationService.confirm({
      header: this.translateService.translate('GESTION_PARC_RAPPORT.VALIDATION'),
      message: this.translateService.translate('GESTION_PARC_RAPPORT.VALIDATION_MSG') + this.resourceName +
        this.translateService.translate('GESTION_PARC_RAPPORT.COPIE_FROM') + this.restaurantSource + this.translateService.translate('GESTION_PARC_RAPPORT.COPIE_TO'),
      acceptLabel: this.translateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.translateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.showPopUp = false;
        this.confirmCopie();
      }
    });
  }

  private confirmCopie(): void {
    if (this.displayText1) {
      this.submitDataEvent.emit(this.formGroup.value);
    } else {
      if (this.selectAll) {
        let finalList = [...this.dropdownListData];
        if (this.rapportModule) {
          finalList = this.dropdownListData.filter(resto => resto.IdenRestaurant !== this.selectedRestaurant.IdenRestaurant);
        }
        this.submitDataEvent.emit(finalList);
      } else {
        let finalList = [...this.selectedRestaurants];
        if (this.rapportModule) {
          finalList = this.selectedRestaurants.filter(resto => resto.IdenRestaurant !== this.selectedRestaurant.IdenRestaurant);
        }
        this.submitDataEvent.emit(finalList);
      }
    }
  }

  public async changeValues(event: any) {
    if (this.selectedRestaurants.length) {
      this.selectAll = false;
    } else {
      this.selectAll = true;
      this.editButtonHidden = false;
    }

    if (this.rapportModule && this.selectedRestaurant && this.dropdownListData.find(resto => resto.IdenRestaurant === this.selectedRestaurant.IdenRestaurant)) {
      if (event.value && !event.value.find(resto => resto.IdenRestaurant === this.selectedRestaurant.IdenRestaurant)) {
        this.selectedRestaurants.unshift(this.selectedRestaurant);
      }
      if (event.value && event.value.length === 0 && event.itemValue) {
        this.selectedRestaurants.unshift(event.itemValue);
      }
      if (!event.itemValue && event.value && event.value.length === 0) {
        this.selectedRestaurants.unshift(this.selectedRestaurant);
      }
      if (this.selectedRestaurants.length) {
        this.selectAll = false;
      } else {
        this.selectAll = true;
        this.editButtonHidden = false;
      }
      if (this.docEditMode && !this.selectAll) {
        if (!await this.checkIfListRestoExist(this.selectedRestaurants, this.selectedRestosBeforeEdit) && this.oldName === this.newName) {
          this.editButtonHidden = true;
          this.messageIfEditButtonIsHidden = this.translateService.translate('GESTION_PARC_RAPPORT.WHEN_EDIT_RAPPORT_IS_HIDDEN');
        } else {
          this.editButtonHidden = false;
        }
      }
    }


  }

  /**
   * disable default tooltip
   */
  public disableDefaultTooltip() {
    if (this.dropdownListData.length <= 1) {
      document.getElementsByClassName('ui-multiselect-label-container')[0].removeAttribute('title');
    }
  }

  private async checkIfListRestoExist(selectedList: any, listRestoHaveRepport: any): Promise<boolean> {
    let count = 0;
    for await (const resto of listRestoHaveRepport) {
      const findedResto = selectedList.find(rest => rest.IdenRestaurant === resto.IdenRestaurant);
      findedResto ? count++ : count += 0;
    }
    if (count === listRestoHaveRepport.length && listRestoHaveRepport.length > 0) {
      return true;
    }
    if (listRestoHaveRepport.length === 0) {
      return true;
    }
    return false;
  }

  private createEditObject() {
    const idsRestoToRemoveDocAndSaveNew = [];
    const idsRestoToSaveNew = [];
    const finalList = this.selectedRestaurants.filter(rest => rest.IdenRestaurant !== this.selectedRestaurant.IdenRestaurant);
    finalList.forEach(resto => {
      const findedResto = this.selectedRestosBeforeEdit.find(rest => rest.IdenRestaurant === resto.IdenRestaurant);
      findedResto ? idsRestoToRemoveDocAndSaveNew.push(resto.IdenRestaurant) : idsRestoToSaveNew.push(resto.IdenRestaurant);
    });
    return {
      idsRestoToRemoveDocAndSaveNew, idsRestoToSaveNew
    };
  }
}
