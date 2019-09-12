import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mean } from 'lodash';

import { ICollegeDetails } from '@nte/interfaces/college-details.interface';
import { CollegeTabsService } from '@nte/services/college-tabs.service';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-academic`,
  templateUrl: `college-academic.html`,
  styleUrls: [`college-academic.scss`]
})
export class CollegeAcademicPage implements OnInit {
  public admissionChart: any;
  public averageAct: number;
  public averageSatMath: number;
  public averageSatReading: number;
  public averageSatWriting: number;
  public furtherStudyChart: any;
  public graduationChart: any;
  public jobMarketChart: any;
  public retentionChart: any;

  get college() {
    return this.collegeTabsService.activeCollege;
  }

  get details(): ICollegeDetails {
    return this.college ? this.college.details : null;
  }

  constructor(
    public collegeService: CollegeService,
    public collegeTabsService: CollegeTabsService,
    public route: ActivatedRoute,
    public router: Router) { }

  ngOnInit() {
    this.setupCharts();
    this.setupAverages();
  }

  private getRoundedMean(firstValue: number, secondValue: number) {
    return Math.round(mean([firstValue, secondValue]));
  }

  private setupAverages() {
    if (this.details) {
      this.averageAct = this.getRoundedMean(this.details.act_25, this.details.act_75);
      this.averageSatMath = this.getRoundedMean(this.details.sat_math_25, this.details.sat_math_75);
      this.averageSatReading = this.getRoundedMean(this.details.sat_reading_25, this.details.sat_reading_75);
      this.averageSatWriting = this.getRoundedMean(this.details.sat_writing_25, this.details.sat_writing_75);
    }
  }

  private setupCharts() {
    if (this.details) {
      /* ADMISSION */
      if (+this.details.admission_rate) {
        this.admissionChart = {
          values: [
            +this.details.admission_rate,
            (100 - +this.details.admission_rate)
          ]
        };
      }
      /* RETENTION */
      if (this.details.retention_pcf) {
        this.retentionChart = {
          values: [
            this.details.retention_pcf,
            (100 - +this.details.retention_pcf)
          ]
        };
      }
      /* GRADUATION */
      if (this.college.six_year_grad_pcf) {
        this.graduationChart = {
          values: [
            this.college.six_year_grad_pcf,
            (100 - +this.college.six_year_grad_pcf)
          ]
        };
      }
      /* FURTHER STUDY */
      if (this.details.percentage_further_education_immediate) {
        this.furtherStudyChart = {
          values: [
            this.details.percentage_further_education_immediate,
            (100 - +this.details.percentage_further_education_immediate)
          ]
        };
      }
      /* JOB MARKET */
      if (this.details.percentage_enter_work_one_year) {
        this.jobMarketChart = {
          values: [
            this.details.percentage_enter_work_one_year,
            (100 - +this.details.percentage_enter_work_one_year)
          ]
        };
      }
    }
  }

}
