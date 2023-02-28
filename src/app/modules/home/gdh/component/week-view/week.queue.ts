import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeekQueue {

  private subject = new Subject<any>();

  // data = { updateData : false, filter : {}}
  nextWeekQueue(data: any) {
    setTimeout(() => {
      this.subject.next(data);
    }, 500);
  }

  getWeekAsObservable(): Observable<any> {
    return this.subject.asObservable();
  }
}
