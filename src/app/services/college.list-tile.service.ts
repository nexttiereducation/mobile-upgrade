import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ITileList } from '@nte/interfaces/tile-list.interface';
import { ApiService } from '@nte/services/api.service';
import { ListTileService } from '@nte/services/list-tile.service';

@Injectable({ providedIn: 'root' })
export class CollegeListTileService extends ListTileService {
  constructor(private api: ApiService) {
    super();
  }

  public create(list: ITileList): Observable<any> {
    return this.api
      .post(`/custom_institutions_list/`, list)
      .pipe(map(response => response.json()));
  }

  public delete(id: number): Observable<Response> {
    return this.api
      .delete(`/custom_institutions_list/${id}`);
  }
}
