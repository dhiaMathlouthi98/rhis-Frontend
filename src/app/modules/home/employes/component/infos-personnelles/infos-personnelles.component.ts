import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BadgeService} from '../../service/badge.service';
import {BadgeModel} from '../../../../../shared/model/badge.model';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {MoyenTransportService} from '../../../configuration/service/moyenTransport.service';
import {EmployeeModel} from '../../../../../shared/model/employee.model';
import {EmployeeService} from '../../service/employee.service';
import {DateService} from '../../../../../shared/service/date.service';
import {SharedEmployeeService} from '../../service/sharedEmployee.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NationaliteModel} from '../../../../../shared/model/nationalite.model';
import {NotificationService} from '../../../../../shared/service/notification.service';
import {NationaliteService} from '../../../configuration/service/nationalite.service';
import {Observable, Subject} from 'rxjs';
import {ConfirmationService} from 'primeng/api';
import {BanqueModel} from '../../../../../shared/model/banque.model';
import {SecuriteSocialeModel} from '../../../../../shared/model/securiteSociale.model';
import {SharedRestaurantService} from '../../../../../shared/service/shared.restaurant.service';
import {SessionService} from '../../../../../shared/service/session.service';
import {UtilisateurService} from '../../../../admin/utilisateur/service/utilisateur.service';
import {ScrollToBlockService} from '../../../../../shared/service/scroll-to-block.service';
import {DomControlService} from '../../../../../shared/service/dom-control.service';
import {DiversModel} from '../../../../../shared/model/divers.model';
import * as rfdc from 'rfdc';

@Component({
  selector: 'rhis-infos-personnelles',
  templateUrl: './infos-personnelles.component.html',
  styleUrls: ['./infos-personnelles.component.scss']
})
export class InfosPersonnellesComponent implements OnInit {
  public navigateAway: Subject<boolean> = new Subject<boolean>();
  public listBadge;
  public badge: BadgeModel;
  public listPays;
  public nationalite = {} as NationaliteModel;
  public listMoyenTransport;
  public employee = {} as EmployeeModel;
  public today = new Date();
  // pour passer en url idSecuriteSocial et idBanque   en cas de modifier d'un employee
  public idSecuriteSocial = 0;
  public uuidSecuriteSocial = null;
  public idDivers = 0;
  public uuidDivers = null;
  public defaultEmployee = {} as EmployeeModel;
  public idBanque = 0;
  public uuidBanque = null;
  public canChange = false;
  public clone = rfdc();

  // gestion des unicite lors d 'ajout d' un employe
  public unicite = {
    emailExist: false,
    matriculeExist: false,
    numeroSecuriteSocialExist: false,
    bicAndIbanBanqueExist: false,
  };
  // gestion de titre de sejour et autorisation de travail par rapport a la nationalite de l'employee
  public statutAutoTravailTitreSejour = {
    autorisationTravail: false,
    titreSejour: false,
  };
  public infosPersonnellesForm: FormGroup = new FormGroup({
    coordonnees: new FormControl(''),
    banque: new FormControl(''),
    securiteSocial: new FormControl(''),
    divers: new FormControl('')
  });
  public formSubmitted = false;
  public canSave = false;
  // si on ajoute un nouveau employee ,le badge ne s'affiche pas
  public hiddenBadge = true;
  // verification si l'employee enregistrer a la base de donnée
  public saveEmployeeToBD = false;
  private ecran = 'ELE';

  public formSubmittedAndValid = false;
  constructor(private badgeService: BadgeService,
              private nationaliteService: NationaliteService,
              private rhisTranslateService: RhisTranslateService,
              private moyenTransportService: MoyenTransportService,
              private employeeService: EmployeeService,
              private notificationService: NotificationService,
              private dateService: DateService,
              private sharedEmployeeService: SharedEmployeeService,
              private route: ActivatedRoute,
              private router: Router,
              private confirmationService: ConfirmationService,
              private sharedRestaurant: SharedRestaurantService,
              private sessionService: SessionService,
              private utilisateurService: UtilisateurService,
              private scrollToBlockService: ScrollToBlockService,
              private domControlService: DomControlService) {
    this.route.parent.params.subscribe(params => {
      this.employee = {} as EmployeeModel;
      this.employee.idEmployee = params.idEmployee;
      this.getInfoEmployees();
    });
  }

  public addButtonControl(): boolean {
    return this.domControlService.addControlButton(this.ecran);
  }

  public deleteButtonControl(): boolean {
    return this.domControlService.deleteListControl(this.ecran);
  }

  async ngOnInit() {
    const matricule: string = await this.addDebutCodeRestaurant();
    this.infosPersonnellesForm.patchValue({
      coordonnees: {
        matricule: matricule
      }
    });
    this.defaultEmployee.matricule = matricule;
  }

