import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Events, IonSlides } from '@ionic/angular';
import { orderBy } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IP_RESULT_DESCRIPTIONS } from '@nte/constants/survey.constants';
import { IResult } from '@nte/models/interest-profiler.models';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiService } from '@nte/services/api.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyIpService } from '@nte/services/survey-ip.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `survey-ip`,
  templateUrl: `survey-ip.html`,
  styleUrls: [`survey-ip.scss`]
})
export class SurveyIpComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(`ipSlider`, { static: false }) public ipSlider: IonSlides;

  @Input() taskTracker: TaskTracker;

  public areaDescriptions: any = IP_RESULT_DESCRIPTIONS;
  public isSliding: boolean;
  public sliderOptions: any;

  private ngUnsubscribe: Subject<any> = new Subject();
  private results: IResult[];

  get currentSurvey() {
    return this.surveyService.currentSurvey;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(
    public api: ApiService,
    public events: Events,
    public stakeholderService: StakeholderService,
    public taskService: TaskService,
    public surveyIpService: SurveyIpService,
    public surveyService: SurveyService) { }

  ngOnInit() {
    this.results = this.stakeholderService.stakeholder.interest_profiler_result;
    this.setupInterestProfiler(this.surveyService.currentSurvey);
    this.sliderOptions = {
      initialSlide: this.surveyIpService.page,
      loop: false,
      pager: false
    };
  }

  ngOnChanges() {
    this.setupInterestProfiler();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public back() {
    if (this.ipSlider) {
      this.ipSlider.lockSwipes(false);
      this.ipSlider.slidePrev();
    }
  }

  public continue(delay: number = 0) {
    setTimeout(() => {
      if (this.ipSlider && !this.isSliding) {
        this.isSliding = true;
        this.ipSlider.lockSwipes(false);
        this.ipSlider.slideNext();
      }
    }, delay);
  }

  public finish() {
    this.surveyIpService.getResults()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => {
          const results = data.results.map(result => {
            result.score = +result.score;
            return result;
          });
          this.results = orderBy(results, result => +result.score, [`desc`]);
          this.updateStakeholder(this.results);
          this.surveyService.currentSurvey.results = this.results;
          this.taskTracker.updatedStatus();
          this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
        },
        err => console.error(err)
      );
  }

  public slideChanged() {
    let slideIndex: number;
    this.ipSlider.getActiveIndex().then((idx) => {
      slideIndex = idx;
      this.surveyIpService.page = slideIndex;
      let cantSwipeToPrev;
      let cantSwipeToNext;
      this.ipSlider.isBeginning().then(cantSwipeBack => {
        cantSwipeToPrev = cantSwipeBack;
        this.ipSlider.isEnd().then(cantSwipeForward => {
          cantSwipeToNext = cantSwipeForward || !this.surveyIpService.pagedQuestions[slideIndex].answer;
          this.ipSlider.lockSwipeToPrev(cantSwipeToPrev);
          this.ipSlider.lockSwipeToNext(cantSwipeToNext);
        });
      });
    });
  }

  private setupInterestProfiler(currentSurvey?: any) {
    this.surveyIpService.pageDelimiter = 1;
    this.surveyIpService.initializeProfiler(
      this.taskTracker.task.id,
      currentSurvey
    );
  }

  private updateStakeholder(data: any) {
    this.stakeholderService.updateInterestProfile(data);
  }
}
