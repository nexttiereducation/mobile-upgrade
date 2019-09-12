import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { isObject } from 'lodash';

import { Category } from '@nte/models/category.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';

@Component({
  selector: `filter-range`,
  templateUrl: `filter-range.html`,
  styles: [`
    ion-range .range-knob-handle + .range-knob-handle {
      display: none;
    }
  `]
})
export class FilterRangePage implements OnInit {
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

  constructor(public router: Router,
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
    const selectedValue = this.selectedValueDisplay;
    if (!this.category.config.valueType) {
      this.category.config.prefix = `$`;
      this.category.config.min = 1000;
      this.category.config.step = 1000;
      this.selectedValue = {
        lower: selectedValue,
        upper: this.category.config.max
      };
      this.dualKnobs = true;
    } else {
      this.selectedValue = selectedValue;
    }
    if (!this.category.config.min) {
      this.category.config.min = 0;
    }
  }

  public applyFilters() {
    this.filterService.filter.updateQuery();
    this.events.publish(`filterApplied`);
    // TODO: Add logic to close filters
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

  public setFilter() {
    const selectedValue = isObject(this.selectedValue) ? this.selectedValue.lower : this.selectedValue;
    const mixpanelData = {
      category: this.category.name,
      range: selectedValue
    };
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
}
