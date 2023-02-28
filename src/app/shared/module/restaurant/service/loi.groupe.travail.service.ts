import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoiGroupeTravailModel} from '../../../model/loi.groupe.travail.model';
import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {PathService} from '../../../service/path.service';
import {Observable} from 'rxjs';
import {PaginationArgs, PaginationPage} from '../../../model/pagination.args';

@Injectable({
  providedIn: 'root'
})
export class LoiGroupeTravailService extends GenericCRUDRestService<LoiGroupeTravailModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/grpTravLaws`);
  }

  public getGroupeTravailLawsByLibelle(libelle: string): Observable<LoiGroupeTravailModel> {
    return this.httpClient.get<LoiGroupeTravailModel>(this.baseUrl + '/' + this.pathService.getUuidRestaurant() + '/' + libelle);
  }

  public getGroupeTravailLaws(paginationArgs: PaginationArgs, uuidGroupeTravail: string): Observable<PaginationPage<LoiGroupeTravailModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${uuidGroupeTravail}`);
  }

  public getGroupeTravailLawsWithoutPagination(uuidGroupeTravail: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/contraintSocial/' + uuidGroupeTravail);
  }

  public updateLoiGroupeTravail(loiGroupeTravail: LoiGroupeTravailModel, uuidGroupeTravail: string, paginationArgs: PaginationArgs): Observable<any> {
    return this.httpClient.put(this.baseUrl + '/' + uuidGroupeTravail + `?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}`, loiGroupeTravail);
  }

  /**
   * get  loi groupe travail by CodeName ( longueurMiniBreak and longueurMaxiShiftSansBreak)
   * @param: idGroupeTravail
   * @param :longueurMiniBreak
   * @param: longueurMaxiShiftSansBreak
   */
  public getGroupeTravailLawUsedInVerificationContraintSocialByCodeName(uuidGroupeTravail: String, longueurMiniBreak: String, longueurMaxiShiftSansBreak: String, nbHeuresMinSansCoupure: String, contratMinSansCoupure: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/' + uuidGroupeTravail + '/' + longueurMiniBreak + '/' + longueurMaxiShiftSansBreak + '/' + nbHeuresMinSansCoupure + '/' + contratMinSansCoupure);
  }

  /**
   * get  loi groupe travail by CodeName ( longueurMiniBreak and longueurMaxiShiftSansBreak)
   * @param: idGroupeTravail
   * @param :longueurMiniBreak
   * @param: longueurMaxiShiftSansBreak
   */
  public getGroupeTravailMngrOrLdrLawUsedInVerificationContraintSocialByCodeName(longueurMiniBreak: String, longueurMaxiShiftSansBreak: String, nbHeuresMinSansCoupure: String, longueurMiniShift: string, longueurMaxiBreak: String, contratMinSansCoupure: string, isPlanningLeader: number): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/groupeTrvMngeOrLeader/' + this.pathService.getUuidRestaurant() + '/' + longueurMiniBreak + '/' + longueurMaxiShiftSansBreak + '/' + nbHeuresMinSansCoupure + '/' + longueurMiniShift + '/' + longueurMaxiBreak + '/' + contratMinSansCoupure + '/' + isPlanningLeader);
  }

  public copyLoiGroupTravail(uuidRestaurant: string, listeRestaurantIds: number[], libelle: string): Observable<void> {
    return this.httpClient.put<void>(`${this.baseUrl}/copy/${uuidRestaurant}?libelle=${libelle}`, listeRestaurantIds);
  }
}
