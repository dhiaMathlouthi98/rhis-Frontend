import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'rhis-position-de-travail',
  templateUrl: './position-de-travail.component.html',
  styleUrls: ['./position-de-travail.component.scss'],
})
export class PositionDeTravailComponent implements OnInit {
  // libellé de la position de travail sélectionné
  @Input() positionDeTravail: {
    label: string,
    color: string,
    value: number,
    idPosition: number,
  };
  @Input() isBannerEditable: boolean;
  @Output() newPosition = new EventEmitter<{
    label: string,
    color: string,
    value: number,
    idPosition: number,
  }>();

  public pdtValue: number;

  constructor(private messageService: MessageService) {
  }

  ngOnInit() {
    this.pdtValue = +this.positionDeTravail.value;
  }

  /**
   * Récupere la nouvelle valeur saisie et l'envoie au composant parent
   * @param event évenement
   */
  public getNewValue(event) {
    this.messageService.clear('wv');
    if (event.target.textContent !== '' && event.target.textContent >= 0) {
      this.pdtValue = event.target.textContent;
      if (!isNaN(this.pdtValue) && this.pdtValue >= 0 && this.positionDeTravail.value !== +this.pdtValue) {
        this.newPosition.emit({
          label: this.positionDeTravail.label,
          color: this.positionDeTravail.color,
          value: this.pdtValue,
          idPosition: this.positionDeTravail.idPosition,
        });
      } else {
        event.preventDefault();
      }
    } else {
      event.target.textContent = +this.positionDeTravail.value;
      this.messageService.add({
        key: 'wv',
        severity: 'warn',
        summary: 'Valeur incorrecte',
        detail: 'La valeur saisie doit être >= 0',
        closable: false
      });
    }
  }

  /**
   * Empêche le retour à la ligne
   * @param event évenement
   */
  public disableNewLine(event) {
    // la valeur 13 correspond au keycode de la touche entrée
    if (event.which === 13 || event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
    if (event.which === 13) {
      event.target.blur();
    }
  }
}
