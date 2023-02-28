import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrightnessColorShiftService {

  // 125 est presque la moyenne de 255 (s'agit de code couleur pour RGB)
  public moyenneBrightness: any = 125;

  constructor() {
  }

  /**
   * Calculate the brightness of background color shift
   * @param: codeColor(hexa)
   */
  public brightnessShiftColor(codeColor: string): any {
    const bgShiftHexWithout = codeColor.replace('#', '');
    const r = parseInt(bgShiftHexWithout.substr(0, 2), 16);
    const g = parseInt(bgShiftHexWithout.substr(2, 2), 16);
    const b = parseInt(bgShiftHexWithout.substr(4, 2), 16);
    const brightnessColorShift = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightnessColorShift;
  }

  /**
   * methode return code color after background color brightness calculculation
   * @param: codeColorBright
   */
  public codeColorTextShift(codeColorBright: string, justShiftFixe = true): any {
    if (this.brightnessShiftColor(codeColorBright) > this.moyenneBrightness && justShiftFixe) {
      return '#414141';
    } else {
      return '#FFF';
    }
  }

  /**
   * methode return image after background color brightness calculculation
   * @param: codeColorBright
   */
  public icontShift(codeColorBright: string, justShiftFixe = true): any {
    if (this.brightnessShiftColor(codeColorBright) > this.moyenneBrightness && justShiftFixe) {
      return 'url(/assets/icons/planning/edit-icon/icon-edit-noir.png)';
    } else {
      return '#FFF';
      return 'url(/assets/icons/planning/edit-icon/icon-edit.svg)';
    }
  }

  /**
   * Change color to the darker color
   * @param: codeColor
   * @param: amt
   */
  public LightenDarkenColor(codeColor: string, amt: any) {
    const bgShiftHexWithout = codeColor.replace('#', '');

    let redColor;
    let geenColor;
    let blueColor;
    if (bgShiftHexWithout !== '000000') {
      if (bgShiftHexWithout.length === 3) {
        redColor = parseInt((bgShiftHexWithout.substr(0, 1) + bgShiftHexWithout.substr(0, 1)), 16);
        geenColor = parseInt((bgShiftHexWithout.substr(1, 1) + bgShiftHexWithout.substr(1, 1)), 16);
        blueColor = parseInt((bgShiftHexWithout.substr(2, 1) + bgShiftHexWithout.substr(2, 1)), 16);
      } else {
        redColor = parseInt(bgShiftHexWithout.substr(0, 2), 16);
        geenColor = parseInt(bgShiftHexWithout.substr(2, 2), 16);
        blueColor = parseInt(bgShiftHexWithout.substr(4, 2), 16);
      }

      if (this.brightnessShiftColor(codeColor) >= 150) {
        redColor = Math.abs(redColor - amt);
        geenColor = Math.abs(geenColor - amt);
        blueColor = Math.abs(blueColor - amt);
      } else if (this.brightnessShiftColor(codeColor) < 150) {
        redColor = Math.abs(redColor + amt);
        geenColor = Math.abs(geenColor + amt);
        blueColor = Math.abs(blueColor + amt);
      }

      if (redColor > 255) {
        redColor = redColor - 255 + amt;
      } else if (redColor < 0) {
        redColor = redColor + 255 - amt;
      }
      if (geenColor > 255) {
        geenColor = geenColor - 255 + amt;
      } else if (geenColor < 0) {
        geenColor = geenColor + 255 - amt;
      }

      if (blueColor > 255) {
        blueColor = blueColor - 255 + amt;
      } else if (blueColor < 0) {
        blueColor = blueColor + 255 - amt;
      }


      const newRedColor = ((redColor.toString(16).length === 1) ? '0' + redColor.toString(16) : redColor.toString(16));
      const newGeenColor = ((geenColor.toString(16).length === 1) ? '0' + geenColor.toString(16) : geenColor.toString(16));
      const newBlueColor = ((blueColor.toString(16).length === 1) ? '0' + blueColor.toString(16) : blueColor.toString(16));

      return '#' + newRedColor + newGeenColor + newBlueColor;
    } else {
      return '#385FE3';
    }

  }

}
