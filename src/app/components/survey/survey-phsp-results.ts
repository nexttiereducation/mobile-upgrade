import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { MILITARY_DISPLAY_VALUES, PLAN_PROPERTIES } from '@nte/constants/survey.constants';

@Component({
  selector: `survey-phsp-results`,
  templateUrl: `survey-phsp-results.html`,
  styleUrls: [`survey-phsp-results.scss`]
})
export class SurveyPhspResultsComponent implements OnInit, OnChanges {
  @Input() answers: any;
  @Input() taskIsComplete: boolean;

  public answerProperties = PLAN_PROPERTIES;
  public branchDisplay: string;

  constructor() { }

  ngOnInit() {
    this.formatMilitary();
  }

  ngOnChanges() {
    this.formatMilitary();
  }

  public formatMilitary() {
    if (this.answers.plan === `military`) {
      this.branchDisplay = MILITARY_DISPLAY_VALUES[this.answers.branch];
    } else {
      this.branchDisplay = undefined;
    }
  }

}
