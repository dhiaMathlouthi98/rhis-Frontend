import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {SchemaLinePayEnum} from '../../../../../shared/enumeration/schema-line-pay.enum';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {OverlayPanel} from 'primeng/overlaypanel';
import {PopoverContentComponent} from 'ngx-smart-popover';

@Component({
    selector: 'rhis-pay-schema-generator',
    templateUrl: './pay-schema-generator.component.html',
    styleUrls: ['./pay-schema-generator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaySchemaGeneratorComponent implements OnInit, OnDestroy {

    @Input()
    set schema(value: string) {
        if (value) {
            this.items = value.split(';').map((item: string) => {
                const parts = item.split(':');
                return {
                    label: parts[0],
                    length: parts.length === 2 ? parts[1] : ''
                };
            });
        } else {
            this.items = [];
        }
    }

    @Output()
    public updateSchema: EventEmitter<string> = new EventEmitter();
    public isErrorWhenUpdatingSchema = false;
    public items: Array<{label: string, length: string}> = [];
    public minStructureCodes: { label: string, value: string }[] = [];
    private tableIsChanged = false;
    public selectedItems = [];
    public selectedItem: String;
    // two dimensional table matrix representing view model
    public itemsTable: Array<{label: string, length: string}[]>;

    // fix column width as defined in CSS (150px + 5px margin)
    public boxWidth = 155;
    // calculated based on dynamic row width
    public columnSize: number;
    private nbrItemsPerLine = 5;
    private lengthPopUp: PopoverContentComponent;

    constructor(private rhisTranslateService: RhisTranslateService) {
    }

    public getItemsTable(rowLayout: Element): {label: string, length: string}[][] {
        // calculate column size per row
        const {width} = rowLayout.getBoundingClientRect();
        const columnSize = Math.round(width / this.boxWidth);
        // view has been resized or updated => update table with new column size
        if ((columnSize !== this.columnSize) || this.tableIsChanged) {
            this.tableIsChanged = false;
            this.columnSize = columnSize;
            this.initTable();
        }
        return this.itemsTable;
    }

    ngOnInit(): void {
        Object.values(SchemaLinePayEnum).forEach((value) => {
            this.selectedItems.push({
                label: this.rhisTranslateService.translate('GDH.PAY.SCHEMA_' + value),
                value: this.rhisTranslateService.translate('GDH.PAY.SCHEMA_' + value)
            });
        });
        this.minStructureCodes = this.selectedItems.filter(
            (item: { label: string, value: string }) =>
                (item.value === SchemaLinePayEnum.CODE));

    }

    public initTable(): void {
        this.itemsTable = this.items
            .filter((_, outerIndex) => outerIndex % this.columnSize === 0)
            .map((
                _,
                rowIndex
                ) =>
                    this.items.slice(
                        rowIndex * this.nbrItemsPerLine,
                        rowIndex * this.nbrItemsPerLine + this.nbrItemsPerLine
                    )
            );
    }

    public reorderDroppedItem(event: CdkDragDrop<{label: string, length: string}[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
        this.items = this.itemsTable.reduce(
            (previous, current) => previous.concat(current),
            []
        );
        this.initTable();
    }

    public delete(parentIndex: number, index: number, event): void {
        event.stopPropagation();
        if (this.lengthPopUp) {
            this.lengthPopUp.hide();
        }
        if (this.canDeleteItem(5 * parentIndex + index)) {
            this.items.splice(5 * parentIndex + index, 1);
            this.tableIsChanged = true;
            this.isErrorWhenUpdatingSchema = false;
        } else {
            this.isErrorWhenUpdatingSchema = true;
        }
    }

    private isSchemaRespected(): boolean {
        return this.minStructureCodes.every(
            (code: { label: string, value: string }) =>
                this.items.map((el: {label: string, length: string}) => el.label).includes(code.label));
    }

    private canDeleteItem(itemIndexToBeDeleted: number): boolean {
        const tempItems = [...this.items.map((el: {label: string, length: string}) => el.label)];
        const deletedItems = tempItems.splice(itemIndexToBeDeleted, 1);
        const someObligatoryItemsIsDeleted = this.minStructureCodes.some(
            (code: { label: string, value: string }) => deletedItems.includes(code.label));
        if (someObligatoryItemsIsDeleted) {
            return this.minStructureCodes.every((code: { label: string, value: string }) => tempItems.includes(code.label));
        }
        return true;
    }

    public add(el: string, ref?: OverlayPanel): void {
        if (el.trim()) {
            this.items.push({label: el, length: ''});
            this.tableIsChanged = true;
            if (ref) {
                ref.hide();
            }
            this.isErrorWhenUpdatingSchema = false;
            this.selectedItem = null;
        }
    }

    public saveSchema(): void {
        if (this.isSchemaRespected()) {
            const schema = this.items
                .map((item: {label: string, length: string}) => item.label + (item.length ? ':' + item.length : ''))
                .join(';');
            this.updateSchema.emit(schema);
            this.isErrorWhenUpdatingSchema = false;
        } else {
            this.isErrorWhenUpdatingSchema = true;
        }
        this.selectedItem = null;
    }

    public addToSchema(element: HTMLInputElement): void {
        this.add(element.value);
        element.value = '';
    }

    public openLengthPopUp(selectedPopUp: PopoverContentComponent): void {
        if (this.lengthPopUp !== selectedPopUp) {
            if (this.lengthPopUp) {
                this.lengthPopUp.hide();
            }
            this.lengthPopUp = selectedPopUp;
        }
    }

    ngOnDestroy(): void {
        this.selectedItem = null;
        this.selectedItems = [];
        this.items = [];
    }
}
