import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IApplicationDate } from '@nte/interfaces/application-date.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { CollegesService } from '@nte/services/colleges.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `application-dates`,
  templateUrl: `application-dates.html`,
  styleUrls: [`application-dates.scss`]
})
export class ApplicationDatesComponent implements OnInit, OnDestroy {
  public admissionTypeInfo = {};
  public applicationDates: IApplicationDate[];
  public applicationMethod: string;
  public college: ICollege;
  public groupMethod: number;
  public isBlocking: boolean;
  public isNewAdd: boolean;
  public isRec: boolean;
  public isSaving: boolean;
  public saveSchoolSubject: Subject<any>;
  public selectedDate: IApplicationDate;
  public skipFields: boolean = false;

  private ngUnsubscribe: Subject<any> = new Subject();

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(private collegeService: CollegesService,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private stakeholderService: StakeholderService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.college = params.college;
    this.isNewAdd = params.isNewAdd;
    this.isRec = params.isRec;
    this.saveSchoolSubject = params.saveSchoolSubject;
  }

  ngOnInit() {
    this.getDates();
    this.getAdmissionTypeInfo();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public addWithoutDates() {
    this.skipFields = true;
    this.modalCtrl.dismiss(null, `skip`);
  }

  public applicationMethodChange(value: string | number) {
    if (typeof value === `number`) {
      this.applicationMethod = `G`;
      this.groupMethod = +value;
    } else {
      this.applicationMethod = value.toString();
      this.groupMethod = null;
    }
  }

  public closeModal() {
    if (this.user.isSenior && !this.applicationDates.length) {
      this.closeNoDeadlines();
    } else {
      this.addWithoutDates();
    }
  }

  public closeNoDeadlines() {
    this.modalCtrl.dismiss(null, `no-deadlines`);
  }

  public generateArray(obj) {
    return Object.keys(obj).map(key => obj[key]);
  }

  public getAdmissionTypeInfo() {
    this.collegeService.getAdmissionTypeInfo()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data: any) => {
          if (!data) { return; }
          this.admissionTypeInfo = {
            'Early Action': {
              details: data.earlyAction,
              showDetails: false
            },
            'Early Action 2': {
              details: data.earlyAction,
              showDetails: false
            },
            'Early Decision': {
              details: data.earlyDecision,
              showDetails: false
            },
            'Early Decision 2': {
              details: data.earlyDecision,
              showDetails: false
            },
            'Priority Decision': {
              details: data.priorityDecision,
              showDetails: false
            },
            'Priority Decision 2': {
              details: data.priorityDecision,
              showDetails: false
            },
            'Regular Decision': {
              details: data.regularDecision,
              showDetails: false
            },
            'Regular Decision 2': {
              details: data.regularDecision,
              showDetails: false
            },
            Rolling: {
              details: data.rolling,
              showDetails: false
            }
          };
          this.parseDetails();
        },
        err => console.error(err)
      );
  }

  public parseDetails() {
    const regex = /<br>/g;
    const admissionTypes = this.generateArray(this.admissionTypeInfo);
    admissionTypes.forEach((type) => {
      if (type.details) {
        type.details = type.details.replace(regex, ``);
      }
    });
  }

  public save() {
    const completed = (this.selectedDate && this.applicationMethod.length > 0);
    if (this.isNewAdd) {
      this.followSchool(completed);
      if (completed) {
        const mixpanelDecisionData = {
          application_method: this.applicationMethod,
          decision_type: this.selectedDate.application_type,
          group_application_id: this.groupMethod,
          school_name: this.college.name
        };
        this.mixpanel.event(`decision_type_set`, mixpanelDecisionData);
      }
    } else {
      this.updateDates();
    }
  }

  private fieldsAreValidated() {
    if ((!this.selectedDate || !this.applicationMethod) && !this.skipFields) {
      return false;
    }
    return true;
  }

  private followSchool(completed?: boolean) {
    if (completed && !this.fieldsAreValidated()) { return; }
    const applicationType = completed ? this.selectedDate.application_type : null;
    const data = {
      application_group: this.groupMethod,
      application_method: this.applicationMethod,
      application_type: applicationType
    };
    this.modalCtrl.dismiss(data, `follow`);
  }

  private getDates() {
    this.collegeService.getAppDates(this.college.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (dates) => {
          this.applicationDates = dates || [];
          if (dates.length === 1) {
            this.selectedDate = dates[0];
          }
        },
        err => console.error(err)
      );
  }

  private updateDates() {
    if (!this.fieldsAreValidated()) { return; }
    const data: any = {
      application_group: this.groupMethod,
      application_method: this.applicationMethod,
      application_type: this.selectedDate.application_type
    };
    this.isSaving = true;
    this.saveSchoolSubject.next(data);
  }

}

// ============== APPENDICES ==============

// ==== APPENDIX 1 ======
// ADD MIXPANEL WHEN FOLLOWING SCHOOL;

  // if (this.mixpanelEventName) {
  //     const mixpanelData = {'institution_id': this.institution.id, 'institution_name': this.institution.name};
  //     this.mixpanel.event(this.mixpanelEventName, mixpanelData);
  // }
  // mixpanel event for decision type set
  // if (!this.skipFields) {
  //     const mixpanelDecisionData = {'school_name': this.institution.name,
  //         'decision_type': this.selectedDate.application_type,
  //         'application_method': this.applicationMethod,
  //         'group_application_id': this.groupMethod };
  //     this.mixpanel.event('decision_type_set', mixpanelDecisionData);
  // }
