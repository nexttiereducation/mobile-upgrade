import { Injectable } from '@angular/core';
import { trimStart } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { Filter } from '@nte/models/filter.model';
import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class FilterService {
  public dependencies = new Map<string, any>();
  public dependencyList: string[] = [];
  public filter: Filter;
  public selectedOptions = {
    cluster: [],
    pathway: []
  };

  private _isCyol: boolean;

  get isCyol() {
    return this._isCyol;
  }

  constructor(private apiService: ApiService) { }

  public createDependency(name: string) {
    const key = `_${name}`;
    this.dependencies.set(key, new BehaviorSubject([]));
    const subj = this.dependencies.get(key);
    this.dependencies.set(name, subj.asObservable());
    this.dependencyList = [name];
    this.updateValues(key, name);
    return this.dependencies.get(name);
  }

  public onUpdateDependency(name: string): void {
    const key = `_${name}`;
    if (this.dependencies.has(key)) {
      this.updateValues(key, name);
    }
  }

  public search(query: string, itemType: string) {
    let path = itemType === `program` ? `/program_code` : `/${itemType}`;
    path += `s/?name=${query}`;
    return this.apiService.get(path)
      .pipe(map(response => response.json()));
  }

  public setCyol(isCyol: boolean) {
    this._isCyol = isCyol;
  }

  public trimQuery(query: string): string {
    return query && query.substr(0, 1) === `?`
      ? query
      : `?` + trimStart(query, `&`);
  }

  public updateValues(key: string, name: string) {
    if (this.filter.queries && this.filter.queries.get(name)) {
      const query = this.filter.queries.get(name);
      const obs = this.dependencies.get(key);
      obs.next(query.values);
    }
  }
}
