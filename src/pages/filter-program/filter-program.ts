import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { trimEnd } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SEARCH_EMPTY_STATES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Option } from '@nte/models/option.model';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { ParamService } from '@nte/services/param.service';

@Component({
  selector: `filter-program`,
  templateUrl: `filter-program.html`,
  styles: [`
    empty-state {
      max-height: calc(100% - 61px);
    }
  `]
})
export class FilterProgramPage implements OnInit, OnDestroy {
  public addItems: any;
  public category: Category;
  public isSearching: boolean = true;
  public items: any;
  public noResults: any;
  public searchValue: string;
  public selectedItem: any;
  public title: string;

  private listType: string;
  private ngUnsubscribe: Subject<any> = new Subject();

  get categoryOptions() {
    if (this.category.options && this.category.options.length > 0) {
      return [...this.category.options];
    } else {
      return [];
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

  constructor(paramService: ParamService,
    route: ActivatedRoute,
    public filterService: FilterService,
    public router: Router,
    private events: Events,
    private mixpanel: MixpanelService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.category = params.category;
    this.listType = params.listType;
    this.title = params.title;
  }

  ngOnInit() {
    this.noResults = Object.assign({}, SEARCH_EMPTY_STATES.noResults);
    const addItems = Object.assign({}, SEARCH_EMPTY_STATES.addItems);
    addItems.title = addItems.title.replace(`item`, this.itemType);
    addItems.body = addItems.body.replace(`item`, this.itemType);
    this.addItems = addItems;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public applyFilters() {
    this.filterService.filter.updateQuery();
    this.events.publish(`filterApplied`);
    // TODO: Add logic to close filters
  }

  public clear(_ev: any) {
    this.category.selectedItems = new Array(0);
    this.selectedItem = undefined;
    this.updateQuery();
    this.mixpanel.event(`${this.itemType}_filter_cleared`);
    this.mixpanel.event(`category_cleared`,
      { category: this.category.name }
    );
  }

  public clearSearch(_event) {
    this.searchValue = ``;
    this.items = new Array(0);
  }

  public closeKeyboard() {
    // this.keyboard.close();
  }

  public search(ev: any) {
    this.searchValue = ev.target.value.toLowerCase();
    if (!this.searchValue.length) {
      this.items = [];
      return;
    }
    this.isSearching = true;
    this.filterService.search(this.searchValue, this.itemType)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        response => {
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
        }
      );
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
    const mixpanelData = {
      category: this.category.name,
      option: optValue
    };
    if (option.isActive) {
      this.mixpanel.event(`option_selected`, mixpanelData);
      this.category.selectedItems.push({
        displayValue: optValue,
        id: optValue
      });
    } else {
      this.mixpanel.event(`option_deselected`, mixpanelData);
      const optIndex = this.selectedItemIds.indexOf(i => i.id === optValue);
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
    this.events.publish(`queryStringChange`, query);
    this.events.publish(`categoryDependencyChange`, {
      category: this.category,
      query
    });
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
