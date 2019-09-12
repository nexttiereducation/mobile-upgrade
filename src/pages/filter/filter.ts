import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ALPHA_CATEGORIES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Filter } from '@nte/models/filter.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { FilterChecklistPage } from '@nte/pages/filter-checklist/filter-checklist';
import { FilterDistancePage } from '@nte/pages/filter-distance/filter-distance';
import { FilterProgramPage } from '@nte/pages/filter-program/filter-program';
import { FilterRangePage } from '@nte/pages/filter-range/filter-range';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { CategoryService } from '@nte/services/category.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';

@Component({
  selector: `filter`,
  templateUrl: `filter.html`,
  styleUrls: [`filter.scss`]
})
export class FilterPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public title: string = ``;

  private closeOnEnter: boolean;
  private filter: Filter;
  private listType: string;
  private ngUnsubscribe: Subject<any> = new Subject();
  private optionFilterTypes: any = {
    default: FilterChecklistPage,
    'filter list': FilterChecklistPage,
    location: FilterDistancePage,
    'max-value': FilterRangePage,
    'search box': FilterProgramPage
  };
  private params: any;

  get categories() {
    const serviceCats = this.filterService.filter.categories;
    return serviceCats.length === 1 ? serviceCats[0].subCategories : serviceCats;
  }

  get mixpanelCategoryName() {
    switch (this.listType) {
      case `Colleges`:
        return `Institution Data`;
      case `Scholarships`:
        return `Scholarship Data`;
    }
  }

  constructor(public categoryService: CategoryService,
    public filterService: FilterService,
    private events: Events,
    private mixpanel: MixpanelService,
    private router: Router,
    navStateService: NavStateService) {
    this.params = navStateService.data;
    if (this.params.filter) {
      this.filter = this.params.filter;
      this.filterService.filter = this.filter;
    }
    this.listType = this.params.listType;
    this.title = this.params.title;
  }

  ngOnInit() {
    this.events.subscribe(
      `queryStringChange`,
      (query: QueryObject) => this.onQueryStringChange(query)
    );
    this.events.subscribe(
      `clearCategory`,
      (category) => this.filterService.filter.clear(category.name)
    );
    this.events.subscribe(
      `filterApplied`,
      () => this.closeOnEnter = true
    );
    this.events.subscribe(
      `categoryDependencyChange`,
      (data: any) => this.onCategoryQueryStringChange(data.query, data.category)
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`categoryDependencyChange`);
    this.events.unsubscribe(`clearCategory`);
    this.events.unsubscribe(`filterApplied`);
    this.events.unsubscribe(`queryStringChange`);
  }

  ionViewWillEnter() {
    if (this.closeOnEnter) {
      this.closeOnEnter = false;
      this.close();
    } else {
      this.checkDependencies();
      if (this.params.has(`cyol`)) {
        this.filterService.setCyol(this.params.get(`cyol`));
      } else {
        this.filterService.setCyol(false);
      }
    }
  }


  public applyFilters() {
    this.close();
  }

  public clear() {
    this.filterService.filter.clear();
    this.mixpanel.event(`category_cleared`,
      { category: this.mixpanelCategoryName }
    );
    this.content.resize();
  }

  public clearCategory(category) {
    this.filterService.filter.clear(category.name);
    this.categoryService.filterArray = [];
    this.mixpanel.event(`category_cleared`,
      { category: category.name }
    );
  }

  public close() {
    // TODO: Add logic to close filters
  }

  public onCategoryQueryStringChange(query: QueryObject, _category: any) {
    if (query
      && this.filterService.dependencies.size
      && this.filterService.dependencies.has(query.name)) {
      this.filterService.onUpdateDependency(query.name);
    }
  }

  public onQueryStringChange(query) {
    this.filterService.filter.updateQuery(query);
  }

  public viewDetails(subCategory: any, parentCategoryName?: string) {
    // if (ev) { ev.preventDefault(); }
    const page = this.optionFilterTypes[subCategory.type];
    this.router.navigate(
      [page],
      {
        state: {
          category: subCategory,
          isAlpha: ALPHA_CATEGORIES.indexOf(subCategory.name) > -1,
          listType: this.listType,
          title: this.title || parentCategoryName
        }
      }
    );
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

  private checkCategoryDependencies(category) {
    if (category.subCategories && category.subCategories.length) {
      category.subCategories.forEach(subcat => {
        if (subcat.dependency) {
          this.filterService.createDependency(subcat.dependency)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              (dependencyFilterArray) => {
                this.categoryService.filterArray = dependencyFilterArray;
                if (dependencyFilterArray.length) {
                  this.filterByDependency(dependencyFilterArray, subcat);
                }
              }
            );
        }
      });
    }
  }

  private checkDependencies() {
    if (this.filterService.filter && this.filterService.filter.categories) {
      this.filterService.filter.categories.forEach(c => this.checkCategoryDependencies(c));
    }
  }

  private filterByDependency(filterArray: string[], category: Category) {
    category.options = category.filterOptions(filterArray);
  }
}
