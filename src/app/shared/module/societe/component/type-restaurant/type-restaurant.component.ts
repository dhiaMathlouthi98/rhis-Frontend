import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TypeRestaurantModel} from '../../../../model/typeRestaurant.model';
import {TypeRestaurantService} from '../../service/type-restaurant.service';
import {TrimValidators} from '../../../../validator/trim-validators';
import {NotificationService} from '../../../../service/notification.service';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {FileUpload} from 'primeng/primeng';
import {SafeUrl} from '@angular/platform-browser';
import {FileService} from '../../../../service/file.service';
import {DomControlService} from '../../../../service/dom-control.service';

@Component({
  selector: 'rhis-type-restaurant',
  templateUrl: './type-restaurant.component.html',
  styleUrls: ['./type-restaurant.component.scss'],
})

export class TypeRestaurantComponent implements OnInit {

  @Input()
  public set data(data: { logo: { url: SafeUrl, name: string, size: number }, typeRestaurant: TypeRestaurantModel }) {
    if (data) {
      this.isEditOperation = true;
      this.isSelectedFile = true;
      this.logo = data.logo;
      this.editableTypeRestaurant = data.typeRestaurant;
      this.typeRestaurantForm.patchValue(data.typeRestaurant);
    }
  }

  @Output()
  public savedTypeRestaurant = new EventEmitter();

  public typeRestaurantForm: FormGroup;
  public typeRestaurant = {} as TypeRestaurantModel;
  public isSubmitted = false;
  public uploadedFiles: any = {};
  public isSelectedFile = false;
  public uploadLogoUrl: string;
  public logo;
  public editableTypeRestaurant: TypeRestaurantModel;
  public isEditOperation = false;
  @ViewChild(FileUpload) fileUpload: FileUpload;
  private ecran = 'GTR';

  constructor(private typeRestaurantService: TypeRestaurantService,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private fileService: FileService,
              private domService: DomControlService) {
  }

  ngOnInit() {
    this.domService.addControl(this.ecran);
    this.setUploadLogoURL();
    this.initForm();
  }

  /**
   * Initiate name `type restaurant` formControl
   */
  initForm() {
    this.typeRestaurantForm = new FormGroup({
      nomType: new FormControl('',
        [
          Validators.required,
          TrimValidators.trimValidator
        ]
      ),
      typeComportementRestaurant: new FormControl(0, Validators.required)
    });
  }

  /**
   * Check nomType has validation errors
   */
  get nameHasError() {
    return this.typeRestaurantForm.get('nomType').hasError('required') ||
      this.typeRestaurantForm.get('nomType').hasError('trimValidator');
  }

  /**
   * Check if typeComportementRestaurant has validation errors
   */
  get modeFonctionnementHasError() {
    return this.typeRestaurantForm.get('typeComportementRestaurant').hasError('required');
  }

  /**
   * On select a file
   * @param: event
   */
  onSelect(event) {
    this.logo = null;
    this.isSelectedFile = true;
  }

  /**
   * On delete selected file
   * @param: event
   */
  onClear(event) {
    this.isSelectedFile = false;
    this.logo = null;
  }

  /**
   * Check validity of the form and the existing of the logo before saving type restaurant
   */
  public saveTypeRestaurant() {
    this.isSubmitted = true;
    if (!this.isSelectedFile) {
      this.notificationService.showErrorMessage('TYPE_RESTAURANT.TYPE_RESTAURANT_SELECT_ERROR');
    } else {
      if (this.typeRestaurantForm.valid) {

        this.typeRestaurant.nomType = this.typeRestaurantForm.get('nomType').value.toString().trim();
        this.typeRestaurant.typeComportementRestaurant = this.typeRestaurantForm.get('typeComportementRestaurant').value;

        const uuid = this.editableTypeRestaurant ? this.editableTypeRestaurant.uuid : null;
        if (this.isEditOperation) {
          if (this.typeRestaurant.nomType !== this.editableTypeRestaurant.nomType) {
            this.typeRestaurantService.isNameDoesNotExist(this.typeRestaurant.nomType, uuid).subscribe(_ => {
                this.delegateOperation();
              }
            );
          } else {
            this.delegateOperation();
          }
        } else {
          this.typeRestaurantService.isNameDoesNotExist(this.typeRestaurant.nomType, uuid).subscribe(
            _ => {
              this.delegateOperation();
            },
            (err: any) => {
              if (err.error === 'RHIS_TYPE_RESTAURANT_NAME_EXISTS') {
                this.notificationService.showErrorMessage('TYPE_RESTAURANT.TYPE_RESTAURANT_NAME_EXISTS_ERROR');
              }
            }
          );
        }
      }
    }
  }

  /**
   * Proceed the contextual operation between add and update
   */
  private delegateOperation() {
    if (!this.isEditOperation) {
      this.fileUpload.upload();
    } else if (this.isEditOperation) {
      if (this.logo) {
        this.updateTypeRestaurant();
      } else {
        this.fileUpload.upload();
      }
    }
  }

  /**
   * On error occurred in upload phase
   * @param: event
   */
  public onUploadError(event) {
    this.notificationService.showErrorMessage('TYPE_RESTAURANT.TYPE_RESTAURANT_UPLOAD_ERROR');
  }

  /**
   * Reset Form
   */
  resetForm() {
    this.typeRestaurantForm.reset();
    this.typeRestaurant = {} as TypeRestaurantModel;
    this.isSubmitted = false;
  }

  /**
   * After the upload of the logo
   * @param: event
   */
  public onUpload(event) {
    this.uploadedFiles = event.files;
    this.typeRestaurant.pathLogo = event.originalEvent.body;
    if (!this.isEditOperation) {
      this.addTypeRestaurant();
    } else if (this.isEditOperation) {
      this.updateTypeRestaurant();
    }
  }

  /**
   * Add type restaurant entity
   */
  private addTypeRestaurant() {
    this.typeRestaurantService.add({...this.typeRestaurant, statut: true}).subscribe(
      _ => {
        this.resetForm();
        this.notificationService.showSuccessMessage('TYPE_RESTAURANT.TYPE_RESTAURANT_ADDED_SUCCESSFULLY');
      }
    );
  }

  /**
   * Update type restaurant and delete the previous logo if it's no longer conserved
   */
  private updateTypeRestaurant() {
    this.typeRestaurantService.update({...this.editableTypeRestaurant, ...this.typeRestaurant}).subscribe(_ => {
        // Delete previous logo if it's changed
        if (!this.logo) {
          this.fileService.deleteLogoByName(this.editableTypeRestaurant.pathLogo).subscribe({error: console.error});
        }
      }, console.error,
      () => {
        this.savedTypeRestaurant.emit({...this.editableTypeRestaurant, ...this.typeRestaurant});
        this.postUpdateConfig();
        this.notificationService.showSuccessMessage('TYPE_RESTAURANT.UPDATED_SUCCESSFULLY');
      });
  }

  /**
   * Reinitialise config variables to it's default values
   */
  private postUpdateConfig() {
    this.typeRestaurant = {} as TypeRestaurantModel;
    this.isSubmitted = false;
    this.uploadedFiles = {};
    this.isSelectedFile = false;
    this.logo = null;
    this.editableTypeRestaurant = null;
    this.isEditOperation = false;
  }

  /**
   * Get path to upload the logo
   */
  private setUploadLogoURL() {
    this.uploadLogoUrl = this.typeRestaurantService.getUploadUrl();
  }
}
