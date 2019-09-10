import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { COLLEGE_NON_PROFIT_QUERY } from '@nte/constants/college.constants';
import { IApplicationDate } from '@nte/models/application-date.interface';
import { ICollegeRecommendation } from '@nte/models/college-recommendation.interface';
import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { INote } from '@nte/models/note.interface';
import { ITag } from '@nte/models/tag.interface';
import { ITileList } from '@nte/models/tile-list.interface';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { LocationService } from '@nte/services/location.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Injectable({ providedIn: 'root' })
export class CollegeService extends ListService {
  public baseFilter: string;
  public bookmarkTag: ITag | any;
  public collegesFollowed: any;
  public count: number;
  public filterName = `All`;
  public filterNamePrefix: string;
  public filterNameSuffix: string;
  public nearbyQuery: string;
  public nextPage: string = null;
  public nextRecommendPage: string = null;
  public previousPage: string = null;
  public selectedCollege: ICollege;
  public selectedColleges = new Array<ICollege>();
  public selectedCollegesIds = new Array<number>();
  public selectedRecommendation: ICollegeRecommendation;

  private _allSchoolTags = new BehaviorSubject<any[]>(null);
  private _bookmarkedColleges = new BehaviorSubject<ICollege[]>([]);
  private _collegeChanges = new Subject<any>();
  private _matchingColleges = new BehaviorSubject<ICollege[]>([]);
  private _moreToScroll = new Subject<boolean>();
  private _nearbyColleges = new BehaviorSubject<ICollege[]>([]);
  private _nextTierApplicationId = new BehaviorSubject<number>(null);
  private _recommendations = new BehaviorSubject<ICollegeRecommendation[]>([]);
  private _recommendationsCount = new BehaviorSubject<number>(null);
  private _showApplications = new BehaviorSubject<boolean>(null);
  private _trackedColleges = new BehaviorSubject<ICollegeTracker[]>(null);

  get allSchoolTags() {
    return this._allSchoolTags.asObservable();
  }

  get bookmarkedColleges$() {
    return this._bookmarkedColleges.asObservable();
  }

  get collegeChanges() {
    return this._collegeChanges.asObservable();
  }

  get matchingColleges$() {
    return this._matchingColleges.asObservable();
  }

  get moreToScroll() {
    return this._moreToScroll.asObservable();
  }

  get nearbyColleges$() {
    return this._nearbyColleges.asObservable();
  }

  get recommendations() {
    return this._recommendations.getValue();
  }

  get recommendations$() {
    return this._recommendations.asObservable();
  }

  get recommendationsCount() {
    return this._recommendationsCount.asObservable();
  }

  get savedColleges$() {
    if (this.user.isParent) {
      return this._bookmarkedColleges.asObservable();
    } else {
      return this._trackedColleges.asObservable();
    }
  }

  get trackedColleges$() {
    return this._trackedColleges.asObservable();
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    private alertCtrl: AlertController,
    private api: ApiService,
    private location: LocationService,
    private stakeholderService: StakeholderService
  ) {
    super();
    this.baseUrl = `/institutions/`;
    // this.baseFilter = COLLEGE_NON_PROFIT_QUERY;
  }

  public checkNextTierApplications(trackers: any[]) {
    this.getNextTierApplicationId()
      .subscribe(nteAppId => {
        this._nextTierApplicationId.next(nteAppId);
        const nextTierApplication = trackers.find(college => {
          if (college.application_group) {
            return college.application_group.id === nteAppId;
          }
        });
        this._showApplications.next(nextTierApplication ? true : false);
      });
  }

  public clearColleges() {
    this.all = [];
  }

  /*
   * Public method to clear out the next/prev pages. This is relevant for when the college service
   * is used in a componentand you need a manual way to clear out the next when the component is destroyed.
   */
  public clearNext() {
    this.nextPage = null;
    this.previousPage = null;
  }

