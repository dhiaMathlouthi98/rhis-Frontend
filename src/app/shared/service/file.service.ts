import {Injectable} from '@angular/core';
import {PathService} from './path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private pathService: PathService, private httpClient: HttpClient) {
  }

  /**
   * Get type restaurant logo by its code
   * @param: codeFile
   */
  public getLogoByName(codeFile: string): Observable<any> {
    return this.httpClient.get(`${this.pathService.getPathEmployee()}/files/logo/${codeFile}`, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   * Delete a logo by its name
   * @param: fileName
   */
  public deleteLogoByName(fileName: string) {
    return this.httpClient.delete(`${this.pathService.getPathEmployee()}/files/logo/${fileName}`);
  }
}
