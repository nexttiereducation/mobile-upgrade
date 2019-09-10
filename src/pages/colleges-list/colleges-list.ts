import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import {
  Content,
  IonicPage,
  ModalController,
  NavController,
  NavParams,
  Platform,
  ToastController
} from 'ionic-angular';
import { isNumber } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { SendComponent } from '@nte/components/send/send';
import { COLLEGE_NON_PROFIT_QUERY, EMPTY_STATES } from '@nte/constants/college.constants';
import { ICollegeRecommendation } from '@nte/models/college-recommendation.interface';
import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { IEmptyState } from '@nte/models/empty-state';
import { Filter } from '@nte/models/filter.model';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { ConnectionService } from '@nte/services/connection.service';
import { FilterService } from '@nte/services/filter.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { LocationService } from '@nte/services/location.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { CollegePage } from './../college/college';
import { FilterPage } from './../filter/filter';

@IonicPage({
  name: `colleges-list-page`
})
@Component({
  selector: `colleges-list`,
  templateUrl: `colleges-list.html`
})
export class CollegesListPage {
  @ViewChild(Content) public content: Content;

  public bgImageBounds: any = { top: 61, bottom: 33.19 };
  public colleges = [];
  public connections: any[];
  public emptyState: IEmptyState;
  public filtering: boolean;
  public isSavingIndex: number;
  public list: any;
  public listName: string;
  public nonProfitQuery = COLLEGE_NON_PROFIT_QUERY;
  public placeholders = [null, null, null];
  public searchControl: AbstractControl = new FormControl(``);
  public searchTerm: string = ``;

  private searchControlSub: Subscription;

  get colleges$() {
    if (this.list.serviceVariable && this.collegeService[this.list.serviceVariable]) {
      return this.collegeService[this.list.serviceVariable];
    } else {
      return this.collegeService.all$;
    }
  }

  get isNearby() {
    return this.list.name === `Near You` || this.listName === `Near You`;
  }

