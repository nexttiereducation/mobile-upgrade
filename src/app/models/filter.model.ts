import { some, startCase, trimEnd } from 'lodash';

import { ISort } from '@nte/interfaces/sort.interface';
import { Category } from '@nte/models/category.model';
import { QueryObject } from '@nte/models/queryobject.model';

export class Filter {
  public categories: Category[];
  public queries: Map<string, QueryObject> = new Map<string, QueryObject>();
  public queryObjects = new Map<string, string>();
  public searchTerm: string;
  public sort: ISort;

  private _rawData: any[];

  get activeChildCount() {
    return this.categories
      .map((subCategory) => subCategory.activeChildCount)
      .reduce((a, b) => a + b, 0);
  }

  get filterCategories() {
    return this.categories.length > 1 ? this.categories : this.categories[0].subCategories;
  }

  get isActive() {
    if (this.categories[0]) {
      return some(this.filterCategories, `isActive`);
    }
  }

  get rawDataCategories() {
    return this._rawData.length > 1 ? this._rawData : this._rawData[0].subCategories;
  }

  constructor(categories: any[], queryString?: string) {
    const preselectedFilters = new Map<string, QueryObject>();
    if (queryString) {
      queryString.split(`&`).map((value) => {
        const splitString = value.split(`=`);
        const queryName = splitString[0];
        const queryValue = splitString[1];
        if (queryName.length) {
          if (preselectedFilters.has(queryName)) {
            const queryObject = preselectedFilters.get(queryName);
            queryObject.values = [...queryObject.values, { id: queryValue }];
            preselectedFilters.set(queryName, queryObject);
          } else {
            const category = this.getCategoryByName(categories, queryName);
            const displayName = category && category.displayName ? category.displayName : startCase(queryName);
            const newQueryObject = new QueryObject({
              displayName,
              name: queryName,
              values: [{ id: queryValue }]
            });
            preselectedFilters.set(queryName, newQueryObject);
          }
        }
      });
    }
    if (categories) {
      this._rawData = JSON.parse(JSON.stringify(categories));
    } else {
      categories = [];
    }
    this.queries = preselectedFilters;
    this.init(categories, preselectedFilters);
  }

  public clear(categoryName?: string) {
    if (!categoryName) {
      this.init(this._rawData);
      this.queries = new Map<string, QueryObject>();
      this.updateQuery();
      return;
    }
    let category = this.getCategoryByName(this.filterCategories, categoryName);
    if (category) {
      category = new Category(this.getCategoryByName(this._rawData, categoryName));
      return;
    }
    this.filterCategories.forEach(cat => {
      const subcatIndex = cat.subCategories.findIndex((c: any) => c.name === categoryName);
      const subcategory = this.getCategoryByName(this.rawDataCategories, categoryName);
      cat.subCategories[subcatIndex] = new Category(subcategory);
      this.clearQueries(cat.subCategories[subcatIndex].subCategories);
    });
  }

  public clearQueries(categories: Category[]) {
    if (categories && categories.length) {
      categories.forEach(cat => {
        const query = {
          displayName: cat.name,
          name: cat.query.name,
          values: []
        };
        this.updateQuery(query);
      });
    }
  }

  public getCategoryByName(categories: Category[], categoryName: string) {
    return categories.find((cat) => cat.name === categoryName || cat.displayName === categoryName);
  }

  public init(categories: any[], preselectedFilters?: Map<string, QueryObject>) {
    this.categories = new Array();
    this.sort = null;
    if (categories) {
      categories.forEach(category => {
        this.categories.push(new Category(category, preselectedFilters));
      });
    }
  }

  public updateQuery(query?: QueryObject) {
    if (query && query.name) {
      this.queries.set(query.name, query);
    }
    let queryString = `&`;
    this.queries.forEach((queryObject) => {
      if (queryObject.values && queryObject.values.length) {
        queryObject.values.forEach((value) => {
          queryString += `${queryObject.name}=${value.id}&`;
        });
      }
    });
    if (this.sort) {
      const orderBy = this.sort.direction === `desc` ? `-${this.sort.key}` : this.sort.key;
      queryString += `order_by=${orderBy}&`;
    }
    queryString = trimEnd(queryString, `&`);
    return queryString;
  }

}
