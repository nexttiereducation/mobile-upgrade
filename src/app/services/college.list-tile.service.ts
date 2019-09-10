import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '@nte/services/api.service';

import { ICustomListTile } from '@nte/models/list-tile-custom.interface';
import { IListTile } from '@nte/models/list-tile.interface';
import { ITileList } from '@nte/models/tile-list.interface';

@Injectable({ providedIn: 'root' })
export class CollegeListTileService {
  private _activeList: BehaviorSubject<ICustomListTile | IListTile> = new BehaviorSubject(null);

  get activeList() {
    return this._activeList.getValue();
  }

  set activeList(listTile: ICustomListTile | IListTile) {
    this._activeList.next(listTile || null);
  }

  constructor(private api: ApiService) { }

  public create(list: ITileList): Observable<any> {
    return this.api
      .post(`/custom_institutions_list/`, list)
      .map(response => response.json());
  }

  public delete(id: number): Observable<Response> {
    return this.api.delete(`/custom_institutions_list/${id}`);
  }
}
