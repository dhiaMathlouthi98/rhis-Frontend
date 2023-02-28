import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {AffectationModel} from '../../../../shared/model/affectation.model';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AffectationRestaurantService extends GenericCRUDRestService<AffectationModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient) {
    super(httpClinent, `${pathService.getPathSecurity()}/affectation`);
  }

  /**
   * modification du profil d'un utilisateur-restaurant
   * @param: entity
   * @param: idUser
   */
  public updateUtilisateur(entity: AffectationModel, uuidUser: string): Observable<AffectationModel> {
    return super.update(entity, `/updateAffectation/` + uuidUser);
  }

  public addAffectation(affectation: AffectationModel): Observable<AffectationModel> {
    return super.add(affectation);
  }
}
