import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { isNumber, uniqBy } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/operators';

import { COLLEGE_NON_PROFIT_QUERY } from '@nte/constants/college.constants';
import { IApplicationDate } from '@nte/interfaces/application-date.interface';
import { ICollegeRecommendation } from '@nte/interfaces/college-recommendation.interface';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { INote } from '@nte/interfaces/note.interface';
import { ITag } from '@nte/interfaces/tag.interface';
import { ITileList } from '@nte/interfaces/tile-list.interface';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { LocationService } from '@nte/services/location.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Injectable({ providedIn: 'root' })
export class CollegesService extends ListService {
  public baseFilter: string;
  public bookmarkTag: ITag | any;
  public collegesFollowed: any;
  public count: number;
  public filterName: string = `All`;
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

  private _allSchoolTags: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  private _bookmarked: BehaviorSubject<ICollege[]> = new BehaviorSubject<ICollege[]>([]);
  private _collegeChanges: Subject<any> = new Subject<any>();
  private _matching: BehaviorSubject<ICollege[]> = new BehaviorSubject<ICollege[]>([]);
  private _moreToScroll: Subject<boolean> = new Subject<boolean>();
  private _nearby: BehaviorSubject<ICollege[]> = new BehaviorSubject<ICollege[]>([]);
  private _nextTierApplicationId: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _recommendations: BehaviorSubject<ICollegeRecommendation[]> = new BehaviorSubject<ICollegeRecommendation[]>([]);
  private _recommendationsCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _showApplications: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _tracked: BehaviorSubject<ICollegeTracker[]> = new BehaviorSubject<ICollegeTracker[]>(null);

  get allSchoolTags() {
    return this._allSchoolTags.asObservable();
  }

  get bookmarked$() {
    return this._bookmarked.asObservable();
  }

  get collegeChanges() {
    return this._collegeChanges.asObservable();
  }

  get matching$() {
    return this._matching.asObservable();
  }

  get moreToScroll() {
    return this._moreToScroll.asObservable();
  }

