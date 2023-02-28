import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {JourSemaine} from '../../../../../../shared/enumeration/jour.semaine';
import {JourReposModel} from '../../../../../../shared/model/jourRepos.model';
import * as moment from 'moment';
import {SemaineReposModel} from '../../../../../../shared/model/semaineRepos.model';
import {ParametreNationauxModel} from '../../../../../../shared/model/parametre.nationaux.model';
import {ScrollToBlockService} from '../../../../../../shared/service/scroll-to-block.service';

@Component({
  selector: 'rhis-jour-repos-form',
  templateUrl: './jour-repos-form..component.html',
  styleUrls: ['./jour-repos-form.component.scss']
})
export class JourReposFormComponent implements OnInit, OnChanges {
  @Output()
  public closeEvent = new EventEmitter();
  @Output()
  public addOrUpdateJourReposEvent = new EventEmitter();
  @Output()
  public resetErrorMessagesEvent = new EventEmitter();
  public semRepos = {} as SemaineReposModel;
  @Input()
  public JoursSemainEnum = [];
  @Input()
  public parametreNationnaux = {} as ParametreNationauxModel;
  @Input()
  selectedSemaineRepos: SemaineReposModel;
  @Input()
  existeJourRepos: string;
  @Input()
  public buttonLabel: string;
  public lastDayOfweek: Date;
  public firstDayOfweek: Date;
  public ONE_DAY_IN_MILLISECONDS = (1000 * 60 * 60 * 24);
  public jourRepo: JourReposModel = new JourReposModel();
  public listJourRepos: JourReposModel[] = [];
  public listJourRepos2: JourReposModel[] = [];
  public joursReposNotSelected = false;
  /**
   * variable for controlling the display of popup add/edit "semaine repos"
   */
  public autoDisplayFirst: boolean;
  public formGroup = new FormGroup(
    {
      dateJour: new FormControl('', [Validators.required]),
      finSemaine: new FormControl({value: '', disabled: true}),
      debutSemaine: new FormControl({value: '', disabled: true})
    }
  );

  /**
   * Css class selectors for styling in error case
   */
  public selectors = {
    calendarSelector: '.ui-inputtext.ui-widget',
  };
  public isSubmitted = false;

  constructor(private scrollToBlockService: ScrollToBlockService) {
  }

  ngOnInit() {
  }

  /**
   * detect changes in parent component
   * @param: changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.JoursSemainEnum) {
      this.JoursSemainEnum = changes.JoursSemainEnum.currentValue;
    }
    if (changes.parametreNationnaux) {
      this.parametreNationnaux = changes.parametreNationnaux.currentValue;
    }
    if (changes.selectedSemaineRepos) {
      this.selectedSemaineRepos = changes.selectedSemaineRepos.currentValue;
      this.displaySemaineRepos(this.selectedSemaineRepos);
    }
    if (changes.existeJourRepos) {
      this.existeJourRepos = changes.existeJourRepos.currentValue;
    }
  }

  public close() {
    this.closeEvent.emit();

  }

  /**
   * Submit the edit/add value to save it
   */
  public onSubmit(): void {
    if (this.listJourRepos && this.listJourRepos.length) {
      this.isSubmitted = true;
      if (this.formGroup.valid) {
        this.semRepos.joursRepos = this.listJourRepos;
        this.semRepos.finSemaine = this.formGroup.get('finSemaine').value;
        this.semRepos.debutSemaine = this.formGroup.get('debutSemaine').value;
        this.addOrUpdateJourReposEvent.emit(this.semRepos);
        this.isSubmitted = false;
      }
    } else {
      this.joursReposNotSelected = true;
      this.scrollToBlockService.scrollToElementHasError('span.form-item-error');
    }
  }

  /**
   * recuperer les jours de repos de l'employe
   ** @param: value
   */
  public setJourSemaine(state: boolean, value, periode?: string) {
    this.joursReposNotSelected = false;
    const firstDayOfweek = this.formGroup.get('debutSemaine').value;
    if (firstDayOfweek) {
      // lors de select sur  combox
      if (state === true) {
        let dateJouRepos;
        this.JoursSemainEnum.forEach((jouSemaine, index) => {
          if (value === jouSemaine.value) {
            dateJouRepos = moment(firstDayOfweek).add(index, 'days').toDate();
            this.setJourRepos(value, periode);
            this.jourRepo.dateRepos = new Date(dateJouRepos);
            this.listJourRepos.push(this.jourRepo);
          }
        });
      } else {
        this.deleteJourSemaineFromListJourRepos(value, this.listJourRepos);
      }
    } else if (state === true) {
      this.setJourRepos(value, periode);
      this.jourRepo.dateRepos = null;
      this.listJourRepos2.push(this.jourRepo);
    } else {
      this.deleteJourSemaineFromListJourRepos(value, this.listJourRepos2);
    }
  }

  /**
   * Create jour repos to be added in the list
   * @param: value
   * @param: periode
   */
  private setJourRepos(value: JourSemaine, periode: string) {
    this.jourRepo = new JourReposModel();
    this.jourRepo.jourSemaine = value;
    if (periode) {
      this.jourRepo[periode] = true;
    } else {
      this.jourRepo.am = this.jourRepo.pm = true;
    }
  }

