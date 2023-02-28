import {Subject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class RestaurantSyncService {
    private entrepriseParam: Subject<string> = new Subject<string>();

    public setEntrepriseParam(value: string): void {
        this.entrepriseParam.next(value);
    }

    public getEntrepriseParam() {
        return this.entrepriseParam.asObservable();
    }
}
