import {Directive, Host, Inject, OnInit, Self} from '@angular/core';
import {Calendar, LocaleSettings} from 'primeng/calendar';
import {DateService} from '../service/date.service';
import {SharedRestaurantService} from '../service/shared.restaurant.service';

@Directive({
  selector: 'p-calendar:not([timeOnly])'
})
export class LangFirstWeekDayCalendarDirective implements OnInit {
  private firstWeekDayRank: number;
  constructor(@Host() @Self() private calendar: Calendar,
              @Inject(DateService) private dateService: DateService,
              @Inject(SharedRestaurantService) private sharedRestaurnat: SharedRestaurantService ) {}

  async ngOnInit() {
    this.firstWeekDayRank = await this.sharedRestaurnat.getWeekFirstDayRank();
    this.calendar.locale = this.dateService.getCalendarConfig(this.firstWeekDayRank) as LocaleSettings;
  }
}
