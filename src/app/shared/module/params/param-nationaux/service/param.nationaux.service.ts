import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntityUuidModel } from 'src/app/shared/model/entityUuid.model';
import { ParametreNationauxModel } from 'src/app/shared/model/parametre.nationaux.model';
import { DateService } from 'src/app/shared/service/date.service';
import { GenericCRUDRestService } from 'src/app/shared/service/generic-crud.service';
import { PathService } from 'src/app/shared/service/path.service';


@Injectable({
  providedIn: 'root'
})
export class ParamNationauxService extends GenericCRUDRestService<ParametreNationauxModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient, private dateService: DateService) {
    super(httpClient, `${pathService.getPathEmployee()}/paramNat`);
  }

 public getParamNationauxByRestaurant(uuidResto?: any): Observable<ParametreNationauxModel> {
   let uuid : any;
   if(uuidResto){
    uuid = uuidResto;
   } else {
     uuid = this.pathService.getUuidRestaurant();
   }
    return this.httpClient.get<ParametreNationauxModel>(this.baseUrl + '/' + uuid);
  }

  public getParamNationauxByRestaurantUuid(uuidRestaurant: EntityUuidModel): Observable<ParametreNationauxModel> {
    return this.httpClient.get<ParametreNationauxModel>(this.baseUrl + '/' + uuidRestaurant);
  }

  public getvaleurProductif(): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + '/valeurProductif');
  }

  public updateParamNationaux(paramNationaux: ParametreNationauxModel, uuidRestaurant?: string): Observable<ParametreNationauxModel> {
    let uuid : string;
    if(uuidRestaurant){
      uuid = uuidRestaurant;
    } else {
      uuid = this.pathService.getUuidRestaurant();
    }
    this.fixDate(paramNationaux);
    return super.update(paramNationaux, '/' + uuid);
  }

  public copierParamNationaux(uuidRestaurant: string, listRestoIds: number[]): Observable<any> {
    return this.httpClient.put<any>(this.baseUrl + '/copie/' + uuidRestaurant, listRestoIds);
  }
 private fixDate(paramNationaux: ParametreNationauxModel) {
    if (paramNationaux.dureeShift1) {
      paramNationaux.dureeShift1 = this.dateService.setCorrectTime(paramNationaux.dureeShift1);
    }
    if (paramNationaux.dureeShift2) {
      paramNationaux.dureeShift2 = this.dateService.setCorrectTime(paramNationaux.dureeShift2);
    }
    if (paramNationaux.dureeShift3) {
      paramNationaux.dureeShift3 = this.dateService.setCorrectTime(paramNationaux.dureeShift3);
    }
    if (paramNationaux.dureeBreak1) {
      paramNationaux.dureeBreak1 = this.dateService.setCorrectTime(paramNationaux.dureeBreak1);
    }
    if (paramNationaux.dureeBreak2) {
      paramNationaux.dureeBreak2 = this.dateService.setCorrectTime(paramNationaux.dureeBreak2);
    }
    if (paramNationaux.dureeBreak3) {
      paramNationaux.dureeBreak3 = this.dateService.setCorrectTime(paramNationaux.dureeBreak3);
    }
    if (paramNationaux.dureePref) {
      paramNationaux.dureePref = this.dateService.setCorrectTime(paramNationaux.dureePref);
    }
    if (paramNationaux.heureDebutWeekend) {
      paramNationaux.heureDebutWeekend = this.dateService.setCorrectTime(paramNationaux.heureDebutWeekend);
    }
    if (paramNationaux.heureFinWeekend) {
      paramNationaux.heureFinWeekend = this.dateService.setCorrectTime(paramNationaux.heureFinWeekend);
    }
  }

}
