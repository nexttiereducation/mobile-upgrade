import { Injectable } from '@angular/core';

import { ICustomListTile } from '@nte/models/list-tile-custom.interface';
import { IListTile } from '@nte/models/list-tile.interface';

@Injectable({ providedIn: 'root' })
export class ScholarshipListTileService {
  private _activeList: ICustomListTile | IListTile;

  get activeList() { return this._activeList; }

  constructor() { }

  public setActiveList(listTile?: ICustomListTile | IListTile) {
    this._activeList = listTile || null;
  }
}
