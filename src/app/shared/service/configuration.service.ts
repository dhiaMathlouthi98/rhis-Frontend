import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from './path.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private httpClient: HttpClient, private  sharedService: PathService) {
  }

  /**
   * Get badge number configuration
   */
  public getDefaultBadgeNumber() {
    return this.httpClient.get(this.sharedService.getPathEmployee() + '/configuration/badge');
  }

}
