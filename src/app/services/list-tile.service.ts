import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ICustomListTile } from '@nte/interfaces/list-tile-custom.interface';
import { IListTile } from '@nte/interfaces/list-tile.interface';

@Injectable({ providedIn: 'root' })
export class ListTileService {
  private _activeList: BehaviorSubject<ICustomListTile | IListTile> = new BehaviorSubject<ICustomListTile | IListTile>(null);

  set activeList(list: ICustomListTile | IListTile) {
    this._activeList.next(list);
  }

  get activeList() {
    return this._activeList.getValue();
  }

  get activeList$() {
    return this._activeList.asObservable();
  }

  constructor() { }
}
