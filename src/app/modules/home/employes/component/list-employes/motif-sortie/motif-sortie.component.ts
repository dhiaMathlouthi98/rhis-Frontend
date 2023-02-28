import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProfilModel} from '../../../../../../shared/model/profil.model';
import {MotifSortieModel} from '../../../../../../shared/model/motifSortie.model';

@Component({
  selector: 'rhis-motif-sortie',
  templateUrl: './motif-sortie.component.html',
  styleUrls: ['./motif-sortie.component.scss']
})
export class MotifSortieComponent implements OnInit {
  @Input()
  public listmotifSorties: MotifSortieModel[];
  @Output()
  public confirmEvent = new EventEmitter();
  public motifSortie: MotifSortieModel;

  constructor() {
  }

  ngOnInit() {
  }

  public confirm(): void {
    this.confirmEvent.emit(this.motifSortie);
    this.motifSortie = null;
  }
}
