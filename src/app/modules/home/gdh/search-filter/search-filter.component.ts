import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'rhis-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilterComponent implements OnInit {

  @Output()
  public searchByFirstLastName = new EventEmitter();
  @Output()
  public sendFilter = new EventEmitter<string>();
  @Input()
  public minSizeEnabled: boolean;
  public filterName = new FormControl('');

  ngOnInit() {
    this.filterName.valueChanges.subscribe((filter: string) => this.sendFilter.emit(filter));
  }

  public searchEmployee(): void {
    this.searchByFirstLastName.emit();
  }
}
