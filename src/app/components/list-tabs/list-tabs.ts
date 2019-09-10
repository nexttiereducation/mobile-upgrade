import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: `[list-tabs]`,
  host: {
    '[class.tabs]': `true`,
    '[class.tabs-md]': `true`,
    '[class.tabbar]': `true`,
    '[class.show-tabbar]': `true`
  },
  templateUrl: `list-tabs.html`
})
export class ListTabsComponent {
  public activeTab: number;

  get deviceIsIphoneX() {
    return false;
  }

  constructor(public navCtrl: NavController) { }

}
