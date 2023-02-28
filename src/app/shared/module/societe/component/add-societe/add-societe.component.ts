import {Component, OnInit} from '@angular/core';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {FormControl, FormGroup} from '@angular/forms';
import {NationaliteModel} from '../../../../model/nationalite.model';
import {NationaliteService} from '../../../../../modules/home/configuration/service/nationalite.service';
import {SocieteService} from '../../service/societe.service';
import {SocieteModel} from '../../../../model/societe.model';

@Component({
  selector: 'rhis-add-societe',
  templateUrl: './add-societe.component.html',
  styleUrls: ['./add-societe.component.scss']
})
export class AddSocieteComponent implements OnInit {
  public activeSection = 0;
  public societeFormGroup: FormGroup;
  public isFormSubmitted = false;
  currentLanguage;
  public listPays: NationaliteModel[];
  public sections = [
    {name: this.rhisTranslateService.translate('SOCIETE.LABEL')},
    {name: this.rhisTranslateService.translate('SOCIETE.PREFECTURE_LABEL')}
  ];

  constructor(private rhisTranslateService: RhisTranslateService,
              private nationaliteService: NationaliteService,
              private societeService: SocieteService,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.currentLanguage = this.rhisTranslateService.currentLang;
    this.initForm();
    this.getListPays();
  }

  /**
   * Delete undesired spacing around string attributes of the form
   */
  private formatForm(): SocieteModel {
    const formObject = {
      ...this.societeFormGroup.get('company').value,
      ...this.societeFormGroup.get('prefecture').value
    };
    for (const attribute in formObject) {
      if (formObject.hasOwnProperty(attribute) && typeof formObject[attribute] === 'string') {
        formObject[attribute] = (formObject[attribute]).trim();
      }
    }
    return formObject;
  }

  /**
   * Create Forms
   */
  private initForm() {
    this.societeFormGroup = new FormGroup({
      company: new FormControl(),
      prefecture: new FormControl()
    });
  }

  /**
   * Fetch all list of countries
   */
  private getListPays() {
    this.nationaliteService.getAll().subscribe(
      (data: NationaliteModel[]) => {
        this.listPays = data;
          this.listPays.sort((a, b) => (a.libelleFR < b.libelleFR ? -1 : 1))

      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  /**
   * Add an enterprise
   */
  public addSociete() {
    this.isFormSubmitted = true;
    if (this.societeFormGroup.valid) {
      this.societeService.add(this.formatForm()).subscribe(
        (data: any) => {
          this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('SOCIETE.SAVE_SUCCESS'));
          this.resetForm();
        },
        (err: any) => {
          if (err.error === 'RHIS_SOCIETE_NAME_EXISTS') {
            this.notificationService.showErrorMessage(this.rhisTranslateService.translate('SOCIETE.SOCIETE_NAME_EXISTS_ERROR'));
          }
        }
      );
    }
  }

  /**
   * Reset enterprise form
   */
  private resetForm() {
    this.societeFormGroup.reset();
    this.isFormSubmitted = false;
  }
}
