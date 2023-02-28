import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DocumentEditorContainerComponent} from '@syncfusion/ej2-angular-documenteditor';
import {DragAndDropEventArgs, TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import * as EJ2_LOCALE from '@syncfusion/ej2-locale/src/fr.json';
import {L10n, setCulture} from '@syncfusion/ej2-base';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DataManager, Predicate, Query} from '@syncfusion/ej2-data';
import {MaskedTextBoxComponent} from '@syncfusion/ej2-angular-inputs';
import {ConfirmationService} from 'primeng/api';
import {VariableReportService} from '../../service/variable-report.service';
import {RhisTranslateService} from '../../../../../service/rhis-translate.service';
import {VariableReportModel} from '../../../../../model/variable-report.model';
import {NotificationService} from '../../../../../service/notification.service';
import {RapportService} from '../../../../../../modules/home/employes/service/rapport.service';
import {DateService} from '../../../../../service/date.service';
import {GlobalSettingsService} from '../../../../../service/global-settings.service';
import {ReportSfdtModel} from '../../../../../model/gui/report-sfdt.model';
import {SharedRestaurantListService} from 'src/app/shared/service/shared-restaurant-list.service';
import {SessionService} from '../../../../../service/session.service';

@Component({
  selector: 'rhis-word-editor',
  templateUrl: './word-editor.component.html',
  styleUrls: ['./word-editor.component.scss']
})
export class WordEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('editor_container')
  public container: DocumentEditorContainerComponent;
  @ViewChild('treeviewObj')
  public listTreeObj: TreeViewComponent;
  @ViewChild('maskObj')
  public maskObj: MaskedTextBoxComponent;
  public culture;
  public reportSFDT: ReportSfdtModel;
  public categories: { label: string, value: string } [] ;


  public formGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required])
  });
  public submitted: boolean;
  public duplicateName: boolean;
  private employeeUuid: string;
  public menuIsOpen: boolean;

  // list data source for TreeView component
  public localData: Object[] = [];

  // Mapping TreeView fields property with data source properties
  public field: Object = {
    dataSource: this.localData,
    id: 'id',
    parentID: 'pid',
    text: 'name',
    hasChildren: 'hasChild',
    expanded: 'expanded'
  };

  private reportVariables: VariableReportModel[];
  public restaurantUuid: string;
  public showPopup = false;
  public listRestoSource: any;
  public listRestoDestination: any;
  public listRestoIds: any[];
  public submitButtonText = this.rhisTranslateService.translate('GESTION_PARC_RAPPORT.SAVE_POPUP');
  public listRestaurantsHaveRapport: any = [];
  public rapportOldName = '';
  public rapportNewName = '';
  public idSelectedRestarant: any;
  public selectedRestaureant: any;

  constructor(
    private notificationService: NotificationService,
    private rhisTranslateService: RhisTranslateService,
    private rapportService: RapportService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dateService: DateService,
    private confirmationService: ConfirmationService,
    private variableReportService: VariableReportService,
    private globalSettingsService: GlobalSettingsService,
    private sessionService: SessionService,
    private sharedRestoService: SharedRestaurantListService) {
    this.activatedRoute.params.subscribe(params => {
      if (params.reportUuid) {
        this.initiateEditedDocument(params.reportUuid);
      }
      if (params.employeeUuid) {
        this.employeeUuid = params.employeeUuid;
      }
      if (params.restaurantUuid) {
        this.restaurantUuid = params.restaurantUuid;
        this.sharedRestoService.getListRestaurant().then((result: any) => {
          this.listRestoSource = result;
          if (this.listRestoSource.length) {
            // this.listRestoDestination = this.listRestoSource.filter((val: any) => val.uuid !== this.restaurantUuid);
            this.listRestoDestination = [...this.listRestoSource];
            this.selectedRestaureant = this.listRestoSource.find(resto => resto.uuid === this.restaurantUuid);
            this.idSelectedRestarant = this.selectedRestaureant.IdenRestaurant;
          }
        });
        this.formGroup.valueChanges.subscribe(fields => {
          if (this.formGroup.get('name').value) {
            this.rapportNewName = this.formGroup.get('name').value;
          }
        });
      }
    });

    this.checkNavigationData();
  }

  private checkMenuSate(): void {
    this.menuIsOpen = this.globalSettingsService.menuIsOpen;
    this.globalSettingsService.onToggleMenu().subscribe(async (menuState: boolean) => {
      await this.dateService.delay(180);
      this.menuIsOpen = menuState;
      this.container.width = this.menuIsOpen ? 'calc(100% - 80px)' : '100%';
    });
  }

  private async checkNavigationData(): Promise<void> {
    const currentNavigation = this.router.getCurrentNavigation();
    const state = currentNavigation.extras.state;
    if (currentNavigation && state && state.file) {
      await this.convertImportedReportToSfdt(state.file);
    }

  }

  private async convertImportedReportToSfdt(file: File): Promise<void> {
    const formData = new FormData();
    formData.set('wordFile', file);
    const fileContent = await this.rapportService.convertFromDocxToSFDT(formData).toPromise();
    this.container.documentEditor.open(fileContent);
    const fileNameParts = file.name.split('.');
    this.formGroup.setValue({name: fileNameParts[0], category: ''});
    this.rapportOldName = fileNameParts[0];
  }

  private async initiateEditedDocument(uuid: string): Promise<void> {
    this.reportSFDT = await this.rapportService.getReportContent(uuid).toPromise();
    if (this.reportSFDT && this.container && this.container.documentEditor) {
      this.formGroup.setValue({name: this.reportSFDT.rapportRef.description, category: this.reportSFDT.rapportRef.categorie});
      this.container.documentEditor.open(this.reportSFDT.content);
      this.rapportOldName = this.formGroup.get('name').value;
      this.rapportNewName = this.formGroup.get('name').value;
      if (this.sessionService.getProfil() === 'superviseur') {
        this.rapportService.getRestaurantsByRapportDescriptionAndFranchise(this.sessionService.getUuidFranchise(),
          this.formGroup.get('name').value)
          .subscribe(listResto => {
            this.listRestaurantsHaveRapport = listResto.filter((val: any) => val.uuid !== this.restaurantUuid);
          });
      } else {
        this.rapportService.getRestaurantsByRapportDescriptionAndUser(this.sessionService.getUuidUser(), this.formGroup.get('name').value).subscribe(listResto => {
          this.listRestaurantsHaveRapport = listResto.filter((val: any) => val.uuid !== this.restaurantUuid);
        });
      }
    }
  }

  public confirmAndSelectRestoBeforeSave(): void {
    this.submitted = true;
    if (this.restaurantUuid) {
      if (this.formGroup.valid) {
        this.showPopup = true;
      }
    } else {
      this.saveData();
    }
  }

  private async saveData(): Promise<void> {
    this.submitted = true;
    if (this.formGroup.valid) {
      const labelReport = this.formGroup.controls['name'].value;

      // check the uniqueness of name
      const nameIsUnique = await this.rapportService.checkNameUniqueness(
        this.reportSFDT ? this.reportSFDT.rapportRef.description : '',
        this.formGroup.controls['name'].value, this.restaurantUuid).toPromise();
      this.container.documentEditor.saveAsBlob('Docx').then(async (exportedDocument: Blob) => {
        if (nameIsUnique) {
          await this.updateReportEntityAndFileContent(exportedDocument);
        } else {
          this.proposeReplacementForExistingReportWithSameName(exportedDocument);
        }
      });
    }
  }

  private async copyReportInAnotherRestaurant(labelReport: string, oldNameReport: string): Promise<void> {
    this.notificationService.startLoader();
    await this.rapportService.copyReportInAnotherRestaurant(this.restaurantUuid, oldNameReport, labelReport, this.listRestoIds).toPromise();
  }

  public closePopup(): void {
    this.showPopup = false;
  }

  public submit(event: any[]): void {
    this.listRestoIds = [];
    event.forEach((val: any) => this.listRestoIds.push(val.IdenRestaurant));
    this.saveData();
  }

  public async submitAfterNameChanged(event: any): Promise<void> {
    // check the uniqueness of name
    const nameIsUnique = await this.rapportService.checkNameUniqueness(
      this.rapportOldName, this.rapportNewName, this.restaurantUuid).toPromise();
    this.container.documentEditor.saveAsBlob('Docx').then(async (exportedDocument: Blob) => {
      if (nameIsUnique) {
        const formData = this.prepareFormData(exportedDocument);
        const listToDelete = [...event.idsRestoToRemoveDocAndSaveNew];
        listToDelete.push(this.idSelectedRestarant);
        const deleteRestaurant = await this.rapportService.deleteDocxFileForParc(this.rapportOldName,
          this.formGroup.get('category').value, listToDelete).toPromise();
        if (deleteRestaurant) {
          const createRapport = await this.rapportService.createNewDocx(this.formGroup.value,
            formData, this.restaurantUuid).toPromise();
          if (createRapport) {
            const finalCopy = await this.rapportService.copyReportInAnotherRestaurant(this.restaurantUuid,
              this.rapportNewName, this.rapportNewName, event.idsRestoToRemoveDocAndSaveNew.concat(event.idsRestoToSaveNew)).toPromise();
            if (finalCopy) {
              this.notificationService.showMessageWithToastKey('success', 'REPORT.SAVE_SUCESS', 'globalToast', 'REPORT.SUCCESS');
              this.goToListRapport();
            }
          }
        }
      }
    });

  }

  public proposeReplacementForExistingReportWithSameName(exportedDocument: Blob): void {
    this.confirmationService.confirm({
      message: this.rhisTranslateService.translate('REPORT.FILE') +
        this.formGroup.controls['name'].value + '.docx ' + this.rhisTranslateService.translate('REPORT.DO_YOU_WANT_REPLACEMENT'),
      header: this.rhisTranslateService.translate('REPORT.FILE_EXISTED'),
      acceptLabel: this.rhisTranslateService.translate('POPUPS.DELETE_ACCEPT_LABEL'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.DELETE_REJECT_LABEL'),
      icon: 'pi pi-info-circle',
      key: 'edit-doc',
      accept: () => {
        this.proceedReplacement(exportedDocument);
      }
    });
  }

  private async proceedReplacement(exportedDocument: Blob): Promise<void> {
    const formData = this.prepareFormData(exportedDocument);
    this.reportSFDT = await this.rapportService.replaceExistedDocx(this.formGroup.value, formData, this.restaurantUuid).toPromise();
    if (this.listRestoIds && this.listRestoIds.length) {
      await this.copyReportInAnotherRestaurant(this.formGroup.value.name, this.rapportOldName).then(() => {
        this.notificationService.stopLoader();
        this.notificationService.showMessageWithToastKey('success', 'REPORT.REPORTS_COPIED_SUCCESSFULLY', 'globalToast', 'REPORT.COPIER');
      });
    } else {
      this.notificationService.showMessageWithToastKey('success', 'REPORT.SAVE_SUCESS', 'globalToast', 'REPORT.SUCCESS');

    }
    this.goToListRapport();
  }

  private async updateReportEntityAndFileContent(exportedDocument: Blob): Promise<void> {
    const formData = this.prepareFormData(exportedDocument);
    if (this.reportSFDT) {
      this.reportSFDT = await this.rapportService.saveToDocx(this.reportSFDT.rapportRef.uuid, this.formGroup.value, formData).toPromise();
    } else {
      this.reportSFDT = await this.rapportService.createNewDocx(this.formGroup.value, formData, this.restaurantUuid).toPromise();
    }

    if (this.listRestoIds && this.listRestoIds.length) {
      await this.copyReportInAnotherRestaurant(this.formGroup.value.name, this.rapportOldName).then(() => {
        this.notificationService.stopLoader();
        this.notificationService.showMessageWithToastKey('success', 'REPORT.REPORTS_COPIED_SUCCESSFULLY', 'globalToast', 'REPORT.COPIER');
      });
    } else {
      this.notificationService.showMessageWithToastKey('success', 'REPORT.SAVE_SUCESS', 'globalToast', 'REPORT.SUCCESS');
    }
    this.goToListRapport();
  }

  private prepareFormData(exportedDocument: Blob): FormData {
    const file = new File([exportedDocument], '');
    const formData = new FormData();
    formData.set('docxFile', file);
    return formData;
  }

  async ngOnInit() {
    this.categories = [
      {value: 'CONGE', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.CONGE')},
      {value: 'DISCIPLINAIRE', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.DISCIPLINAIRE')},
      {value: 'DIVERS', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.DIVERS')},
      {value: 'EMBAUCHE_CONTRAT', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.EMBAUCHE_CONTRAT')},
      {value: 'ENTRETIENT_PROFESSIONEL', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.ENTRETIENT_PROFESSIONEL')},
      {value: 'FORMATION', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.FORMATION')},
      {value: 'TRAVAILLEURS_ETRANGER', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.TRAVAILLEURS_ETRANGER')},
      {value: 'VISITE_MEDICAL', label: this.rhisTranslateService.translate('RAPPORT_CATEGORIE.VISITE_MEDICAL')}
    ];
    this.setEditorLanguage();
    await this.setUpReportVariables();
  }

  private async setUpReportVariables(): Promise<void> {
    await this.setUpReportsVariables();
    this.changeDataSource(this.localData);
    this.listTreeObj.refresh();
  }

  private async setUpReportsVariables(): Promise<void> {
    const paths = await this.variableReportService.getDistinctCategoriesPaths().toPromise();
    this.reportVariables = await this.variableReportService.getAll().toPromise();
    let idValue = 1;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i].split(';');
      for (let j = 0; j < path.length; j++) {
        const existedOneIndex = this.localData.findIndex(data => data['name'] === path[j]);
        if (existedOneIndex === -1) {
          if (j === 0) {
            this.localData.push({
              id: idValue, name: path[j], hasChild: true
            });
          } else {
            const parentIndex = this.localData.findIndex(data => data['name'] === path[j - 1]);
            if (parentIndex !== -1) {
              this.localData.push({
                id: idValue,
                pid: this.localData[parentIndex]['id'],
                name: path[j],
                hasChild: true
              });
            }
          }
          idValue = idValue + 1;
        }
      }
    }
    this.reportVariables = this.placeCodesInReportVariablesAfterCode(
        this.reportVariables,
        ['Emp_NiveauContrat', 'Emp_EchelonContrat', 'Emp_CoefficientContrat'],
        'Emp_JobType_LowerCase');
    for (const variable of this.reportVariables) {
      const category = variable.categories.split(';').pop();
      const categoryCoordination = this.localData.find(data => data['name'] === category);
      if (categoryCoordination) {
        this.localData.push({
          id: variable.uuid, pid: categoryCoordination['id'], name: variable.label
        });
      }
    }
  }

  private placeCodesInReportVariablesAfterCode(variables: VariableReportModel[], codes: string[], codeRef: string): VariableReportModel[] {
    const elements: VariableReportModel[] = [];
    codes.forEach(code => {
      const i = variables.findIndex(v => v.code === code);
      elements.push(variables[i]);
      variables.splice(i, 1);
    });
    const indexRef = variables.findIndex(v => v.code === codeRef);
    const leftPart: VariableReportModel[] = variables.slice(0, indexRef + 1);
    const rigthPart: VariableReportModel[] = indexRef === variables.length - 1 ? [] : variables.slice(indexRef + 1, variables.length);
    variables = leftPart.concat(elements).concat(rigthPart);
    return variables;
  }

  private getCategories(): void {
    this.rapportService.getReportCategories().subscribe((categories: string[]) => {
      this.categories = categories.map(category => {
        return {label: category, value: category};
      });
    });
  }

  private setEditorLanguage(): void {
    const frenchLangCode = 'fr';
    if (this.rhisTranslateService.currentLang === frenchLangCode) {
      L10n.load({fr: EJ2_LOCALE.fr});
      setCulture(frenchLangCode);
    }
  }

  ngAfterViewInit() {
    this.checkMenuSate();
    this.listTreeObj.expandOn = 'Click';
    this.container.enableToolbar = false;
    this.container.height = 'calc(100vh - 270px)';
    this.container.width = this.menuIsOpen ? 'calc(100% - 80px)' : '100%';
  }

  public onCreate(): void {
    // Prevent default drag over for document editor element
    this.container.documentEditor.element.addEventListener('dragover', function (event) {
      event.preventDefault();
    });
    this.container.documentEditor.contextMenu.addCustomMenu([], true, false);
  }

  public nodeCheck(): void {
    this.listTreeObj.expandOn = 'Click';
  }

  public onSelectTreeNode(args: any): void {
    const nodeData = args.nodeData;
    this.getCodeAndPlaceItInDocEditor(nodeData);
  }

  public nodeDragStopHandler(e: DragAndDropEventArgs): void {
    const draggedNodeData = e.draggedNodeData;
    this.getCodeAndPlaceItInDocEditor(draggedNodeData);
  }

  private getCodeAndPlaceItInDocEditor(nodeData: { [p: string]: Object }): void {
    if (!nodeData.hasChildren) {
      const variable = this.reportVariables.find(v => v.uuid === nodeData.id);
      if (variable) {
        const fieldName: any = variable.code;
        this.insertField(fieldName);
      }
    }
  }

  private insertField(fieldName: any): void {
    const fileName: any = fieldName.replace(/\n/g, '').replace(/\r/g, '').replace(/\r\n/g, '');
    this.container.documentEditor.editor.insertText(fileName);
    this.container.documentEditor.editor.insertText(' ');
    this.container.documentEditor.focusIn();
  }

  public onDocumentChange(): void {
    this.container.documentEditor.focusIn();
  }

  private changeDataSource(data): void {
    this.listTreeObj.fields = {
      dataSource: data, id: 'id', text: 'name', parentID: 'pid', hasChildren: 'hasChild'
    };
  }

  public searchNodes(args): void {
    const _text = this.maskObj.element.value;
    const predicats = [], _array = [], _filter = [];
    if (_text.trim() === '') {
      this.changeDataSource(this.localData);
    } else {
      const predicate = new Predicate('name', 'contains', _text, true);
      const filteredList = new DataManager(this.localData).executeLocal(new Query().where(predicate));
      this.extractResultsToPredicate(filteredList, _filter, _array, predicats);
      if (predicats.length === 0) {
        this.changeDataSource([]);
      } else {
        const query = new Query().where(Predicate.or(predicats));
        const newList = new DataManager(this.localData).executeLocal(query);
        this.changeDataSource(newList);
        const proxy = this;
        setTimeout(function (this) {
          proxy.listTreeObj.expandAll();
        }, 100);
      }
    }
  }

  private extractResultsToPredicate(filteredList: Object[], _filter: any[], _array: any[], predicats: any[]): void {
    for (let j = 0; j < filteredList.length; j++) {
      _filter.push(filteredList[j]['id']);
      const filters = this.getFilterItems(filteredList[j], this.localData);
      for (let i = 0; i < filters.length; i++) {
        if (_array.indexOf(filters[i]) === -1 && filters[i] != null) {
          _array.push(filters[i]);
          predicats.push(new Predicate('id', 'equal', filters[i], false));
        }
      }
    }
  }

  // Find the Parent Nodes for corresponding childs
  public getFilterItems(fList, list): any[] {
    const nodes = [];
    nodes.push(fList['id']);
    const query2 = new Query().where('id', 'equal', fList['pid'], false);
    const fList1 = new DataManager(list).executeLocal(query2);
    if (fList1.length !== 0) {
      const pNode = this.getFilterItems(fList1[0], list);
      for (let i = 0; i < pNode.length; i++) {
        if (nodes.indexOf(pNode[i]) === -1 && pNode[i] != null) {
          nodes.push(pNode[i]);
        }
      }
      return nodes;
    }
    return nodes;
  }

  public goToListRapport(): void {
    if (this.restaurantUuid) {
      this.router.navigate(['parc/rapport']);
    } else {
      this.router.navigate([`home/employee/${this.employeeUuid}/detail/rapport`]);
    }
  }
}
