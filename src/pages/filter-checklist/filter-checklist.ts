import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ALPHABET } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Option } from '@nte/models/option.model';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { CollegesService } from '@nte/services/colleges.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';

@Component({
  selector: `filter-checklist`,
  templateUrl: `filter-checklist.html`,
  styleUrls: [`filter-checklist.scss`]
})
export class FilterChecklistPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public alphabet = ALPHABET;
  public category: Category;

  public groupedOptions = [];
  public isAlphabetized: boolean;
  public options: Option[];
  public searchTerm: string;
  public title: string;

  private listType: string;
  private ngUnsubscribe: Subject<any> = new Subject();

  get categoryOptions() {
    return [...this.category.options];
  }

  get isColleges() {
    return this.category && this.category.name === `Institutions`;
  }

  get isMajors() {
    return this.category && this.category.name === `Majors`;
  }

  get optionIds() {
    return this.category.options.map((o) => o.id);
  }

  get selectedItemIds() {
    return this.category.selectedItems.map((o) => o.id);
  }

  constructor(
    public collegesService: CollegesService,
    public events: Events,
    public filterService: FilterService,
    public router: Router,
    private mixpanel: MixpanelService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.category = params.category;
    this.isAlphabetized = params.isAlpha;
    this.listType = params.listType;
    this.title = params.title;
  }

  ngOnInit() {
    this.options = this.categoryOptions;
    if (this.isAlphabetized) {
      this.groupOptions();
    }
    this.checkOptions();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public applyFilters() {
    this.filterService.filter.updateQuery();
    this.events.publish(`filterApplied`);
    // TODO: Implement logic for closing filters
  }

  public clear() {
    this.category.selectedItems = new Array(0);
    this.updateQuery();
    this.content.resize();
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public clearSearch(_event) {
    this.searchTerm = ``;
    this.options = null;
  }

  public scrollTo(letter: string) {
    const yOffset = document.getElementById(letter).offsetTop;
    this.content.scrollTo(0, yOffset, 1200);
  }

  public search(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() !== ``) {
      if (this.isColleges) {
        // get institutions based on searchQuery
        this.collegesService.search(`?sector=1&sector=2&sector=4&sector=5&search=${val}`, true)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (response) => {
              this.options = response.map(
                (college) => new Option({
                  id: college.id,
                  value: college.name
                }));
            }
          );
      } else {
        // Reset items back to all of the items
        this.options = this.categoryOptions;
        this.options = this.options.filter((option) => {
          return (option.value.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
      }
    }
  }

  public updateOption(option: Option) {
    option.isActive = !option.isActive;
    const mixpanelData = { category: this.category.name, option: option.value };
    if (option.isActive) {
      this.mixpanel.event(`option_selected`, mixpanelData);
      this.category.selectedItems.push({ id: option.id, displayValue: option.value });
    } else {
      this.mixpanel.event(`option_deselected`, mixpanelData);
      const optIndex = this.selectedItemIds.indexOf((item) => item.id === option.id);
      this.category.selectedItems.splice(optIndex, 1);
    }
    if ((option.isActive && this.category.selectedItems.length === 1) ||
      (!option.isActive && this.category.selectedItems.length === 0)) {
      this.content.resize();
    }
    this.updateQuery();
  }

  public viewSummary() {
    this.filterService.filter.updateQuery();
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

  private checkOptions() {
    if (this.category && this.category.hasOptions && this.category.hasSelectedItems) {
      this.category.selectedItems.forEach(item => {
        const optIndex = this.optionIds.indexOf(item.id);
        if (optIndex > -1) {
          this.options[optIndex].isActive = true;
        }
      });
    }
  }

  private groupOptions() {
    let currentLetter;
    let currentOptions = [];
    const catOptions = this.categoryOptions;
    catOptions.map((option) => {
      if (option.value.charAt(0).toUpperCase() !== currentLetter) {
        currentLetter = option.value.charAt(0).toUpperCase();
        const newGroup = {
          letter: currentLetter,
          options: []
        };
        currentOptions = newGroup.options;
        this.groupedOptions.push(newGroup);
      }
      currentOptions.push(option);
    });
  }

  private updateQuery() {
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
}
