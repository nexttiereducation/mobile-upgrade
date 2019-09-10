import { BehaviorSubject } from 'rxjs';

import { Filter } from '@nte/models/filter.model';

export class ListService {
  // private _saved: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _all: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _baseUrl: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _count: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _expandedItem: BehaviorSubject<any> = new BehaviorSubject(null);
  private _filter: BehaviorSubject<Filter> = new BehaviorSubject(null);
  private _filterQuery: BehaviorSubject<string> = new BehaviorSubject(null);
  private _isInitializing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _isLoadingMore: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _nextPage: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _prevPage: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _sortBy: BehaviorSubject<string> = new BehaviorSubject<string>(`-created`);
  private _total: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  get all() {
    return this._all.getValue();
  }

  get all$() {
    return this._all.asObservable();
  }

  get baseUrl() {
    return this._baseUrl.getValue();
  }

  get baseUrl$() {
    return this._baseUrl.asObservable();
  }

  get count() {
    return this._count.getValue();
  }

  get count$() {
    return this._count.asObservable();
  }

  get expandedItem() {
    return this._expandedItem.getValue();
  }

  get expandedItem$() {
    return this._expandedItem.asObservable();
  }

  get filter() {
    return this._filter.getValue();
  }

  get filter$() {
    return this._filter.asObservable();
  }

  get filterQuery() {
    return this._filterQuery.getValue();
  }

  get filterQuery$() {
    return this._filterQuery.asObservable();
  }

  get isInitializing() {
    return this._isInitializing.getValue();
  }

  get isInitializing$() {
    return this._isInitializing.asObservable();
  }

  get isLoadingMore() {
    return this._isLoadingMore.getValue();
  }

  get isLoadingMore$() {
    return this._isLoadingMore.asObservable();
  }

  get nextPage() {
    return this._nextPage.getValue();
  }

  get nextPage$() {
    return this._nextPage.asObservable();
  }

  get prevPage() {
    return this._prevPage.getValue();
  }

  get prevPage$() {
    return this._prevPage.asObservable();
  }

  get sortBy() {
    return this._sortBy.getValue();
  }

  get sortBy$() {
    return this._sortBy.asObservable();
  }

  get total() {
    return this._total.getValue();
  }

  get total$() {
    return this._total.asObservable();
  }

  set all(all: any[]) {
    this._all.next(all);
  }

  set baseUrl(baseUrl: string) {
    this._baseUrl.next(baseUrl);
  }

  set count(count: number) {
    this._count.next(count);
  }

  set expandedItem(expandedItem: any) {
    this._expandedItem.next(expandedItem);
  }

  set filter(filter: Filter) {
    this._filter.next(filter);
  }

  set filterQuery(filterQuery: string) {
    this._filterQuery.next(filterQuery);
  }

  set isInitializing(isInitializing: boolean) {
    this._isInitializing.next(isInitializing);
  }

  set isLoadingMore(isLoadingMore: boolean) {
    this._isLoadingMore.next(isLoadingMore);
  }

  set nextPage(nextPage: string) {
    this._nextPage.next(nextPage);
  }

  set prevPage(prevPage: string) {
    this._prevPage.next(prevPage);
  }

  set sortBy(sortBy: string) {
    this._sortBy.next(sortBy);
  }

  set total(total: number) {
    this._total.next(total);
  }

}
