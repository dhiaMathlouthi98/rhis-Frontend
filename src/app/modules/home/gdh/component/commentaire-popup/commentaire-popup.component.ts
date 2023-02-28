import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {DateService} from '../../../../../shared/service/date.service';
import {GdhDayNoteModel} from '../../../../../shared/model/gdh-day-note.model';
import {GdhDayNoteService} from '../../service/gdh-day-note.service';
import {RestaurantModel} from '../../../../../shared/model/restaurant.model';

@Component({
  selector: 'rhis-commentaire-popup',
  templateUrl: './commentaire-popup.component.html',
  styleUrls: ['./commentaire-popup.component.scss']
})
export class CommentairePopupComponent {
  @Input()
  public set currentDate(date: Date) {
    this.selectedDate = new Date(date);
    this.localeFormattedDate = this.dateService.getFormattedDateWithLocale(date, 'll', this.rhisTranslateService.currentLang);
    this.getNote();
  }

  @Input() public openedAlertes = false;
  @Output() public closeAlertes: EventEmitter<any> = new EventEmitter();
  public localeFormattedDate = '';
  private selectedDate: Date;
  public note = '';
  private gdhDayNote: GdhDayNoteModel;

  constructor(private gdhDayNoteService: GdhDayNoteService,
              private rhisTranslateService: RhisTranslateService,
              private dateService: DateService) {
  }

  public hideAlertes(): void {
    this.closeAlertes.emit();
  }

  public async saveNote(): Promise<void> {
    this.gdhDayNote = {
      ...this.gdhDayNote,
      restaurant: {idRestaurant: this.gdhDayNoteService.getIdRestaurant()} as RestaurantModel,
      note: this.note,
      date: this.selectedDate,
    } as GdhDayNoteModel;
    this.gdhDayNote = await this.gdhDayNoteService.add(this.gdhDayNote).toPromise();
  }

  private async getNote(): Promise<void> {
    const date = this.dateService.formatDateToScoreDelimiter(this.selectedDate);
    this.gdhDayNote = await this.gdhDayNoteService.getOneByRestaurantIdAndDate(date).toPromise();
    this.note =  this.gdhDayNote ? this.gdhDayNote.note : '';
  }
}
