import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FranchiseModel} from '../../../../../../shared/model/franchise.model';
import {RestaurantModel} from '../../../../../../shared/model/restaurant.model';

@Component({
  selector: 'rhis-add-franchise',
  templateUrl: './add-franchise.component.html',
  styleUrls: ['./add-franchise.component.scss']
})
export class AddFranchiseComponent implements OnInit, OnChanges {

  @Input()
  public listFranchises: FranchiseModel[];
  @Input()
  public listRestaurants: RestaurantModel[];
  @Output()
  public AddFranchiseEvent = new EventEmitter();
  @Input()
  public libelleExiste: string;
  @Input()
  public selectedFranchise: FranchiseModel;
  @Input()
  public buttonLabel: string;
  @Output()
  public resetErrorMessagesEventLabel = new EventEmitter();
  public isSubmitted = false;
  public scrollHeight = '200px';
  public addFranchiseForm = new FormGroup(
    {
      nom: new FormControl('',
        [Validators.required,
          Validators.maxLength(255)]),
      adresse: new FormControl('', [Validators.maxLength(255)]),
      numTelephone: new FormControl(null, [Validators.pattern('^(\\+|[0-9]){1}( |[0-9])*[0-9]$'), Validators.maxLength(20)]),
      codePostal: new FormControl(null, Validators.min(0)),
      ville: new FormControl('', [Validators.maxLength(255)])
    }
  );

  constructor() {
  }

  @Input()
  set setSelectedFranchise(franchise: FranchiseModel) {
    this.selectedFranchise = franchise;
    this.addFranchiseForm.patchValue(franchise);
  }

  /**
   * recuperer la libelle de type formation
   */
  get nom() {
    return this.addFranchiseForm.get('nom');
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedFranchise) {
      this.addFranchiseForm.patchValue(changes.selectedFranchise.currentValue);
    }
  }

  /**
   * affecter
   */
  public addOrUpdateFranchise(): void {
    this.isSubmitted = true;
    if (this.addFranchiseForm.valid) {
      this.AddFranchiseEvent.emit(this.addFranchiseForm.value);
    }
  }


}
