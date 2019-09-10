import { Injectable } from '@angular/core';
import { filter, findIndex, partition } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { SCHOLARSHIP_FILTERS } from '@nte/constants/scholarship.constants';
import { Filter } from '@nte/models/filter.model';
import { ICustomListTile } from '@nte/models/list-tile-custom.interface';
import { ISavedScholarship, IScholarship } from '@nte/models/scholarship.interface';
import { Scholarship } from '@nte/models/scholarship.model';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { NodeApiService } from '@nte/services/api-node.service';
import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class ScholarshipService {
  public baseFilter: any;
  public fetchingScholarships = false;
  public fetchingTotals = false;
  public showFilter = true;
  public showVaryingTotal = false;

  private _applyingScholarships = new BehaviorSubject<ISavedScholarship[]>([]);
  private _count: number;
  private _filter: Filter;
  private _nextPage: string;
  private _previousPage: string;
  private _recommendedNextPage: string;
  private _recommendedPreviousPage: string;
  private _recommendedScholarships = new BehaviorSubject<IScholarship[]>([]);
  private _savedNextPage: string;
  private _savedPreviousPage: string;
  private _savedScholarships = new BehaviorSubject<ISavedScholarship[]>([]);
  private _scholarships = new BehaviorSubject<IScholarship[]>([]);
  private _selectedScholarship = new Subject<IScholarship>();
  private _studentScholarships = new BehaviorSubject<ISavedScholarship[]>([]);

  get applyingScholarships() {
    return this._applyingScholarships.asObservable();
  }

  get count() {
    return this._count;
  }

  get filter() {
    return this._filter;
  }

  get nextPage() {
    return this._nextPage;
  }

  get previousPage() {
    return this._previousPage;
  }

  get recommendedNextPage() {
    return this._recommendedNextPage;
  }

  get recommendedPreviousPage() {
    return this._recommendedPreviousPage;
  }

  get recommendedScholarships() {
    return this._recommendedScholarships.asObservable();
  }

  get savedNextPage() {
    return this._savedNextPage;
  }

  get savedPreviousPage() {
    return this._savedPreviousPage;
  }

  get savedScholarships() {
    return this._savedScholarships.asObservable();
  }

  get scholarships() {
    return this._scholarships.asObservable();
  }

  get selectedScholarship() {
    return this._selectedScholarship.asObservable();
  }

  get studentScholarships() {
    return this._studentScholarships.asObservable();
  }

  constructor(private apiService: ApiService,
    private nodeApiService: NodeApiService) {
    this.scholarships.subscribe(
      () => this.determineFollowedScholarships()
    );
  }

  public cleanUp() {
    this._applyingScholarships.next([]);
    this._recommendedScholarships.next([]);
    this._savedScholarships.next([]);
  }

  public createList(listTile: ICustomListTile) {
    return this.nodeApiService.post(`/custom-scholarship-lists`, listTile)
      .map((response) => response.json());
  }

  public deleteList(id: number) {
    return this.nodeApiService.delete(`/custom-scholarship-lists/${id}`)
      .map((response) => response.json());
  }

  public getById(id: number) {
    return this.apiService.get(`/scholarship/${id}`)
      .map((response) => {
        const scholarship = response.json();
        return new Scholarship(scholarship);
      });
  }

  public getFilters() {
    return this.apiService.get(`/meta/scholarship/`)
      .map((response) => response.json());
  }

  // getLists() {
  //   return this.apiService.nodeGet('/custom-scholarship-lists')
  //     .map(response => response.json());
  // }

  public getRecommendedScholarships(userId: number) {
    this.fetchingScholarships = true;
    const recommendations = [];
    return this.apiService.getPaged<any>(`/student/${userId}/recommendation?type=S`)
      .map((data) => {
        // const newRecs = data.map((rec) => {
        //   rec.scholarship = new Scholarship(rec.scholarship);
        // });
        recommendations.push.apply(recommendations, data);
      })
      .subscribe(
        null,
        err => console.error(err),
        () => {
          this._recommendedScholarships.next(recommendations);
          this.fetchingScholarships = false;
        }
      );
  }

  public getSavedScholarships() {
    // this.getStudentScholarships();
    // this._studentScholarships.subscribe(scholarships => {
    //     if (scholarships && scholarships.length > 0) {
    //         const savedScholarships = scholarships.map(savedScholarship => {
    //             const isSaved = (savedScholarship.status === 'I');
    //             savedScholarship.scholarship.saved = isSaved;
    //             savedScholarship.scholarship.applying = !isSaved;
    //             savedScholarship.scholarship.status = savedScholarship.status;
    //             return savedScholarship;
    //         });
    //         const scholarshipArray = partition(savedScholarships, {'status': 'I'});
    //         this._savedScholarships.next(this._savedScholarships.value.concat(scholarshipArray[0]));
    //         this._applyingScholarships.next(this._applyingScholarships.value.concat(scholarshipArray[1]));
    //         this.determineFollowedScholarships();
    //     }
    // });
    this.fetchingScholarships = true;
    return this.apiService.getPaged<ISavedScholarship>(`/scholarship_list/`)
      .map((scholarships) => {
        // this._savedNextPage = scholarships.next;
        return scholarships.map((tracker) => {
          const isSaved = (tracker.status === `I`);
          tracker.scholarship = new Scholarship(tracker.scholarship);
          tracker.scholarship.saved = isSaved;
          tracker.scholarship.applying = !isSaved;
          tracker.scholarship.status = tracker.status;
          return tracker;
        });
      })
      .subscribe(
        (data) => {
          const scholarshipArray = partition(data, { status: `I` });
          this._savedScholarships.next(this._savedScholarships.value.concat(scholarshipArray[0]));
          this._applyingScholarships.next(this._applyingScholarships.value.concat(scholarshipArray[1]));
          this.determineFollowedScholarships();
        },
        err => console.error(err),
        () => { this.fetchingScholarships = false; }
      );
  }

  public getScholarships(queryString = ``, isAbsolute?: boolean, _hasQuery?: boolean) {
    this.fetchingScholarships = true;
    queryString = isAbsolute ? queryString : `/scholarship/${queryString}`;
    if (queryString === this._previousPage) { return; }
    this.fetchingTotals = true;
    return this.apiService.get(queryString, isAbsolute)
      .map((response) => response.json())
      .subscribe(
        (data) => {
          this._count = data.count;
          this._previousPage = queryString;
          this._nextPage = data.next;
          const fetchedScholarships = data.results.map((scholarship) => new Scholarship(scholarship));
          if (isAbsolute) {
            const scholarships = this._scholarships.value.concat(fetchedScholarships);
            this._scholarships.next(scholarships);
          } else {
            this._scholarships.next(fetchedScholarships);
          }
          return true;
        },
        err => console.error(err),
        () => { this.fetchingScholarships = false; }
      );
  }

  public getStudentScholarships(): void {
    this.fetchingScholarships = true;
    this.apiService.getPaged<ISavedScholarship>(`/scholarship_list/`)
      .subscribe(
        (data) => { this._studentScholarships.next(data); },
        null,
        () => { this.fetchingScholarships = false; });
  }

  public initializeFilters(user: Stakeholder) {
    const filterSub = this.getFilters()
      .subscribe(
        (data) => {
          this._filter = new Filter(this.parseScholarshipFilters(data, user));
          filterSub.unsubscribe();
        },
        err => console.error(err),
        () => {
          filterSub.unsubscribe();
        }
      );
  }

  public initializeList(list: any, userId: number) {
    switch (list.name) {
      case `Applying`:
      case `Saved`:
        this.getSavedScholarships();
        break;
      case `Recommended`:
        this.getRecommendedScholarships(userId);
        break;
      case `Search All`:
      default:
        this.getScholarships(list.filter);
        break;
    }
  }

  public removeScholarship(scholarship: IScholarship): Observable<any> {
    return this.apiService.delete(`/scholarship_list/${scholarship.id}`)
      .pipe(map(
        (response) => {
          this._savedScholarships.next(
            filter(this._savedScholarships.value, (saved) => saved.scholarship.id !== scholarship.id)
          );
          this._applyingScholarships.next(
            filter(this._applyingScholarships.value, (applying) => applying.scholarship.id !== scholarship.id)
          );
          const scholarships = this._scholarships.getValue();
          const scholarshipIndex = scholarships.findIndex((ship) => ship.id === scholarship.id);
          if (scholarshipIndex !== -1) {
            this._scholarships.value[scholarshipIndex].applying = false;
            this._scholarships.value[scholarshipIndex].saved = false;
            this._scholarships.value[scholarshipIndex].status = null;
          }
          return response;
        },
        err => console.error(err)
      ));
  }

  public save(_id: number, postObj: any): Observable<ISavedScholarship> {
    return this.apiService.post(`/scholarship_list/`, postObj)
      .map((response) => {
        const savedScholarship = response.json();
        const isSaved = (savedScholarship.status === `I`);
        savedScholarship.scholarship = new Scholarship(savedScholarship.scholarship);
        savedScholarship.scholarship.saved = isSaved;
        savedScholarship.scholarship.applying = !isSaved;
        savedScholarship.scholarship.status = savedScholarship.status;
        if (isSaved) {
          this._savedScholarships.value.push(savedScholarship);
          this._savedScholarships.next(this._savedScholarships.value);
        } else {
          this._applyingScholarships.value.push(savedScholarship);
          this._applyingScholarships.next(this._applyingScholarships.value);
        }
        return savedScholarship;
      });
  }

  public saveScholarship(id: number, isExisting: boolean, isApplying?: boolean): Observable<ISavedScholarship> {
    const data: any = {};
    if (isApplying) {
      data.status = `APG`;
    }
    if (isExisting) {
      return this.update(id, data);
    } else {
      data.scholarship = id;
      return this.save(id, data);
    }
  }

  public searchScholarships(query: string): Observable<IScholarship[]> {
    this.fetchingScholarships = true;
    return this.apiService.get(`/scholarship/${query}`)
      .map((response) => {
        this.fetchingScholarships = false;
        const searchResults = response.json().results.map((scholarship) => new Scholarship(scholarship));
        return searchResults;
      });
  }

  public setBaseFilter(query: string) {
    if (query && query.substr(0, 1) === `&`) {
      query = `?` + query.substr(1, (query.length - 1));
    }
    this.baseFilter = query;
    this.getScholarships(query);
  }

  public setSelectedScholarship(scholarship: IScholarship) {
    this._selectedScholarship.next(scholarship);
  }

  public studentRemoveRecommended(recommendationId: number, studentId: number) {
    return this.apiService.delete(`/student/${studentId}/recommendation/${recommendationId}`)
      .map(
        () => {
          this.removeRecommendedScholarship(recommendationId, studentId);
          return true;
        },
        (error) => {
          console.error(`error: ${error}`);
        }
      );
  }

  public update(id: number, postObj: any) {
    return this.apiService.patch(`/scholarship_list/${id}`, postObj)
      .map((response) => {
        const updatedScholarship = response.json();
        updatedScholarship.scholarship = new Scholarship(updatedScholarship.scholarship);
        updatedScholarship.scholarship.saved = false;
        updatedScholarship.scholarship.applying = true;
        updatedScholarship.scholarship.status = updatedScholarship.status;
        const indx = this._savedScholarships.value.findIndex((saved) => saved.scholarship.id === id);
        this._savedScholarships.value.splice(indx, 1);
        this._savedScholarships.next(this._savedScholarships.value);
        this._applyingScholarships.value.push(updatedScholarship);
        this._applyingScholarships.next(this._applyingScholarships.value);
        return updatedScholarship;
      });
  }

  public updateList(listTile: ICustomListTile, id: number) {
    return this.nodeApiService.patch(`/custom-scholarship-lists/${id}`, listTile)
      .map((response) => response.json());
  }

  private determineFollowedScholarships() {
    const savedScholarships = this._savedScholarships.getValue();
    const applyingScholarships = this._applyingScholarships.getValue();
    if (!savedScholarships.length && !applyingScholarships.length) { return; }
    const scholarships = this._scholarships.getValue();
    for (let i = 0, scholarship: IScholarship; scholarship = scholarships[i]; ++i) {
      const savedIndex = findIndex(
        savedScholarships,
        (savedScholarship) => savedScholarship.scholarship.id === scholarship.id
      );
      if (savedIndex !== -1) {
        scholarship.saved = true;
        scholarship.applying = false;
        scholarship.status = savedScholarships[savedIndex].status;
        continue;
      }
      const applyingIndex = findIndex(
        applyingScholarships,
        (applyingScholarship) => applyingScholarship.scholarship.id === scholarship.id
      );
      if (applyingIndex !== -1) {
        scholarship.saved = false;
        scholarship.applying = true;
        scholarship.status = applyingScholarships[applyingIndex].status;
      }
    }
  }

  private parseScholarshipFilters(filterOptions: any, user: Stakeholder) {
    // tslint:disable-next-line:no-shadowed-variable
    const filter: any = [...SCHOLARSHIP_FILTERS];
    filter[0].subCategories[0].options = filterOptions.race.choices;
    filter[0].subCategories[1].options = filterOptions.religion.choices;
    filter[0].subCategories[2].options = filterOptions.state.choices;

    filter[1].subCategories[0].options = filterOptions.interest.choices;
    filter[1].subCategories[1].options = filterOptions.sport.choices;

    filter[2].subCategories[0].options = filterOptions.major.choices;

    if (user.district) {
      filter.push({
        name: `My District`,
        options: [{
          id: user.district.id,
          value: user.district.name
        }],
        queryName: `district_id`,
        type: `default`
      });
    }
    return filter;
  }

  private removeRecommendedScholarship(recommendationId: number, _studentId: number) {
    const recs = filter(this._recommendedScholarships.value, (rec) => rec.id !== recommendationId);
    this._recommendedScholarships.next(recs);
  }
}
