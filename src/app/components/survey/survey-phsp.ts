import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subscription } from 'rxjs/Subscription';

import { militaryBranches, plans } from '@nte/constants/phsp-form.constants';
import { PLAN_DESCRIPTIONS, SURVEY_NAMES } from '@nte/constants/survey.constants';
import { ICollegeStatusItem, IScholarshipStatusItem } from '@nte/models/status-item.interface';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { DatetimeProvider } from '@nte/services/datetime.service';
import { ScholarshipProvider } from '@nte/services/scholarship.service';
import { SurveyProvider } from '@nte/services/survey.service';

@Component({
  selector: `survey-phsp`,
  templateUrl: `survey-phsp.html`
})
export class SurveyPhspComponent implements OnDestroy, OnInit {
  @Input() public taskTracker: TaskTracker;

  public datePickerOptions: any;
  public isInvalid = false;
  public isShortSurvey: boolean;
  public maxYear: number;
  public militaryBranches: any[] = militaryBranches;
  public minYear: number;
  public planDescriptions = PLAN_DESCRIPTIONS;
  public plans: any[] = plans;
  public startOnLastSlide: boolean = false;
  public studentAnswers: any = {
    page: 1
  };
  public surveyResults: any;

  private collegeValidSub: Subscription;
  private scholarshipValidSub: Subscription;
  private surveyDataSub: Subscription;

  get acceptedColleges() {
    if (!this.studentAnswers.institutions_followed) { return []; }
    const colleges = this.studentAnswers.institutions_followed.filter((institution) => institution.decision === `A`);
    return colleges;
  }

  get hideFormNavButtons(): boolean {
    const isHidden = this.isUniversityPlan &&
      (this.studentAnswers.page === 2 || this.studentAnswers.page === 4 || this.isConfirmationPage);
    return isHidden;
  }

  get isCollegeOrScholarshipPage(): boolean {
    return (this.isUniversityPlan && (this.studentAnswers.page === 2 || this.studentAnswers.page === 4));
  }

  get isConfirmationPage(): boolean {
    const lastPageOfTwoOrFourYear = (this.studentAnswers.page === 5 &&
      (this.studentAnswers.plan === `four_year` || this.studentAnswers.plan === `two_year`));
    const lastPageOfNonSchool = this.studentAnswers.page === 3 && !this.isUniversityPlan;
    return lastPageOfNonSchool || lastPageOfTwoOrFourYear;
  }

  get isLastQuestion(): boolean {
    const lastPageOfTwoOrFourYear = (this.studentAnswers.page === 4 && this.isUniversityPlan);
    const lastPageOfNonSchool = this.studentAnswers.page === 2 && !this.isUniversityPlan;
    return lastPageOfNonSchool || lastPageOfTwoOrFourYear;
  }

  get isUniversityPlan(): boolean {
    return this.studentAnswers.plan === `four_year` || this.studentAnswers.plan === `two_year`;
  }

  constructor(private datetimeProvider: DatetimeProvider,
    private events: Events,
    private scholarshipProvider: ScholarshipProvider,
    private surveyProvider: SurveyProvider) {
    this.maxYear = this.datetimeProvider.maxYear();
    this.minYear = this.datetimeProvider.minYear();
    this.datePickerOptions = this.datetimeProvider.pickerOptions;
  }

  ngOnInit() {
    this.setupValidSubs();
    this.setupUpdateSubs();
    this.setupSurvey();
  }

  ngOnDestroy() {
    if (this.collegeValidSub) {
      this.collegeValidSub.unsubscribe();
    }
    if (this.scholarshipValidSub) {
      this.scholarshipValidSub.unsubscribe();
    }
    if (this.surveyDataSub) {
      this.surveyDataSub.unsubscribe();
    }
  }

  public nextPage() {
    this.studentAnswers.page++;
    this.startOnLastSlide = false;
    if (this.isCollegeOrScholarshipPage) {
      this.isInvalid = true;
    } else {
      this.isInvalid = false;
    }
    this.saveSurvey()
      .subscribe(
        () => { /* success */ },
        err => console.error(err)
      );
  }

  public onChangeSurveyPage(params: any) {
    if (params.direction === `previous`) {
      this.previousPage();
    } else {
      if (params.page === `scholarship`) {
        this.viewConfirmation();
      } else {
        this.nextPage();
      }
    }
  }

  public onCollegeAttendingChanged(event: any) {
    if (event.value === -1) {
      delete this.studentAnswers.financial_aid;
      delete this.studentAnswers.start_date;
    }
  }

