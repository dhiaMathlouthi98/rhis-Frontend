import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GenericCRUDRestService} from '../../../../service/generic-crud.service';
import {VariableReportModel} from '../../../../model/variable-report.model';
import {PathService} from '../../../../service/path.service';

@Injectable({
  providedIn: 'root'
})
export class VariableReportService extends GenericCRUDRestService<VariableReportModel, Number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathEmployee()}/variableRapport`);
  }

  public getAll(): Observable<VariableReportModel[]> {
    return super.getAll();
  }

  public getDistinctCategoriesPaths(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.baseUrl}/distinct_categories_paths`);
  }
}
