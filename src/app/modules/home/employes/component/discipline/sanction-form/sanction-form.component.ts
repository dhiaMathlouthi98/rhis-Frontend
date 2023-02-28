import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {DisciplineModel} from '../../../../../../shared/model/discipline.model';
import {SortDateValidator} from '../sortDateValidator';
import {ScrollToBlockService} from '../../../../../../shared/service/scroll-to-block.service';

@Component({
  selector: 'rhis-sanction-form',
  templateUrl: './sanction-form.component.html',
  styleUrls: ['./sanction-form.component.scss']
})
export class SanctionFormComponent {
  @Input()
  private set discipline(discipline: DisciplineModel) {
    this.displayDiscipline(discipline);
  }

  @Input()
  public typeSanctionList: { value: number, label: string }[];
  public dateFields = [
    'dateFais', 'dateDemandeJustif', 'dateConvocation', 'dateEntretien', 'dateNotification'
  ];

  @Input()
  public set isDesactivated(statut: boolean) {
    if (statut) {
      this.autoDisplayFirst = false;
    }
  }

  @Input()
  public buttonLabel: string;
  @Output()
  public sanctionEvent = new EventEmitter();
  public formGroup = new FormGroup(
    {
      dateFais: new FormControl('', [Validators.required]),
      dateDemandeJustif: new FormControl(''),
      dateConvocation: new FormControl(''),
      dateEntretien: new FormControl(''),
      dateNotification: new FormControl(''),
      typeSanction: new FormControl('', [Validators.required]),
      faisReproches: new FormControl('', [Validators.required]),
    }, {
      validators: SortDateValidator
    }
  );

  public selectors = {
    calendarSelector: '.ui-inputtext.ui-widget',
    dropDownSelector: '.ui-dropdown'
  };

  isSubmitted = false;
  /**
   * Control if we display the first item in 'type sanction' dropdown list
   */
  public autoDisplayFirst: boolean;

  constructor(private scrollToBlockService: ScrollToBlockService) {
  }

  /**
   * Display the infos of a 'discipline'
   * @param: discipline
   */
  private displayDiscipline(discipline: DisciplineModel): void {
    if (discipline) {
      this.formGroup.patchValue(discipline);
      this.autoDisplayFirst = true;
    } else {
      this.resetForm();
    }
  }

  /**
   * Reset the form when opening the pop-up
   */
  private resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
    this.autoDisplayFirst = false;
  }

  /**
   * set dates hour to 12 to ensure the correct saving date
   * @param: formValues
   */
  private configDate(): void {
    this.dateFields.forEach(dateField => {
      if (this.formGroup.get(dateField).value) {
        const date = new Date(this.formGroup.get(dateField).value);
        date.setHours(12);
        this.formGroup.patchValue({[dateField]: date});
      }
    });
  }

  get dateFais(): AbstractControl {
    return this.formGroup.get('dateFais');
  }

  get typeSanction(): AbstractControl {
    return this.formGroup.get('typeSanction');
  }

  get faisReproches(): AbstractControl {
    return this.formGroup.get('faisReproches');
  }

  /**
   * Submit the edit/add value to save it
   */
  public onSubmit(): void {
    this.isSubmitted = true;
    if (this.formGroup.valid) {
      this.configDate();
      this.sanctionEvent.emit(this.formGroup.value);
      this.isSubmitted = false;
    }
    if (!this.formGroup.valid) {
      this.scrollToBlockService.scrollToElementHasErrorThirdParent('span.form-item-error');
    }
  }

}
