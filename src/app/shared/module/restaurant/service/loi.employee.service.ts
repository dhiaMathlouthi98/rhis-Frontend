import {GenericCRUDRestService} from '../../../service/generic-crud.service';
import {LoiEmployeeModel} from '../../../model/loi.employee.model';
import {PathService} from '../../../service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {PaginationArgs, PaginationPage} from '../../../model/pagination.args';

@Injectable({
  providedIn: 'root'
})
export class LoiEmployeeService extends GenericCRUDRestService<LoiEmployeeModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPlanning()}/emplLaws`);
  }


  public getEmployeeLaws(paginationArgs: PaginationArgs, uuidEmployee: string): Observable<PaginationPage<LoiEmployeeModel>> {
    return super.getAllWithPaginationAndFilter(paginationArgs, `/${uuidEmployee}`);
  }

  /**
   * get all loi employee
   * @param :idEmployee
   */
  public getEmployeeLawUsedInVerificationContraintSocial(uuidEmployee: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/contraintSocial/' + uuidEmployee + '/');
  }

  public updateLoiEmployee(loiEmployee: LoiEmployeeModel, uuidEmployee: string, paginationArgs: PaginationArgs): Observable<any> {
    return this.httpClient.put(this.baseUrl + '/' + uuidEmployee + `?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}`, loiEmployee);
  }

  /**
   * get  loi employee by CodeName ( longueurMiniBreak and longueurMaxiShiftSansBreak)
   * @param: idEmployee
   * @param :longueurMiniBreak
   * @param: longueurMaxiShiftSansBreak
   */
  public getEmployeeLawUsedInVerificationContraintSocialByCodeName(uuidEmployee: string, longueurMiniBreak: String, longueurMaxiShiftSansBreak: String, nbHeuresMinSansCoupure: String, longueurMiniShift: string, longueurMaxiBreak: String, contratMinSansCoupure: string): Observable<any> {
    return this.httpClient.get(this.baseUrl + '/' + uuidEmployee + '/' + longueurMiniBreak + '/' + longueurMaxiShiftSansBreak + '/' + nbHeuresMinSansCoupure + '/' + longueurMiniShift + '/' + longueurMaxiBreak+ '/' + contratMinSansCoupure);
  }
}
