import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpServiceService {

  constructor(private http: HttpClient) {
  }

  public getIPAddress(): Observable<object> {
    return this.http.get('http://api.ipify.org/?format=json');
  }
}
