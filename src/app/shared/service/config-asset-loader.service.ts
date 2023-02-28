import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from './path.service';
import {Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class ConfigAssetLoaderService {

  private readonly CONFIG_URL = 'assets/config/config.json';
  private configuration: Observable<any>;

  constructor(private http: HttpClient, private  pathService: PathService, private title: Title) {
  }

  public loadConfigurations(): Promise<any> {
    if (!this.configuration) {
      this.configuration = this.http.get(this.CONFIG_URL);
    }
    return this.configuration.toPromise().then(config => {
      this.pathService.hostServerEmployee = config.hostServerEmployee;
      this.pathService.hostServerPlanning = config.hostServerPlanning;
      this.pathService.hostServerGDH = config.hostServerGDH;
      this.pathService.hostServerSecurity = config.hostServerSecurity;
      this.pathService.hostServerCalculePlanning = config.hostServerCalculePlanning;
      this.pathService.hostServerRapport = config.hostServerRapport;

      this.pathService.defaultRestaurantId = config.defaultRestaurantId;
      this.title.setTitle(config.title);
      this.pathService.idleTime = config.idleTimeMax;
    });
  }

}