  get isRecd() {
    return this.list.name === `Recommended` || this.listName === `Recommended`;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(params: NavParams,
    public collegeService: CollegeService,
    public connectionService: ConnectionService,
    public filterService: FilterService,
    public keyboard: KeyboardService,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public platform: Platform,
    private listTileService: CollegeListTileService,
    private location: LocationService,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    this.connections = params.get(`connections`);
    this.filterService.filter = params.get(`filter`);
    if (params.get(`list`)) {
      this.list = params.get(`list`);
    } else {
      this.list = this.listTileService.activeList;
    }
  }

  ionViewDidEnter() {
    if (this.filtering) {
      this.updateCollegeList();
      this.filtering = false;
    }
  }

  ionViewDidLoad() {
    this.updateCollegeList();
    this.setupEmptyState();
  }

  ionViewWillUnload() {
    if (this.searchControlSub) {
      this.searchControlSub.unsubscribe();
    }
    if (!this.list.serviceVariable || this.list.serviceVariable === `all$`) {
      this.collegeService.all = null;
    }
  }

  public clearSearch(_event: Event) {
    this.searchTerm = ``;
    this.updateCollegeList();
  }

  public closeKeyboard(event: Event) {
    if (event) { event.stopPropagation(); }
    this.keyboard.close();
  }

  public followCollege(college: ICollege | ICollegeRecommendation | ICollegeTracker | any,
    fromToast?: boolean, id?: number) {
    const collegeId = id || this.collegeService.getIdFromCollege(college);
    const collegeName = this.getNameFromInstitution(college);
    const collegeInfo = { id: collegeId, name: collegeName };
    const isRec = this.list.name === `Recommended`;
    if (this.user.phase === `Senior`) {
      const isNewAdd = true;
      if (college && college.institution) {
        college = isNumber(college.institution) ? college : college.institution;
      }
      this.collegeService.getCollegeDetails(collegeId)
        .subscribe((collegeDetails) => {
          const applyModal = this.modalCtrl.create(
            ApplicationDatesComponent, {
              college: collegeDetails,
              isNewAdd,
              isRec
            });
          applyModal.present();
          applyModal.onDidDismiss((data, role) => {
            if (role === `follow`) {
              this.saveCollege(collegeInfo, fromToast, data, isRec);
            } else if (role === `skip`) {
              this.saveCollege(collegeInfo, fromToast, null, isRec);
            } else {
              this.resetSavingIndex();
            }
          });
        });
    } else {
      this.saveCollege(collegeInfo, fromToast, null, isRec);
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

  public infiniteScrollLoad(infiniteScroll: any) {
    if (!this.collegeService.nextPage) {
      infiniteScroll.enable(false);
      return;
    }
    const loadMoreSub: Subscription = this.collegeService.moreToScroll
      .subscribe((more) => {
        if (!more) {
          infiniteScroll.enable(false);
        }
        infiniteScroll.complete();
        loadMoreSub.unsubscribe();
      });
    this.collegeService.getMoreColleges(this.isNearby);
  }

  public isSaved(college: any) {
    return this.collegeService.isSaved(college.id)
      || this.collegeService.isSaved(college.institution);
  }

  public onFilterOpen(event: Event) {
    if (event) { event.stopPropagation(); }
    this.filtering = true;
    this.navCtrl.push(
      FilterPage,
      {
        cyol: false,
        filter: this.filterService.filter,
        listType: `Colleges`
      }
    );
  }

  public onSearch(event: Event) {
    if (event) { event.stopPropagation(); }
    this.mixpanel.event(`search_entered`, {
      'search term entered': this.searchTerm,
      'page': `Colleges`
    });
    this.updateCollegeList();
  }

  public openSendModal(college: any) {
    const collegeItem = this.getCollegeObj(college);
    const sendModal = this.modalCtrl.create(
      SendComponent,
      {
        item: collegeItem,
        type: `College`
      },
      {
        cssClass: `smallModal`,
        enableBackdropDismiss: true,
        showBackdrop: false
      }
    );
    sendModal.present();
  }

  public removeRec(rec: ICollegeRecommendation) {
    this.collegeService.declineRecommendation(rec)
      .subscribe(() => {
        const mixpanelData = { institution_id: rec.institution.id, institution_name: rec.institution.name };
        this.mixpanel.event(`recommended_school_rejected`, mixpanelData);
        const toast = this.buildToast(``, `toast-red`, 5000, `Recommendation Removed!`, false);
        toast.present();
      });
  }

  public resetSavingIndex() {
    this.isSavingIndex = undefined;
  }

  public saveCollege(college: any, fromToast?: boolean, applicationData?: any, isRec?: boolean) {
    this.collegeService.save(college, this.user, applicationData, isRec)
      .subscribe(
        () => {
          this.resetSavingIndex();
          const mixpanelData = { institution_id: college.id, institution_name: college.name };
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
          if (fromToast) { return; }
          const toastMessage = isRec ? `Recommendation Saved!` : `Saved!`;
          const showCloseButton = !isRec;
          const toast = this.buildToast(`UNDO`, `toast-green`, 5000, toastMessage, showCloseButton);
          toast.present();
          toast.onDidDismiss((_data, role) => {
            if (this.list.name !== `Recommended` && role === `close`) {
              this.unsaveCollege(college, true, college.id);
            }
          });
        },
        (error) => {
          this.resetSavingIndex();
          console.error(error);
        }
      );
  }

  public setSavingIndex(savingIndex: number) {
    this.isSavingIndex = savingIndex;
  }

  public unsaveCollege(college: ICollege | ICollegeTracker, fromToast?: boolean, id?: number) {
    const collegeId = id ? id : this.collegeService.getIdFromCollege(college);
    this.collegeService.unsave(collegeId, this.user.isParent).subscribe(
      () => {
        this.stakeholderService.updateStakeholder();
        this.mixpanel.event(`school_removed`, { institution_id: collegeId });
        if (fromToast || this.list.name === `Recommended`) { return; }
        const toast = this.buildToast(`UNDO`, `toast-red`, 5000, `College Removed`);
        toast.present();
        toast.onDidDismiss((_data, role) => {
          if (role === `close`) { this.followCollege(college, true, collegeId); }
        });
      },
      (err) => console.error(err)
    );
  }

  public viewCollege(college: any) {
    const id = this.collegeService.getIdFromCollege(college);
    this.navCtrl.push(
      CollegePage,
      {
        college,
        id,
        isRecd: this.collegeService.isRecd(id) || this.isRecd,
        isSaved: this.collegeService.isSaved(id)
      }
    );
  }

  /* PRIVATE METHODS */

  private buildToast(buttonText: string, cssClass: string, duration: number, message: string,
    showCloseButton: boolean = true) {
    return this.toastCtrl.create({
      closeButtonText: buttonText,
      cssClass,
      duration,
      message,
      position: `bottom`,
      showCloseButton
    });
  }

  private getCollegeObj(college: any) {
    if (college.institution && !isNumber(college.institution)) {
      return college.institution;
    } else {
      return college;
    }
  }

  // private getConnections() {
  //   if (this.user.isParent && !this.user.students) {
  //     const studentSub = this.stakeholderService.getStudentsForParent()
  //       .subscribe(
  //         (data) => {
  //           this.user.students = data;
  //           studentSub.unsubscribe();
  //         }
  //       );
  //   }
  // }

  private getLocation() {
    const posSub = this.location.position.subscribe(
      (pos) => {
        if (pos) {
          this.location.distance = 30;
          this.location.showPosition(pos);
          this.filterService.filter = new Filter(
            this.filterService.filter.categories,
            this.collegeService.getNearbyQueryFromPosition(pos)
          );
          this.collegeService.initializeNearbyColleges();
          posSub.unsubscribe();
        }
      }
    );
    this.location.checkIfLocationAuthorized();
  }

  private getNameFromInstitution(college: any) {
    return college.institution ? college.institution.name : college.name;
  }

  private setupEmptyState() {
    const listName = this.list ? this.list.name : `Search All`;
    const listEmptyState = EMPTY_STATES[listName];
    const userType = this.user.stakeholder_type;
    if (listEmptyState) {
      this.emptyState = listEmptyState[userType] ? listEmptyState[userType] : listEmptyState;
    } else {
      this.emptyState = EMPTY_STATES.Default;
    }
    if (this.emptyState) {
      this.emptyState.imagePath = this.list.iconUrl;
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
    this.collegeService.initList(query, this.isNearby);
    if (this.isNearby) {
      this.getLocation();
    }
  }
}
