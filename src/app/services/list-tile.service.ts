import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ICustomListTile } from '@nte/interfaces/list-tile-custom.interface';
import { IListTile } from '@nte/interfaces/list-tile.interface';

@Injectable({ providedIn: 'root' })
export class ListTileService {
  private _all: BehaviorSubject<ICustomListTile[] | IListTile[]> = new BehaviorSubject<ICustomListTile[] | IListTile[]>(null);
  private _activeList: BehaviorSubject<ICustomListTile | IListTile> = new BehaviorSubject<ICustomListTile | IListTile>(null);

  get activeList() {
    return this._activeList.getValue();
  }
  set activeList(list: ICustomListTile | IListTile) {
    this._activeList.next(list);
  }
  get activeList$() {
    return this._activeList.asObservable();
  }

  get all() {
    return this._all.getValue();
  }
  set all(list: ICustomListTile[] | IListTile[]) {
    this._all.next(list);
  }
  get all$() {
    return this._all.asObservable();
  }

  constructor() { }
}
