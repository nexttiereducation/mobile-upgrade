import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { militaryBranches, plans } from '@nte/constants/phsp-form.constants';
import { PLAN_DESCRIPTIONS, SURVEY_NAMES } from '@nte/constants/survey.constants';
import { ICollegeStatusItem, IScholarshipStatusItem } from '@nte/interfaces/status-item.interface';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { DatetimeService } from '@nte/services/datetime.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { SurveyService } from '@nte/services/survey.service';

@Component({
  selector: `survey-phsp`,
  templateUrl: `survey-phsp.html`,
  styleUrls: [`survey-phsp.scss`]
})
export class SurveyPhspComponent implements OnDestroy, OnInit {
  @Input() taskTracker: TaskTracker;

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

  private ngUnsubscribe: Subject<any> = new Subject();

  get acceptedColleges() {
    if (!this.studentAnswers.institutions_followed) {
      return [];
    } else {
      return this.studentAnswers.institutions_followed.filter(c => c.decision === `A`);
    }
  }

  get hideFormNavButtons(): boolean {
    return this.isUniversityPlan &&
      (this.studentAnswers.page === 2
        || this.studentAnswers.page === 4
        || this.isConfirmationPage);
  }

  get isCollegeOrScholarshipPage(): boolean {
    return this.isUniversityPlan &&
      (this.studentAnswers.page === 2 || this.studentAnswers.page === 4);
  }

  get isConfirmationPage(): boolean {
    const lastSchoolPage = this.studentAnswers.page === 5 && this.isUniversityPlan;
    const lastOtherPage = this.studentAnswers.page === 3 && !this.isUniversityPlan;
    return lastOtherPage || lastSchoolPage;
  }

  get isLastQuestion(): boolean {
    const lastSchoolQ = this.studentAnswers.page === 4 && this.isUniversityPlan;
    const lastOtherQ = this.studentAnswers.page === 2 && !this.isUniversityPlan;
    return lastOtherQ || lastSchoolQ;
  }

  get isUniversityPlan(): boolean {
    return this.studentAnswers.plan === `four_year` || this.studentAnswers.plan === `two_year`;
  }

  constructor(private datetimeService: DatetimeService,
    private events: Events,
    private scholarshipService: ScholarshipService,
    private surveyService: SurveyService) {
    this.maxYear = this.datetimeService.maxYear();
    this.minYear = this.datetimeService.minYear();
    this.datePickerOptions = this.datetimeService.pickerOptions;
  }

  ngOnInit() {
    this.setupValidSubs();
    this.setupUpdateSubs();
    this.setupSurvey();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
      .pipe(takeUntil(this.ngUnsubscribe))
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
    this.studentAnswers.scholarships_followed = scholarships.map(s => {
      s.amount_awarded = +s.amount_awarded;
      return s;
    });
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => { /* success */ },
        err => console.error(err)
      );
  }

  public saveSurvey() {
    this.setCollegeAttending();
    return this.surveyService.saveSurveyData(this.taskTracker.task.id, { answers: this.studentAnswers });
  }

  public setCollegeAttending() {
    const answers = this.studentAnswers;
    if (!answers.college_attending || answers.college_attending_id === -1) {
      answers.college_attending = {};
      answers.college_attending.enrolling = false;
    } else if (answers.college_attending_id) {
      answers.college_attending = answers.institutions_followed
        .find((college) => college.id === answers.college_attending_id);
      if (!answers.college_attending) {
        answers.college_attending = {};
      }
      answers.college_attending.enrolling = true;
    }
    if (answers.financial_aid) {
      answers.college_attending.financial_aid = answers.financial_aid;
    }
    if (answers.start_date) {
      answers.college_attending.start_date = answers.start_date;
    }
    if (answers.major) {
      answers.college_attending.major = answers.major;
    }
  }

  public surveyComplete() {
    if (this.isShortSurvey) {
      this.saveSurvey()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => this.studentAnswers.page++,
          err => console.error(err)
        );
    }
    this.taskTracker.updatedStatus();
    this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
  }

  public viewConfirmation() {
    this.saveSurvey()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => this.getResults(),
        err => console.error(err)
      );
  }

  private getResults() {
    this.surveyService.getSurveyData(this.taskTracker.task.id)
      .pipe(takeUntil(this.ngUnsubscribe))
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
    this.surveyService.getSurveyData(this.taskTracker.task.id)
      .pipe(takeUntil(this.ngUnsubscribe))
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
    this.scholarshipService.getStudentScholarships();
  }

  private setupUpdateSubs() {
    this.events.subscribe(
      `changeSurveyPage`,
      params => this.onChangeSurveyPage(params)
    );
    this.events.subscribe(
      `collegeListUpdated`,
      colleges => this.onCollegeListUpdated(colleges)
    );
    this.events.subscribe(
      `previousPage`,
      () => this.previousPage()
    );
    this.events.subscribe(
      `scholarshipListUpdated`,
      ships => this.onScholarshipListUpdated(ships)
    );
    this.events.subscribe(
      `surveyComplete`,
      () => this.surveyComplete()
    );
  }

  private setupValidSubs() {
    this.surveyService.isCollegeStatusSectionValid
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isValid => this.isInvalid = !isValid);
    this.surveyService.isScholarshipStatusSectionValid
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isValid => this.isInvalid = !isValid);
  }
}
