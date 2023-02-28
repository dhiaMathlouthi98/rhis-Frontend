import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export class ConfigTypeService<Model> extends GenericCRUDRestService<Model, String> {
  constructor(private pathService: PathService, httpClient: HttpClient, rootPath: string) {
    super(httpClient, `${pathService.getPathEmployee()}/${rootPath}`);
  }

  /**
   * Get all entities of type Model
   */
  public getAll(): Observable<Model[]> {
    return super.getAll('/all');
  }

  /**
   * Update en entity of type Model
   * @param: entity
   */
  public update(entity: Model): Observable<Model> {
    return super.update(entity, '/update');
  }

  /**
   * Add an entity of type Model
   * @param: entity
   */
  public add(entity: Model): Observable<Model> {
    return super.add(entity, '/add');
  }

  /**
   * Remove an entity of type Model by id
   * @param: id
   */
  public remove(id: String): Observable<Response> {
    return super.remove(id, '/delete/');
  }
}