  /**
   * * recuperer l'id de l'employee
   * */
  getIdEmployee() {
    this.unicite.numeroSecuriteSocialExist = false;
    if (this.sharedEmployeeService.selectedEmployee) {
      this.employee = this.sharedEmployeeService.selectedEmployee;
      this.employee.idEmployee = this.sharedEmployeeService.selectedEmployee.idEmployee;
      if (!this.employee.securiteSocial) {
        this.idSecuriteSocial = 0;
        this.uuidSecuriteSocial = null;
      }
      if (!this.employee.banque) {
        this.idBanque = 0;
        this.uuidBanque = null;
      }
      if (!this.employee.divers) {
        this.idDivers = 0;
        this.uuidDivers = null;
      }

    } else if (this.employee.idEmployee) {
      this.getEmployeByIdWithBadge();
    }
  }

  /**
   * requperer les details de l'employé
   * * les methodes doit etre  shycronniser
   */
  public lazyDetailEmployee() {
    this.employeeService.requestDataFromMultipleSources(this.employee.uuid).subscribe(responseList => {
      this.employee.moyenTransport = responseList[0];
      this.employee.securiteSocial = responseList[1];
      // todo we should verify in other attribute rather than ``securiteSocial``
      // if (this.sessionService.getPermissions() && +this.sessionService.getRestaurant() > 0) {
      //   if (this.sessionService.getPermissions().indexOf('' + this.employee.securiteSocial.idRestaurant) < 0) {
      //     this.router.navigateByUrl('/forbidden');
      //   }
      // }
      this.employee.banque = responseList[2];
      this.employee.nationalite = responseList[3];
      this.employee.divers = responseList[4];
      this.showNaionaliteOfEmployee();
      this.showDetailEmploye();

    });
  }

  /*
  permet de verifier la validation de champs obligatoires
   */
  public async onSubmit() {
    Object.keys(this.unicite).forEach(key => {
      this.unicite[key] = false;
    });
    this.formSubmittedAndValid = false;
    this.formSubmitted = true;
    this.canSave = false;
    if (this.infosPersonnellesForm.valid) {
      this.canSave = true;
      this.getEmployeeDetail();
      this.saveEmployeeToBD = false;
      if (this.employee.idEmployee) {
        await this.verifyEmployeeToUpdate();
      } else {
        await this.saveEmployee();
      }
    }
    if (this.infosPersonnellesForm.invalid) {
      const errorElements = document.querySelectorAll(
        'input.has-error');

      const errorElementsNationalite = document.querySelectorAll(
        'div.has-error');

      setTimeout(
        () => {
          [].forEach.call(errorElements, (node) => {
            if (errorElements[0].parentElement.getElementsByClassName('ui-calendar')) {
              this.scrollToBlockService.scrollToError(errorElements[0].parentElement.parentElement.parentElement.parentElement);
            } else {
              this.scrollToBlockService.scrollToError(errorElements[0].parentElement);
            }
          });
          [].forEach.call(errorElementsNationalite, (node) => {
            if (errorElementsNationalite[0].parentElement.getElementsByClassName('ui-dropdown')) {
              this.scrollToBlockService.scrollToError(errorElementsNationalite[0].parentElement.parentElement.parentElement);
            } else {
              this.scrollToBlockService.scrollToError(errorElementsNationalite[0].parentElement);
            }
          });
        }
        , 200);
    }
  }

  /*
   recuperations lalist de badge disponible par restaurant
   */
  getlistBadge() {
    this.badgeService.getAllBadgeDisponible().subscribe(
      (data: any) => {
        if (data != null) {
          this.listBadge = data;
          if (this.employee.idEmployee && this.employee.badge) {
            this.listBadge.push(this.employee.badge);
          }
        }

      },
      (err: any) => {
        console.log('Erreure au niveau de la liste badge');
      }
    );
  }

  /**
   * Cette methode permet de recuperer la liste des pays
   */
  getListPays() {
    this.nationaliteService.getAll().subscribe(
      (data: any) => {
        this.listPays = data;
        this.getLabelPays();
      },
      (err: any) => {
        console.log('error');
        console.log(err);
      }
    );
  }

