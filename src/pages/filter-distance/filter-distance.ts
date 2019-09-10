import { Component } from '@angular/core';
import { AlertController, Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import { Category } from '@nte/models/category.model';
import { FilterService } from '@nte/services/filter.service';
import { LocationService } from '@nte/services/location.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ListTileCreatePage } from './../list-tile-create/list-tile-create';

@IonicPage()
@Component({
  selector: `filter-distance`,
  templateUrl: `filter-distance.html`
})
export class FilterDistancePage {
  public category: Category;
  public title: string;

  private authSub: Subscription;
  private changeSub: Subscription;
  private listType: string;

  constructor(params: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public location: LocationService,
    public filterService: FilterService,
    private events: Events,
    private mixpanel: MixpanelService) {
    this.category = params.get(`category`);
    this.listType = params.get(`listType`);
    this.title = params.get(`title`);
  }

  public applyFilters() {
    this.filterService.filter.updateQuery();
    this.events.publish(`filterApplied`);
    const mixpanelData = {
      distance: this.location.distance,
      location: this.location.zipOrAddress
    };
    this.mixpanel.event(`location_filter_applied`, mixpanelData);
    this.back();
  }

  public back() {
    this.navCtrl.pop({ animation: `ios-transition` });
  }

  public clear() {
    this.category.selectedItems = new Array();
    this.events.publish(`clearCategory`, this.category);
    this.location.clearAll();
    this.mixpanel.event(`location_filter_cleared`);
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public ionViewDidLoad() {
    this.setupChangeSub();
    this.setupAuthSub();
    this.location.checkIfLocationAuthorized();
    if (this.category.preselectedFilters) {
      this.setPreselectedFilters();
    }
  }

  public ionViewWillUnload() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.changeSub) {
      this.changeSub.unsubscribe();
    }
  }

  public setFilter() {
    if (this.location.distance && this.location.method === `other` && !this.location.zipOrAddress) {
      this.showInputAlert();
    }
    this.location.buildQueryString();
  }

  public setPreselectedFilters() {
    const preselected = this.category.preselectedFilters;
    if (preselected.has(`distance`) &&
      preselected.get(`distance`).values.length) {
      this.location.distance = +preselected.get(`distance`).values[0].id;
    }
    if (preselected.has(`location`) &&
      preselected.get(`location`).values.length) {
      this.location.getZipcode(preselected.get(`location`).values[0].id)
        .subscribe((data: any) => {
          for (let i = 0, addr; addr = data.results[0].address_components[i]; ++i) {
            if (addr.types[0] === `postal_code`) {
              this.location.zipOrAddress = addr.short_name;
              if (this.location.method === `my`) {
                this.location.method = this.location.geoAuthorized ? `my` : `other`;
              } else {
                this.location.method = `other`;
              }
            }
          }
          this.setFilter();
        });
    }
  }

  public showInputAlert() {
    const alert = this.alertCtrl.create({
      buttons: [
        {
          handler: () => { /* handler */ },
          role: `cancel`,
          text: `Cancel`
        },
        {
          handler: (data) => {
            this.location.zipOrAddress = data.zip;
            this.setFilter();
          },
          text: `OK`
        }
      ],
      inputs: [
        {
          name: `zip`,
          placeholder: ``
        }
      ],
      title: `Enter ZIP or City`
    });
    alert.present();
  }

  public viewSummary() {
    this.navCtrl.push(
      ListTileCreatePage,
      {
        filter: this.filterService.filter,
        page: this.listType
      }
    );
  }

  /* PRIVATE METHODS */

  private setupAuthSub() {
    this.authSub = this.location.isAuthorized
      .subscribe((authorized) => {
        if (authorized === undefined) { return; }
        if (authorized) {
          this.location.buildQueryString();
        } else {
          // this.showInputAlert();
          this.location.method = `other`;
        }
        this.authSub.unsubscribe();
      });
  }

  private setupChangeSub() {
    this.changeSub = this.location.query
      .subscribe((data) => {
        if (this.category.selectedItems.length) {
          this.category.selectedItems = new Array();
        }
        this.category.selectedItems.push(data.locationQuery, data.distanceQuery);
        this.events.publish(`queryStringChange`, data.locationQuery);
        this.events.publish(`queryStringChange`, data.distanceQuery);
      });
  }
}
