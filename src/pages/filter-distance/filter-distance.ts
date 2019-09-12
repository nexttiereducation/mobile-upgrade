import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Category } from '@nte/models/category.model';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { FilterService } from '@nte/services/filter.service';
import { LocationService } from '@nte/services/location.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';

@Component({
  selector: `filter-distance`,
  templateUrl: `filter-distance.html`
})
export class FilterDistancePage implements OnInit, OnDestroy {
  public category: Category;
  public title: string;

  private listType: string;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public router: Router,
    public alertCtrl: AlertController,
    public location: LocationService,
    public filterService: FilterService,
    private events: Events,
    private mixpanel: MixpanelService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.category = params.category;
    this.listType = params.listType;
    this.title = params.title;
  }

  ngOnInit() {
    this.setupChangeSub();
    this.setupAuthSub();
    this.location.checkIfLocationAuthorized();
    if (this.category.preselectedFilters) {
      this.setPreselectedFilters();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public applyFilters() {
    this.filterService.filter.updateQuery();
    this.events.publish(`filterApplied`);
    this.mixpanel.event(`location_filter_applied`, {
      distance: this.location.distance,
      location: this.location.zipOrAddress
    });
    // TODO: Add logic to close filters
  }

  public clear() {
    this.category.selectedItems = new Array();
    this.events.publish(`clearCategory`, this.category);
    this.location.clearAll();
    this.mixpanel.event(`location_filter_cleared`);
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
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
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          data.results[0].address_components.forEach(addr => {
            if (addr.types[0] === `postal_code`) {
              this.location.zipOrAddress = addr.short_name;
              if (this.location.method === `my`) {
                this.location.method = this.location.geoAuthorized ? `my` : `other`;
              } else {
                this.location.method = `other`;
              }
            }
          });
          this.setFilter();
        });
    }
  }

  public async showInputAlert() {
    const alert = await this.alertCtrl.create({
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
      header: `Enter ZIP or City`,
      inputs: [
        {
          name: `zip`,
          placeholder: ``
        }
      ]
    });
    return await alert.present();
  }

  public viewSummary() {
    this.router.navigate(
      [ListTileCreatePage],
      {
        state: {
        filter: this.filterService.filter,
        page: this.listType
      }
      }
    );
  }

  /* PRIVATE METHODS */

  private setupAuthSub() {
    this.location.isAuthorized
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (authorized) => {
        if (authorized === undefined) { return; }
        if (authorized) {
          this.location.buildQueryString();
        } else {
          // this.showInputAlert();
          this.location.method = `other`;
        }
        }
      );
  }

  private setupChangeSub() {
    this.location.query
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => {
        if (this.category.selectedItems.length) {
          this.category.selectedItems = new Array();
        }
        this.category.selectedItems.push(data.locationQuery, data.distanceQuery);
        this.events.publish(`queryStringChange`, data.locationQuery);
        this.events.publish(`queryStringChange`, data.distanceQuery);
        }
      );
  }
}
