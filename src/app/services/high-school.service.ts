import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { ApiService } from '@nte/services/api.service';


@Injectable({ providedIn: 'root' })
export class HighSchoolService {
  constructor(private apiService: ApiService) {
  }

  public getDetails(highSchoolId): Observable<string> {
    return this.apiService.get(`/highschool/${highSchoolId}/`)
      .pipe(map((response) => response.json()));
  }

  public searchSchools(query: string, newUser?: boolean): Observable<any> {
    if (newUser) {
      return this.apiService.getNoHeaders(`/highschool/${query}`)
        .pipe(map((response) => response.json().results));
    } else {
      return this.apiService.get(`/highschool/${query}`)
        .pipe(map((response) => response.json().results));
    }
  }

  public updateHighSchool(highSchoolId: any): Observable<any> {
    return this.apiService.patch(`/stakeholder/`, { highschool: highSchoolId })
      .pipe(map((response) => response.json()));
  }

}
