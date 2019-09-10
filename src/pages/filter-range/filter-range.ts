import { Component } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from '@ionic/angular';
import { isObject } from 'lodash';

import { Category } from '@nte/models/category.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ListTileCreatePage } from './../list-tile-create/list-tile-create';

@IonicPage()
@Component({
  selector: `filter-range`,
  templateUrl: `filter-range.html`
})
export class FilterRangePage {
  public category: Category;
  public dualKnobs: boolean = false;
  public selectedValue: number | any;
  public title: string;

  private listType: string;
  private query: QueryObject;

  get selectedValueDisplay() {
    if (this.selectedValue) {
      return isObject(this.selectedValue) ? this.selectedValue.lower : this.selectedValue;
    } else if (this.category && this.category.selectedItems && this.category.selectedItems.length > 0) {
      return this.category.selectedItems[0].id;
    } else {
      return 0;
    }
  }

  constructor(public params: NavParams,
    public navCtrl: NavController,
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
    this.back();
  }

  public back() {
    this.navCtrl.pop({ animation: `ios-transition` });
  }

  public clear() {
    this.category.selectedItems = new Array();
    this.events.publish(`clearCategory`, this.category);
    this.query = {
      displayName: this.category.name,
      name: this.category.query.name,
      values: []
    };
    this.events.publish(`queryStringChange`, this.query);
    this.mixpanel.event(`range_filter_cleared`);
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public ionViewDidLoad() {
    const selectedValue = this.selectedValueDisplay;
    if (!this.category.config.valueType) {
      this.category.config.prefix = `$`;
      this.category.config.min = 1000;
      this.category.config.step = 1000;
      this.selectedValue = { lower: selectedValue, upper: this.category.config.max };
      this.dualKnobs = true;
    } else {
      this.selectedValue = selectedValue;
    }
    if (!this.category.config.min) {
      this.category.config.min = 0;
    }
  }

  public setFilter() {
    const selectedValue = isObject(this.selectedValue) ? this.selectedValue.lower : this.selectedValue;
    const mixpanelData = { category: this.category.name, range: selectedValue };
    this.mixpanel.event(`range_filter_applied`, mixpanelData);
    if (this.category.selectedItems.length) {
      this.category.selectedItems = new Array();
    }
    this.category.selectedItems.push({ id: selectedValue });
    this.query = {
      displayName: this.category.name,
      name: this.category.query.name,
      values: [this.category.selectedItems[0]]
    };
    this.events.publish(`queryStringChange`, this.query);
  }

  public viewSummary() {
    // this.events.publish('viewListSummary');
    this.navCtrl.push(
      ListTileCreatePage,
      {
        filter: this.filterService.filter,
        page: this.listType
      }
    );
  }
}
