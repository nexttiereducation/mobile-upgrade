import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabs, ModalController, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { CollegeAcademicComponent } from '@nte/components/college-details/academic/college-academic';
import { CollegeApplicationComponent } from '@nte/components/college-details/application/college-application';
import { CollegeCampusComponent } from '@nte/components/college-details/campus/college-campus';
import { CollegeFinancialComponent } from '@nte/components/college-details/financial/college-financial';
import { CollegeGeneralComponent } from '@nte/components/college-details/general/college-general';
import { ICollegeRecommendation } from '@nte/interfaces/college-recommendation.interface';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { CollegeService } from '@nte/services/college.service';
import { CollegesService } from '@nte/services/colleges.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `college`,
  templateUrl: `college.html`,
  styleUrls: [`college.scss`],
  encapsulation: ViewEncapsulation.None
})
export class CollegePage implements OnInit, OnDestroy {
  @ViewChild(`collegeTabs`, { static: false }) tabs: IonTabs;

  public activeCollegeId: number;
  public isChanging: boolean;
  public isRecd: boolean;
  public isSaved: boolean;
  public recommender: any;
  public selectedIndex: number = 0;
  public tabDetails: any[] = [
    {
      icon: `information-circle`,
      page: CollegeGeneralComponent
    },
    {
      icon: `school`,
      page: CollegeAcademicComponent
    },
    {
      icon: `nt-scholarships`,
      page: CollegeFinancialComponent
    },
    {
      icon: `nt-colleges`,
      page: CollegeCampusComponent
    },
    {
      icon: `document`,
      page: CollegeApplicationComponent
    }
  ];
  public title: string;

  private _activeView: BehaviorSubject<string> = new BehaviorSubject<string>('general');
  private ngUnsubscribe: Subject<any> = new Subject();

  get activeView() {
    return this._activeView.getValue();
  }
  set activeView(view: string) {
    this._activeView.next(view);
  }
  get activeView$() {
    return this._activeView.asObservable();
  }

  get college() {
    if (this.collegeService.active) {
      return this.collegeService.active;
    }
  }
  get college$() {
    if (this.collegeService.active$) {
      return this.collegeService.active$;
    }
  }

  get collegeUrl() {
    if (this.id) {
      return `app/colleges/${this.id}`;
    }
  }

  get id() {
    return this.collegesService.getIdFromCollege(this.college) || this.activeCollegeId;
  }

  get savedStatus() {
    if (this.user.institution_trackers) {
      return this.user.institution_trackers.filter(c => c.institution === this.activeCollegeId).length > 0;
    } else {
      return null;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(private collegeService: CollegeService,
    private collegesService: CollegesService,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.activeCollegeId = params.id;
    this.isRecd = params.isRecd;
    this.isSaved = params.isSaved || this.savedStatus;
  }

  ngOnInit() {
    if (this.isRecd) {
      this.collegesService.recommendations$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((recs: ICollegeRecommendation[]) => {
          if (this.collegesService.recommendations && this.collegesService.recommendations.length) {
            const rec = recs.find(
              c => c.id === this.activeCollegeId || c.id === (this.activeCollegeId + 1)
            );
            if (rec) {
              this.collegeService.active = rec.institution;
              this.recommender = rec.recommender;
              this.getCollegeDetails(rec.institution.id);
            }
          }
        });
      if (!this.college) {
        this.collegesService.initRecs(this.user.id);
      }
    } else {
      this.init();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public switchView(ev: any) {
    this.activeView = ev.detail.value;
  }

  public toggleSaved() {
    this.isChanging = true;
    if (this.isSaved) {
      this.unsave(this.college);
    } else {
      this.follow(this.college);
    }
  }

  private follow(college: ICollege | ICollegeRecommendation | ICollegeTracker | any,
    fromToast?: boolean, _collegeId?: number) {
    const collegeInfo = {
      id: this.id,
      name: this.college.name
    };
    const isRec = this.collegesService.isRecd(this.id);
    if (this.user.phase === `Senior`) {
      const isNewAdd = true;
      if (college) {
        college = college.institution ? college.institution : college;
      }
      this.collegesService.getDetails(this.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (collegeDetails) => {
          const applyModal = await this.modalCtrl.create({
            component: ApplicationDatesComponent,
            componentProps: {
              college: collegeDetails,
              isNewAdd,
              isRec
            }
          });
          // TODO: Fix this
          applyModal.onDidDismiss()
            .then((detail: OverlayEventDetail) => {
              switch (detail.role) {
                case `follow`:
                  this.save(collegeInfo, fromToast, detail.data, isRec);
                  break;
                case `skip`:
                  this.save(collegeInfo, fromToast, null, isRec);
                  break;
                case `no-deadlines`:
                  this.isChanging = false;
                  break;
                default:
                  break;
              }
            });
          return await applyModal.present();
        });
    } else {
      this.save(collegeInfo, fromToast, null, isRec);
    }
  }

  private getCollegeDetails(id: number) {
    this.collegesService.getDetails(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((college) => {
        this.collegeService.active = college;
        this.activeCollegeId = this.collegesService.getIdFromCollege(this.college);
        // mixpanel
        // const mixpanelData = { 'institution_name': institution.name };
        // this.mixpanel.event('details_scrolled', mixpanelData);
      });
  }

  private init() {
    if (this.college) {
      this.getCollegeDetails(this.id);
    } else {
      const id = this.activeCollegeId || +this.route.snapshot.paramMap.get('id');
      this.getCollegeDetails(id);
    }
    this.mixpanel.event(`navigated_to-College-Detail`,
      { institution_name: this.college.name }
    );
  }

  private async openSaveModal(college: any, isRec: boolean) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.unsave(college, true, college.id),
        text: `Undo`
      }],
      duration: 3000,
      message: isRec ? `Recommendation Saved!` : `Saved!`,
      position: `bottom`
    });
    toast.present();
  }

  private async openUnsaveModal(college: any) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          if (!this.isRecd) {
            this.follow(college, true, this.id);
          }
        },
        text: `Undo`
      }],
      duration: 3000,
      message: `College Removed`,
      position: `bottom`
    });
    toast.present();
  }

  private save(college: any, fromToast?: boolean, applicationData?: any, isRec?: boolean) {
    this.collegesService.save(college, this.user, applicationData, isRec)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (collegeTracker) => {
          this.isChanging = false;
          this.isSaved = true;
          const mixpanelData = {
            institution_id: collegeTracker.id,
            institution_name: collegeTracker.name
          };
          if (!this.user.isParent) {
            this.stakeholderService.updateStakeholder();
            if (isRec) {
              this.mixpanel.event(`recommended_school_added`, mixpanelData);
            }
          }
          this.mixpanel.event(`school_added`, mixpanelData);
          if (!fromToast) {
            this.openSaveModal(college, isRec);
          }
        },
        err => console.error(err)
      );
  }

  private unsave(college: ICollege | ICollegeTracker, fromToast?: boolean, _id?: number) {
    this.collegesService.unsave(this.id, this.user.isParent)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.isChanging = false;
          this.isSaved = false;
          this.stakeholderService.updateStakeholder();
          this.mixpanel.event(
            `school_removed`,
            { institution_id: this.activeCollegeId }
          );
          if (!fromToast) {
            this.openUnsaveModal(college);
          }
        },
        err => console.error(err)
      );
  }
}
