import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

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
    return (this.pagedQuestions.length / this.pageDelimiter) - 1;
  }

  get surveyProgress() {
    if (!this._interestProfiler) { return 0; }
    return this._interestProfiler.progress;
  }

  get user() {
    return this.stakeholderService.stakeholder;
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
    return this.apiService
      .patch(
        `/survey/${this._taskId}`, {
        answers: this._interestProfiler.answers,
        survey_is_complete: true
      }
      )
      .pipe(map((response) => response));
  }

  public getStartingPage() {
    const index = this.pagedQuestions.findIndex((question) => !question.answer);
    if (this.pageDelimiter === 1) {
      return (index === -1) ? (this.pagedQuestions.length - 1) : index;
    }
    if (index === this.pagedQuestions.length) {
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
      return this.apiService
        .get(`/survey/${taskId}`)
        .pipe(map((response) => new InterestProfiler(response)))
        .subscribe(
          (interestProfiler) => {
            this.configureProfiler(interestProfiler);
          }
        );
    }
  }

  public saveAnswers() {
    return this.apiService
      .patch(`/survey/${this._taskId}`, {
        answers: this._interestProfiler.answers
      })
      .pipe(map((response) => response))
      .subscribe(
        (data) => this.user.interest_profiler_answers = data.current_answers,
        err => console.error(err)
      );
  }

}