  /**
   * recuperer la libelle de pays selon la langue de navigateur
   */
  getLabelPays() {

      this.listPays.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1));
      this.listPays.forEach(pays => {
        this.nationalite.libellePays = pays.libelleFR;
      });
    }


  /**
   * Cette methode permet de recuperer la liste des moyens de transports
   */
  getlistMoyenTransport() {
    this.moyenTransportService.getAllMoyenTransportActive().subscribe(
      (data: any) => {
        this.listMoyenTransport = data;

      },
      (err: any) => {
        console.log('Erreuue au niveau de la liste moyen de transport');
      }
    );
  }

  /**
   * Cette methode permet de recuperer l'employee avec le badge
   */
  getEmployeByIdWithBadge() {
    this.employeeService.getEmployeByIdWithBadge(this.employee.uuid).subscribe(
      (employee: EmployeeModel) => {
        this.employee = employee;
        this.verifyMail();
        this.sharedEmployeeService.selectedEmployee = employee;
        this.defaultEmployee = JSON.parse(JSON.stringify(this.employee));
        this.setIdSecuriteSocialAndIdBanqueToEmployeeBefore();
      },
      (err: any) => {
        console.log('Erreuue au niveau de un employe ');
      }
    );
  }

  private verifyMail() {
    if (!this.employee.email.includes('@')) {
      (this.employee.email = '');
    }
  }

  /**
   *recupere l objet employea avec securite social et banque
   * */
  getEmployeeDetail() {
    this.setIdSecuriteSocialAndIdBanqueToEmployeeBefore();
    Object.entries(this.infosPersonnellesForm.value).forEach(entry => {
      if (entry[0] === 'coordonnees' || entry[0] === 'divers') {
        this.employee = {...this.employee, ...entry[1]};
      } else {
        this.employee[entry[0]] = entry[1];
      }
    });
    this.setIdSecuriteSocialAndIdBanqueToEmployeeAfter();

  }

  /**
   * enregistrer employee
   */
  private async saveEmployee() {
    if (!this.employee.email) {
      this.employee.email = '';
    }
    this.setEmployeeBeforSave();
    try {
      const data = await this.employeeService.add(this.employee).toPromise();
      this.setEmployeeAfterSave(data);
    } catch (e) {
      this.canSave = false;
      this.setUniciteErrorMessageOnSaveEmploye(e);
    }


  }

  /**
   *set IdSecuriteSocial And IdBanqueToEmployee Before mapping employee
   */
  setIdSecuriteSocialAndIdBanqueToEmployeeBefore() {
    if (this.employee.banque) {
      this.idBanque = this.employee.banque.idBanque;
      this.uuidBanque = this.employee.banque.uuid;
    }
    if (this.employee.securiteSocial) {
      this.idSecuriteSocial = this.employee.securiteSocial.idSecuriteSocial;
      this.uuidSecuriteSocial = this.employee.securiteSocial.uuid;
    }
    if (this.employee.divers) {
      this.idDivers = this.employee.divers.idDivers;
      this.uuidDivers = this.employee.divers.uuid;
    }
  }

  /**
   *set IdSecuriteSocial And IdBanqueToEmployee after mapping employee
   */
  setIdSecuriteSocialAndIdBanqueToEmployeeAfter() {
    if (this.employee.securiteSocial) {
      this.employee.securiteSocial.numero = this.employee.securiteSocial.numero.split(' ').join('');
      this.employee.securiteSocial.idSecuriteSocial = this.idSecuriteSocial;
      this.employee.securiteSocial.uuid = this.uuidSecuriteSocial;
    }
    if (this.employee.banque) {
      this.employee.banque.idBanque = this.idBanque;
      this.employee.banque.uuid = this.uuidBanque;
    }
    if (this.employee.divers) {
      this.employee.divers.idDivers = this.idDivers;
      this.employee.divers.uuid = this.uuidDivers;
    }
  }

  /**
   * update employee before save
   */
  setEmployeeBeforSave() {
    if (!this.employee.securiteSocial.numero &&
      !this.employee.securiteSocial.mutuelle &&
      !this.employee.securiteSocial.nomPersonneContacter &&
      !this.employee.securiteSocial.numTelephUrgence && !this.employee.nomPermisTravailCarteSejour && !this.employee.numPermisTravailCarteSejour) {
      this.employee.securiteSocial = null;
    }
    if (this.employee.nomPermisTravailCarteSejour || this.employee.numPermisTravailCarteSejour) {
      if (!this.employee.securiteSocial) {
        this.employee.securiteSocial = new SecuriteSocialeModel();
        this.employee.securiteSocial.numero = '';
        this.employee.securiteSocial.mutuelle = '';
        this.employee.securiteSocial.nomPersonneContacter = '';
        this.employee.securiteSocial.numTelephUrgence = '';
      }
      this.employee.securiteSocial.noTitreSejour = this.employee.numPermisTravailCarteSejour;
      this.employee.securiteSocial.nomTitreSejour = this.employee.nomPermisTravailCarteSejour;
    }
    if (!this.employee.banque.iban && !this.employee.banque.bic) {
      this.employee.banque = null;
    }
    if (this.employee.finValiditeSejour) {
      this.employee.finValiditeSejour = this.dateService.setCorrectDate(this.employee.finValiditeSejour);
    }
    if (this.employee.finValiditeAutorisationTravail) {
      this.employee.finValiditeAutorisationTravail = this.dateService.setCorrectDate(this.employee.finValiditeAutorisationTravail);
    }
    this.employee.sexe = this.employee.sexe[0];
    this.employee.nom = this.employee.nom.toUpperCase();
    this.employee.prenom = this.employee.prenom.toUpperCase();
    this.employee.dateNaissance = this.dateService.setCorrectDate(this.employee.dateNaissance);
    if (this.employee.dateEntree) {
      this.employee.dateEntree = this.dateService.setCorrectDate(this.employee.dateEntree);
    }
    if (!this.employee.badge) {
      this.employee.badge = null;
    }

    this.changeDiversByDetailEmployee();
    if (this.employee.divers && !this.employee.divers.paysNaissance) {
      this.employee.divers.paysNaissance = null;
    }
  }

  /**
   * update employee after save
   */
  setEmployeeAfterSave(data) {
    this.employee.idEmployee = data.idEmployee;
    this.employee.uuid = data.uuidEmployee;
    if (data.idBanque) {
      this.employee.banque.idBanque = data.idBanque;
      this.employee.banque.uuid = data.uuidBanque;
    }
    if (data.idSecuriteSocial) {
      this.employee.securiteSocial.idSecuriteSocial = data.idSecuriteSocial;
      this.employee.securiteSocial.uuid = data.uuidSecuriteSocial;

    }
    if (data.idDivers) {
      this.employee.divers.idDivers = data.idDivers;
      this.employee.divers.uuid = data.uuidDivers;
      if (!this.employee.divers.paysNaissance) {
        this.employee.divers.paysNaissance = null;
      }

    }
    Object.keys(this.unicite).forEach(key => {
      this.unicite[key] = false;
    });
    if (!this.sharedEmployeeService.selectedEmployee.idEmployee || this.sharedEmployeeService.selectedEmployee.idEmployee === this.employee.idEmployee) {
      this.sharedEmployeeService.selectedEmployee = this.clone(this.employee);
      this.defaultEmployee = JSON.parse(JSON.stringify(this.employee));
      this.saveEmployeeToBD = true;
      this.redirectToContrat();
    }

    this.setEmployeeUpdatedInSharedListEmployee();
    this.formSubmittedAndValid = true;
    this.notificationService.showSuccessMessage('EMPLOYEE.ADDED_SUCCESSFULLY');

  }

  /**
   * mise à jour l'employeé dans la liste des employees dans le shared employee
   */
  private setEmployeeUpdatedInSharedListEmployee() {
    let listOrdonneEmployee = [];
    this.sharedEmployeeService.listEmployeeDisplay.subscribe(employeeList => listOrdonneEmployee = employeeList);
    listOrdonneEmployee.forEach((emp, index) => {
      if (emp.idEmployee === this.employee.idEmployee) {
        listOrdonneEmployee[index] = this.employee;
      }
    });
    this.sharedEmployeeService.setListEmployeeDisplay(listOrdonneEmployee.sort((a, b) => (a.nom > b.nom) ? 1 : -1));
    this.setDisplayedName(listOrdonneEmployee);
  }

  private setDisplayedName(listOrdonneEmployee: any) {
    listOrdonneEmployee.forEach((item: EmployeeModel) => {
      item.displayedName = item.nom + ' ' + item.prenom;
    });
  }

  /**
   * Enable navigation to all other section (contrat, discipline, rapport ...)
   * And redirect to 'contrat' section
   */
  private redirectToContrat(): void {
    if (this.router.url.includes('add')) {
      this.sharedEmployeeService.toggleSectionsState();
      this.router.navigateByUrl(`/home/employee/${this.employee.uuid}/detail/contrat`, {state: {addContrat: true}});
    }
  }

  /**
   * getsion des erreuurs d'unicite
   * @param :err
   */
  setUniciteErrorMessageOnSaveEmploye(err) {
    if (err.error === 'RHIS_EMPLOYEE_EMAIL_EXISTS') {
      this.unicite.emailExist = true;
      this.scrollToBlockService.scrollToElementHasError('.email-exist');
    }
    if (err.error === 'RHIS_EMPLOYEE_MATRICULE_EXISTS') {
      this.unicite.matriculeExist = true;
    }
    if (err.error === 'RHIS_SECURITE_SOCIALE_NUMBER_EXIST') {
      this.unicite.numeroSecuriteSocialExist = true;
    }
    if (err.error === 'RHIS_BANK_CODE_EXIST') {
      this.unicite.bicAndIbanBanqueExist = true;
    }
  }

  /**
   * récuperer les informations nécessaires de l'employé
   */
  showDetailEmploye(): void {
    let numero = '';
    let mutuelle = '';
    let nomPersonneContacter = '';
    let numTelephUrgence = '';
    let iban = '';
    let bic = '';
    let villeNaissanceDivers = '';
    let paysNaissanceDivers = '';
    let codePostalNaissanceDivers = '';
    if (this.employee.badge) {
      this.hiddenBadge = false;
    } else {
      this.hiddenBadge = true;
    }
    if (this.employee.finValiditeAutorisationTravail) {
      this.employee.finValiditeAutorisationTravail = new Date(this.employee.finValiditeAutorisationTravail);
    }
    if (this.employee.finValiditeSejour) {
      this.employee.finValiditeSejour = new Date(this.employee.finValiditeSejour);
    }
    if (this.employee.securiteSocial) {
      numero = this.employee.securiteSocial.numero;
      mutuelle = this.employee.securiteSocial.mutuelle;
      nomPersonneContacter = this.employee.securiteSocial.nomPersonneContacter;
      numTelephUrgence = this.employee.securiteSocial.numTelephUrgence;
      this.employee.nomPermisTravailCarteSejour = this.employee.securiteSocial.nomTitreSejour;
      this.employee.numPermisTravailCarteSejour = this.employee.securiteSocial.noTitreSejour;
    }
    if (this.employee.banque) {
      iban = this.employee.banque.iban;
      bic = this.employee.banque.bic;
    }
    if (this.employee.divers) {
      villeNaissanceDivers = this.employee.divers.villeNaissance;
      paysNaissanceDivers = this.employee.divers.paysNaissance;
      codePostalNaissanceDivers = this.employee.divers.numDepartementNaissance;
    }
    let dateAnciennete: any;
    if (this.employee.dateEntree) {
      dateAnciennete = new Date(this.employee.dateEntree);
    } else {
      dateAnciennete = null;
    }
    this.infosPersonnellesForm.patchValue({
      coordonnees: {
        nom: this.employee.nom,
        prenom: this.employee.prenom,
        sexe: [this.employee.sexe],
        dateNaissance: new Date(this.employee.dateNaissance),
        matricule: this.employee.matricule,
        badge: this.employee.badge,
        dateEntree: dateAnciennete,
        requiredDateAnciennete: this.employee.dateEntree ? true : false,
        email: this.employee.email,
        numTelephone: this.employee.numTelephone,
        nationalite: this.employee.nationalite,
        finValiditeSejour: this.employee.finValiditeSejour,
        adresse: this.employee.adresse,
        complAdresse: this.employee.complAdresse,
        codePostal: this.employee.codePostal,
        ville: this.employee.ville,
        finValiditeAutorisationTravail: this.employee.finValiditeAutorisationTravail,
        nomPermisTravailCarteSejour: this.employee.nomPermisTravailCarteSejour,
        numPermisTravailCarteSejour: this.employee.numPermisTravailCarteSejour,
        villeNaissance: villeNaissanceDivers,
        paysNaissance: paysNaissanceDivers,
        codePostalNaissance: codePostalNaissanceDivers,
        handicap: this.employee.handicap

      },
      divers: {
        moyenTransport: this.employee.moyenTransport,
      },
      securiteSocial: {
        numero: numero,
        mutuelle: mutuelle,
        nomPersonneContacter: nomPersonneContacter,
        numTelephUrgence: numTelephUrgence,
      },
      banque: {
        iban: iban,
        bic: bic,
      },

    });
    this.defaultEmployee = JSON.parse(JSON.stringify(this.employee));
  }

  /**
   *  recuperer le statut d'autorisation de travail et titre de sejour  de l'employé selon la nationalite
   *  * @param : event
   */
  getStatutAutoTravailTitreSejour(event) {
    this.statutAutoTravailTitreSejour = event;
  }

  private showConfirmDelete() {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('EMPLOYEE.DELETE_MAIL_BODY'),
      header: this.rhisTranslateService.translate('EMPLOYEE.DELETE_MAIL_HEAD'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.updateEmpoye();
      },
      reject: () => {
      }
    });
  }

  /**
   * modification employee
   */
  private async verifyEmployeeToUpdate() {
    this.setEmployeeBeforSave();
    this.cheeckAutorisationTravailAndTitreSejourToEmployee();

    /** verify si le mail est supprimé */
    if (this.defaultEmployee.email.includes('@') && this.employee.email === '') {
      /** verifier s'il y'a un utilisateur créer pour cet employé */
      this.utilisateurService.isUserExist(this.defaultEmployee.email).subscribe(exist => {
        if (exist) {
          this.showConfirmDelete();
        } else {
          this.updateEmpoye();
        }
      }, err => {
        console.log(err);
      });
    } else {
      this.updateEmpoye();
    }
  }

  private async updateEmpoye() {
    let etat;
    if (this.employee.email === '') {
      etat = false;
    } else {
      etat = await this.employeeService.verifyEmail(this.employee.email).toPromise();
    }
    if (!etat || this.employee.email === this.defaultEmployee.email) {
      try {
        const data = await this.employeeService.updateEmployee(this.employee, this.uuidSecuriteSocial ? this.uuidSecuriteSocial : '0', this.uuidBanque ? this.uuidBanque : '0', this.uuidDivers ? this.uuidDivers : '0').toPromise();
        this.setEmployeeAfterSave(data);
      } catch (e) {
        this.canSave = false;
        this.setUniciteErrorMessageOnSaveEmploye(e);
        this.scrollToBlockService.scrollToElementHasError('input.has-error');
      }
    } else {
      this.unicite.emailExist = true;
      this.scrollToBlockService.scrollToElementHasError('.email-exist');
    }
  }

  /**
   * visualiser  la nationalite de l'employee
   * */
  showNaionaliteOfEmployee() {

      this.employee.nationalite.libellePays = this.employee.nationalite.libelleFR;
      if (this.employee.divers && this.employee.divers.paysNaissance) {
        this.employee.divers.paysNaissance.libellePays = this.employee.divers.paysNaissance.libelleFR;
      }

    if (this.employee.nationalite.titreSejour && this.employee.nationalite.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = true;
      this.statutAutoTravailTitreSejour.titreSejour = true;
    }
    if (!this.employee.nationalite.titreSejour && this.employee.nationalite.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = true;
      this.statutAutoTravailTitreSejour.titreSejour = false;
    }
    if (this.employee.nationalite.titreSejour && !this.employee.nationalite.titreTravail) {
      this.statutAutoTravailTitreSejour.autorisationTravail = false;
      this.statutAutoTravailTitreSejour.titreSejour = true;
    }
  }

  /**
   * recuperer l'autorisation de travail et titre de sejour de l'employee selon la nationalite
   */
  public cheeckAutorisationTravailAndTitreSejourToEmployee() {
    if (!this.statutAutoTravailTitreSejour.autorisationTravail && !this.statutAutoTravailTitreSejour.titreSejour) {
      this.employee.finValiditeAutorisationTravail = null;
      this.employee.finValiditeSejour = null;
    }
    if (!this.statutAutoTravailTitreSejour.autorisationTravail && this.statutAutoTravailTitreSejour.titreSejour) {
      this.employee.finValiditeAutorisationTravail = null;
    }
    if (this.statutAutoTravailTitreSejour.autorisationTravail && !this.statutAutoTravailTitreSejour.titreSejour) {
      this.employee.finValiditeSejour = null;
    }
  }

  /**
   * get Employees form infos
   */
  private getInfoEmployees() {
    this.getIdEmployee();
    this.getlistBadge();
    this.getListPays();
    this.getlistMoyenTransport();
    if (this.employee.idEmployee) {
      this.lazyDetailEmployee();
    }
  }

  /**
   * verification s'il y a changement d'employee
   *
   */
  public canDeactivate(): boolean {
    let update = true;
    this.canChange = false;
    this.getEmployeeDetail();
    if (!this.detecteChangementOfEmployee() && !this.saveEmployeeToBD) {
      update = false;
      this.canChange = true;

    }

    return update;
  }

  /**
   * Pop up for confirmation if data should be saved or not
   */
  public saveContentBeforeDeactivation(): Observable<boolean> {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.SAVING_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.NAVIGATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: async () => {

        await this.onSubmit();
        if (this.canSave) {
          setTimeout(() => this.navigateAway.next(true), 1500);
        } else {
          this.navigateAway.next(false);
        }
        this.canChange = false;

      },
      reject: () => {
        this.canChange = false;

        this.navigateAway.next(true);
      }

    });
    return this.navigateAway;
  }

  /**
   * detecter le changement
   */
  private detecteChangementOfEmployee(): boolean {
    this.setEmployeeBeforeDetectChangement(this.employee);
    this.setEmployeeBeforeDetectChangement(this.defaultEmployee);
    if (JSON.stringify(this.defaultEmployee.moyenTransport) !== JSON.stringify(this.employee.moyenTransport)) {
      return false;
    }
    if (JSON.stringify(this.defaultEmployee.badge) !== JSON.stringify(this.employee.badge)) {
      return false;
    }
    if (JSON.stringify(this.defaultEmployee.nationalite) !== JSON.stringify(this.employee.nationalite)) {
      return false;
    }
    if (this.defaultEmployee.banque && this.employee.banque && ((JSON.stringify(this.defaultEmployee.banque.bic) !== JSON.stringify(this.employee.banque.bic)) || (JSON.stringify(this.defaultEmployee.banque.iban) !== JSON.stringify(this.employee.banque.iban)))) {
      return false;
    }
    if (this.defaultEmployee.securiteSocial && this.employee.securiteSocial && ((JSON.stringify(this.defaultEmployee.securiteSocial.numero) !== JSON.stringify(this.employee.securiteSocial.numero)) ||
      (JSON.stringify(this.defaultEmployee.securiteSocial.nomPersonneContacter) !== JSON.stringify(this.employee.securiteSocial.nomPersonneContacter)) ||
      (JSON.stringify(this.defaultEmployee.securiteSocial.numTelephUrgence) !== JSON.stringify(this.employee.securiteSocial.numTelephUrgence)) ||
      (JSON.stringify(this.defaultEmployee.securiteSocial.mutuelle) !== JSON.stringify(this.employee.securiteSocial.mutuelle)))) {
      return false;
    }
    if (JSON.stringify(this.defaultEmployee.idEmployee) !== JSON.stringify(this.employee.idEmployee) || JSON.stringify(this.defaultEmployee.nom) !== JSON.stringify(this.employee.nom) || JSON.stringify(this.defaultEmployee.prenom) !== JSON.stringify(this.employee.prenom) || JSON.stringify(this.defaultEmployee.email) !== JSON.stringify(this.employee.email) ||
      JSON.stringify(this.defaultEmployee.matricule) !== JSON.stringify(this.employee.matricule) || JSON.stringify(this.defaultEmployee.dateNaissance) !== JSON.stringify(this.employee.dateNaissance) || JSON.stringify(this.defaultEmployee.dateEntree) !== JSON.stringify(this.employee.dateEntree) || JSON.stringify(this.defaultEmployee.numTelephone) !== JSON.stringify(this.employee.numTelephone) ||
      JSON.stringify(this.defaultEmployee.adresse) !== JSON.stringify(this.employee.adresse) || JSON.stringify(this.defaultEmployee.complAdresse) !== JSON.stringify(this.employee.complAdresse) ||
      JSON.stringify(this.defaultEmployee.codePostal) !== JSON.stringify(this.employee.codePostal) || JSON.stringify(this.defaultEmployee.ville) !== JSON.stringify(this.employee.ville) || JSON.stringify(this.defaultEmployee.handicap) !== JSON.stringify(this.employee.handicap)) {
      return false;
    }
    this.changeDiversByDetailEmployee();
    if (!this.defaultEmployee.divers && this.employee.divers) {
      return false;
    }
    if (this.employee.divers && !this.employee.divers.paysNaissance) {
      this.employee.divers.paysNaissance = '';
    }
    if (this.defaultEmployee.divers && this.employee.divers && ((JSON.stringify(this.defaultEmployee.divers.numDepartementNaissance) !== JSON.stringify(this.employee.divers.numDepartementNaissance))
      || (JSON.stringify(this.defaultEmployee.divers.villeNaissance) !== JSON.stringify(this.employee.divers.villeNaissance)) ||
      (JSON.stringify(this.defaultEmployee.divers.paysNaissance) !== JSON.stringify(this.employee.divers.paysNaissance)))) {
      return false;
    }
    if (this.employee.divers && !this.employee.divers.paysNaissance) {
      this.employee.divers.paysNaissance = null;
    }
    return true;
  }

  private changeDiversByDetailEmployee(): void {
    if (this.employee.villeNaissance || this.employee.paysNaissance || this.employee.codePostalNaissance) {
      if (!this.employee.divers) {
        this.employee.divers = new DiversModel();
      }
      this.employee.divers.villeNaissance = this.employee.villeNaissance;
      this.employee.divers.paysNaissance = this.employee.paysNaissance;
      this.employee.divers.numDepartementNaissance = this.employee.codePostalNaissance;
    }
  }

  sortKeys(employee) {
    const key = Object.keys(employee);
    key.sort((key1, key2) => (key1 < key2 ? -1 : 1));
  }

  /**
   * pour que le employee par default et employee courant  ont la meme format
   * @param :employee
   */
  private setEmployeeBeforeDetectChangement(employee) {
    if (employee.finValiditeSejour) {
      employee.finValiditeSejour = new Date(employee.finValiditeSejour);
    }
    if (employee.finValiditeAutorisationTravail) {
      employee.finValiditeAutorisationTravail = new Date(employee.finValiditeAutorisationTravail);
    }
    if (employee.dateEntree) {
      employee.dateEntree = new Date(employee.dateEntree);
    }
    employee.dateNaissance = new Date(employee.dateNaissance);
    if (!employee.banque) {
      employee.banque = {} as BanqueModel;
      employee.banque.iban = '';
      employee.banque.bic = '';
      employee.banque.idBanque = 0;
    }
    if (!employee.securiteSocial) {
      employee.securiteSocial = {} as SecuriteSocialeModel;
      employee.securiteSocial.numero = '';
      employee.securiteSocial.mutuelle = '';
      employee.securiteSocial.nomPersonneContacter = '';
      employee.securiteSocial.numTelephUrgence = '';
      employee.securiteSocial.idSecuriteSocial = 0;
    }
    if (!employee.badge) {
      employee.badge = '';
    }
    if (!employee.nationalite) {
      employee.nationalite = '';
    }
    if (!employee.adresse) {
      employee.adresse = '';
    }
    if (!employee.codePostal) {
      employee.codePostal = '';
    }
    if (!employee.complAdresse) {
      employee.complAdresse = '';
    }
    if (!employee.finValiditeAutorisationTravail) {
      employee.finValiditeAutorisationTravail = '';
    }
    if (!employee.finValiditeSejour) {
      employee.finValiditeSejour = '';
    }
    if (!employee.nationalite) {
      employee.nationalite = '';
    }
    if (!employee.numTelephone) {
      employee.numTelephone = '';
    }

    if (!employee.statut) {
      employee.statut = false;
    }
    if (!employee.ville) {
      employee.ville = '';

    }
    if (!employee.email) {
      employee.email = ' ';
    }
    if (!employee.nom) {
      employee.nom = '';
    }
    if (!employee.prenom) {
      employee.prenom = '';
    }
    if (!employee.idEmployee) {
      employee.idEmployee = 0;
    }
    if (!employee.sexe) {
      employee.sexe = [''];
    }
    employee.sexe = [employee.sexe];

    if (this.employee.divers && !employee.divers.villeNaissance) {

      employee.divers.villeNaissance = '';
    }
    if (this.employee.divers && !employee.divers.paysNaissance) {

      employee.divers.paysNaissance = '';
    }
    if (this.employee.divers && !employee.divers.numDepartementNaissance) {
      employee.divers.numDepartementNaissance = '';
    }
    if (!employee.handicap) {
      employee.handicap = false;
    }
  }

  private async addDebutCodeRestaurant(): Promise<string> {
    if (this.router.url.includes('add')) {
      const restaurant = await this.sharedRestaurant.getRestaurantById().toPromise();
      const codeLastEmploye = await this.employeeService.findMaxMatriculeOfEmployes().toPromise();
      return this.getNextMatricul(codeLastEmploye, restaurant.codeDebutMatricule);
    }
    return '';
  }

  /**
   * recuperer le prochain matricule
   * @param maxMatricule
   * @param codeDebutMatricule
   */
  private getNextMatricul(maxMatricule: any, codeDebutMatricule: string) {
    if (!codeDebutMatricule) {
      codeDebutMatricule = '';
    }
    if (maxMatricule) {
      if (isNaN(maxMatricule)) {
        let index = maxMatricule.length - 1;
        let baseCode = maxMatricule.charCodeAt(index);
        do {
          baseCode = maxMatricule.charCodeAt(index);
          const matriculeDisplay = maxMatricule.split('');
          if (matriculeDisplay[index] === 'z') {
            matriculeDisplay[index] = 'a';
            baseCode = 90;
            if (index === 0) {
              matriculeDisplay.unshift('a');
            }
          } else if (matriculeDisplay[index] === 'Z') {
            matriculeDisplay[index] = 'A';
            if (index === 0) {
              matriculeDisplay.unshift('A');
            }
          } else {
            if (matriculeDisplay[index] !== '9') {
              baseCode = maxMatricule.codePointAt(index);
              matriculeDisplay[index] = String.fromCharCode(baseCode + 1);
            } else {
              matriculeDisplay[index] = '0';
              if (index === 0) {
                matriculeDisplay.unshift('0');
              }
              baseCode = 90;
            }
          }
          maxMatricule = matriculeDisplay.join('');
          index--;
        } while (baseCode === 90);
      } else {
        const maxMatriculeAsNumber = parseInt(maxMatricule, 10);
        maxMatricule = ('' + maxMatricule).slice(0, ('' + maxMatricule).indexOf('' + maxMatriculeAsNumber)) + (maxMatriculeAsNumber + 1);
      }
      maxMatricule = codeDebutMatricule + maxMatricule;
    } else {
      maxMatricule = codeDebutMatricule + '1';
    }
    return maxMatricule;
  }
}


