import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'rhis-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  /**
   * Boolean permettant de masquer le header et le menu dans certaines pages (p.e : visualisation de pdf)
   */
  public hideHeaderAndMenu = false;
  constructor(router: Router) {
    this.hideHeaderAndMenu = router.url.toString().includes('/home/rapports/display/');
  }

}
