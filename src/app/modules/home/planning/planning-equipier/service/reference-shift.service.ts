import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ReferenceShiftModel} from '../../../../../shared/model/reference-shift.model';

@Injectable({
    providedIn: 'root'
})
export class ReferenceShiftService extends GenericCRUDRestService<ReferenceShiftModel, string> {

    constructor(private pathService: PathService, httpClient: HttpClient) {
        super(httpClient, `${pathService.hostServerCalculePlanning}/refShifts/`);
    }

    public getAll(day: string): Observable<ReferenceShiftModel[]> {
        return this.httpClient.get<ReferenceShiftModel[]>(`${this.baseUrl}${this.pathService.getUuidRestaurant()}/${day}`);
    }

    public generateWeekReferenceShifts(day: string): Observable<ReferenceShiftModel[]> {
        return this.httpClient.get<ReferenceShiftModel[]>(`${this.baseUrl}generate/${this.pathService.getUuidRestaurant()}/week/${day}`);
    }

    public generateDayReferenceShifts(day: string): Observable<ReferenceShiftModel[]> {
        return this.httpClient.get<ReferenceShiftModel[]>(`${this.baseUrl}generate/${this.pathService.getUuidRestaurant()}/daily/${day}`);
    }

    public saveReferenceShifts(referenceShifts: ReferenceShiftModel[]): Observable<ReferenceShiftModel[]> {
        return this.httpClient.post<ReferenceShiftModel[]>(`${this.baseUrl}save/${this.pathService.getUuidRestaurant()}`, referenceShifts);
    }
}
