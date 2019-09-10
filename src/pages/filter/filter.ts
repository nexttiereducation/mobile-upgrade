import { Component, ViewChild } from '@angular/core';
import { Content, Events, IonicPage, NavController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { ALPHA_CATEGORIES } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Filter } from '@nte/models/filter.model';
import { QueryObject } from '@nte/models/queryobject.model';
import { CategoryService } from '@nte/services/category.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { FilterChecklistPage } from './../filter-checklist/filter-checklist';
import { FilterDistancePage } from './../filter-distance/filter-distance';
import { FilterProgramPage } from './../filter-program/filter-program';
import { FilterRangePage } from './../filter-range/filter-range';
import { ListTileCreatePage } from './../list-tile-create/list-tile-create';

@IonicPage()
@Component({
  selector: `filter`,
  templateUrl: `filter.html`
})
export class FilterPage {
  @ViewChild(Content) public content: Content;

  public title: string = ``;

  private closeOnEnter: boolean;
  private dependencySub: Subscription;
  private filter: Filter;
  private listType: string;
  private mixpanelCategoryName: string;
  private optionFilterTypes: any = {
    'default': FilterChecklistPage,
    'filter list': FilterChecklistPage,
    'location': FilterDistancePage,
    'max-value': FilterRangePage,
    'search box': FilterProgramPage
  };

  get categories() {
    const serviceCats = this.filterService.filter.categories;
    return serviceCats.length === 1 ? serviceCats[0].subCategories : serviceCats;
  }

  constructor(public categoryService: CategoryService,
    public filterService: FilterService,
    private events: Events,
    private mixpanel: MixpanelService,
    private navCtrl: NavController,
    private params: NavParams) {
    if (params.get(`filter`)) {
      this.filter = params.get(`filter`);
      this.filterService.filter = this.filter;
    }
    this.listType = params.get(`listType`);
    this.title = params.get(`title`);
  }

  ionViewDidLoad() {
    this.events.subscribe(`queryStringChange`, (query: QueryObject) => {
      this.onQueryStringChange(query);
    });
    this.events.subscribe(`clearCategory`, (category) => {
      this.filterService.filter.clear(category.name);
    });
    this.events.subscribe(`filterApplied`, () => {
      this.closeOnEnter = true;
    });
    this.events.subscribe(`categoryDependencyChange`, (data: any) => {
      this.onCategoryQueryStringChange(data.query, data.category);
    });
    switch (this.listType) {
      case `Colleges`:
        this.mixpanelCategoryName = `Institution Data`;
        break;
      case `Scholarships`:
        this.mixpanelCategoryName = `Scholarship Data`;
        break;
    }
  }

  ionViewWillEnter() {
    if (this.closeOnEnter) {
      this.closeOnEnter = false;
      this.close();
    } else {
      this.checkDependencies();
      if (this.params.get(`cyol`)) {
        this.filterService.setCyol(this.params.get(`cyol`));
      } else {
        this.filterService.setCyol(false);
      }
    }
  }

  // ngOnChanges(changes: any) {
  //   if (changes.filter) {
  //     this.filterService.filter = changes.filter.currentValue;
  //   }
  // }

  ionViewWillUnload() {
    this.events.unsubscribe(`categoryDependencyChange`);
    this.events.unsubscribe(`clearCategory`);
    this.events.unsubscribe(`filterApplied`);
    this.events.unsubscribe(`queryStringChange`);
    if (this.dependencySub) {
      this.dependencySub.unsubscribe();
    }
  }

  public applyFilters() {
    this.close();
  }

  public clear() {
    this.filterService.filter.clear();
    this.mixpanel.event(`category_cleared`, { category: this.mixpanelCategoryName });
    this.content.resize();
  }

  public clearCategory(category) {
    this.filterService.filter.clear(category.name);
    this.categoryService.filterArray = [];
    this.mixpanel.event(`category_cleared`, { category: category.name });
  }

  public close() {
    this.navCtrl.pop();
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
    this.navCtrl.push(
      page,
      {
        category: subCategory,
        isAlpha: ALPHA_CATEGORIES.indexOf(subCategory.name) > -1,
        listType: this.listType,
        title: this.title || parentCategoryName
      },
      { animation: `ios-transition` }
    );
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

  private checkCategoryDependencies(category) {
    if (category.subCategories && category.subCategories.length) {
      for (let i = 0, subCategory; subCategory = category.subCategories[i]; ++i) {
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

  private checkDependencies() {
    if (this.filterService.filter && this.filterService.filter.categories) {
      for (let i = 0, category; category = this.filterService.filter.categories[i]; ++i) {
        this.checkCategoryDependencies(category);
      }
    }
  }

  private filterByDependency(filterArray: string[], category: Category) {
    category.options = category.filterOptions(filterArray);
  }
}
