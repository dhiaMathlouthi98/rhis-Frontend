import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {DomControlService} from '../../../../../service/dom-control.service';
import {RhisRoutingService} from '../../../../../service/rhis.routing.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'rhis-edit-doc-space',
  templateUrl: './edit-doc-space.component.html',
  styleUrls: ['./edit-doc-space.component.scss']
})
export class EditDocSpaceComponent implements OnInit {

  private currentUrl: string;
  public employeHeader = true;

  constructor(public rhisRouter: RhisRoutingService,
              private domControlService: DomControlService,
              private router: Router) {
    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
      )
      .subscribe((e: NavigationEnd) => {
        this.currentUrl = e.urlAfterRedirects;
        if (this.currentUrl.includes('/parc')) {
          this.employeHeader = false;
        } else {
          this.employeHeader = true;
        }
      });
  }

  public ngOnInit() {
  }
}