  /**
   * suppression de jour de repos de la list
   * @param :value
   */
  deleteJourSemaineFromListJourRepos(value, listJourRepos) {
    listJourRepos.forEach((jour, index) => {
      if (value === jour.jourSemaine) {
        listJourRepos.splice(index, 1);
      }
    });
  }

  /**
   *lors de select la date de semaine de repos
   */
  getSemaine() {
    const dateSelected = this.formGroup.get('dateJour').value;
    if (this.listJourRepos.length > 0 && this.listJourRepos) {
      this.listJourRepos2 = this.listJourRepos;
    }
    this.listJourRepos = [];
    if (dateSelected) {
      this.resetErrorMessages();
      this.firstDayOfweek = new Date(dateSelected.getTime() - (this.findDecalage() * this.ONE_DAY_IN_MILLISECONDS));
      this.lastDayOfweek = new Date(this.firstDayOfweek.getTime() + (6 * this.ONE_DAY_IN_MILLISECONDS));
      this.formGroup.controls['debutSemaine'].setValue(this.firstDayOfweek);
      this.formGroup.controls['finSemaine'].setValue(this.lastDayOfweek);
      if (this.listJourRepos2.length > 0 && this.listJourRepos2) {
        this.listJourRepos2.forEach(jour => {
          this.setJourSemaine(true, jour.jourSemaine);
        });
      }
      this.listJourRepos2 = [];
    }
  }

  /**
   * Cette methode permer de calculer le decalage entre la date saisie et le premier jour de la semaine du restaurant
   */
  findDecalage(): number {
    const dateSelected = this.formGroup.get('dateJour').value;
    let decalage = 0;
    switch (this.parametreNationnaux.premierJourSemaine) {
      case JourSemaine.LUNDI: {
        decalage = dateSelected.getDay() - (1 % 7);
        break;
      }
      case JourSemaine.MARDI: {
        decalage = dateSelected.getDay() - (2 % 7);
        break;
      }
      case JourSemaine.MERCREDI: {
        decalage = dateSelected.getDay() - (3 % 7);
        break;
      }
      case JourSemaine.JEUDI: {
        decalage = dateSelected.getDay() - (4 % 7);
        break;
      }
      case JourSemaine.VENDREDI: {
        decalage = dateSelected.getDay() - (5 % 7);
        break;
      }
      case JourSemaine.SAMEDI: {
        decalage = dateSelected.getDay() - (6 % 7);
        break;
      }
      case JourSemaine.DIMANCHE: {
        decalage = dateSelected.getDay() - (7 % 7);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    if (decalage < 0) {
      decalage += 7;
    }
    return decalage;
  }

  /**
   * Display the infos of a 'semainRepos'
   * @param: semainRepos
   */
  private displaySemaineRepos(semainRepos: SemaineReposModel): void {
    if (semainRepos) {
      semainRepos.debutSemaine = new Date(semainRepos.debutSemaine);
      semainRepos.finSemaine = new Date(semainRepos.finSemaine);
      this.formGroup.controls['debutSemaine'].setValue(semainRepos.debutSemaine);
      this.formGroup.controls['finSemaine'].setValue(semainRepos.finSemaine);
      this.formGroup.controls['dateJour'].setValue(semainRepos.debutSemaine);
      semainRepos.joursRepos.forEach(jourRepos => {
        jourRepos.dateRepos = new Date(jourRepos.dateRepos);
      });
      this.listJourRepos = semainRepos.joursRepos;
      this.autoDisplayFirst = true;
    } else {
      this.resetForm();
    }
  }

  /**
   * Get periode
   * @param: jourRepos
   * @param: periode
   * @param: listjourRepos
   */
  public getPeriode(jourRepos: string, periode: string, listjourRepos): boolean {
    const filtredList = listjourRepos.filter(jour => jour.jourSemaine === jourRepos);
    if (filtredList.length) {
      return filtredList.shift()[periode];
    }
  }

  /**
   * Set periode
   * @param: jourRepos
   * @param: listJourRepos
   * @param: periode
   */
  public setPeriode(jourRepos: string, listJourRepos: JourReposModel[], periode?: string) {
    const index = listJourRepos.findIndex(jour => jour.jourSemaine === jourRepos);
    if (index !== -1) {
      if (periode) {
        listJourRepos[index][periode] = !listJourRepos[index][periode];
        if ((listJourRepos[index].pm === false) && (listJourRepos[index].am === false)) {
          this.deleteJourSemaineFromListJourRepos(jourRepos, listJourRepos);
        }
      } else {
        if (listJourRepos[index]['am'] !== listJourRepos[index]['pm']) {
          listJourRepos[index]['am'] = true;
          listJourRepos[index]['pm'] = true;
        } else {
          this.setJourSemaine(
            !listJourRepos[index]['am'] && !listJourRepos[index]['pm'],
            jourRepos
          );
        }
      }
    } else {
      if (periode) {
        this.setJourSemaine(true, jourRepos, periode);
      } else {
        this.setJourSemaine(true, jourRepos);
      }
    }
  }

  /**
   * Reset the form when opening the pop-up
   */
  private resetForm(): void {
    if (this.formGroup) {
      this.formGroup.reset();
    }
    this.autoDisplayFirst = false;
  }

  /**
   * reset messege d'erreur
   */
  resetErrorMessages() {
    if (this.existeJourRepos) {
      this.resetErrorMessagesEvent.emit();
    }
    this.joursReposNotSelected = false;
  }
}
