import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../shared/validator/trim-validators';
import {FormationModel} from '../../../../../../shared/model/formation.model';

@Component({
  selector: 'rhis-add-list-formation',
  templateUrl: './add-list-formation.component.html',
  styleUrls: ['./add-list-formation.component.scss']
})
export class AddListFormationComponent implements OnInit, OnChanges {

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdateTypeFormationEvent = new EventEmitter();

  @Output()
  public resetErrorMessagesEventLabel = new EventEmitter();
  @Output()
  public resetErrorMessagesEventCode = new EventEmitter();
  @Input()
  public libelleExiste: string;
  @Input()
  public codeExiste: string;
  @Input()
  public selectedTypeFormation: FormationModel;
  @Input()
  public showAddOrUpdateTypeFormationButtons: string;

  public isSubmitted = false;
  public typeFormationform = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      code: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      dureeValidite: new FormControl(''),
      formationObligatoire: new FormControl(''),
    }
  );

  ngOnInit(): void {

    this.libelle.valueChanges.subscribe(
      value => this.resetErrorMessagesLabel()
    );
    this.code.valueChanges.subscribe(
      value => this.resetErrorMessagesCode()
    );
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.libelleExiste) {
      this.libelleExiste = changes.libelleExiste.currentValue;
    }
    if (changes.codeExiste) {
      this.codeExiste = changes.codeExiste.currentValue;
    }
    if (changes.selectedTypeFormation) {
      this.selectedTypeFormation = changes.selectedTypeFormation.currentValue;
      if (this.selectedTypeFormation) {
        this.displayTypeFormation(this.selectedTypeFormation);
      }
    }
    if (changes.showAddOrUpdateTypeFormationButtons) {
      this.showAddOrUpdateTypeFormationButtons = changes.showAddOrUpdateTypeFormationButtons.currentValue;
    }

  }

  /**
   *  recuperer les valeurs de groupe de travail pour ajouter ou modifier
   */
  public addOrUpdateGroupTravail() {
    this.isSubmitted = true;
    if (this.typeFormationform.valid) {
      this.addOrUpdateTypeFormationEvent.emit(this.typeFormationform.value);
    }
  }

  /**
   * recuperer la libelle de type formation
   */
  get libelle() {
    return this.typeFormationform.get('libelle');
  }

  /**
   * recuperer le priorite de groupe de travail
   */
  get priorite() {
    return this.typeFormationform.get('priorite');
  }

  /**
   * recuperer le code de type formation
   */
  get code() {
    return this.typeFormationform.get('code');
  }

  /**
   * reset erreur messege de champs libelle
   */
  public resetErrorMessagesLabel() {
    if (this.libelleExiste) {
      this.resetErrorMessagesEventLabel.emit();
    }
  }

  /**
   * reset erreur messege de champs code
   */
  public resetErrorMessagesCode() {
    if (this.codeExiste) {
      this.resetErrorMessagesEventCode.emit();
    }
  }

  /**
   * set type Formation
   * @param : typeFormation
   */
  public displayTypeFormation(typeFormation: FormationModel) {
    if (typeFormation) {
      this.typeFormationform.patchValue({...typeFormation});

    } else {
      if (this.typeFormationform) {
        this.typeFormationform.reset();
      }
    }
  }

  /**
   * modifier ou ajouter type formation
   */
  public addOrUpdateTypeFormation() {
    this.isSubmitted = true;
    if (this.typeFormationform.valid) {
      this.addOrUpdateTypeFormationEvent.emit(this.typeFormationform.value);
    }
  }


}
