import {Component, OnInit} from '@angular/core';
import {TypeRestaurantModel} from '../../../../model/typeRestaurant.model';
import {RhisTranslateService} from '../../../../service/rhis-translate.service';
import {NotificationService} from '../../../../service/notification.service';
import {TypeRestaurantService} from '../../service/type-restaurant.service';
import {FileService} from '../../../../service/file.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ConfirmationService} from 'primeng/api';
import {RhisRoutingService} from '../../../../service/rhis.routing.service';
import {DomControlService} from '../../../../service/dom-control.service';

@Component({
  selector: 'rhis-list-types-restaurant',
  templateUrl: './list-types-restaurant.component.html',
  styleUrls: ['./list-types-restaurant.component.scss']
})
export class ListTypesRestaurantComponent implements OnInit {
  public listTypeRestaurant: TypeRestaurantModel[];
  public header: { title: string, field: string }[];
  private imagesCoordinations: Array<{ blob: Blob, idTypeRestaurant: number, url: SafeUrl }>;
  public popupVisibility = false;
  public selectedTypeRestaurant: { logo: { url: SafeUrl, name: string, size: number }, typeRestaurant: TypeRestaurantModel };
  private ecran = 'GTR';

  public heightInterface: any;

  constructor(private rhisTranslateService: RhisTranslateService,
              private notificationService: NotificationService,
              private typeRestaurantService: TypeRestaurantService,
              private fileService: FileService,
              private sanitizer: DomSanitizer,
              private confirmationService: ConfirmationService,
              public rhisRouter: RhisRoutingService,
              private domService: DomControlService) {
  }

  ngOnInit() {
    this.domService.addControl(this.ecran);
    this.setHeader();
    this.getAll();
  }

  public deleteButtonControl(): boolean {
    return this.domService.deleteListControl(this.ecran);
  }

  public detailsControl(): boolean {
    return this.domService.detailsControl(this.ecran);
  }

  public addButtonControl(): boolean {
    return this.domService.addControl(this.ecran);
  }

