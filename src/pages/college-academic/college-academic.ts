import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { mean } from 'lodash';

import { CollegeService } from '@nte/services/college.service';

@IonicPage({
  name: `college-academic-page`
})
@Component({
  selector: `college-academic`,
  templateUrl: `college-academic.html`
})
export class CollegeAcademicPage {
  public admissionChart: any;
  public averageAct: number;
  public averageSatMath: number;
  public averageSatReading: number;
  public averageSatWriting: number;
  public college: any;
  public furtherStudyChart: any;
  public graduationChart: any;
  public jobMarketChart: any;
  public retentionChart: any;

  constructor(public navCtrl: NavController,
    public params: NavParams,
    public collegeService: CollegeService) {
    this.college = params.data;
  }

  public ionViewDidLoad() {
    this.setupCharts();
    this.setupAverages();
  }

  private getRoundedMean(firstValue: number, secondValue: number) {
    return Math.round(mean([firstValue, secondValue]));
  }

  private setupAverages() {
    const cd = this.college.details;
    this.averageAct = this.getRoundedMean(cd.act_25, cd.act_75);
    this.averageSatMath = this.getRoundedMean(cd.sat_math_25, cd.sat_math_75);
    this.averageSatReading = this.getRoundedMean(cd.sat_reading_25, cd.sat_reading_75);
    this.averageSatWriting = this.getRoundedMean(cd.sat_writing_25, cd.sat_writing_75);
  }

  private setupCharts() {
    /* ADMISSION */
    if (+this.college.details.admission_rate) {
      this.admissionChart = {
        values: [
          +this.college.details.admission_rate,
          (100 - +this.college.details.admission_rate)
        ]
      };
    }
    /* RETENTION */
    if (this.college.details.retention_pcf) {
      this.retentionChart = {
        values: [
          this.college.details.retention_pcf,
          (100 - this.college.details.retention_pcf)
        ]
      };
    }
    /* GRADUATION */
    if (this.college.six_year_grad_pcf) {
      this.graduationChart = {
        values: [
          this.college.six_year_grad_pcf,
          (100 - this.college.six_year_grad_pcf)
        ]
      };
    }
    /* FURTHER STUDY */
    if (this.college.details.percentage_further_education_immediate) {
      this.furtherStudyChart = {
        values: [
          this.college.details.percentage_further_education_immediate,
          (100 - this.college.details.percentage_further_education_immediate)
        ]
      };
    }
    /* JOB MARKET */
    if (this.college.details.percentage_enter_work_one_year) {
      this.jobMarketChart = {
        values: [
          this.college.details.percentage_enter_work_one_year,
          (100 - this.college.details.percentage_enter_work_one_year)
        ]
      };
    }
  }

}
