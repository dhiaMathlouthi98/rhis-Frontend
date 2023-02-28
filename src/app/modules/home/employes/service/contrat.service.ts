import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from '../../../../shared/service/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from '../../../../shared/service/path.service';
import {DateService} from '../../../../shared/service/date.service';
import {ContratModel} from '../../../../shared/model/contrat.model';
import {JourDisponibiliteModel} from '../../../../shared/model/jourDisponibilite.model';
import {JourDisponibiliteService} from './jour-disponibilite.service';

@Injectable({
  providedIn: 'root'
})
export class ContratService extends GenericCRUDRestService<ContratModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient, private dateHelperService: DateService, private jourDisponibiliteService: JourDisponibiliteService) {
    super(httpClinent, `${pathService.getPathEmployee()}/contrat/`);
  }

  /**
   *  recupere tous les contrat par employeeId
   * @param :emplId
   */
  public findAllContratByEmployeeID(emplId: string): Observable<ContratModel[]> {
    return this.httpClient.get<ContratModel[]>(`${this.baseUrl}` + 'all/' + emplId);
  }

  /**
   * get contrat actif
   * @param: date
   * @param: employeeId
   */
  public getActifContratByEmployee(date: Date, employeeId: string) {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(date);
    return this.httpClient.get(`${this.baseUrl}` + 'actifContrat/' + dateChoisit + '/' + employeeId);
  }

  /**
   * get fuill contrat (groupe de travail,type contrat, disponiblite,repartition)
   * @param: contratId
   */
  public getFullContratByIdContrat(contratId: string) {
    return this.httpClient.get(`${this.baseUrl}` + contratId);
  }

  /**
   * get contrats non actif
   * @param: employeeId
   */
  public getListContratByEmployeWithoutContratActif(date: Date, employeeId: string) {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(date);
    return this.httpClient.get(`${this.baseUrl}` + 'notActifContrat' + '/' + dateChoisit + '/' + employeeId);
  }

  /**
   * get fuill avenant contrat (groupe de travail,type contrat, disponiblite,repartition)
   * @param: contratId
   */
  public getFullAvenantContratByIdContrat(contratId: string) {
    return this.httpClient.get(`${this.baseUrl}` + 'avenant' + '/' + contratId);
  }

  /**
   * get avenant contrat actif
   * @param: date
   * @param: contratId
   */
  public getActifAvenantContratByEmployee(date: Date, contratId: string) {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(date);
    return this.httpClient.get(`${this.baseUrl}` + 'actifAvenant/' + dateChoisit + '/' + contratId);
  }

  /**
   * get contrats non actif
   * @param: employeeId
   */
  public getPresentConratByDateDebutAndDateFin(dateEffectif: Date, dateFin: Date, employeeId: string): Observable<any> {
    const dateEffectifContrat = this.dateHelperService.formatDateToScoreDelimiter(dateEffectif);
    let dateFinContrat;
    let url = `${this.baseUrl}presentContrat/${dateEffectifContrat}/${employeeId}`;
    if (dateFin) {
      dateFinContrat = this.dateHelperService.formatDateToScoreDelimiter(dateFin);
    }
    if (dateFin) {
      url = url + `?dateFinAsString=${dateFinContrat}`;
    }
    return this.httpClient.get(url);
  }

  /**
   * get contrats non actif
   * @param: employeeId
   */
  public getPresentConratHasGroupeTravailDirecteur(dateEffectif: Date, dateFin: Date, contratId: string): Observable<any> {
    const dateEffectifContrat = this.dateHelperService.formatDateToScoreDelimiter(dateEffectif);
    let dateFinContrat;
    if (!contratId) {
      contratId = "00000000-0000-0000-0000-000000000000";
    }
    let url = `${this.baseUrl}${this.pathService.getUuidRestaurant()}/presentDirecteur/${dateEffectifContrat}/${contratId}`;
    if (dateFin) {
      dateFinContrat = this.dateHelperService.formatDateToScoreDelimiter(dateFin);
    }
    if (dateFin) {
      url = url + `?dateFinAsString=${dateFinContrat}`;
    }
    return this.httpClient.get(url);
  }

  /**
   * persist contrat
   * @param: contrat
   * @param: arrondiContratMensuel
   */
  public persistContrat(contrat: ContratModel, arrondiContratMensuel) {
    contrat.disponibilite.jourDisponibilites.forEach(item => {

      this.setCorrectDateFormat(item);

    });
    if (contrat.avenantContrats) {
      contrat.avenantContrats.forEach(avenant => {
        if (avenant.disponibilite) {
          avenant.disponibilite.jourDisponibilites.forEach(jourDisponiblite => {
            this.setCorrectDateFormat(jourDisponiblite);
          });
        }
      });
    }
    this.dateHelperService.setCorrectDate(contrat.dateEffective);
    if (contrat.datefin) {
      this.dateHelperService.setCorrectDate(contrat.datefin);
    }
    return this.httpClient.post(`${this.baseUrl}` + arrondiContratMensuel + '/' + this.pathService.getUuidRestaurant() + '/' + 0, contrat);
  }

  /**
   * update contrat
   * @param: contrat
   * @param: arrondiContratMensuel
   */
  public UpdateContrat(contrat, arrondiContratMensuel, disactivatContrat: number) {
    contrat.disponibilite.jourDisponibilites.forEach(item => {

      this.setCorrectDateFormat(item);
    });
    if(disactivatContrat){
      contrat.avenantContrats = [];
    }else if (contrat.avenantContrats) {
      contrat.avenantContrats.forEach(avenant => {
        if (avenant.disponibilite) {
          avenant.disponibilite.jourDisponibilites.forEach(jourDisponiblite => {
            this.setCorrectDateFormat(jourDisponiblite);
          });
        }
      });
    }
    this.dateHelperService.setCorrectDate(contrat.dateEffective);
    if (contrat.datefin) {
      this.dateHelperService.setCorrectDate(contrat.datefin);
    }
    return this.httpClient.post(`${this.baseUrl}` + arrondiContratMensuel + '/' + this.pathService.getUuidRestaurant() + '/' + disactivatContrat, contrat);
  }


  /**
   * persist avenant
   * @param: avenant
   * @param: arrondiContratMensuel
   */
  public persistAvenant(avenant: ContratModel, arrondiContratMensuel, disactivatAvenantDisplay: number) {
    avenant.disponibilite.jourDisponibilites.forEach(item => {

      this.setCorrectDateFormat(item);
    });
    if (avenant.contratPrincipale && avenant.contratPrincipale.disponibilite) {
      avenant.contratPrincipale.disponibilite.jourDisponibilites.forEach(item => {
        this.setCorrectDateFormat(item);
      });
    }
    return this.httpClient.post(`${this.baseUrl}` + 'avenant/' + arrondiContratMensuel + '/' + this.pathService.getUuidRestaurant() + '/' + disactivatAvenantDisplay, avenant);
  }

  /**
   * podifier avenant
   * @param: avenant
   * @param: arrondiContratMensuel
   */
  public updateAvenant(avenant: ContratModel, arrondiContratMensuel): Observable<ContratModel> {
    avenant.disponibilite.jourDisponibilites.forEach(item => {

      this.setCorrectDateFormat(item);
    });
    if (avenant.contratPrincipale && avenant.contratPrincipale.disponibilite) {
      avenant.contratPrincipale.disponibilite.jourDisponibilites.forEach(item => {
        this.setCorrectDateFormat(item);
      });
    }

    return this.httpClient.post<ContratModel> (`${this.baseUrl}` + 'avenant/' + arrondiContratMensuel + '/' + this.pathService.getUuidRestaurant() + '/' + 0, avenant);
  }

  /**
   * suppression groupTravail
   * @param: idGroupTravail
   */
  public deleteAvenant(idAvenant: string): Observable<Object> {
    return super.remove(idAvenant, 'delete/');
  }


  /**
   * get last contrat
   * @param: employeeId
   */
  public getLastContratByEmployee(employeeId: string) {
    return this.httpClient.get(`${this.baseUrl}` + 'lastContrat/' + employeeId);
  }

  /**
   * get contrat actif with disponiblite
   * @param: employeeId
   */
  public getActifContratByEmployeeWithDisponiblite(employeeId: string, dateShift: Date , statusEmbauche?: boolean) {
    const datePlg = this.dateHelperService.formatDateToScoreDelimiter(dateShift);
    const status = statusEmbauche ? statusEmbauche : false;
    const embauche = status ? '1' : '0';
    return this.httpClient.get(`${this.baseUrl}` + 'contratActifWithDisponiblite/' + employeeId + '/' + datePlg + '/' + embauche);
  }

  /**
   * Count number of active contract with contract type active and determined or not and by restaurant id
   */
  public countContractsBasedOnContractTypeAndRestaurantId(isDetermined: boolean, isAvenant: boolean): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}${this.pathService.getUuidRestaurant()}/active/count?isDetermined=${isDetermined}&isAvenant=${isAvenant}`);
  }

  /**
   * get fuill avenant contrat
   * @param: EmployeeId
   */
  public getAvenantOrContratByIdEmployee(employeeId: string) {
    return this.httpClient.get(`${this.baseUrl}` + 'allContrat' + '/' + employeeId);
  }

  /**
   * get contrats actif par date
   * @param :dateDebut
   * @param :dateFin
   * @param :employeeId
   */
  public getActifContratByDateDebutAndDateFin(dateDebut: Date, dateFin: Date, employeeId: string): Observable<any> {
    const dateDebutShift = this.dateHelperService.formatDateToScoreDelimiter(dateDebut);
    let dateFinContrat;
    let url = `${this.baseUrl}actifContratByDate/${dateDebutShift}/${employeeId}`;
    if (dateFin) {
      dateFinContrat = this.dateHelperService.formatDateToScoreDelimiter(dateFin);
      url = url + `?dateFinAsString=${dateFinContrat}`;
    }

    return this.httpClient.get(url);
  }

  /**
   * correction format date de disponiblité avant de sauvegarder dans la bd
   * @param: jourDisponibilite
   */
  private setCorrectDateFormat(jourDisponibilite: JourDisponibiliteModel) {
    if (jourDisponibilite.debut1) {
      jourDisponibilite.debut1 = this.dateHelperService.formatDateTo(jourDisponibilite.debut1, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (jourDisponibilite.fin1) {
      jourDisponibilite.fin1 = this.dateHelperService.formatDateTo(jourDisponibilite.fin1, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (jourDisponibilite.debut2) {
      jourDisponibilite.debut2 = this.dateHelperService.formatDateTo(jourDisponibilite.debut2, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (jourDisponibilite.fin2) {
      jourDisponibilite.fin2 = this.dateHelperService.formatDateTo(jourDisponibilite.fin2, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (jourDisponibilite.debut3) {
      jourDisponibilite.debut3 = this.dateHelperService.formatDateTo(jourDisponibilite.debut3, 'YYYY-MM-DDTHH:mm:ss');
    }
    if (jourDisponibilite.fin3) {
      jourDisponibilite.fin3 = this.dateHelperService.formatDateTo(jourDisponibilite.fin3, 'YYYY-MM-DDTHH:mm:ss');
    }
  }
}
