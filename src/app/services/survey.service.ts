import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { SURVEY_NAMES } from '@nte/constants/survey.constants';
import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  public currentSurvey: any;
  public hideButtons: boolean;
  public surveyNames: any = SURVEY_NAMES;

  private _isCollegeStatusSectionValid = new Subject<boolean>();
  private _isScholarshipStatusSectionValid = new Subject<boolean>();

  get isCareerCluster() {
    if (!this.currentSurvey) { return; }
    return (this.currentSurvey.survey_name === this.surveyNames.cc);
  }

  get isCollegeStatusSectionValid() {
    return this._isCollegeStatusSectionValid.asObservable();
  }

  get isCustom() {
    if (!this.currentSurvey) { return; }
    return this.currentSurvey.template_source_name === this.surveyNames.custom;
  }

  get isInterestProfiler() {
    if (!this.currentSurvey) { return; }
    return (this.currentSurvey.survey_name === this.surveyNames.ip_short ||
      this.currentSurvey.survey_name === this.surveyNames.ip_long);
  }

  get isPHSP() {
    if (!this.currentSurvey) { return; }
    return (this.currentSurvey.survey_name === this.surveyNames.phsp_short ||
      this.currentSurvey.survey_name === this.surveyNames.phsp);
  }

  get isScholarshipStatusSectionValid() {
    return this._isScholarshipStatusSectionValid.asObservable();
  }

  constructor(private apiService: ApiService) { }

  public formatData(data: any) {
    if (data.answers.institutions_followed) {
      const formattedColleges = [];
      for (let i = 0, college; college = data.answers.institutions_followed[i]; ++i) {
        formattedColleges.push({
          decision: college.decision,
          deferred: college.deferred,
          id: college.id,
          name: college.name,
          photo_url: college.photo_url,
          waitlisted: college.waitlisted
        });
      }
      data.answers.institutions_followed = formattedColleges;
    }
    if (data.answers.scholarships_followed) {
      const formattedScholarships = [];
      for (let i = 0, scholarship; scholarship = data.answers.scholarships_followed[i]; ++i) {
        if (scholarship.amount_awarded) {
          scholarship.decision = `A`;
        }
        formattedScholarships.push({
          amount_awarded: scholarship.amount_awarded,
          decision: scholarship.decision,
          id: scholarship.id,
          isActive: scholarship.isActive,
          name: scholarship.name,
          photo_url: scholarship.photo_url,
          status: scholarship.status
        });
      }
      data.answers.scholarships_followed = formattedScholarships;
    }
    return data;
  }

  public getStudentSurveyData(taskId: number, studentId: number) {
    return this.apiService.get(`/survey/${taskId}?student_pk=${studentId}`)
      .pipe(map((response) => {
        this.currentSurvey = response.json();
        return response.json();
      }));
  }

  public getSurveyData(taskId: number) {
    return this.apiService.get(`/survey/${taskId}`)
      .pipe(map((response) => {
        this.currentSurvey = response.json();
        return response.json();
      }));
  }

  public saveSurveyData(taskId: number, surveyData: any) {
    const formattedSurvey = this.formatData(surveyData);
    return this.apiService.patch(`/survey/${taskId}`, formattedSurvey);
  }

  public setCollegeStatusSectionValidity(isValid: boolean) {
    this._isCollegeStatusSectionValid.next(isValid);
  }

  public setScholarshipStatusSectionValidity(isValid: boolean) {
    this._isScholarshipStatusSectionValid.next(isValid);
  }

}
