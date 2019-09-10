import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { InterestProfiler } from '@nte/models/interest-profiler.models';
import { ApiService } from '@nte/services/api.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyService } from '@nte/services/survey.service';

@Injectable({ providedIn: 'root' })
export class SurveyIpService {
  public number;
  public page = 0;
  public pageDelimiter = 5;

  private _interestProfiler: InterestProfiler;
  private _taskId;

  get pagedQuestions() {
    if (!this._interestProfiler) { return; }
    return this._interestProfiler.profiler.questions;
  }

  get pages() {
    if (!this._interestProfiler) { return 0; }
    return (this._interestProfiler.profiler.questions.length / this.pageDelimiter) - 1;
  }

  get surveyProgress() {
    if (!this._interestProfiler) { return 0; }
    return this._interestProfiler.progress;
  }

  constructor(private apiService: ApiService,
    public stakeholderService: StakeholderService,
    public surveyService: SurveyService) { }

  public configureProfiler(interestProfiler: any) {
    this._interestProfiler = interestProfiler;
    this._interestProfiler.setExistingAnswers(this.surveyService.currentSurvey.answers);
    this.page = this.getStartingPage();
  }

  public getResults(): Observable<any> {
    return this.apiService.patch(
      `/survey/${this._taskId}`,
      {
        answers: this._interestProfiler.answers,
        survey_is_complete: true
      }
    )
      .map((response) => response.json());
  }

  public getStartingPage() {
    const index = this._interestProfiler.profiler.questions.findIndex((question) => !question.answer);
    if (this.pageDelimiter === 1) {
      return (index === -1) ? (this._interestProfiler.profiler.questions.length - 1) : index;
    }
    if (index === this._interestProfiler.profiler.questions.length) {
      return (index / this.pageDelimiter);
    }
    return (index < this.pageDelimiter) ? 0 : Math.floor(((index + 1) / this.pageDelimiter));
  }

  public initializeProfiler(taskId: number, survey?: any) {
    if (survey) {
      const interestProfiler = new InterestProfiler(survey);
      this.configureProfiler(interestProfiler);
    } else {
      this._taskId = taskId;
      const route = `/survey/${taskId}`;
      return this.apiService.get(route)
        .map((response) => new InterestProfiler(response.json()))
        .subscribe(
          (interestProfiler) => {
            this.configureProfiler(interestProfiler);
          }
        );
    }
  }

  public saveAnswers() {
    return this.apiService.patch(`/survey/${this._taskId}`, { answers: this._interestProfiler.answers })
      .map((response) => response.json())
      .subscribe(
        (data) => this.stakeholderService.stakeholder.interest_profiler_answers = data.current_answers,
        err => console.error(err)
      );
  }

}
