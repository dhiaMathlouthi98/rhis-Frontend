import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PositionTravailModel} from '../../../../../../../shared/model/position.travail.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TrimValidators} from '../../../../../../../shared/validator/trim-validators';

@Component({
  selector: 'rhis-add-update-position-travail',
  templateUrl: './add-update-position-travail.component.html',
  styleUrls: ['./add-update-position-travail.component.scss']
})
export class AddUpdatePositionTravailComponent implements OnInit {

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public addOrUpdatePositionTravailEvent = new EventEmitter();

  @Output()
  public resetErrorMessagesEvent = new EventEmitter();


  @Input()
  public set existentPositionTravail(errMessage: string) {
    this.existentPositionTravailMessage = errMessage;
  }

  public positionTravailform = new FormGroup(
    {
      libelle: new FormControl('', [Validators.required, TrimValidators.trimValidator]),
      dureeMax: new FormControl('', [Validators.required, Validators.min(0)]),
      minQualfication: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.max(100), Validators.min(0)]),
      couleur: new FormControl(''),
      priorite: new FormControl(''),
      actifPositionTravail: new FormControl(''),
      decalageArrive: new FormControl(''),
      senseDecalageArrive: new FormControl(''),
      decalageDepart: new FormControl(''),
      senseDecalageDepart: new FormControl(''),
      fermeture: new FormControl(''),
      prod: new FormControl(''),
      idPositionTravail: new FormControl(''),
      uuid: new FormControl('')
    }
  );

  @Input()
  public set buttonLabel(buttonLabel: string) {
    this.buttonTitle = buttonLabel;
  }

  @Input()
  public set initPositionTravail(positionTravail: PositionTravailModel) {
    if (positionTravail) {
      this.positionTravailform.setValue({
        libelle: positionTravail.libelle,
        dureeMax: positionTravail.dureeMax,
        minQualfication: positionTravail.minQualfication,
        couleur: positionTravail.couleur,
        priorite: positionTravail.priorite,
        actifPositionTravail: positionTravail.actifPositionTravail,
        decalageArrive: positionTravail.decalageArrive,
        senseDecalageArrive: positionTravail.senseDecalageArrive,
        decalageDepart: positionTravail.decalageDepart,
        senseDecalageDepart: positionTravail.senseDecalageDepart,
        fermeture: positionTravail.fermeture,
        prod: positionTravail.prod,
        idPositionTravail: positionTravail.idPositionTravail,
        uuid: positionTravail.uuid ? positionTravail.uuid : null
      });
    } else {
      if (this.positionTravailform) {
        this.positionTravailform.reset();
        this.positionTravailform.controls['couleur'].setValue('#c4c0c0');
      }
    }
  }

  public existentPositionTravailMessage: string;

  public isSubmitted = false;

  public buttonTitle = '';


  constructor() {
  }

  ngOnInit() {
    this.positionTravailform.get('libelle').valueChanges.subscribe(
      value => this.resetErrorMessages()
    );
  }

  resetErrorMessages() {
    if (this.existentPositionTravailMessage) {
      this.resetErrorMessagesEvent.emit();
    }
  }

  addOrUpdatePositionTravail() {
    this.isSubmitted = true;
    if (this.positionTravailform.valid) {
      this.addOrUpdatePositionTravailEvent.emit(this.positionTravailform.value);
    }
  }

}
