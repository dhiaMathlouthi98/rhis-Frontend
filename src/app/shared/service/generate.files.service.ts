import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from './path.service';
import {GDHFilter} from '../model/gui/GDH-filter';
import {RhisTranslateService} from './rhis-translate.service';

@Injectable({
  providedIn: 'root'
})
export class GenerateFilesService {
  public fieldsToPrint = [
    {
      libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.INFORMATION_EMPLOYEE'),
      value: 'Information employé',
      isOpen: true,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.INFORMATION_PERSONNEL'),
        value: 'Information personnel',
        isOpen: true,
        thirdLevel: [
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_NOM'),
            value: 'EMP.NOM'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_PRENOM'),
            value: 'EMP.PRENOM'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_MATRICULE'),
            value: 'EMP.MATRICULE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_BADGE'),
            value: 'EMP.BADGE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_DATE_ANCIENNETE'),
            value: 'EMP.DATE_ANCIENNETE'
          }, {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_DATE_NAISSANCE'),
            value: 'EMP.DATE_NAISSANCE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_SEXE'),
            value: 'EMP.SEXE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_NUM'),
            value: 'EMP.NUM_TEL'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_MAIL'),
            value: 'EMP.MAIL'
          }, {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_ADDR'),
            value: 'EMP.ADDR'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_COMPL_ADDR'),
            value: 'EMP.COMPLEMENT'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_CODE_POSTAL'),
            value: 'EMP.CODE_POSTAL'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.EMPLOYEE_VILLE'),
            value: 'EMP.VILLE'
          }, {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.NATIONALITE'),
            value: 'EMP.NATIONALITE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.DATE_FIN_CARTE_SEJOUR'),
            value: 'EMP.DATE_FIN_CARTE_SEJOUR'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.DATE_FIN_AUTORISATION_TRAVAIL'),
            value: 'EMP.DATE_FIN_AUTORISATION_TRAVAIL'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.DATE_FIN_TRAVAILLEUR_ETRANGER'),
            value: 'EMP.DATE_FIN_TRAVAILLEUR_ETRANGER'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.NUM_CENTRE'),
            value: 'EMP.NUM_CENTRE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.NOM_TITRE_SEJOUR'),
            value: 'EMP.NOM_TITRE_SEJOUR'
          }, {
            libelle: this.rhisTranslateService.translate('EMPLOYEE.HANDICAP'),
            value: 'EMP.HANDICAP'
          }, {
            libelle: this.rhisTranslateService.translate('EMPLOYEE.CODE_POSTAL_NAISSANCE'),
            value: 'EMP.CODE_POSTAL_NAISSANCE'
          }, {
            libelle: this.rhisTranslateService.translate('EMPLOYEE.VILLE_NAISSANCE'),
            value: 'EMP.VILLE_NAISSANCE'
          }, {
            libelle: this.rhisTranslateService.translate('EMPLOYEE.PAYS_NAISSANCE'),
            value: 'EMP.PAYS_NAISSANCE'
          }
        ]
      },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.BANQUE'),
          value: 'Banque',
          isOpen: false,
          thirdLevel: [
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.BANQUE_BIC'),
              value: 'EMP.BIC'
            },
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.BANQUE_IBAN'),
              value: 'EMP.IBAN'
            }]
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.SANTE'),
          value: 'Sante',
          isOpen: false,
          thirdLevel: [
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.SANTE_NUM_SEC'),
              value: 'EMP.NUM_SECU_SOCIALE'
            },
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.SANTE_MUTUELLE'),
              value: 'EMP.MUTUELLE'
            },
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.SANTE_PERSONNE_CAS_URGENCE'),
              value: 'EMP.PERSONNE_URGENCE'
            },
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.SANTE_NUM_CAS_URGENCE'),
              value: 'EMP.NUM_URGENCE'
            }]
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.DIVERS'),
          value: 'Divers',
          isOpen: false,
          thirdLevel: [
            {
              libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.DIVERS_MOYEN_TRANSPORT'),
              value: 'EMP.MOYEN_TRANSPORT'
            }]
        }]
    },
    {
      libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT'),
      value: 'Contrat',
      isOpen: false,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_GLOB'),
        value: 'generalFields',
        isOpen: false,
        thirdLevel: [
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_POSTE'),
            value: 'CONTRAT.POSTE'
          },
          {
            libelle: this.rhisTranslateService.translate('GROUPE_TRAVAIL.LEVEL'),
            value: 'CONTRAT.LEVEL'
          },
          {
            libelle: this.rhisTranslateService.translate('GROUPE_TRAVAIL.ECHELON'),
            value: 'CONTRAT.ECHELON'
          },
          {
            libelle: this.rhisTranslateService.translate('GROUPE_TRAVAIL.COEFFICIENT'),
            value: 'CONTRAT.COEFFICIENT'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_HEBDO'),
            value: 'CONTRAT.HEBDO'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TYPE'),
            value: 'CONTRAT.TYPE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_STATUS'),
            value: 'CONTRAT.STATUS'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TEMPS_PLEIN'),
            value: 'CONTRAT.TEMPS_PLEIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DATE_DEBUT'),
            value: 'CONTRAT.DATE_DEBUT'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DATE_FIN'),
            value: 'CONTRAT.DATE_FIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_MOTIF_FIN'),
            value: 'CONTRAT.MOTIF_FIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_MENS'),
            value: 'CONTRAT.MENS'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_AN'),
            value: 'CONTRAT.AN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TAUX_HORAIRE'),
            value: 'CONTRAT.TAUX_HORAIRE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_SALAIRE'),
            value: 'CONTRAT.SALAIRE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_COMPLE'),
            value: 'CONTRAT.COMPLE'
          }]
      },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_REPART'),
          value: 'Repartition'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DISPO'),
          value: 'Disponibilités'
        }]
    },
    {
      libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.AVENANT'),
      value: 'Avenant',
      isOpen: false,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_GLOB'),
        value: 'Av.generalFields',
        isOpen: false,
        thirdLevel: [
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_POSTE'),
            value: 'AVENANT.POSTE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_HEBDO'),
            value: 'AVENANT.HEBDO'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TYPE'),
            value: 'AVENANT.TYPE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_STATUS'),
            value: 'AVENANT.STATUS'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TEMPS_PLEIN'),
            value: 'AVENANT.TEMPS_PLEIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DATE_DEBUT'),
            value: 'AVENANT.DATE_DEBUT'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DATE_FIN'),
            value: 'AVENANT.DATE_FIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_MOTIF_FIN'),
            value: 'AVENANT.MOTIF_FIN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_MENS'),
            value: 'AVENANT.MENS'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_AN'),
            value: 'AVENANT.AN'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_TAUX_HORAIRE'),
            value: 'AVENANT.TAUX_HORAIRE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_SALAIRE'),
            value: 'AVENANT.SALAIRE'
          },
          {
            libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_COMPLE'),
            value: 'AVENANT.COMPLE'
          }]
      },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_REPART'),
          value: 'Av.Repartition'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.CONTRAT_DISPO'),
          value: 'Av.Disponibilités'
        }]
    },
    {
      libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.COMPETENCES'),
      value: 'Competences',
      isOpen: false,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.COMPETENCES_QUALIF'),
        value: 'Qualification'
      },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.COMPETENCES_FORMATION_OBLIG'),
          value: 'Formations Obligatoire'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.COMPETENCES_FORMATION_NON_OBLIG'),
          value: 'Autres formations'
        }]
    },
    {
      libelle: this.rhisTranslateService.translate('RESTAURANT.NAME'),
      value: 'Restaurant',
      isOpen: false,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('CREATE_RESTAURANT.RESTAURANT_MATRICULE_EXTERNE'),
        value: 'RESTAURANT.CODE_EXTERNE'
      }]
    },
    {
      libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE'),
      value: 'Franchise',
      isOpen: false,
      secondLevel: [{
        libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_NAME'),
        value: 'FRAN.NOM'
      },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_TEL'),
          value: 'FRAN.NUMTELPHONE'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_ADDRESS'),
          value: 'FRAN.ADRESSE'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_CITY'),
          value: 'FRAN.VILLE'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_ZIP'),
          value: 'FRAN.CODEPOSTAL'
        },
        {
          libelle: this.rhisTranslateService.translate('DOWNLOAD_EMPLOYEE_EXCEL.FRANCHISE_ZIP_CITY'),
          value: 'FRAN.CODEPOSTAL_VILLE'
        }]
    }
  ];

  constructor(private httpClient: HttpClient, private pathService: PathService, private rhisTranslateService: RhisTranslateService) {
  }

  /**
   * Elle permet de retourner le nom du fichier genrerer dans le serveur
   * @param langue
   * @param filter
   */
  public getFileName(langue: string, filter: any): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathEmployee() + '/excel/' + this.pathService.getUuidRestaurant() + '/' + langue + `${this.generateUrl(filter)}`);
  }

  private generateUrl(obj: any): string {
    let url = '';
    if (obj) {
      Object.entries(obj).forEach((entry, index) => {
        if (entry) {
          if (index === 0) {
            url = url + '?' + entry[0] + '=' + entry[1];
          } else {
            url = url + '&' + entry[0] + '=' + entry[1];
          }
        }
      });
    }
    return url;
  }

  /**
   * Permet de télécharger le fichier dont son nom est passer en param from employee service
   * @param fileName
   */
  public getFileByFileNameFromEmployeeService(fileName: string): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathEmployee() + '/files/' + fileName, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   * Permet de télécharger le fichier dont son nom est passer en param from gdh service
   * @param fileName
   */
  public getFileByFileNameFromGDHService(fileName: string): Observable<Blob> {
    return this.httpClient.get(this.pathService.getPathGdh() + '/gdh/files/' + fileName, {
      responseType: 'blob', observe: 'body'
    });
  }

  /**
   * Elle permet de retourner le nom du fichier csv genrerer dans le serveur à partir de la vue jour GDH
   * @param langue
   * @param filter
   */
  public getCSVVueJour(langue: string, filter: GDHFilter, isHourly: boolean): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathGdh() + '/gdh/CsvVueJour/' + this.pathService.getUuidRestaurant() + '/' + langue + `?datedebut=${filter.date}&datefin=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}&isHundredth=${!isHourly}`);
  }

  /**
   * Elle permet de retourner le nom du fichier csv genrerer dans le serveur à partir de la vue semaine GDH
   * @param langue
   * @param filter
   */
  public getCSVVueSemaine(langue: string, hourlyView: boolean, filter: GDHFilter): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathGdh() + '/gdhvs/CsvVueSem/' + this.pathService.getUuidRestaurant() + '/' + langue + '/' + hourlyView + `?datedebut=${filter.weekStartDate}&datefin=${filter.weekEndDate}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }

  public getGdhVueSemaineFile(dateDebut: string, dateFin: string, hourlyView: boolean, lang: string, uuidRestaurant?: string): Observable<string> {
    return this.httpClient.get<string>(`${this.pathService.hostServerGDH}/gdhvs/CsvVueSem/vuePaieValidation/${uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()}/${lang}/${hourlyView}?datedebut=${dateDebut}&datefin=${dateFin}`);
  }

  /**
   * Elle permet de retourner le nom du fichier csv genrerer dans le serveur à partir de la vue paye GDH
   * @param langue
   * @param filter
   */
  public getCSVVuePaye(langue: string, hourlyView: boolean, filter: GDHFilter, uuidRestaurant?: string): Observable<Object> {
    return this.httpClient.get(this.pathService.getPathGdh() + '/gdhvp/CsvVuePaye/' + (uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()) + '/' + langue + '/' + hourlyView + `?date=${filter.date}&filterIsEmployee=${filter.onlyEmployees}&filterIsManager=${filter.onlyManagers}`);
  }

  public getErrorsFileName(currentLangue: string, errors: string[]): Observable<Object> {
    return this.httpClient.post(this.pathService.getPathEmployee() + '/excel/importerrors/' + this.pathService.getUuidRestaurant() + '/' + currentLangue, errors);

  }


  public generateExcelFileFromFieldsOldVersion(currentLangue: string, filter: any, excelFields: Map<any, any>): Observable<Object> {
    const convMap = {};
    excelFields.forEach((val: any, key: string) => {
      if (val instanceof Map) {
        let secondLevelMap = {};
        val.forEach((innerVal: any, innerKey: string) => {
          if (innerVal instanceof Map) {
            let thirdLevelMap = {};
            innerVal.forEach((thirdLevelVal: any, thirdLevelKey: any) => {
              thirdLevelMap[thirdLevelKey] = thirdLevelVal;
            });
            innerVal = thirdLevelMap;
          }
          secondLevelMap[innerKey] = innerVal;
        });
        val = secondLevelMap;
      }
      convMap[key] = val;
    });
    return this.httpClient.post(this.pathService.getPathEmployee() + '/excelFromFields/' + this.pathService.getUuidRestaurant() + '/' + currentLangue + `${this.generateUrl(filter)}`, convMap);
  }

  public generateExcelFileFromFields(currentLangue: string, filter: any, fromListEmployee: boolean, uuidRestaurant?: string): Observable<Object> {
    if (!fromListEmployee) {
      filter.filterStatut = 'Actif,Embauche';
    }
    const convMap = this.getFieldsToPrint(fromListEmployee);

    return this.httpClient.post(this.pathService.getPathEmployee() + '/excelFromFields/' + (uuidRestaurant ? uuidRestaurant : this.pathService.getUuidRestaurant()) + '/' + currentLangue + `${this.generateUrl(filter)}`, convMap);
  }

  private addElementToMap(item: any, firstLevel: Map<any, any>, thirdLevel: boolean): void {
    let secondLevelElement;
    if (thirdLevel) {
      secondLevelElement = document.getElementById(item.attributes['data-parent'].value).attributes['data-parent'].value;
    } else {
      secondLevelElement = item.attributes['data-parent'].value;
    }
    let secondLevelMap = firstLevel.get(secondLevelElement);
    if (!secondLevelMap) {
      secondLevelMap = new Map();
    }
    if (thirdLevel) {
      let collection = secondLevelMap.get(item.attributes['data-parent'].value);
      if (collection) {
        collection.set(item.id, true);
      } else {
        collection = new Map();
        collection.set(item.id, true);
        secondLevelMap.set(item.attributes['data-parent'].value, collection);
      }
    } else {
      secondLevelMap.set(item.id, new Map());
    }
    firstLevel.set(secondLevelElement, secondLevelMap);
  }

  /**
   * recuperer les variables pour la téléchargement
   */
  public getFieldsToEmployeExcel() {
    const firstLevel = new Map();
    let secondLevelElement = new Map();
    const convMap = {};
    this.fieldsToPrint.forEach((item: any) => {
      if (item.secondLevel) {
        item.secondLevel.forEach((slv: any) => {
          secondLevelElement = item.value;
          let secondLevelMap = firstLevel.get(secondLevelElement);
          if (!secondLevelMap) {
            secondLevelMap = new Map();
          }
          if (slv.thirdLevel) {
            slv.thirdLevel.forEach((thlv: any) => {
              let collection = secondLevelMap.get(slv.value);
              if (collection) {
                collection.set(thlv.value, true);
              } else {
                collection = new Map();
                collection.set(thlv.value, true);
                secondLevelMap.set(slv.value, collection);
              }
            });
          } else {
            secondLevelMap.set(slv.value, new Map());
          }
          firstLevel.set(secondLevelElement, secondLevelMap);
        });
      }
    });
    return firstLevel;
  }

  /**
   * recuperer les variables pour génerer le fichier list des employés
   * @param fromListEmployee :si true -> on  génere le repport dans l onglet list employés
   */
  public getFieldsToPrint(fromListEmployee: boolean): any {
    const convMap = {};
    let firstLevel = new Map();
    firstLevel = !fromListEmployee ? this.getFieldsToEmployeExcel() : this.getFieldsToEmployeExcelFromListEmploye();
    firstLevel.forEach((val: any, key: any) => {
      if (val instanceof Map) {
        const secondLevelMap = {};
        val.forEach((innerVal: any, innerKey: string) => {
          if (innerVal instanceof Map) {
            const thirdLevelMap = {};
            innerVal.forEach((thirdLevelVal: any, thirdLevelKey: any) => {
              thirdLevelMap[thirdLevelKey] = thirdLevelVal;
            });
            innerVal = thirdLevelMap;
          }
          secondLevelMap[innerKey] = innerVal;
        });
        val = secondLevelMap;
      }
      convMap[key] = val;
    });
    return convMap;
  }

  /**
   * recuperer les variables sélectionnées dans l'onglet list employé
   * @private
   */
  private getFieldsToEmployeExcelFromListEmploye() {
    const firstLevel = new Map();
    const allThings = [];
    this.fieldsToPrint.forEach((item: any) => {
      allThings.push(document.getElementById(item.value));
      if (item.secondLevel) {
        item.secondLevel.forEach((slv: any) => {
          allThings.push(document.getElementById(slv.value));
          if (slv.thirdLevel) {
            slv.thirdLevel.forEach((tlv: any) => {
              allThings.push(document.getElementById(tlv.value));
            });
          }
        });
      }
    });
    allThings.forEach((item: any) => {
      if (item.checked) {
        if (item.attributes['data-parent']) {
          // lower level element
          if (item.attributes['thirdLevel']) {
            // thirdLevel element
            this.addElementToMap(item, firstLevel, true);
          } else {
            // second level element
            if (item.attributes['data-parent'].value === 'Contrat' ||
              item.attributes['data-parent'].value === 'Avenant' ||
              item.attributes['data-parent'].value === 'Competences' ||
              item.attributes['data-parent'].value === 'Franchise' ||
              item.attributes['data-parent'].value === 'Restaurant') {
              this.addElementToMap(item, firstLevel, false);
            }
          }
        }
      }
    });

    return firstLevel;
  }
}
