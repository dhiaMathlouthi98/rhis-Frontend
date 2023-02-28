import {Injectable} from '@angular/core';
import {PathService} from '../../../../shared/service/path.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DateService} from '../../../../shared/service/date.service';

@Injectable({
  providedIn: 'root'
})
export class InterfaceCaisseService {

  private baseUrl = `${this.pathService.getPathPlanning()}/icaisse`;

  constructor(private pathService: PathService,
              private dateService: DateService,
              private httpClient: HttpClient) {
  }

  public importInterfaceCaisseFiles(file: File): Observable<void> {
    const formData = new FormData();
    formData.set('file', file);
    return this.httpClient.post<void>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/interfaceCaisse`, formData);
  }

  public importInterfaceNCRCaisseFiles(dateDebut: Date, dateFin: Date): Observable<number> {
    const dateDebutAsString: string = this.dateService.formatToShortDate(dateDebut);
    const dateFinAsString: string = this.dateService.formatToShortDate(dateFin);

    return this.httpClient.get<number>(`${this.baseUrl}/restaurants/${this.pathService.getUuidRestaurant()}/interfaceCaisseNCR/${dateDebutAsString}/${dateFinAsString}`);
  }

  public importInterfaceCaisseMICROSFiles(startDate: Date, endDate: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(startDate);
    const formattedEndDate: string = this.dateService.formatToShortDate(endDate);
    return this.httpClient.get<void>(`${this.baseUrl}/system/manually/micros/restaurants/${this.pathService.getUuidRestaurant()}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
  }

  public importInterfaceBOHCaisseFiles(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseBOH/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }

  public importInterfaceMAITREDCaisseFiles(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseMAITRED/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }


  public importInterfaceIMPORT_FICHIERCaisseFiles(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseREBOOT/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }

  public importInterfaceREBOOTCaisse(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseREBOOT/manually/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }

  public importInterfaceZeltyCaisse(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseZelty/manually/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }
  public importInterfaceCashPadCaisse(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseCashpad/manually/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }

  public importInterfaceAdditionCaisse(dateDebut: Date, dateFin: Date): Observable<void> {
    const formattedStartDate: string = this.dateService.formatToShortDate(dateDebut);
    const formattedEndDate: string = this.dateService.formatToShortDate(dateFin);
    return this.httpClient.get<void>(`${this.baseUrl}/interfaceCaisseAddition/manually/${this.pathService.getUuidRestaurant()}?dateDebutAsString=${formattedStartDate}&dateFinAsString=${formattedEndDate}`);
  }

}
