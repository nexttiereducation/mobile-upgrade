import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `[list-tabs]`,
  styleUrls: [`list-tabs.scss`],
  templateUrl: `list-tabs.html`
})
export class ListTabsComponent {
  public activeTab: number;

  get deviceIsIphoneX() {
    return false;
  }

  constructor(public router: Router) { }

  public selectTab(idx: number) {
    // TODO: Determine if this file is still needed. If not, delete it.
    // this.router.parent.select(idx);
    // this.router.pop();
    console.log('hi');
  }
}

