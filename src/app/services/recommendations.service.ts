import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private _college = new BehaviorSubject<any[]>(null);
  private _scholarship = new BehaviorSubject<any[]>(null);

  get college$() {
    return this._college.asObservable();
  }

  get scholarship$() {
    return this._scholarship.asObservable();
  }

  constructor(private api: ApiService) { }

  public get(id: number) {
    this.api.get(`/student/${id}/recommendation`)
      .subscribe(recs => {
        if (recs.length > 0) {
          this._college.next(recs.filter(r => r.institution !== null));
          this._scholarship.next(recs.filter(r => r.scholarship !== null));
        }
      });
  }
}
