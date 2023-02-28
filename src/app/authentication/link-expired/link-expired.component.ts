import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'rhis-link-expired',
  templateUrl: './link-expired.component.html',
  styleUrls: ['./link-expired.component.scss']
})
export class LinkExpiredComponent implements OnInit {

  constructor(private router: Router) { }
  ngOnInit() {
  }

  goLogin(): void {
    this.router.navigate(['login']);
  }
}
