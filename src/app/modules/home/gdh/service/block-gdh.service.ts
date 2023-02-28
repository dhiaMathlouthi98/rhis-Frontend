import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {DateService} from '../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class BlockGdhService {
  private blockGdhSubject = new Subject<{isModificationBlocked: boolean, limitBlockDate: string}>();
  private _isModificationBlocked: boolean;
  private _limitBlockDate: string;

  constructor(public dateService: DateService) {
  }
  public sendGdhBlockState(state: {isModificationBlocked: boolean, limitBlockDate: string}): void {
    this.blockGdhSubject.next(state);
  }

  public getGdhBlockState(): Observable<{isModificationBlocked: boolean, limitBlockDate: string}> {
    return this.blockGdhSubject.asObservable();
  }


  get isModificationBlocked(): boolean {
    return this._isModificationBlocked;
  }

  set isModificationBlocked(value: boolean) {
    this._isModificationBlocked = value;
  }


  get limitBlockDate(): string {
    return this._limitBlockDate;
  }

  set limitBlockDate(value: string) {
    this._limitBlockDate = value;
  }

  /**
   * Check that pointage/absence/repas modification is allowed in GDH day view (default or hourly view)
   * @param selectedDate date of the day in GDH day view
   * @param referenceParamValue the GDH_BLOCK parameter to compare with
   */
  public getDayViewBlockState(selectedDate: Date, referenceParamValue: string): {isModificationBlocked: boolean, isDateIntervalTotallyBlocked: boolean} {
    const referenceDate = new Date(referenceParamValue.split('/').reverse().join('/'));
    const isModificationAuthorized = this.dateService.isAfterOn(selectedDate, referenceDate, 'days');
    this.isModificationBlocked = !isModificationAuthorized;
    this._limitBlockDate = referenceParamValue;
    this.sendGdhBlockState({isModificationBlocked: this.isModificationBlocked, limitBlockDate: this.limitBlockDate});
    return {isModificationBlocked: this.isModificationBlocked, isDateIntervalTotallyBlocked: !isModificationAuthorized};
  }

  /**
   * Check that pointage/absence/repas modification is allowed in GDH week/period view
   * @param startDate start date of the period
   * @param endDate end date of the period
   * @param referenceParamValue the GDH_BLOCK parameter to compare with
   */
  public getPeriodBlockState(startDate: Date, endDate: Date, referenceParamValue: string): {isModificationBlocked: boolean, isDateIntervalTotallyBlocked: boolean} {
    const referenceDate = new Date(referenceParamValue.split('/').reverse().join('/'));
    const isModificationBlocked = !this.dateService.isAfterOn(startDate, referenceDate, 'days');
    const isDateIntervalTotallyBlocked = !this.dateService.isBeforeOn(endDate, referenceDate, 'days');
    this.isModificationBlocked = isModificationBlocked;
    this._limitBlockDate = referenceParamValue;
    this.sendGdhBlockState({isModificationBlocked, limitBlockDate: this.limitBlockDate});
    return {isModificationBlocked, isDateIntervalTotallyBlocked};
  }
}