  public onCollegeListUpdated(colleges: ICollegeStatusItem[]) {
    this.studentAnswers.institutions_followed = colleges;
  }

  public onPlanChanged(plan: any) {
    this.studentAnswers = {
      page: 1,
      plan: plan.value
    };
  }

  public onScholarshipListUpdated(scholarships: IScholarshipStatusItem[]) {
    for (let i = 0, scholarship; scholarship = scholarships[i]; ++i) {
      scholarship.amount_awarded = +scholarship.amount_awarded;
    }
    this.studentAnswers.scholarships_followed = scholarships;
  }

  public previousPage() {
    this.studentAnswers.page--;
    if (this.isCollegeOrScholarshipPage) {
      this.isInvalid = true;
      this.startOnLastSlide = true;
    } else {
      this.isInvalid = false;
      this.startOnLastSlide = false;
    }
    this.saveSurvey()
      .subscribe(
        () => { /* success */ },
        err => console.error(err)
      );
  }

  public saveSurvey() {
    this.setCollegeAttending();
    return this.surveyProvider.saveSurveyData(this.taskTracker.task.id, { answers: this.studentAnswers });
  }

  public setCollegeAttending() {
    if (!this.studentAnswers.college_attending || this.studentAnswers.college_attending_id === -1) {
      this.studentAnswers.college_attending = {};
      this.studentAnswers.college_attending.enrolling = false;
    } else if (this.studentAnswers.college_attending_id) {
      this.studentAnswers.college_attending = this.studentAnswers.institutions_followed
        .find((college) => college.id === this.studentAnswers.college_attending_id);
      if (!this.studentAnswers.college_attending) {
        this.studentAnswers.college_attending = {};
      }
      this.studentAnswers.college_attending.enrolling = true;
    }
    if (this.studentAnswers.financial_aid) {
      this.studentAnswers.college_attending.financial_aid = this.studentAnswers.financial_aid;
    }
    if (this.studentAnswers.start_date) {
      this.studentAnswers.college_attending.start_date = this.studentAnswers.start_date;
    }
    if (this.studentAnswers.major) {
      this.studentAnswers.college_attending.major = this.studentAnswers.major;
    }
  }

  public surveyComplete() {
    if (this.isShortSurvey) {
      this.saveSurvey()
        .subscribe(
          () => {
            this.studentAnswers.page++;
          },
          err => console.error(err)
        );
    }
    this.taskTracker.updatedStatus();
    this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
  }

  public viewConfirmation() {
    this.saveSurvey()
      .subscribe(
        () => {
          this.getResults();
        },
        err => console.error(err)
      );
  }

  private getResults() {
    this.surveyProvider.getSurveyData(this.taskTracker.task.id)
      .subscribe(
        (data) => {
          this.surveyResults = data;
          if (this.studentAnswers.page !== 5) {
            this.studentAnswers.page++;
          }
        },
        err => console.error(err)
      );
  }

  private setupSurvey() {
    this.surveyDataSub = this.surveyProvider.getSurveyData(this.taskTracker.task.id)
      .subscribe(
        (data) => {
          this.isShortSurvey = data.survey_name === SURVEY_NAMES.phsp_short;
          if (Object.keys(data.answers).length > 0) {
            this.studentAnswers = data.answers;
            this.studentAnswers.page = data.answers.page || 1;
          }
          if (this.taskTracker.isComplete || this.studentAnswers.page === 5) {
            this.getResults();
          }
        },
        err => console.error(err)
      );
    this.scholarshipProvider.getStudentScholarships();
  }

  private setupUpdateSubs() {
    this.events.subscribe(`changeSurveyPage`, (params) => this.onChangeSurveyPage(params));
    this.events.subscribe(`collegeListUpdated`, (colleges) => this.onCollegeListUpdated(colleges));
    this.events.subscribe(`scholarshipListUpdated`, (scholarships) => this.onScholarshipListUpdated(scholarships));
    this.events.subscribe(`previousPage`, () => this.previousPage());
    this.events.subscribe(`surveyComplete`, () => this.surveyComplete());
  }

  private setupValidSubs() {
    this.collegeValidSub = this.surveyProvider.isCollegeStatusSectionValid.subscribe(
      (isValid) => {
        this.isInvalid = !isValid;
      }
    );
    this.scholarshipValidSub = this.surveyProvider.isScholarshipStatusSectionValid.subscribe(
      (isValid) => {
        this.isInvalid = !isValid;
      }
    );
  }
}
