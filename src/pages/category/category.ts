import { Component } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { ALPHA_CATEGORIES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { CategoryService } from '@nte/services/category.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { FilterChecklistPage } from './../filter-checklist/filter-checklist';
import { FilterDistancePage } from './../filter-distance/filter-distance';
import { FilterProgramPage } from './../filter-program/filter-program';
import { FilterRangePage } from './../filter-range/filter-range';

@IonicPage()
@Component({
  selector: `category`,
  templateUrl: `category.html`
})
export class FilterCategoryPage {
  public index: number;
  public title: string;

  private dependencySub: Subscription;
  private optionFilterTypes: any = {
    'default': FilterChecklistPage,
    'filter list': FilterChecklistPage,
    'location': FilterDistancePage,
    'max-value': FilterRangePage,
    'search box': FilterProgramPage
  };

  get category() {
    return new Category(this.filterService.filter.categories[this.index]);
  }

  constructor(params: NavParams,
    public navCtrl: NavController,
    public events: Events,
    public categoryService: CategoryService,
    public filterService: FilterService,
    private mixpanel: MixpanelService) {
    this.index = params.get(`index`);
    this.title = params.get(`title`);
  }

  ionViewDidLoad() {
    this.events.subscribe(
      `categoryDependencyChange`,
      (query: QueryObject) => {
        this.onQueryStringChange(query);
      }
    );
    this.checkDependencies();
  }

  ionViewWillUnload() {
    if (this.category.dependency) {
      this.dependencySub.unsubscribe();
    }
    this.events.unsubscribe(`categoryDependencyChange`);
  }

  public applyFilters() {
    this.events.publish(`filterApplied`);
  }

  public checkDependencies() {
    if (this.category.subCategories && this.category.subCategories.length) {
      for (let i = 0, subCategory; subCategory = this.category.subCategories[i]; ++i) {
        if (subCategory.dependency) {
          this.dependencySub = this.filterService.createDependency(subCategory.dependency)
            .subscribe((dependencyFilterArray) => {
              this.categoryService.filterArray = dependencyFilterArray;
              if (dependencyFilterArray.length) {
                this.filterByDependency(dependencyFilterArray, subCategory);
              }
            });
        }
      }
    }
  }

  public clear() {
    this.filterService.filter.clear(this.category.name);
    this.categoryService.filterArray = [];
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public onQueryStringChange(_query: QueryObject) {
    for (let i = 0, subCategory; subCategory = this.category.subCategories[i]; ++i) {
      if (this.filterService.dependencyList.length > 0 &&
        this.filterService.dependencyList.indexOf(subCategory.query.name) >= 0) {
        this.filterService.onUpdateDependency(subCategory.query.name);
      }
    }
  }

  public viewDetail(subCategory: any) {
    const page = this.optionFilterTypes[subCategory.type];
    this.navCtrl.push(
      page,
      {
        category: subCategory,
        isAlpha: ALPHA_CATEGORIES.indexOf(subCategory.name) > -1,
        title: this.title || this.category.name
      }
    );
  }

  public viewSummary() {
    this.events.publish(`viewListSummary`);
    this.navCtrl.popToRoot();
  }

  private filterByDependency(filterArray: string[], category: Category) {
    category.options = category.filterOptions(filterArray);
  }
}
