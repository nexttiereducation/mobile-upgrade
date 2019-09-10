import { Component } from '@angular/core';
import { IonicPage, ModalController, NavParams, ToastController } from '@ionic/angular';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { ICollegeRecommendation } from '@nte/models/college-recommendation.interface';
import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { CollegeAcademicPage } from './../../pages/college-academic/college-academic';
import { CollegeApplicationPage } from './../../pages/college-application/college-application';
import { CollegeCampusPage } from './../../pages/college-campus/college-campus';
import { CollegeFinancialPage } from './../../pages/college-financial/college-financial';
import { CollegeGeneralPage } from './../../pages/college-general/college-general';
import { CollegeService } from '@nte/services/college.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@IonicPage({
  name: `college-page`
})
@Component({
  selector: `college`,
  templateUrl: `college.html`
})
export class CollegePage {
  public activeCollegeId: number;
  public college: ICollege;
  public isChanging: boolean;
  public isRecd: boolean;
  public isSaved: boolean;
  public recommender: any;
  public selectedIndex: number = 0;
  public tabs: any[] = [
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

  get id() {
    return this.collegeService.getIdFromCollege(this.college) || this.activeCollegeId;
  }

  get savedStatus() {
    if (this.user.institution_trackers) {
      return this.user.institution_trackers.filter(col => col.institution === this.activeCollegeId).length > 0;
    } else {
      return null;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(private collegeService: CollegeService,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    this.activeCollegeId = +this.navParams.get(`id`);
    this.college = this.navParams.get(`college`);
    this.isRecd = this.navParams.get(`isRecd`);
    this.isSaved = this.navParams.get(`isSaved`) || this.savedStatus;
  }

  ionViewDidLoad() {
    if (this.college) {
      this.init();
    }
    if (this.isRecd) {
      this.collegeService.recommendations$
        .subscribe((recs: ICollegeRecommendation[]) => {
          if (this.collegeService.recommendations$ && this.collegeService.recommendations.length) {
            const rec = recs.find(
              c => c.id === this.activeCollegeId || c.id === (this.activeCollegeId + 1)
            );
            if (rec) {
              this.college = rec.institution;
              this.recommender = rec.recommender;
              this.activeCollegeId = rec.institution.id;
              this.init();
            }
          }
        });
      if (!this.college) {
        this.collegeService.initializeRecommendations(this.user.id);
      }
    }
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
    const collegeInfo = { id: this.id, name: this.college.name };
    const isRec = this.collegeService.isRecd(this.id);
    if (this.user.phase === `Senior`) {
      const isNewAdd = true;
      if (college) {
        college = college.institution ? college.institution : college;
      }
      this.collegeService.getCollegeDetails(this.id)
        .subscribe((collegeDetails) => {
          const applyModal = this.modalCtrl.create(
            ApplicationDatesComponent,
            {
              college: collegeDetails,
              isNewAdd,
              isRec
            }
          );
          applyModal.present();
          applyModal.onDidDismiss((data, role) => {
            switch (role) {
              case `follow`:
                this.save(collegeInfo, fromToast, data, isRec);
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
        });
    } else {
      this.save(collegeInfo, fromToast, null, isRec);
    }
  }

  private getCollegeDetails(id: number) {
    const sub = this.collegeService.getCollegeDetails(id)
      .subscribe((college) => {
        this.collegeService.setCollege(college);
        this.college = college;
        if (!this.activeCollegeId) {
          this.activeCollegeId = this.collegeService.getIdFromCollege(this.college);
        }
        // mixpanel
        // const mixpanelData = { 'institution_name': institution.name };
        // this.mixpanel.event('details_scrolled', mixpanelData);
        sub.unsubscribe();
      });
  }

  private init() {
    this.getCollegeDetails(this.activeCollegeId);
    this.mixpanel.event(`navigated_to-College-Detail`, { institution_name: this.college.name });
  }

  private save(college: any, fromToast?: boolean, applicationData?: any, isRec?: boolean) {
    this.collegeService.save(college, this.user, applicationData, isRec)
      .subscribe(
        (collegeTracker) => {
          this.isChanging = false;
          this.isSaved = true;
          const mixpanelData = { institution_id: collegeTracker.id, institution_name: collegeTracker.name };
          if (!this.user.isParent) {
            this.stakeholderService.updateStakeholder();
            if (isRec) {
              this.mixpanel.event(`recommended_school_added`, mixpanelData);
            }
          }
          this.mixpanel.event(`school_added`, mixpanelData);
          if (fromToast) { return; }
          const toastMessage = isRec ? `Recommendation Saved!` : `Saved!`;
          const toast = this.toastCtrl.create({
            closeButtonText: `Undo`,
            duration: 3000,
            message: toastMessage,
            position: `bottom`,
            showCloseButton: !isRec
          });
          toast.present();
          toast.onDidDismiss((_data, role) => {
            if (role === `close`) {
              this.unsave(college, true, college.id);
            }
          });
        },
        (err) => console.error(err)
      );
  }

  private unsave(college: ICollege | ICollegeTracker, fromToast?: boolean, _id?: number) {
    this.collegeService.unsave(this.id, this.user.isParent).subscribe(
      () => {
        this.isChanging = false;
        this.isSaved = false;
        this.stakeholderService.updateStakeholder();
        this.mixpanel.event(`school_removed`, { institution_id: this.activeCollegeId });
        if (fromToast) { return; }
        const isRec = this.collegeService.isRecd(this.id);
        const toast = this.toastCtrl.create({
          closeButtonText: `Undo`,
          duration: 3000,
          message: `College Removed`,
          position: `bottom`,
          showCloseButton: !isRec
        });
        toast.present();
        toast.onDidDismiss((_data, role) => {
          if (role === `close`) {
            this.follow(college, true, this.id);
          }
        });
      },
      (err) => console.error(err)
    );
  }
}
