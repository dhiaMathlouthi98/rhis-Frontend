import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ResizeEvent} from 'angular-resizable-element';
import {QualificationModel} from '../../../../../../shared/model/qualification.model';
import {DomControlService} from '../../../../../../shared/service/dom-control.service';
import {GlobalSettingsService} from '../../../../../../shared/service/global-settings.service';

@Component({
  selector: 'rhis-competence',
  templateUrl: './competence.component.html',
  styleUrls: ['./competence.component.scss']
})
export class CompetenceComponent implements OnInit {

  @Input()
  set competence(_competence: QualificationModel) {
    this.qualification = _competence;
  }

  @Input()
  set translateComment(_comment: string) {
    this.comment = _comment;
  }

  @Output()
  removeCompetence = new EventEmitter();

  @Output()
  updateCompetenceValue = new EventEmitter();


  // La valeur souhaite de passer d'un niveau a un autre. Dans la premiere version le passage d'un niveau à un autre et de 25=> 25 = 100 / 4 (ratio)
  private ratio = 4;
  public containerWidth: number;
  public competenceWidth = 0;
  public isFullNote = false;
  public upDownValues: number[];
  public downUpValues: number[];

  // valeur de qualification en string (expert,debutant...) traduit par langue
  public comment: string;
  qualification: QualificationModel;

  public backColor = '#385FE3';
  public edge = {right: true};
  public resizeSide = 'right';
  private ecran = 'GDQ';
  public menuIsOpen = false;

  constructor(private domControlService: DomControlService) {
  }

  public ngOnInit(): void {
    this.isFullNote = this.qualification.valeurQualification >= 100;
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  public updateControl(): string {
    return this.domControlService.updateListControl(this.ecran) ? '' : 'No';
  }

  /**
   * Service qui permet d'appeler le service parent (removeCompetence) qui sert à supprimer une compétence de la liste
   */
  public remove() {
    this.removeCompetence.emit(this.qualification.positionTravail.idPositionTravail);
  }


  validate(event: ResizeEvent): boolean {
    return !(event.rectangle.width &&
      (event.rectangle.width < (this.containerWidth / this.ratio) ||
        event.rectangle.width > this.containerWidth));
  }

  onResizeEnd(event: ResizeEvent): void {
    if ((event.rectangle.width > this.competenceWidth) && (this.qualification.valeurQualification < 100)) {
      this.competenceWidth = this.downUpValues.find((value, index) => (value > event.rectangle.width) || (index === this.ratio - 1));
    } else if ((event.rectangle.width < this.competenceWidth) && (this.qualification.valeurQualification > 100 / this.ratio)) {
      this.competenceWidth = this.upDownValues.find((value, index) => (value < event.rectangle.width) || (index === this.ratio - 1));
    }
    this.qualification.valeurQualification = (this.competenceWidth * 100) / this.containerWidth;
    setTimeout(() => {
      this.isFullNote = this.qualification.valeurQualification >= 100;
    }, 100);
  }

  setWidth(width) {
    this.containerWidth = width;
    this.competenceWidth = (this.qualification.valeurQualification * this.containerWidth) / 100;
    this.upDownValues = this.getPartsUpDown(this.containerWidth, this.ratio);
    this.downUpValues = this.getPartsDownUp(this.containerWidth, this.ratio);
  }

  private getPartsDownUp(holePart: number, nbrPart: number) {
    const array = [];
    for (let i = 1; i <= nbrPart; i++) {
      array.push((holePart * i) / nbrPart);
    }
    return array;
  }

  private getPartsUpDown(holePart: number, nbrPart: number) {
    const array = [];
    for (let i = nbrPart; i >= 1; i--) {
      array.push((holePart * i) / nbrPart);
    }
    return array;
  }


}
