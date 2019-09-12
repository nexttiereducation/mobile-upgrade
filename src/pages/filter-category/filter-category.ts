import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ALPHA_CATEGORIES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { FilterChecklistPage } from '@nte/pages/filter-checklist/filter-checklist';
import { FilterDistancePage } from '@nte/pages/filter-distance/filter-distance';
import { FilterProgramPage } from '@nte/pages/filter-program/filter-program';
import { FilterRangePage } from '@nte/pages/filter-range/filter-range';
import { CategoryService } from '@nte/services/category.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';

import { NavStateService } from '@nte/services/nav-state.service';

@Component({
  selector: `filter-category`,
  templateUrl: `filter-category.html`,
  styleUrls: [`filter-category.scss`]
})
export class FilterCategoryPage implements OnInit, OnDestroy {
  public index: number;
  public title: string;

  private ngUnsubscribe: Subject<any> = new Subject();
  private optionFilterTypes: any = {
    default: FilterChecklistPage,
    'filter list': FilterChecklistPage,
    location: FilterDistancePage,
    'max-value': FilterRangePage,
    'search box': FilterProgramPage
  };

  get category() {
    return new Category(this.filterService.filter.categories[this.index]);
  }

  constructor(
    public events: Events,
    public categoryService: CategoryService,
    public filterService: FilterService,
    public router: Router,
    private mixpanel: MixpanelService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.index = params.index;
    this.title = params.title;
  }

  ngOnInit() {
    this.events.subscribe(
      `categoryDependencyChange`,
      (query: QueryObject) => this.onQueryStringChange(query)
    );
    this.checkDependencies();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`categoryDependencyChange`);
  }

  public applyFilters() {
    this.events.publish(`filterApplied`);
  }

  public checkDependencies() {
    if (this.category.subCategories && this.category.subCategories.length) {
      this.category.subCategories.forEach(subcat => {
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

  public clear() {
    this.filterService.filter.clear(this.category.name);
    this.categoryService.filterArray = [];
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public onQueryStringChange(_query: QueryObject) {
    this.category.subCategories.forEach(subcat => {
      if (this.filterService.dependencyList.length > 0 &&
        this.filterService.dependencyList.indexOf(subcat.query.name) >= 0) {
        this.filterService.onUpdateDependency(subcat.query.name);
      }
    });
  }

  public viewDetail(subCategory: any) {
    this.router.navigate(
      [this.optionFilterTypes[subCategory.type]],
      {
        state: {
          category: subCategory,
          isAlpha: ALPHA_CATEGORIES.indexOf(subCategory.name) > -1,
          title: this.title || this.category.name
        }
      }
    );
  }

  public viewSummary() {
    this.events.publish(`viewListSummary`);
    // TODO: Figure out routing for CYOL / filters
    // this.router.navigate([]);
  }

  private filterByDependency(filterArray: string[], category: Category) {
    category.options = category.filterOptions(filterArray);
  }
}
