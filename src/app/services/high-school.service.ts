import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class HighSchoolService {

  constructor(private apiService: ApiService) {
  }

  public getDetails(highSchoolId): Observable<string> {
    return this.apiService.get(`/highschool/${highSchoolId}/`)
      .map((response) => response.json());
  }

  public searchSchools(query: string, newUser?: boolean): Observable<any> {
    if (newUser) {
      return this.apiService.getNoHeaders(`/highschool/${query}`)
        .map((response) => response.json().results);
    } else {
      return this.apiService.get(`/highschool/${query}`)
        .map((response) => response.json().results);
    }
  }

  public updateHighSchool(highSchoolId: any): Observable<any> {
    return this.apiService.patch(`/stakeholder/`, { highschool: highSchoolId })
      .map((response) => response.json());
  }

}
