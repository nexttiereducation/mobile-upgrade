import { groupBy } from 'lodash';

import { IPlaceholderValues } from '@nte/interfaces/placeholder-values.interface';
import { ITypeSettings } from '@nte/interfaces/type-settings.interface';
import { Option } from '@nte/models/option.model';
import { QueryObject } from '@nte/models/queryobject.model';

export class Category {
  public config?: any;
  public dependency: string;
  public displayName: string;
  public isHidden: boolean;
  public name: string;
  public options?: Option[];
  public placeholderValues: IPlaceholderValues;
  public preselectedFilters: Map<string, QueryObject>;
  public query: QueryObject = new QueryObject();
  public queryName: string;
  public selectedItems: any[];
  public subCategories?: Category[];
  public type: string;
  public type_settings: ITypeSettings;

  private _dependencyResolvers = {};
  private _rawOptions: any[];

  get activeChildCount() {
    return !this.subCategories ? this.selectedItems.length :
      this.subCategories
        .map((subCategory) => subCategory.activeChildCount)
        .reduce((a, b) => a + b, 0);
  }

  get hasOptions() {
    return this.options && this.options.length > 0;
  }

  get hasSelectedItems() {
    return this.selectedItems && this.selectedItems.length > 0;
  }

  get isActive() {
    return this.activeChildCount;
  }

  constructor(category: Category, preselectedFilters?: Map<string, QueryObject>) {
    this.setVariables(category, preselectedFilters);
    const isPreselected = this.preselectedFilters
      && this.preselectedFilters.has(this.query.name);
    let categoryValues = new Array();
    if (isPreselected) {
      const selectedVals = [...this.preselectedFilters.get(this.query.name).values];
      categoryValues = [...selectedVals];
    }
    if (category.config) {
      this.config = category.config ? category.config : {};
      this.config.max = category.config.max ? category.config.max : 60000;
    }
    if (category.subCategories) {
      this.subCategories = new Array<Category>();
      for (const newSubCategory of category.subCategories) {
        this.subCategories.push(new Category(newSubCategory, this.preselectedFilters));
      }
    } else if (this.preselectedFilters &&
      (!category.options || (category.options && category.options.length < 1))) {
      this.selectedItems = isPreselected ? categoryValues : new Array();
    }
    if (category.options) {
      let values = null;
      if (this.preselectedFilters && isPreselected) {
        values = categoryValues;
      }
      this.initializeOptions(category.options, values);
    }
    if (category.dependency) {
      this.initializeDependencyResolvers();
    }
  }

  public filterOptions(searchTerms: string[]) {
    let filteredOptions = [];
    searchTerms.forEach((searchTerm: any) => {
      filteredOptions = filteredOptions.concat(this._dependencyResolvers[searchTerm.id]);
    });
    return filteredOptions;
  }

  public initializeDependencyResolvers() {
    this._dependencyResolvers = groupBy(this._rawOptions, (option) => option.dependency_resolver);
  }

  public initializeOptions(options: any[], values?: any[]) {
    this.options = new Array();
    this._rawOptions = new Array();
    if (options && options.length > 0) {
      options.forEach(opt => {
        this._rawOptions.push(new Option(opt));
        if (values && values.length) {
          const index = values.findIndex((value) => value.id === opt.id);
          if (index > -1) {
            opt.isActive = true;
            values[index].id = opt.id;
            values[index].displayValue = opt.value;
            this.selectedItems = values;
          }
        }
        this.options.push(new Option(opt));
      });
    }
  }

  public setVariables(category: Category, preselectedFilters?: Map<string, QueryObject>) {
    this.name = category.displayName ? category.displayName : category.name;
    this.query.name = (category.query && category.query.name)
      ? category.query.name
      : (category.queryName ? category.queryName : category.name);
    this.dependency = category.dependency;
    this.type_settings = category.type_settings || null;
    if (this.name === `Programs`) {
      this.type = `search box`;
    } else {
      this.type = category.type_settings ? category.type_settings.type.name : `default`;
    }
    this.placeholderValues = category.placeholderValues;
    this.selectedItems = new Array();
    this.preselectedFilters = preselectedFilters;
  }
}
