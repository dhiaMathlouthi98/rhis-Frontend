import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PositionTravailModel} from '../../../../../../shared/model/position.travail.model';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'rhis-add-new-qualification',
  templateUrl: './add-new-qualification.component.html',
  styleUrls: ['./add-new-qualification.component.scss']
})
export class AddNewQualificationComponent implements OnInit {

  @Output()
  public addNewQualificationEvent = new EventEmitter();

  @Input()
  set positionTravails(listPositionTravail: PositionTravailModel[]) {
    this.positionTravailItemList = [];
    listPositionTravail.forEach(item => {
      this.positionTravailItemList.push({
        label: item.libelle, value: item
      });
    });
  }

  positionTravailItemList: SelectItem[] = [];

  selectedPositionTravail: PositionTravailModel;

  constructor() {
  }

  ngOnInit() {
    this.selectedPositionTravail = undefined;
  }


  addNewQualification() {
    if (this.selectedPositionTravail) {
      this.addNewQualificationEvent.emit(this.selectedPositionTravail);
      this.selectedPositionTravail = undefined;
    } else {
      this.addNewQualificationEvent.emit(this.selectedPositionTravail);
    }
  }
}
