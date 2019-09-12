import { Injectable } from '@angular/core';

import { ListTileService } from './list-tile.service';

@Injectable({ providedIn: 'root' })
export class ScholarshipListTileService extends ListTileService {
  constructor() {
    super();
  }
}
