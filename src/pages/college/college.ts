import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonTabs, ModalController, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { ICollegeRecommendation } from '@nte/interfaces/college-recommendation.interface';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { CollegeAcademicPage } from '@nte/pages/college-academic/college-academic';
import { CollegeApplicationPage } from '@nte/pages/college-application/college-application';
import { CollegeCampusPage } from '@nte/pages/college-campus/college-campus';
import { CollegeFinancialPage } from '@nte/pages/college-financial/college-financial';
import { CollegeGeneralPage } from '@nte/pages/college-general/college-general';
import { CollegeTabsService } from '@nte/services/college-tabs.service';
import { CollegeService } from '@nte/services/college.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `college`,
  templateUrl: `college.html`,
  styleUrls: [`college.scss`]
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
      page: CollegeGeneralPage
    },
    {
      icon: `school`,
      page: CollegeAcademicPage
    },
    {
      icon: `nt-scholarships`,
      page: CollegeFinancialPage
    },
    {
      icon: `nt-colleges`,
      page: CollegeCampusPage
    },
    {
      icon: `document`,
      page: CollegeApplicationPage
    }
  ];
  public title: string;

  private ngUnsubscribe: Subject<any> = new Subject();

  get college() {
    return this.collegeTabsService.activeCollege;
  }

  get id() {
    return this.collegeService.getIdFromCollege(this.college) || this.activeCollegeId;
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
    private collegeTabsService: CollegeTabsService,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.activeCollegeId = params.id;
    this.isRecd = params.isRecd;
    this.isSaved = params.isSaved || this.savedStatus;
  }

  ngOnInit() {
    if (this.college) {
      if (!this.activeCollegeId) {
        this.activeCollegeId = this.college.id;
      }
      this.init();
    } else {
      if (this.collegeTabsService.activeCollege) {
        this.activeCollegeId = this.college.id;
        this.init();
      } else {
        this.activeCollegeId = +this.route.snapshot.paramMap.get('id');
        this.init();
      }
    }
    if (this.isRecd) {
      this.collegeService.recommendations$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((recs: ICollegeRecommendation[]) => {
          if (this.collegeService.recommendations$ && this.collegeService.recommendations.length) {
            const rec = recs.find(
              c => c.id === this.activeCollegeId || c.id === (this.activeCollegeId + 1)
            );
            if (rec) {
              this.collegeTabsService.activeCollege = rec.institution;
              this.recommender = rec.recommender;
              this.activeCollegeId = rec.institution.id;
              this.init();
            }
          }
        });
      if (!this.college) {
        this.collegeService.initRecs(this.user.id);
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    const isRec = this.collegeService.isRecd(this.id);
    if (this.user.phase === `Senior`) {
      const isNewAdd = true;
      if (college) {
        college = college.institution ? college.institution : college;
      }
      this.collegeService.getDetails(this.id)
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
    this.collegeService.getDetails(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((college) => {
        this.collegeTabsService.activeCollege = college;
        this.collegeService.setSelected(college);
        if (!this.activeCollegeId) {
          this.activeCollegeId = this.collegeService.getIdFromCollege(this.college);
        }
        // mixpanel
        // const mixpanelData = { 'institution_name': institution.name };
        // this.mixpanel.event('details_scrolled', mixpanelData);
      });
  }

  private init() {
    this.getCollegeDetails(this.activeCollegeId);
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
    const isRec = this.collegeService.isRecd(this.id);
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          if (!isRec) {
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
    this.collegeService.save(college, this.user, applicationData, isRec)
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
    this.collegeService.unsave(this.id, this.user.isParent)
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