  public clearSelected() {
    for (let i = 0; i < this.selectedColleges.length; i++) {
      this.selectedColleges[i].selected = false;
    }
    this.selectedColleges = [];
    this.selectedCollegesIds = [];
    this._collegeChanges.next();
  }

  public createList(list: ITileList): Observable<any> {
    return this.api
      .post(`/custom_institutions_list/`, list)
      .map(response => response.json());
  }

  public createNote(id: number, note: string): Observable<INote> {
    return this.api
      .post(`${this.baseUrl}${id}/note`, { note })
      .map(response => response.json());
  }

  public declineRecommendation(rec: ICollegeRecommendation) {
    return this.api
      .delete(`/student/${this.user.id}/recommendation/${rec.id}`)
      .do(() => this.removeRecommendation(rec.institution.id));
  }

  public deleteCustomList(id: number): Observable<Response> {
    return this.api.delete(`/custom_institutions_list/${id}`);
  }

  public deleteNote(id: number, noteId: number) {
    return this.api.delete(`${this.baseUrl}${id}/note/${noteId}`);
  }

  public followCollege(id: number, appData?: any, _isRec?: boolean) {
    if (appData) {
      appData.institution = id;
    } else {
      appData = { institution: id };
    }
    const existingTracked = this._trackedColleges.getValue();
    return this.api.post(`/institution_tracker/`, appData)
      .map(response => {
        const tracker = response.json();
        existingTracked.push(tracker);
        this._trackedColleges.next(existingTracked);
        this.checkNextTierApplications(existingTracked);
        return tracker;
      });
  }

  public getAdmissionTypeInfo() {
    const url =
      `https://next-tier.s3.amazonaws.com/externalized-strings/admission-deadline-information.json`;
    return this.api.getNoHeaders(url, true).map(response => response.json());
  }

  public getApplicationDates(id: number): Observable<IApplicationDate[]> {
    return this.api
      .get(`${this.baseUrl}${id}/dates/`)
      .map(response => response.json().results);
  }

  public getCollegeDeadlines(id: number): Observable<Response> {
    return this.api.get(`${this.baseUrl}${id}/dates/`);
  }

  public getCollegeDetails(id: number): Observable<ICollege> {
    return this.api.get(`${this.baseUrl}${id}/`)
      .map(response => response.json());
  }

  public getCollegeFilter(): Observable<Response> {
    return this.api.get(`/meta/institution`);
  }

  public getCollegeScattergram(id: number): Observable<any> {
    return this.api.get(`${this.baseUrl}${id}/scattergrams/`)
      .map(response => response.json());
  }

  public getCustomLists(): Observable<any> {
    return this.api.get(`/custom_institutions_list/`)
      .map(response => {
        const data = response.json();
        return data.results;
      });
  }

  public getFollowedColleges(): Observable<Response> {
    return this.api.get(`/institution_tracker/`);
  }

  public getIdFromCollege(
    college: ICollegeTracker | ICollegeRecommendation | ICollege | any
  ) {
    // The institution can come in from institution, recommended, or saved and the id is in a different variable
    if (college) {
      if (college.institution && college.institution.id) {
        return college.institution.id;
      } else if (college.institution) {
        return college.institution;
      } else {
        return college.id;
      }
    }
  }

  public getMatchingColleges(): void {
    this.isInitializing = true;
    this.getFollowedColleges()
      .map(response => response.json())
      .subscribe(followedColleges => {
        let query = `?`;
        for (let i = 0, school; (school = followedColleges[i]); ++i) {
          query += `id=${school.institution}&`;
        }
        query += this.buildTestScoreQuery();
        const url = `/matches/${query.slice(0, -1)}`;
        this.api
          .get(url)
          .subscribe(
            response => {
              const data = response.json();
              this._matchingColleges.next(data.results);
              this.nextPage = null;
              this.isInitializing = false;
            },
            err => {
              console.error(err);
              this.isInitializing = false;
            }
          );
      });
  }

