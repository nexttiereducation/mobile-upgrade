import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { IonInfiniteScroll, ModalController, Platform, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { isNumber } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { SendComponent } from '@nte/components/send/send';
import { COLLEGE_NON_PROFIT_QUERY, COLLEGES_EMPTY_STATES } from '@nte/constants/college.constants';
import { ICollegeRecommendation } from '@nte/interfaces/college-recommendation.interface';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { Filter } from '@nte/models/filter.model';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { CollegesService } from '@nte/services/colleges.service';
import { ConnectionService } from '@nte/services/connection.service';
import { FilterService } from '@nte/services/filter.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { LocationService } from '@nte/services/location.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

const { Toast } = Plugins;

@Component({
  selector: `colleges-list`,
  templateUrl: `colleges-list.html`,
  styleUrls: [`colleges-list.scss`]
})
export class CollegesListPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public bgImageBounds: any = { top: 61, bottom: 33.19 };
  public colleges: any[] = [];
  public connections: any[];
  public emptyState: IEmptyState;
  public filtering: boolean;
  public isSavingIndex: number;
  public list: any;
  public listName: string;
  public nonProfitQuery: string = COLLEGE_NON_PROFIT_QUERY;
  public placeholders: any[] = [null, null, null];
  public searchControl: AbstractControl = new FormControl(``);
  public searchTerm: string;

  private ngUnsubscribe: Subject<any> = new Subject();

  get colleges$() {
    return this.collegesService[this.list.serviceVariable];
  }

  get isNearby() {
    return this.listNameVal === `Near You`;
  }

  get isRecd() {
    return this.listNameVal === `Recommended`;
  }

  get listNameVal() {
    return this.list && this.list.name ? this.list.name : this.listName || '';
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public collegeService: CollegeService,
    public collegesService: CollegesService,
    public connectionService: ConnectionService,
    public filterService: FilterService,
    public keyboard: KeyboardService,
    public modalCtrl: ModalController,
    public platform: Platform,
    public route: ActivatedRoute,
    public router: Router,
    private listTileService: CollegeListTileService,
    private location: LocationService,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.connections = params.connections || null;
    this.filterService.filter = params.filter || null;
    this.list = params.list || this.listTileService.activeList || null;
  }

  ngOnInit() {
    // this.setupEmptyState();
    if (this.listName === 'Saved' && this.user.isStudent) {
      this.collegesService.tracked = this.user.institution_trackers;
    } else {
      this.updateCollegeList();
    }
    if (this.filtering) {
      this.filtering = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public clearSearch(_event: Event) {
    this.searchTerm = ``;
    this.updateCollegeList();
  }

  public closeKeyboard(event: Event) {
    if (event) { event.stopPropagation(); }
    // this.keyboard.close();
  }

  public followCollege(college: ICollege | ICollegeRecommendation | ICollegeTracker | any,
    fromToast?: boolean, id?: number) {
    const collegeId = id || this.collegesService.getIdFromCollege(college);
    const collegeName = this.collegesService.getNameFromCollege(college);
    const isRec = this.list.name === `Recommended`;
    const collegeInfo = {
      fromToast,
      id: collegeId,
      isRec,
      name: collegeName
    };
    if (this.user.phase === `Senior`) {
      const isNewAdd = true;
      if (college && college.institution) {
        college = isNumber(college.institution) ? college : college.institution;
      }
      this.collegesService.getDetails(collegeId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(details => this.openApplyModal(details, collegeInfo));
    } else {
      this.saveCollege(collegeInfo, fromToast, null, isRec);
    }
  }

  public getCollegeObj(college: any) {
    if (college.institution && !isNumber(college.institution)) {
      return college.institution;
    } else {
      return college;
    }
  }

  public getId(college: ICollege | ICollegeRecommendation | ICollegeTracker | any) {
    return this.getCollegeObj(college).id;
  }

  public getLogo(college: any) {
    if (college.photo_url && college.photo_url.length > 0) {
      return college.photo_url;
    } else if (college.institution && college.institution.photo_url) {
      return college.institution.photo_url;
    } else {
      return null;
    }
  }

  public goBack() {
    this.router.navigateByUrl(`app/colleges`);
  }

  public infiniteScrollLoad(infiniteScroll: IonInfiniteScroll) {
    if (!this.collegesService.nextPage) {
      infiniteScroll.complete();
      // infiniteScroll.disabled = true;
      return;
    }
    this.collegesService.moreToScroll
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((more) => {
        if (!more) {
          infiniteScroll.complete();
        }

      });
    this.collegesService.getMore(this.isNearby);
  }

  public isSaved(college: any) {
    return this.collegesService.isSaved(college.id)
      || this.collegesService.isSaved(college.institution);
  }

  public onFilterOpen(event: Event) {
    this.filtering = true;
    this.router.navigate(
      [`filter`],
      {
        relativeTo: this.route,
        state: {
          cyol: false,
          filter: this.filterService.filter,
          listType: `Colleges`
        }
      }
    );
  }

  public async openApplyModal(details: any, data: any) {
    const applyModal = await this.modalCtrl.create({
      component: ApplicationDatesComponent,
      componentProps: {
        college: details,
        isNewAdd: data.isNewAdd,
        isRec: data.isRec
      }
    });
    applyModal.onDidDismiss()
      .then((detail: OverlayEventDetail) => {
        if (detail.role === `follow`) {
          this.saveCollege(data, data.fromToast, detail.data, data.isRec);
        } else if (detail.role === `skip`) {
          this.saveCollege(data, data.fromToast, null, data.isRec);
        } else {
          this.resetSavingIndex();
        }
      });
    return await applyModal.present();
  }

  public async openRemoveRecToast() {
    await Toast.show({
      text: `Recommendation declined.`
    });
  }

  public async openSaveToast(college: any, isRec: boolean) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          if (this.list.name !== `Recommended`) {
            this.unsaveCollege(college, true, college.id);
          }
        },
        text: `Undo`
      }],
      message: isRec ? `Recommendation Saved!` : `Saved!`
    });
    toast.present();
  }

  public async openSendModal(college: any) {
    const collegeItem = this.getCollegeObj(college);
    const sendModal = await this.modalCtrl.create({
      backdropDismiss: true,
      component: SendComponent,
      componentProps: {
        item: collegeItem,
        type: `College`
      },
      cssClass: `smallModal`,
      showBackdrop: false
    });
    return await sendModal.present();
  }

  public async openUnsaveToast(college: any, id: number, name: string) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.followCollege(college, true, id),
        text: `Undo`
      }],
      message: `${name} removed from Saved.`
    });
    toast.present();
  }

  public removeRec(rec: ICollegeRecommendation) {
    this.collegesService.declineRec(rec)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.mixpanel.event(`recommended_school_rejected`, {
          institution_id: rec.institution.id,
          institution_name: rec.institution.name
        });
        this.openRemoveRecToast();
      });
  }

  public resetSavingIndex() {
    this.isSavingIndex = undefined;
  }

  public saveCollege(college: any, fromToast?: boolean, applicationData?: any, isRec?: boolean) {
    this.collegesService.save(college, this.user, applicationData, isRec)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.resetSavingIndex();
          const mixpanelData = {
            institution_id: college.id,
            institution_name: college.name
          };
          if (!this.user.isParent) {
            this.stakeholderService.updateStakeholder();
            if (isRec) {
              this.mixpanel.event(`recommended_school_added`, mixpanelData);
            }
            if (this.list.name === `Matching`) {
              this.mixpanel.event(`matching_school_added`, mixpanelData);
            }
          }
          this.mixpanel.event(`school_added`, mixpanelData);
          if (!fromToast) {
            this.openSaveToast(college, isRec);
          }
        },
        (error) => {
          this.resetSavingIndex();
          console.error(error);
        }
      );
  }

  public search(event: any) {
    if (event) {
      this.searchTerm = event.detail.value;
      this.mixpanel.event(`search_entered`, {
        'search term entered': this.searchTerm,
        page: `Colleges`
      });
      this.updateCollegeList();
    }
  }

  public setSavingIndex(savingIndex: number) {
    this.isSavingIndex = savingIndex;
  }

  public unsaveCollege(college: ICollege | ICollegeTracker, fromToast?: boolean, id?: number) {
    const collegeId = id ? id : this.collegesService.getIdFromCollege(college);
    const collegeName = this.collegesService.getNameFromCollege(college);
    this.collegesService.unsave(collegeId, this.user.isParent)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.stakeholderService.updateStakeholder();
          this.mixpanel.event(`school_removed`,
            { institution_id: collegeId }
          );
          if (!fromToast && this.list.name !== `Recommended`) {
            this.openUnsaveToast(college, collegeId, collegeName);
          }
        },
        (err) => console.error(err)
      );
  }

  public viewCollege(college: any) {
    this.collegeService.active = college;
    const id = this.collegesService.getIdFromCollege(college);
    this.router.navigate(
      [
        `college`,
        id
      ],
      {
        relativeTo: this.route,
        state: {
          college,
          id,
          isRecd: this.collegesService.isRecd(id) || this.isRecd,
          isSaved: this.collegesService.isSaved(id)
        }
      }
    );
  }

  /* PRIVATE METHODS */

  private getLocation() {
    this.location.position
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (pos) => {
          if (pos) {
            this.location.distance = 30;
            this.location.showPosition(pos);
            this.filterService.filter = new Filter(
              this.filterService.filter.categories,
              this.collegesService.getNearbyQueryFromPosition(pos)
            );
          }
        }
      );
    this.location.checkIfLocationAuthorized();
  }

  private setupEmptyState() {
    const listName = this.list ? this.list.name : `Search All`;
    const listEmptyState = COLLEGES_EMPTY_STATES[listName];
    const userType = this.user.stakeholder_type;
    if (listEmptyState) {
      this.emptyState = listEmptyState[userType] ? listEmptyState[userType] : listEmptyState;
    } else {
      this.emptyState = COLLEGES_EMPTY_STATES.Default;
    }
    if (this.emptyState) {
      this.emptyState.imagePath = this.list ? this.list.iconUrl : null;
      this.emptyState.isAbsoluteUrl = true;
    }
  }

  private updateCollegeList(query: string = ``) {
    if (this.filterService.filter) {
      query = this.filterService.filter.updateQuery();
    }
    if (this.searchTerm && this.searchTerm !== ``) {
      query += `&search=${this.searchTerm}`;
    }
    query = this.filterService.trimQuery(query);
    this.collegesService.initList(query, this.isNearby);
    if (this.isNearby) {
      this.getLocation();
    }
  }
}
