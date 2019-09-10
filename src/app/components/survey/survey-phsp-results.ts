import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { MILITARY_DISPLAY_VALUES, PLAN_PROPERTIES } from '@nte/constants/survey.constants';

@Component({
  selector: `survey-phsp-results`,
  templateUrl: `survey-phsp-results.html`
})
export class SurveyPhspResultsComponent implements OnInit, OnChanges {
  @Input() public answers: any;
  @Input() public taskIsComplete: boolean;

  public answerProperties = PLAN_PROPERTIES;
  public branchDisplay: string;

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