  public getMoreColleges(isNearby: boolean = false): void {
    if (!this.nextPage || this.nextPage === this.previousPage) {
      return;
    }
    this.api
      .get(this.nextPage, true)
      .subscribe(
        response => {
          const data = response.json();
          this.joinCollegeList(data.results, isNearby);
          if (data.next === this.nextPage) {
            this.nextPage = null;
            this._moreToScroll.next(false);
          } else {
            this.previousPage = this.nextPage;
            this.nextPage = data.next;
            this._moreToScroll.next(true);
          }
        },
        () => {
          const alert = this.alertCtrl.create({
            buttons: [`Dismiss`],
            subTitle: `An error has occurred. Please try again.`,
            title: `Error`
          });
          alert.present();
        }
      );
  }

  public getNearbyQueryFromPosition(position: any) {
    const pos = position.coords;
    let query = `location=${pos.latitude.toFixed(2)},${pos.longitude.toFixed(2)}`;
    query += `&distance=50${COLLEGE_NON_PROFIT_QUERY}`;
    this.nearbyQuery = query;
    return query;
  }

  public getNextTierApplicationId(): Observable<number> {
    return this.api.get(`/group/`).map(response => {
      const groups = response.json().results;
      let nextTierApplicationId: number;
      groups.forEach(group => {
        if (group.name === `NextTier Application`) {
          nextTierApplicationId = group.id;
        }
      });
      return nextTierApplicationId;
    });
  }

  public getNotes(id: number, url?: string, isAbsoluteUrl?: boolean) {
    const query = url ? url : `${this.baseUrl}${id}/note`;
    return this.api.get(query, isAbsoluteUrl)
      .map(response => response.json());
  }

  public getPremadeLists(): Observable<any[]> {
    return this.api
      .get(`/admin/tag/institution/`)
      .map(response => response.json().results);
  }

  public getRecommendedColleges(): ICollege[] {
    return this.user.recommended_colleges;
  }

  public getSelectedCollege() {
    return this.selectedCollege;
  }

  public getTagsOnSchool(userId: number, collegeId: number) {
    return this.api
      .get(`/stakeholder/${userId}/tag/institution/${collegeId}`)
      .map(response => response.json());
  }

