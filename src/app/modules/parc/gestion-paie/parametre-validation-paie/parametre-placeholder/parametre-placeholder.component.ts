import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RhisTranslateService} from '../../../../../shared/service/rhis-translate.service';
import {SessionService} from '../../../../../shared/service/session.service';

@Component({
  selector: 'rhis-parametre-placeholder',
  templateUrl: './parametre-placeholder.component.html',
  styleUrls: ['./parametre-placeholder.component.scss']
})
export class ParametrePlaceholderComponent implements OnInit {

  listRestaurants: any = [];
  existPlaceholder = false;
  msg = '';
  placeHolderText = '';
  placeHolderCheckList = ['<Liste_Restaurants>', '<Restaurants_List>', '<Lista_de_Restaurantes>', '<Restaurantlijst>', '<Restaurantliste>'];

  @Input() set listRestaurant(value) {
    this.listRestaurants = value;
    if (value.length > 0) {
      this.setMessage(this.msg);
    }

  }

  @Input() set message(value: string) {
    this.msg = value;
  }

  @Input() set messageBox(value: string) {
    if (value) {
      this.msg = value;
      this.setMessage(value);
    }
  }


  @Output() textChanges = new EventEmitter();

  constructor(private rhisTranslateService: RhisTranslateService, public sessionService: SessionService) {
  }

  ngOnInit() {
  }

  setMessage(value) {
    if (value) {
      let exsitPlaceHolder = false;
      this.placeHolderCheckList.forEach(el => {
        if (value.toLowerCase().includes(el.toLowerCase())) {
          exsitPlaceHolder = true;
        }
      });
      if (exsitPlaceHolder) {
        this.existPlaceholder = true;
        const placeholder = document.getElementsByClassName('placeholder') as HTMLCollectionOf<HTMLElement>;
        const index = placeholder.length === 0 ? 0 : placeholder.length;
        if (index > 0) {
          for (let i = 0; i < placeholder.length; i++) {
            placeholder[i].innerText = this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER');
          }
        }
        setTimeout(() => {
          this.generateText(document.getElementById('divMessage').innerText);
        }, 150);
      } else {
        this.generateText(null);
        this.existPlaceholder = false;
      }
    } else {
      this.existPlaceholder = false;
    }
  }


  generateText(text) {
    const divMessage = document.getElementById('divMessage') as HTMLElement;
    divMessage.innerHTML = '';

    const textMail = document.createElement('span');
    textMail.setAttribute('id', 'textemail');
    divMessage.append(textMail);
    textMail.innerHTML = '';
    const listdesMots = text ? text.trim().split(/\s+/) : this.msg.trim().split(/\s+/);

    if (listdesMots.length > 0) {
      listdesMots.forEach(mot => {
        const span = document.createElement('span');
        if (this.placeHolderCheckList.includes(mot) || this.placeHolderCheckList.includes(mot.slice(0, -1))) {
          const croix = this.createCroix();
          this.createPlaceHolderSpan(span, false, croix);
          textMail.append(span);
          const emptySpan = document.createElement('span');
          emptySpan.innerHTML = '&nbsp; ';
          textMail.append(emptySpan);
          /* fix cursor focus after place holder */
          const setpos = document.createRange();
          const set = window.getSelection();
          setpos.setStart(emptySpan.childNodes[0], 1);
          setpos.collapse(true);
          set.removeAllRanges();
          set.addRange(setpos);
          emptySpan.focus();
          /* fix cursor focus after place holder */
        } else {
          span.innerText = mot + ' ';
          textMail.append(span);
        }

      });
      this.textChanges.emit(textMail.innerText);
    }

  }

  createPlaceHolderSpan(span, newSpan, croix) {
    const placeholder = document.getElementsByClassName('placeholder') as HTMLCollectionOf<HTMLElement>;
    const index = !placeholder.length ? 0 : placeholder.length;
    let spanPlaceholder = span;
    if (newSpan) {
      spanPlaceholder = document.createElement('span');
    }
    spanPlaceholder.setAttribute('class', 'placeholder');
    spanPlaceholder.setAttribute('id', 'placeholder' + index);
    spanPlaceholder.setAttribute('contenteditable', 'false');
    spanPlaceholder.setAttribute('style', 'background-color: #c6dff5;padding-left: 3px;border-radius: 3px;');
    spanPlaceholder.innerText = this.addRestaurantsNamesToMessage();
    spanPlaceholder.append(croix);

  }

  createCroix(): HTMLElement {
    const croix = document.createElement('i');
    croix.setAttribute('class', 'pi pi-fw pi-times');
    croix.setAttribute('style', 'cursor: pointer;');

    croix.addEventListener('click', function handleClick(event: PointerEvent) {
      const d = event.srcElement.parentElement.id;
      document.getElementById(d).remove();
    });
    return croix;
  }

  addRestaurantsNamesToMessage(): string {
    if (this.listRestaurants && this.listRestaurants.length > 0 && this.existPlaceholder) {
      const list = [];
      this.listRestaurants.forEach(restaurant => list.push(restaurant.libelleRestaurant));
      if (list.length === 1) {
        const resto = ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Du_restaurant') + ' ' + list[0];
        this.placeHolderText = resto;
        return resto;

      } else {
        let names = ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.Des_restaurants_de') + ' ';
        list.forEach((name, index) => {
          if (index + 1 === list.length) {
            names += ' ' + this.rhisTranslateService.translate('PARAMETRE_ENVOI_RAPPORT_FRANCHISE.LIST_RESTAURANT_PLACEHOLDER_MORE_RESTO') + ' ' + name;
          }
          if (index === 0) {
            names += name;
          }
          if (index !== 0 && index + 1 !== list.length) {
            names += ', ' + name;
          }
        });
        this.placeHolderText = names;
        return names;
      }
    }
    return '';
  }

}