  get nearby$() {
    return this._nearby.asObservable();
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

  get saved$() {
    if (this.user.isParent) {
      return this._bookmarked.asObservable();
    } else {
      return this._tracked.asObservable();
    }
  }

  get tracked$() {
    return this._tracked.asObservable();
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
    this.selectedColleges.forEach(c => c.selected = false);
    this.selectedColleges = [];
    this.selectedCollegesIds = [];
    this._collegeChanges.next();
  }

  public createList(list: ITileList): Observable<any> {
    return this.api
      .post(`/custom_institutions_list/`, list);
  }

  public createNote(id: number, note: string): Observable<INote> {
    return this.api
      .post(`${this.baseUrl}${id}/note`, { note });
  }

  public declineRec(rec: ICollegeRecommendation) {
    return this.api
      .delete(`/student/${this.user.id}/recommendation/${rec.id}`)
      .pipe(tap(() => { this.removeRec(rec.institution.id); }));
  }

  public deleteCustomList(id: number): Observable<Response> {
    return this.api
      .delete(`/custom_institutions_list/${id}`);
  }

  public deleteNote(id: number, noteId: number) {
    return this.api
      .delete(`${this.baseUrl}${id}/note/${noteId}`);
  }

  public follow(id: number, appData?: any, _isRec?: boolean) {
    if (appData) {
      appData.institution = id;
    } else {
      appData = { institution: id };
    }
    return this.api
      .post(`/institution_tracker/`, appData)
      .pipe(map(tracker => {
        const existingTracked = this._tracked.getValue() ? this._tracked.getValue() : [];
        existingTracked.push(tracker);
        this._tracked.next(existingTracked);
        this.checkNextTierApplications(existingTracked);
        return tracker;
      }));
  }

  public getAdmissionTypeInfo() {
    const url =
      `https://next-tier.s3.amazonaws.com/externalized-strings/admission-deadline-information.json`;
    return this.api
      .getNoHeaders(url, true);
  }

  public getAppDates(id: number): Observable<IApplicationDate[]> {
    return this.api
      .get(`${this.baseUrl}${id}/dates/`)
      .pipe(map(response => response.results));
  }

  public getDeadlines(id: number): Observable<Response> {
    return this.api
      .get(`${this.baseUrl}${id}/dates/`);
  }

  public getDetails(id: number): Observable<ICollege> {
    return this.api
      .get(`${this.baseUrl}${id}/`);
  }

  public getFilter(): Observable<Response> {
    return this.api
      .get(`/meta/institution`);
  }

  public getScattergram(id: number): Observable<any> {
    return this.api
      .get(`${this.baseUrl}${id}/scattergrams/`);
  }

  public getCustomLists(): Observable<any> {
    return this.api
      .get(`/custom_institutions_list/`)
      .pipe(map(data => {
        return data.results;
      }));
  }

  public getFollowed(): Observable<any> {
    return this.api
      .get(`/institution_tracker/`);
  }

  public getIdFromCollege(
    college: ICollegeTracker | ICollegeRecommendation | ICollege | any
  ) {
    // The institution can come in from institution, recommended, or saved and the id is in a different variable
    if (college) {
      if (college.institution && college.institution.id) {
        return college.institution.id;
      } else if (college.institution && isNumber(college.institution)) {
        return college.institution;
      } else {
        return college.id;
      }
    }
  }

  public getMatching(): void {
    this.isInitializing = true;
    this.getFollowed()
      .subscribe((saved: any[]) => {
        let query = `?`;
        saved.forEach(s => query += `id=${s.institution}&`);
        query += this.buildTestScoreQuery();
        const url = `/matches/${query.slice(0, -1)}`;
        this.api
          .get(url)
          .subscribe(
            response => {
              this._matching.next(response.results);
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

  public getMore(isNearby: boolean = false): void {
    if (!this.nextPage || this.nextPage === this.previousPage) {
      return;
    }
    this.api
      .get(this.nextPage, true)
      .subscribe(
        data => {
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
        async () => {
          const alert = await this.alertCtrl.create({
            buttons: [`Dismiss`],
            subHeader: `An error has occurred. Please try again.`,
            header: `Error`
          });
          return await alert.present();
        }
      );
  }

  public getNameFromCollege(college: any, shorten?: boolean, maxLength: number = 24): any {
    let name: string = college.name || college.institution_name || college.institution.name;
    if (shorten && name.length > maxLength) {
      if (name.indexOf(`University`) !== -1) {
        name = name.replace(`University`, `U`);
      } else if (name.indexOf(` College`) !== -1) {
        name = name.replace(` College`, ``);
      }
      if (name.length > maxLength) {
        name = name.replace(` Campus`, ``);
      }
    }
    return name;
  }

  public getNearbyQueryFromPosition(position: any) {
    const pos = position.coords;
    let query = `location=${pos.latitude.toFixed(2)},${pos.longitude.toFixed(2)}`;
    query += `&distance=50${COLLEGE_NON_PROFIT_QUERY}`;
    this.nearbyQuery = query;
    return query;
  }

  public getNextTierApplicationId(): Observable<number> {
    return this.api
      .get(`/group/`)
      .pipe(map(response => {
        const groups = response.results;
        let nextTierApplicationId: number;
        groups.forEach(group => {
          if (group.name === `NextTier Application`) {
            nextTierApplicationId = group.id;
          }
        });
        return nextTierApplicationId;
      }));
  }

  public getNotes(id: number, url?: string, isAbsoluteUrl?: boolean) {
    return this.api
      .get(url || `${this.baseUrl}${id}/note`, isAbsoluteUrl);
  }

  public getPremadeLists(): Observable<any[]> {
    return this.api
      .get(`/admin/tag/institution/`)
      .pipe(map(response => response.results));
  }

  public getRecs(): ICollege[] {
    return this.user.recommended_colleges;
  }

  public getSelected() {
    return this.selectedCollege;
  }

  public getTags(userId: number, collegeId: number) {
    return this.api
      .get(`/stakeholder/${userId}/tag/institution/${collegeId}`);
  }

  public initBookmarked(userId: number) {
    this.isInitializing = true;
    // this._bookmarked.next([]);
    this.api
      .get(`/stakeholder/${userId}/institution/tags/`)
      .pipe(map(response => response.results))
      .subscribe(
        (results: any[]) => {
          let bookmarkId;
          this.bookmarkTag = results.find(r => r.name === `bookmark`);
          if (this.bookmarkTag) {
            bookmarkId = this.bookmarkTag.id;
          }
          const allTags = results.filter(r => r.tag_type === `college`);
          this._allSchoolTags.next(allTags);
          let url = this.baseUrl;
          if (bookmarkId !== undefined) {
            url += `?tag=${bookmarkId}`;
            this.api
              .get(url)
              .subscribe(data => {
                this.count = data.count;
                this.previousPage = url;
                this.nextPage = data.next;
                this._bookmarked.next(data.results);
              });
          } else {
            this._bookmarked.next([]);
          }
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public initColleges(queryString: string = ``): void {
    this.isInitializing = true;
    // this.clearColleges();
    const url = this.baseUrl + queryString;
    this.api
      .get(url)
      .subscribe(
        data => {
          this.count = data.count;
          this.previousPage = url;
          this.nextPage = data.next;
          this.all = data.results;
          this.isInitializing = false;
        },
        async err => {
          console.error(err);
          const alert = await this.alertCtrl.create({
            buttons: [`Dismiss`],
            subHeader: `An error has occurred. Please try again.`,
            header: `Error`
          });
          this.isInitializing = false;
          return await alert.present();
        }
      );
  }

  public initTrackers(): void {
    this.isInitializing = true;
    // this._tracked.next([]);
    this.getFollowed()
      .subscribe(
        (trackers: any) => {
          this.nextPage = null;
          this._tracked.next(trackers);
          this.checkNextTierApplications(trackers);
          this.isInitializing = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public initNearby(queryString: string = ``) {
    this.isInitializing = true;
    let url = `/institutions?`;
    if (this.nearbyQuery && this.nearbyQuery.length) {
      url += this.nearbyQuery + queryString;
      this.getNearby(url);
    } else {
      this.location.position
        .subscribe(pos => {
          url += this.getNearbyQueryFromPosition(pos) + queryString;
          this.getNearby(url);
        });
    }
  }

  public initRecs(userId: number, isParent?: boolean): void {
    this.isInitializing = true;
    // this._recommendations.next([]);
    const url = isParent
      ? `/stakeholder/recommendation/institution/`
      : `/student/${userId}/recommendation?type=I`;
    this.api
      .get(url)
      .subscribe(
        (data) => {
          const recs = data.results;
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

  public initSaved(userId: number, isParent?: boolean) {
    if (isParent) {
      this.initBookmarked(userId);
    } else {
      this.initTrackers();
    }
  }

  public initList(queryString: string, isNearby: boolean) {
    if (isNearby) {
      if (!this._nearby.getValue() || !this._nearby.getValue().length) {
        this.initNearby(queryString);
      }
    } else {
      // if (!this.all || !this.all.length) {
      this.initColleges(queryString);
      // }
    }
  }

  public isFollowing(id: number): Observable<boolean> {
    return this.api.get(`/institution_tracker/`)
      .pipe(map(collegeTrackers => {
        return (
          collegeTrackers.findIndex((collegeTracker: any) => {
            return collegeTracker.college === id;
          }) >= 0
        );
      }));
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
      ? this._bookmarked.getValue()
      : this._tracked.getValue();
    let listMatch = null;
    if (list && list.length) {
      listMatch = list.find((c: any) => c[isParent ? `id` : `institution`] === id);
    }
    return listMatch !== undefined && listMatch !== null;
  }

  public removeBookmark(id: number) {
    const existing = this._bookmarked.getValue();
    this._bookmarked.next(existing.filter(school => school.id !== id));
  }

  public removeRec(id: number) {
    const existing = this._recommendations.getValue();
    this._recommendations.next(
      existing.filter(rec => rec.institution.id !== id)
    );
    this._recommendationsCount.next(this._recommendations.getValue().length);
  }

  public removeTracked(id: number) {
    const existing = this._tracked.getValue();
    this._tracked.next(
      existing.filter(tracker => tracker.institution !== id)
    );
  }

  public save(college: ICollege, user: any, appData?: any, isRec?: boolean) {
    if (user.isParent) {
      return this.tag(college.id, user.id, `bookmark`, college);
    } else {
      return this.follow(college.id, appData, isRec);
    }
  }

  public search(query: string, fullUrl: boolean = false): Observable<ICollege[]> {
    const url = fullUrl ? query : this.baseUrl + query;
    return this.api
      .get(url)
      .pipe(map(response => response.results));
  }

  public setBaseFilter(query: string) {
    if (query.substr(0, 1) === `&`) {
      query = `?${query.substr(1, query.length - 1)}`;
    }
    this.baseFilter = query;
    this.initColleges(query);
  }

  public setSelected(college: ICollege) {
    this.selectedCollege = college;
  }

  /*
   * If the full college is passed and the tag type is 'bookmark',
   * then the school will be added to the list of bookmarked schools.
   */
  public tag(id: number, userId: number, tag?: string, college?: ICollege) {
    const tagName = tag || `bookmark`;
    const data = {
      hideLoader: true,
      institution_id: id,
      tag_name: tagName
    };
    return this.api
      .post(`/stakeholder/${userId}/tag/institution/`, data)
      .pipe(map(result => {
        const bookmarked = this._bookmarked.value;
        bookmarked.push(college);
        this._bookmarked.next(bookmarked);
        return result;
      }));
  }

  public unbookmark(id: number, userId: number): Observable<any> {
    return this.untag(userId, +this.bookmarkTag.id, id)
      .pipe(map(() => { this.removeBookmark(id); }));
  }

  public unfollow(id: number): Observable<Response> {
    return this.api
      .delete(`/institution_tracker/${id}`)
      .pipe(map(response => {
        this.removeTracked(id);
        return response;
      }));
  }

  public unsave(id: number, isParent?: boolean): Observable<any> {
    if (isParent) {
      return this.unbookmark(id, this.user.id);
    } else {
      return this.unfollow(id);
    }
  }

  public untag(userId: number, tagId: number, id: number) {
    return this.api
      .delete(`/stakeholder/${userId}/tag/${tagId}/institution/${id}`);
  }

  public updateTracker(id: number, collegeData: any) {
    return this.api
      .patch(`/institution_tracker/${id}`, collegeData);
  }

  public updateList(list: any, id: number): Observable<any> {
    return this.api
      .patch(`/custom_institutions_list/${id}`, list);
  }

  public updateSelected(college: ICollege) {
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

  private getNearby(url: string) {
    this.api
      .get(url)
      .subscribe(
        (data: any) => {
          this.count = data.count;
          this.previousPage = url;
          this.nextPage = data.next;
          this._nearby.next(data.results);
          this.isInitializing = false;
        },
        async err => {
          console.error(err);
          const alert = await this.alertCtrl.create({
            buttons: [`Dismiss`],
            subHeader: `An error has occurred. Please try again.`,
            header: `Error`
          });
          this.isInitializing = false;
          return await alert.present();
        }
      );
  }

  private joinCollegeList(newColleges: ICollege[], isNearby: boolean = false) {
    const existingColleges = isNearby ? this._nearby.getValue() : this.all;
    existingColleges.push.apply(existingColleges, newColleges);
    const uniq = uniqBy(existingColleges, (college: any) => college.id);
    if (isNearby) {
      this._nearby.next(uniq);
    } else {
      this.all = uniq;
    }
  }
}
