import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {DecoupagePlanningEquipier} from '../../../../../shared/model/gui/planning.equipier.model';
import {debounce} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class SynchroPlanningEquipierService {
    private decoupage = new Subject<DecoupagePlanningEquipier>();
    private isWeekLoaded = new Subject<boolean>();
    private globalEquipierSave = new Subject<void>();

    public getDecoupage(): Observable<DecoupagePlanningEquipier> {
        return this.decoupage.asObservable();
    }

    public setDecoupage(decoupage: DecoupagePlanningEquipier): void {
        this.decoupage.next(decoupage);
    }

    public getWeakLoading(): Observable<boolean> {
        return this.isWeekLoaded.asObservable();
    }

    public sendWeekLoading(isWeekLoaded: boolean): void {
        this.isWeekLoaded.next(isWeekLoaded);
    }

    public onEquipierGlobalSave(): Observable<void> {
        return this.globalEquipierSave.asObservable().pipe(debounce(() => timer(5000)));
    }

    public sendEquipierGlobalSave(): void {
        this.globalEquipierSave.next();
    }
}
