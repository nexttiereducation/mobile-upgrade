import { Injectable } from '@angular/core';
import { filter, partition } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { SCHOLARSHIP_FILTERS } from '@nte/constants/scholarship.constants';
import { ICustomListTile } from '@nte/interfaces/list-tile-custom.interface';
import { ISavedScholarship, IScholarship } from '@nte/interfaces/scholarship.interface';
import { Filter } from '@nte/models/filter.model';
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

  private _applying = new BehaviorSubject<ISavedScholarship[]>([]);
  private _count: number;
  private _filter: Filter;
  private _nextPage: string;
  private _prevPage: string;
  private _recommendedNextPage: string;
  private _recommendedPrevPage: string;
  private _recommended = new BehaviorSubject<IScholarship[]>([]);
  private _savedNextPage: string;
  private _savedPrevPage: string;
  private _saved = new BehaviorSubject<ISavedScholarship[]>([]);
  private _scholarships = new BehaviorSubject<IScholarship[]>([]);
  private _selected = new Subject<IScholarship>();
  private _studentScholarships = new BehaviorSubject<ISavedScholarship[]>([]);

  get applying() {
    return this._applying.getValue();
  }

  get applying$() {
    return this._applying.asObservable();
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

  get prevPage() {
    return this._prevPage;
  }

  get recommendedNextPage() {
    return this._recommendedNextPage;
  }

  get recommendedPrevPage() {
    return this._recommendedPrevPage;
  }

  get recommended() {
    return this._recommended.getValue();
  }

  get recommended$() {
    return this._recommended.asObservable();
  }

  get savedNextPage() {
    return this._savedNextPage;
  }

  get savedPrevPage() {
    return this._savedPrevPage;
  }

  get saved() {
    return this._saved.getValue();
  }

  get saved$() {
    return this._saved.asObservable();
  }

  get scholarships() {
    return this._scholarships.getValue();
  }

  get scholarships$() {
    return this._scholarships.asObservable();
  }

  get selected() {
    return this._selected.asObservable();
  }

  get studentScholarships() {
    return this._studentScholarships.asObservable();
  }

  constructor(private api: ApiService,
    private nodeapi: NodeApiService) {
    this.scholarships$.subscribe(
      () => this.determineFollowedScholarships()
    );
  }

  public cleanUp() {
    this._applying.next([]);
    this._recommended.next([]);
    this._saved.next([]);
  }

  public createList(listTile: ICustomListTile) {
    return this.nodeapi
      .post(`/custom-scholarship-lists`, listTile);
  }

  public deleteList(id: number) {
    return this.nodeapi
      .delete(`/custom-scholarship-lists/${id}`);
  }

  public getById(id: number) {
    return this.api
      .get(`/scholarship/${id}`)
      .pipe(map(response => new Scholarship(response)));
  }

  public getFilters() {
    return this.api
      .get(`/meta/scholarship/`);
  }

  // getLists() {
  //   return this.api
  //  .nodeGet('/custom-scholarship-lists')
  //     .pipe(map(response => response));
  // }

  public getRecommendedScholarships(userId: number) {
    this.fetchingScholarships = true;
    const recommendations = [];
    return this.api
      .getPaged<IScholarship>(`/student/${userId}/recommendation?type=S`)
      .pipe(map(data => {
        // const newRecs = data.map((rec) => {
        //   rec.scholarship = new Scholarship(rec.scholarship);
        // });
        recommendations.push.apply(recommendations, data);
        return recommendations;
      }))
      .subscribe(
        (recs: IScholarship[]) => {
          this._recommended.next(recs);
          this.fetchingScholarships = false;
        },
        err => {
          console.error(err);
          this.fetchingScholarships = false;
        },
        () => this.fetchingScholarships = false
      );
  }

  public getSavedScholarships() {
    // this.getStudentScholarships();
    // this._studentScholarships.subscribe(scholarships => {
    //     if (scholarships && scholarships.length > 0) {
    //         const saved = scholarships.map(savedScholarship => {
    //             const isSaved = (savedScholarship.status === 'I');
    //             savedScholarship.scholarship.saved = isSaved;
    //             savedScholarship.scholarship.applying = !isSaved;
    //             savedScholarship.scholarship.status = savedScholarship.status;
    //             return savedScholarship;
    //         });
    //         const scholarshipArray = partition(saved, {'status': 'I'});
    //         this._saved.next(this._saved.value.concat(scholarshipArray[0]));
    //         this._applying.next(this._applying.value.concat(scholarshipArray[1]));
    //         this.determineFollowedScholarships();
    //     }
    // });
    this.fetchingScholarships = true;
    return this.api.getPaged<ISavedScholarship>(`/scholarship_list/`)
      .pipe(map((scholarships: any[]) => {
        // this._savedNextPage = scholarships.next;
        return scholarships.map((tracker) => {
          const isSaved = (tracker.status === `I`);
          tracker.scholarship = new Scholarship(tracker.scholarship);
          tracker.scholarship.saved = isSaved;
          tracker.scholarship.applying = !isSaved;
          tracker.scholarship.status = tracker.status;
          return tracker;
        });
      }))
      .subscribe(
        (data) => {
          const scholarshipArray = partition(data, { status: `I` });
          this._saved.next(this._saved.value.concat(scholarshipArray[0]));
          this._applying.next(this._applying.value.concat(scholarshipArray[1]));
          this.determineFollowedScholarships();
        },
        err => console.error(err),
        () => { this.fetchingScholarships = false; }
      );
  }

  public getScholarships(queryString = ``, isAbsolute?: boolean, _hasQuery?: boolean) {
    this.fetchingScholarships = true;
    queryString = isAbsolute ? queryString : `/scholarship/${queryString}`;
    if (queryString === this._prevPage) { return; }
    this.fetchingTotals = true;
    this.api
      .get(queryString, isAbsolute)
      .subscribe(
        (data) => {
          this._count = data.count;
          this._prevPage = queryString;
          this._nextPage = data.next;
          const fetchedScholarships = data.results.map(s => new Scholarship(s));
          if (isAbsolute) {
            const scholarships = this._scholarships.value.concat(fetchedScholarships);
            this._scholarships.next(scholarships);
          } else {
            this._scholarships.next(fetchedScholarships);
          }
          // return true;
        },
        err => console.error(err),
        () => { this.fetchingScholarships = false; }
      );
  }

  public getStudentScholarships(): void {
    this.fetchingScholarships = true;
    this.api
      .getPaged(`/scholarship_list/`)
      .subscribe(
        (data: ISavedScholarship[]) => {
          this._studentScholarships.next(data);
          this.fetchingScholarships = false;
        },
        () => {
          this.fetchingScholarships = false;
        }
      );
  }

  public initializeFilters(user: Stakeholder) {
    this.getFilters()
      .subscribe(
        (data) => {
          this._filter = new Filter(this.parseScholarshipFilters(data, user));
        },
        err => console.error(err)
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
    return this.api
      .delete(`/scholarship_list/${scholarship.id}`)
      .pipe(map(
        (response) => {
          this._saved.next(
            this._saved.value.filter(s => s.scholarship.id !== scholarship.id)
          );
          this._applying.next(
            this._applying.value.filter(s => s.scholarship.id !== scholarship.id)
          );
          const scholarships = this._scholarships.getValue();
          const scholarshipIndex = scholarships.findIndex(s => s.id === scholarship.id);
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
    return this.api
      .post(`/scholarship_list/`, postObj)
      .pipe(map(sTracker => {
        const isSaved = (sTracker.status === `I`);
        sTracker.scholarship = new Scholarship(sTracker.scholarship);
        sTracker.scholarship.saved = isSaved;
        sTracker.scholarship.applying = !isSaved;
        sTracker.scholarship.status = sTracker.status;
        if (isSaved) {
          this._saved.value.push(sTracker);
          this._saved.next(this._saved.value);
        } else {
          this._applying.value.push(sTracker);
          this._applying.next(this._applying.value);
        }
        return sTracker;
      }));
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
    return this.api
      .get(`/scholarship/${query}`)
      .pipe(map(response => {
        this.fetchingScholarships = false;
        return response.results.map(s => new Scholarship(s));
      }));
  }

  public setBaseFilter(query: string) {
    if (query && query.substr(0, 1) === `&`) {
      query = `?${query.substr(1, (query.length - 1))}`;
    }
    this.baseFilter = query;
    this.getScholarships(query);
  }

  public setSelectedScholarship(scholarship: IScholarship) {
    this._selected.next(scholarship);
  }

  public studentRemoveRecommended(recommendationId: number, studentId: number) {
    return this.api
      .delete(`/student/${studentId}/recommendation/${recommendationId}`)
      .pipe(map(
        () => {
          this.removeRecommendedScholarship(recommendationId, studentId);
          return true;
        },
        (error) => console.error(`error: ${error}`)
      ));
  }

  public update(id: number, postObj: any) {
    return this.api
      .patch(`/scholarship_list/${id}`, postObj)
      .pipe(map(sTracker => {
        sTracker.scholarship = new Scholarship(sTracker.scholarship);
        sTracker.scholarship.saved = false;
        sTracker.scholarship.applying = true;
        sTracker.scholarship.status = sTracker.status;
        const indx = this._saved.value.findIndex(s => s.scholarship.id === id);
        this._saved.value.splice(indx, 1);
        this._saved.next(this._saved.value);
        this._applying.value.push(sTracker);
        this._applying.next(this._applying.value);
        return sTracker;
      }));
  }

  public updateList(listTile: ICustomListTile, id: number) {
    return this.nodeapi.patch(`/custom-scholarship-lists/${id}`, listTile);
  }

  private determineFollowedScholarships() {
    const saved = this._saved.getValue();
    const applying = this._applying.getValue();
    if (!saved.length && !applying.length) { return; }
    const scholarships = this._scholarships.getValue();
    for (let i = 0, scholarship: IScholarship; scholarship = scholarships[i]; ++i) {
      const savedIndex = saved.findIndex(s => s.scholarship.id === scholarship.id);
      if (savedIndex !== -1) {
        scholarship.saved = true;
        scholarship.applying = false;
        scholarship.status = saved[savedIndex].status;
        continue;
      }
      const applyingIndex = applying.findIndex(a => a.scholarship.id === scholarship.id);
      if (applyingIndex !== -1) {
        scholarship.saved = false;
        scholarship.applying = true;
        scholarship.status = applying[applyingIndex].status;
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

  private removeRecommendedScholarship(recId: number, _studentId: number) {
    const recs = this._recommended.value.filter((rec) => rec.id !== recId);
    this._recommended.next(recs);
  }
}
