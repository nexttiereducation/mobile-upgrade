import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CollegeService } from '@nte/services/college.service';

@IonicPage({
  name: `college-financial-page`
})
@Component({
  selector: `college-financial`,
  templateUrl: `college-financial.html`
})
export class CollegeFinancialPage {
  public college: any;
  public undergradFinAidChart: any;

  constructor(public navCtrl: NavController,
    public params: NavParams,
    public collegeService: CollegeService) {
    this.college = params.data;
    this.setupUndergradFinAidChart();
  }

  public setupUndergradFinAidChart() {
    if (this.college.details.initial_financial_aid) {
      this.undergradFinAidChart = {
        values: [
          this.college.details.initial_financial_aid,
          (100 - this.college.details.initial_financial_aid)
        ]
      };
    }
  }

}
