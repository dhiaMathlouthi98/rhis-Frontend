import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {AbstractValueAccessor, MakeProvider} from '../../../../../../shared/class/abstract-value.accessor';

@Component({
  selector: 'rhis-sante',
  templateUrl: './sante.component.html',
  styleUrls: ['./sante.component.scss'],
  providers: [
    ...MakeProvider(SanteComponent)
  ]
})
export class SanteComponent extends AbstractValueAccessor implements OnInit, OnChanges, AfterViewInit {
  @Input() unicite;
  // lors de cique sur le buttin save employe
  @Input() onSubmit;

  ngOnInit() {
    this.formGroup = new FormGroup(
      {
        numero: new FormControl('', this.nullAndLenghtValidity(15)),
        mutuelle: new FormControl(''),
        nomPersonneContacter: new FormControl(''),
        numTelephUrgence: new FormControl('', [Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$'), Validators.maxLength(20)])
      });
  }

  private nullAndLenghtValidity(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value.split(' ').join('').trim();
      return (value !== '') && (value.length !== length) ? {size: true} : null;
    };
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.unicite) {
      this.unicite = changes.unicite.currentValue;
    }
  }

  private setCaretForSecuriteSociale(): void {
    const input = document.querySelector("#EMP-infoPerso-numSecSocial > input") as HTMLInputElement;
    input.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      input.value = input.value.trim();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(_ => this.setCaretForSecuriteSociale(), 1000);
  }
}