  public initializeBookmarked(userId: number) {
    this.isInitializing = true;
    // this._bookmarkedColleges.next([]);
    this.api
      .get(`/stakeholder/${userId}/institution/tags/`)
      .map(response => response.json().results)
      .subscribe(
        results => {
          let bookmarkId;
          this.bookmarkTag = results.find({ name: `bookmark` });
          if (this.bookmarkTag) {
            bookmarkId = this.bookmarkTag.id;
          }
          const allTags = results.filter({ tag_type: `college` });
          this._allSchoolTags.next(allTags);
          let url = this.baseUrl;
          if (bookmarkId !== undefined) {
            url += `?tag=${bookmarkId}`;
            this.api
              .get(url)
              .map(data => data.json())
              .subscribe(data => {
                this.count = data.count;
                this.previousPage = url;
                this.nextPage = data.next;
                this._bookmarkedColleges.next(data.results);
              });
          } else {
            this._bookmarkedColleges.next([]);
          }
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public initializeColleges(queryString: string = ``): void {
    this.isInitializing = true;
    // this.clearColleges();
    const url = this.baseUrl + queryString;
    this.api
      .get(url)
      .subscribe(
        response => {
          const data = response.json();
          this.count = data.count;
          this.previousPage = url;
          this.nextPage = data.next;
          this.all = data.results;
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          const alert = this.alertCtrl.create({
            buttons: [`Dismiss`],
            subTitle: `An error has occurred. Please try again.`,
            title: `Error`
          });
          alert.present();
          this.isInitializing = false;
        }
      );
  }

  public initializeCollegeTrackers(): void {
    this.isInitializing = true;
    // this._trackedColleges.next([]);
    this.getFollowedColleges()
      .map(response => response.json())
      .subscribe(
        (trackers: any) => {
          this.nextPage = null;
          this._trackedColleges.next(trackers);
          this.checkNextTierApplications(trackers);
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public initializeNearbyColleges(queryString: string = ``) {
    this.isInitializing = true;
    let url = `/institutions?`;
    if (this.nearbyQuery && this.nearbyQuery.length) {
      url += this.nearbyQuery + queryString;
      this.getNearbyColleges(url);
    } else {
      this.location.position
        .subscribe(pos => {
          url += this.getNearbyQueryFromPosition(pos) + queryString;
          this.getNearbyColleges(url);
        });
    }
  }

  public initializeRecommendations(userId: number, isParent?: boolean): void {
    this.isInitializing = true;
    // this._recommendations.next([]);
    const url = isParent
      ? `/stakeholder/recommendation/institution/`
      : `/student/${userId}/recommendation?type=I`;
    this.api.get(url)
      .subscribe(
        (data) => {
          const recs = data.json().results;
          this.nextPage = null;
          this._moreToScroll.next(false);
          this._recommendationsCount.next(recs.length);
          this._recommendations.next(recs);
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public initializeSaved(userId: number, isParent?: boolean) {
    if (isParent) {
      this.initializeBookmarked(userId);
    } else {
      this.initializeCollegeTrackers();
    }
  }

  public initList(queryString: string, isNearby: boolean) {
    if (isNearby) {
      if (!this._nearbyColleges.getValue() || !this._nearbyColleges.getValue().length) {
        this.initializeNearbyColleges(queryString);
      }
    } else {
      this.initializeColleges(queryString);
    }
  }

  public isFollowingSchool(id: number): Observable<boolean> {
    return this.api.get(`/institution_tracker/`)
      .map(response => {
        const collegeTrackers = response.json();
        return (
          collegeTrackers.findIndex((collegeTracker: any) => {
            return collegeTracker.college === id;
          }) >= 0
        );
      });
  }

  public isRecd(id: number): boolean {
    if (this.user.isParent) {
      return false;
    }
    const list = this._recommendations.getValue();
    let listMatch = null;
    if (list && list.length) {
      listMatch = list.find((college: any) => {
        return college.id === id || college.institution === id;
      });
    }
    return listMatch !== undefined && listMatch !== null;
  }

  public isSaved(id: number): boolean {
    const isParent = this.user.isParent;
    const list: any[] = isParent
      ? this._bookmarkedColleges.getValue()
      : this._trackedColleges.getValue();
    let listMatch = null;
    if (list && list.length) {
      listMatch = list.find((college: any) => college[isParent ? `id` : `institution`] === id);
    }
    return listMatch !== undefined && listMatch !== null;
  }

  public removeBookmarkedSchool(id: number) {
    const existing = this._bookmarkedColleges.getValue();
    this._bookmarkedColleges.next(existing.filter(school => school.id !== id));
  }

  public removeRecommendation(id: number) {
    const existing = this._recommendations.getValue();
    this._recommendations.next(
      existing.filter(rec => rec.institution.id !== id)
    );
    this._recommendationsCount.next(this._recommendations.getValue().length);
  }

  public removeTrackedSchool(id: number) {
    const existing = this._trackedColleges.getValue();
    this._trackedColleges.next(
      existing.filter(tracker => tracker.institution !== id)
    );
  }

  public save(college: ICollege, user: any, appData?: any, isRec?: boolean) {
    if (user.isParent) {
      return this.tagSchool(college.id, user.id, `bookmark`, college);
    } else {
      return this.followCollege(college.id, appData, isRec);
    }
  }

  public searchColleges(query: string, fullUrl: boolean = false): Observable<ICollege[]> {
    const url = fullUrl ? query : this.baseUrl + query;
    return this.api.get(url).map(response => response.json().results);
  }

  public setBaseFilter(query: string) {
    if (query.substr(0, 1) === `&`) {
      query = `?` + query.substr(1, query.length - 1);
    }
    this.baseFilter = query;
    this.initializeColleges(query);
  }

  public setCollege(college: ICollege) {
    this.selectedCollege = college;
  }

  /*
   * If the full college is passed and the tag type is 'bookmark',
   * then the school will be added to the list of bookmarked schools.
   */
  public tagSchool(
    id: number,
    userId: number,
    tag?: string,
    college?: ICollege
  ) {
    const tagName = tag || `bookmark`;
    const data = {
      hideLoader: true,
      institution_id: id,
      tag_name: tagName
    };
    return this.api
      .post(`/stakeholder/${userId}/tag/institution/`, data)
      .map(response => {
        const result = response.json();
        const bookmarkedColleges = this._bookmarkedColleges.value;
        bookmarkedColleges.push(college);
        this._bookmarkedColleges.next(bookmarkedColleges);
        return result;
      });
  }

  public unbookmarkCollege(id: number, userId: number): Observable<any> {
    return this.untagSchool(userId, +this.bookmarkTag.id, id).map(() => {
      this.removeBookmarkedSchool(id);
    });
  }

  public unfollowCollege(id: number): Observable<Response> {
    return this.api.delete(`/institution_tracker/${id}`).map(response => {
      this.removeTrackedSchool(id);
      return response;
    });
  }

  public unsave(id: number, isParent?: boolean): Observable<any> {
    if (isParent) {
      return this.unbookmarkCollege(id, this.user.id);
    } else {
      return this.unfollowCollege(id);
    }
  }

  public untagSchool(userId: number, tagId: number, id: number) {
    return this.api.delete(`/stakeholder/${userId}/tag/${tagId}/institution/${id}`);
  }

  public updateCollegeTracker(id: number, collegeData: any) {
    return this.api
      .patch(`/institution_tracker/${id}`, collegeData)
      .map(response => response.json());
  }

  public updateList(list: any, id: number): Observable<any> {
    return this.api
      .patch(`/custom_institutions_list/${id}`, list)
      .map(response => response.json());
  }

  public updateSelectedColleges(college: ICollege) {
    const colIdx = this.selectedColleges.findIndex(c => c.id === college.id);
    if (colIdx !== -1) {
      this.selectedColleges.splice(colIdx, 1);
      this.selectedCollegesIds.splice(colIdx, 1);
    } else {
      this.selectedColleges.push(college);
      this.selectedCollegesIds.push(college.id);
    }
    this._collegeChanges.next();
  }

  private buildTestScoreQuery(): string {
    const user = this.user;
    if (!user.isStudent) {
      return;
    }
    let queryString = ``;
    const maxAct = Math.max(...user.act_scores.map(score => score.composite));
    const maxReading = Math.max(...user.sat_scores.map(score => score.reading));
    const maxMath = Math.max(...user.sat_scores.map(score => score.math));
    if (maxAct !== -Infinity) {
      queryString += `act_composite=${maxAct}&`;
    }
    if (maxReading !== -Infinity) {
      queryString += `sat_reading=${maxReading}&`;
      queryString += `sat_writing=${maxReading}&`;
    }
    if (maxMath !== -Infinity) {
      queryString += `sat_math=${maxMath}&`;
    }
    return queryString;
  }

  private getNearbyColleges(url: string) {
    this.api
      .get(url)
      .map(response => response.json())
      .subscribe(
        data => {
          this.count = data.count;
          this.previousPage = url;
          this.nextPage = data.next;
          this._nearbyColleges.next(data.results);
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          const alert = this.alertCtrl.create({
            buttons: [`Dismiss`],
            subTitle: `An error has occurred. Please try again.`,
            title: `Error`
          });
          alert.present();
          this.isInitializing = false;
        }
      );
  }

  private joinCollegeList(newColleges: ICollege[], isNearby: boolean = false) {
    const existingColleges = isNearby ? this._nearbyColleges.getValue() : this.all;
    existingColleges.push.apply(existingColleges, newColleges);
    const uniq = uniqBy(existingColleges, (college: any) => college.id);
    if (isNearby) {
      this._nearbyColleges.next(uniq);
    } else {
      this.all = uniq;
    }
  }
}
