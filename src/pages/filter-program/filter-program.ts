import { Component } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from '@ionic/angular';
import { replace, trimEnd } from 'lodash';

import { SEARCH_EMPTY_STATES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Option } from '@nte/models/option.model';
import { FilterService } from '@nte/services/filter.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ListTileCreatePage } from './../list-tile-create/list-tile-create';

@IonicPage({
  segment: ``
})
@Component({
  selector: `filter-program`,
  templateUrl: `filter-program.html`
})
export class FilterProgramPage {
  public addItems: any;
  public category: Category;
  public isSearching = true;
  public items: any;
  public noResults: any;
  public searchValue: string;
  public selectedItem: any;
  public title: string;

  private listType: string;

  get categoryOptions() {
    if (this.category.options && this.category.options.length > 0) {
      return [...this.category.options];
    }
  }

  get itemType() {
    return trimEnd(this.category.name.toLowerCase(), `s`);
  }

  get selectedItemIds() {
    if (this.category.selectedItems && this.category.selectedItems.length > 0) {
      return this.category.selectedItems.map((item) => item.id);
    }
  }

  constructor(params: NavParams,
    public navCtrl: NavController,
    public filterService: FilterService,
    private events: Events,
    private keyboard: KeyboardService,
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

  public clear(_ev: any) {
    this.category.selectedItems = new Array(0);
    this.selectedItem = undefined;
    this.updateQuery();
    this.mixpanel.event(this.itemType + `_filter_cleared`);
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public clearSearch(_event) {
    this.searchValue = ``;
    this.items = new Array(0);
  }

  public closeKeyboard() {
    this.keyboard.close();
  }

  public ionViewWillEnter() {
    this.noResults = Object.assign({}, SEARCH_EMPTY_STATES.noResults);
    const addItems = Object.assign({}, SEARCH_EMPTY_STATES.addItems);
    addItems.title = replace(addItems.title, `item`, this.itemType);
    addItems.body = replace(addItems.body, `item`, this.itemType);
    this.addItems = addItems;
  }

  public search(ev: any) {
    this.searchValue = ev.target.value.toLowerCase();
    if (!this.searchValue.length) {
      this.items = [];
      return;
    }
    this.isSearching = true;
    this.filterService.search(this.searchValue, this.itemType)
      .subscribe((response) => {
        if (this.category.selectedItems.length > 0) {
          this.items = response.results.map((item) => {
            if (this.selectedItemIds.indexOf(item.name) > -1) {
              item.isActive = true;
            }
            return item;
          });
        } else {
          this.items = response.results;
        }
        this.isSearching = false;
      });
  }

  public selectProgram(item: Option | any) {
    const mixpanelData = { category: this.category.name };
    mixpanelData[this.itemType] = item.name;
    this.mixpanel.event(`${this.itemType}_filter_selected`, mixpanelData);
    if (this.category.selectedItems.length) {
      this.category.selectedItems = new Array();
    }
    this.category.selectedItems.push({ id: item.name });
    this.updateQuery();
  }

  public toggleMajor(option: Option | any) {
    option.isActive = !option.isActive;
    const optValue = option.name || option.displayValue;
    const mixpanelData = { category: this.category.name, option: optValue };
    if (option.isActive) {
      this.mixpanel.event(`option_selected`, mixpanelData);
      this.category.selectedItems.push({ id: optValue, displayValue: optValue });
    } else {
      this.mixpanel.event(`option_deselected`, mixpanelData);
      const optIndex = this.selectedItemIds.indexOf((item) => item.id === optValue);
      this.category.selectedItems.splice(optIndex, 1);
    }
    this.updateQuery();
  }

  public updateQuery() {
    const query = {
      displayName: this.category.name,
      name: this.category.query.name,
      values: this.category.selectedItems
    };
    const eventObj = {
      category: this.category,
      query
    };
    this.events.publish(`queryStringChange`, query);
    this.events.publish(`categoryDependencyChange`, eventObj);
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
