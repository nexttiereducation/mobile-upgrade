import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trimEnd } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLLEGE_NON_PROFIT_QUERY, CREATE_LIST_IMAGES } from '@nte/constants/college.constants';
import { Filter } from '@nte/models/filter.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { FilterService } from '@nte/services/filter.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { ParamService } from '@nte/services/param.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';

@Component({
  selector: `list-tile-create`,
  templateUrl: `list-tile-create.html`,
  styleUrls: [`list-tile-create.scss`]
})
export class ListTileCreatePage implements OnInit, OnDestroy {
  public existingList: any;
  public filterOptions: Filter;
  public images: string[] = CREATE_LIST_IMAGES;
  public list: any = {
    filters: []
  };
  public listTileService: CollegeListTileService | ScholarshipListTileService;
  public nonProfitQuery: string = COLLEGE_NON_PROFIT_QUERY;
  public page: string;
  public pageItemService: any;
  public showSummary: boolean = false;

  private ngUnsubscribe: Subject<any> = new Subject();

  get filter() {
    return this.filterOptions;
  }

  get rootPage() {
    return this.page.toLowerCase();
  }

  get selectionsMade() {
    return (this.list.filters && (this.list.filters.length > 0)
      && this.list.name && this.list.image && this.showSummary)
      || (!this.showSummary && this.filterOptions && this.filterOptions.isActive);
  }

  constructor(paramService: ParamService,
    public filterService: FilterService,
    private collegeListTileService: CollegeListTileService,
    private scholarshipListTileService: ScholarshipListTileService,
    private router: Router,
    private collegeService: CollegeService,
    private scholarshipService: ScholarshipService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.page = params.page;
    this.filterOptions = params.filter;
    this.existingList = params.list || this.listTileService.activeList;
    this.setupServices();
  }

  ngOnInit() {
    if (this.existingList) {
      this.list.name = this.existingList.name;
      this.list.image = this.existingList.iconUrl;
      this.list.id = this.existingList.id || null;
      this.showSummary = true;
    } else {
      // this.filterOptions.clear();
      this.list.image = this.images[0];
      // this.list.filters = this.filterOptions;
    }
    if (this.filterOptions.queries && this.filterOptions.queries.size > 0) {
      this.filterOptions.queries.forEach((val) => {
        this.list.filters.push(val);
      });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.clear();
  }

  public clear() {
    this.existingList = null;
    this.filterOptions = null;
    // this.images = null;
    this.list = { filters: [] };
    // this.nonProfitQuery = null;
    this.page = null;
    this.showSummary = null;
  }

  public close(eventName?: string, data?: any) {
    // this.router.popTo(this.page.toLowerCase());
    // this.router.popToRoot();
    if (eventName && data) {
      data.page = this.page;
      data[eventName] = true;
      this.router.navigate([this.rootPage, data]);
    } else {
      this.router.navigate([this.rootPage]);
    }
  }

  public getFilters() {
    this.list.filters = [];
    this.filterOptions.queries.forEach((query) => {
      this.list.filters.push(query);
    });
  }

  public removeFilter(query: QueryObject, filterIndex: number, valueIndex: number) {
    this.removeItem(query, filterIndex, valueIndex);
    if (query.name === `distance`) {
      const index = this.list.filters.findIndex((filter: any) => filter.name === `location`);
      this.removeItem(this.list.filters[index], index, 0);
    }
  }

  public removeItem(query: QueryObject, index: number, valueIndex: number) {
    this.list.filters[index].values.splice(valueIndex, 1);
    if (!this.list.filters[index].values.length) {
      this.list.filters.splice(index, 1);
    }
    this.filterOptions.updateQuery(query);
    this.filterService.filter = this.filterOptions;
  }

  public saveList() {
    const newList: any = {
      name: this.list.name,
      query: this.filterOptions.updateQuery()
    };
    if (this.page === `Colleges`) {
      newList.mobile_image_url = this.list.image;
    } else {
      newList.image_url = this.list.image;
    }
    if (this.existingList) {
      this.updateList(newList, this.list.id);
    } else {
      this.createNewList(newList);
    }
  }

  private createNewList(newList: any) {
    this.pageItemService.createList(newList)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          const eventData = {
            listTile: response,
            page: this.page
          };
          this.close(`newListTile`, eventData);
        },
        err => console.error(err)
      );
  }

  private setupServices() {
    const providerPrefix = trimEnd(this.page.toLowerCase(), `s`);
    switch (providerPrefix) {
      case `college`:
        this.pageItemService = this.collegeService;
        this.listTileService = this.collegeListTileService;
        break;
      case `scholarship`:
        this.pageItemService = this.scholarshipService;
        this.listTileService = this.scholarshipListTileService;
        break;
      default:
        break;
    }
  }

  private updateList(updatedList: any, id: number) {
    this.pageItemService.updateList(updatedList, id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          const eventData: any = {
            listTile: response,
            page: this.page
          };
          if (this.existingList && this.existingList.name) {
            eventData.prevName = this.existingList.name;
          }
          this.close(`updatedListTile`, eventData);
        },
        err => console.error(err)
      );
  }
}
