import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Events, Slides } from '@ionic/angular';
import { orderBy } from 'lodash';

import { IP_RESULT_DESCRIPTIONS } from '@nte/constants/survey.constants';
import { IResult } from '@nte/models/interest-profiler.models';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiProvider } from '@nte/services/api.service';
import { StakeholderProvider } from '@nte/services/stakeholder.service';
import { SurveyIpProvider } from '@nte/services/survey-ip.service';
import { SurveyProvider } from '@nte/services/survey.service';
import { TaskProvider } from '@nte/services/task.service';

@Component({
  selector: `survey-ip`,
  templateUrl: `survey-ip.html`
})
export class SurveyIpComponent implements OnInit, OnChanges {
  @ViewChild(`ipSlider`) public ipSlider: Slides;

  @Input() public taskTracker: TaskTracker;

  public areaDescriptions: any = IP_RESULT_DESCRIPTIONS;
  public isSliding: boolean;
  public sliderOptions: any;

  private results: IResult[];

  get currentSurvey() {
    return this.surveyProvider.currentSurvey;
  }

  get user() {
    return this.stakeholderProvider.stakeholder;
  }

  constructor(
    public apiProvider: ApiProvider,
    public events: Events,
    public stakeholderProvider: StakeholderProvider,
    public taskProvider: TaskProvider,
    public surveyIpProvider: SurveyIpProvider,
    public surveyProvider: SurveyProvider) { }

  ngOnInit() {
    this.results = this.stakeholderProvider.stakeholder.interest_profiler_result;
    this.setupInterestProfiler(this.surveyProvider.currentSurvey);
    this.sliderOptions = {
      loop: false,
      pager: false
    };
  }

  ngOnChanges() {
    this.setupInterestProfiler();
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
    this.surveyIpProvider.getResults().subscribe(
      data => {
        const results = data.results.map(result => {
          result.score = +result.score;
          return result;
        });
        this.results = orderBy(results, result => +result.score, [`desc`]);
        this.updateStakeholder(this.results);
        this.surveyProvider.currentSurvey.results = this.results;
        this.taskTracker.updatedStatus();
        this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
      },
      err => console.error(err)
    );
  }

  public slideChanged() {
    const slideIndex = this.ipSlider.getActiveIndex();
    this.surveyIpProvider.page = slideIndex;
    const cantSwipeToPrev = this.ipSlider.isBeginning();
    const cantSwipeToNext =
      !this.surveyIpProvider.pagedQuestions[slideIndex].answer ||
      this.ipSlider.isEnd();
    this.ipSlider.lockSwipeToPrev(cantSwipeToPrev);
    this.ipSlider.lockSwipeToNext(cantSwipeToNext);
  }

  private setupInterestProfiler(currentSurvey?: any) {
    this.surveyIpProvider.pageDelimiter = 1;
    this.surveyIpProvider.initializeProfiler(
      this.taskTracker.task.id,
      currentSurvey
    );
  }

  private updateStakeholder(data: any) {
    this.apiProvider
      .patch(`/stakeholder`, { interest_profiler_result: data })
      .map(response => response.json())
      .subscribe(
        response => {
          this.stakeholderProvider.setInterestProfilerResult(
            response.interest_profiler_result
          );
        },
        err => console.error(err)
      );
  }
}