  /**
   * Fetch all type restaurant with its images
   */
  private getAll(): void {
    this.typeRestaurantService.getAll().subscribe((listTypeRestaurant: TypeRestaurantModel[]) => {
      this.listTypeRestaurant = listTypeRestaurant;
      this.sortTypeRestaurants(this.listTypeRestaurant);
      this.imagesCoordinations = new Array<{ blob: Blob, idTypeRestaurant: number, url: SafeUrl }>(this.listTypeRestaurant.length);
      const paths = this.listTypeRestaurant.map(typeRestaurant => typeRestaurant.pathLogo);
      const imagesObservables = paths.map(path => this.fileService.getLogoByName(path).pipe(catchError(err => of(null))));
      forkJoin(...imagesObservables).subscribe((images: Blob[]) => {
        if (images && images.length) {
          images.forEach((image: Blob, index: number) => {
            this.imagesCoordinations[index] = {
              blob: image,
              idTypeRestaurant: this.listTypeRestaurant[index]['idTypeRestaurant'],
              url: image ? this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image)) : null
            };
          });
        }
      });
    });
  }

  /**
   * Initialize the header of the type restaurant list table
   */
  private setHeader() {
    this.header = [
      {title: this.rhisTranslateService.translate('LIST_TYPE_RESTAURANT.NAME'), field: 'nomType'},
      {
        title: this.rhisTranslateService.translate('LIST_TYPE_RESTAURANT.OPERATING_MODE'),
        field: 'typeComportementRestaurant'
      },
      {title: this.rhisTranslateService.translate('LIST_TYPE_RESTAURANT.LOGO'), field: 'logo'}];
  }

  /**
   * Show confirmation Popup for delete
   * @param: id
   */
  public showConfirmDelete(uuid: string, index: number): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.DELETE_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.DELETE_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.delete(uuid, index);
      },
      reject: () => {
      }
    });
  }

  /**
   * Delete type restaurant by id
   * @param: id
   */
  private delete(uuid: string, index: number): void {
    this.typeRestaurantService.remove(uuid).subscribe({
      next: (message: any) => {
        if (message === 'RHIS_TYPE_RESTAURANT_IS_USED') {
          this.desactivateTypeRestaurant(uuid);
        } else {
          this.listTypeRestaurant.splice(index, 1);
          this.imagesCoordinations.splice(index, 1);
          this.notificationService.showSuccessMessage('LIST_TYPE_RESTAURANT.SUPPSUCCESS');
        }
      },
        error: console.error
      }
    );
  }

  /**
   * Show confirmation Popup to activate type restaurant
   * @param: typeRestaurant
   */
  public showConfirmActivation(typeRestaurant: TypeRestaurantModel): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('POPUPS.ACTIVATION_MESSAGE'),
      header: this.rhisTranslateService.translate('POPUPS.ACTIVATION_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.activateTypeRestaurant(typeRestaurant);
      },
      reject: () => {
      }
    });
  }

  /**
   * Desactivate attatched type restaurant
   * @param: id
   */
  private desactivateTypeRestaurant(uuid: string): void {
    const index = this.listTypeRestaurant.findIndex((typeRestaurant: TypeRestaurantModel) => typeRestaurant.uuid === uuid);
    this.listTypeRestaurant[index]['statut'] = false;
    this.sortTypeRestaurants(this.listTypeRestaurant);
    this.sortImagesCoordinations();
    this.notificationService.showSuccessMessage('LIST_TYPE_RESTAURANT.DESACTIVATED');
  }

  /**
   * Activate type restaurant
   * @param: typeRestaurant
   */
  private activateTypeRestaurant(typeRestaurant: TypeRestaurantModel): void {
    this.typeRestaurantService.update({...typeRestaurant, statut: true}).subscribe({
      next: _ => {
        typeRestaurant.statut = true;
        this.sortTypeRestaurants(this.listTypeRestaurant);
        this.sortImagesCoordinations();
      },
      error: console.error,
      complete: () => this.notificationService.showSuccessMessage('LIST_TYPE_RESTAURANT.ACTIVATED')
    });
  }

  /**
   * Sort Type restaurant to have the this order : activated then inactivated ones
   * @param: typeRestaurant
   */
  private sortTypeRestaurants(typeRestaurants: TypeRestaurantModel[]): TypeRestaurantModel[] {
    return typeRestaurants.sort((a: any, b: any) => b['statut'] - a['statut']);
  }

  /**
   * Sort images urls to match associated type restaurant
   */
  private sortImagesCoordinations(): void {
    const orderedImagesCoordinations: Array<{ blob: Blob, idTypeRestaurant: number, url: SafeUrl }> = [];
    this.listTypeRestaurant.forEach((typeRestaurant: TypeRestaurantModel) => {
      const searchedIndex = this.imagesCoordinations.findIndex((imageCoordination: { idTypeRestaurant: number, url: SafeUrl }) => imageCoordination.idTypeRestaurant === typeRestaurant.idTypeRestaurant);
      orderedImagesCoordinations.push(this.imagesCoordinations[searchedIndex]);
    });
    this.imagesCoordinations = [...orderedImagesCoordinations];
  }

  /**
   * Open popup to update type restaurant
   * @param: typeRestaurant
   * @param: index
   */
  public modifyTypeRestaurant(typeRestaurant: TypeRestaurantModel, index: number): void {
    if (this.domService.updateListControl(this.ecran)) {
      this.popupVisibility = true;
      // size is by default in byte ---> converted to kilo byte (/1000)
      const size = this.imagesCoordinations[index].blob ? this.imagesCoordinations[index].blob.size / 1000 : 0;
      this.selectedTypeRestaurant = {
        logo: {url: this.imagesCoordinations[index]['url'], name: typeRestaurant.pathLogo, size: size},
        typeRestaurant: typeRestaurant
      };
    }
  }

  /**
   * Update the list with the one that was updated
   * @param: typeRestaurant
   */
  public updateList(updatedTypeRestaurant: TypeRestaurantModel): void {
    this.popupVisibility = false;
    const index = this.listTypeRestaurant.findIndex((typeRestaurant: TypeRestaurantModel) => typeRestaurant.idTypeRestaurant === updatedTypeRestaurant.idTypeRestaurant);
    if (index !== -1) {
      this.listTypeRestaurant[index] = updatedTypeRestaurant;
      this.fileService.getLogoByName(updatedTypeRestaurant.pathLogo).subscribe((image: Blob) => {
          if (image) {
            this.imagesCoordinations[index] = {
              ...this.imagesCoordinations[index],
              blob: image,
              url: image ? this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image)) : null
            };
          }
        },
        console.error);
    }
  }
}
