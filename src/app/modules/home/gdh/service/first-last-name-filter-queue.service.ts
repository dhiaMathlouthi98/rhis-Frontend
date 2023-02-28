import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class FirstLastNameFilterQueue {
  private _firstLastNameFilter = '';
  private subject = new Subject<void>();
  private sort = new Subject<void>();
  private _order = false;


  public launchSearchByFirstLastName(): void {
    this.subject.next();
  }

  public searchByFirstLastName(): Observable<void> {
    return this.subject.asObservable();
  }

  public launchSort(): void {
    this.sort.next();
  }

  public searchSort(): Observable<void> {
    return this.sort.asObservable();
  }

  get order(): boolean {
    return this._order;
  }

  set order(value: boolean) {
    this._order = value;
  }

  get firstLastNameFilter(): string {
    return this._firstLastNameFilter;
  }

  set firstLastNameFilter(value: string) {
    this._firstLastNameFilter = value;
  }
}
