import { Component, ViewChild } from '@angular/core';
import { Content, Events, IonicPage, NavController, NavParams } from 'ionic-angular';

import { ALPHABET } from '@nte/constants/filter.constants';
import { Category } from '@nte/models/category.model';
import { Option } from '@nte/models/option.model';
import { CollegeService } from '@nte/services/college.service';
import { FilterService } from '@nte/services/filter.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ListTileCreatePage } from './../list-tile-create/list-tile-create';

@IonicPage()
@Component({
  selector: `filter-checklist`,
  templateUrl: `filter-checklist.html`
})
export class FilterChecklistPage {

  @ViewChild(Content) public content: Content;
  public alphabet = ALPHABET;
  public category: Category;

  public groupedOptions = [];
  public isAlphabetized: boolean;
  public options: Option[];
  public searchTerm: string;
  public title: string;

  private listType: string;

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

  constructor(params: NavParams,
    public events: Events,
    public filterService: FilterService,
    public navCtrl: NavController,
    private collegeService: CollegeService,
    private mixpanel: MixpanelService) {
    this.category = params.get(`category`);
    this.isAlphabetized = params.get(`isAlpha`);
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
    this.category.selectedItems = new Array(0);
    this.updateQuery();
    this.content.resize();
    this.mixpanel.event(`category_cleared`, { category: this.category.name });
  }

  public clearSearch(_event) {
    this.searchTerm = ``;
    this.options = null;
  }

  public ionViewDidLoad() {
    this.options = this.categoryOptions;
    if (this.isAlphabetized) {
      this.groupOptions();
    }
    this.checkOptions();
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
        const url = `?sector=1&sector=2&sector=4&sector=5&search=${val}`;
        this.collegeService.searchColleges(url, true).subscribe(
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
    this.navCtrl.push(
      ListTileCreatePage,
      {
        filter: this.filterService.filter,
        page: this.listType
      }
    );
  }

  private checkOptions() {
    if (this.category && this.category.hasOptions && this.category.hasSelectedItems) {
      for (let i = 0; i < this.category.selectedItems.length; i++) {
        const item = this.category.selectedItems[i];
        const optIndex = this.optionIds.indexOf(item.id);
        if (optIndex > -1) {
          this.options[optIndex].isActive = true;
        }
      }
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
    const eventObj = {
      category: this.category,
      query
    };
    this.events.publish(`queryStringChange`, query);
    this.events.publish(`categoryDependencyChange`, eventObj);
  }
}
