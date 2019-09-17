import { Component, Input, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';

@Component({
  selector: `survey-phsp-results-college`,
  templateUrl: `survey-phsp-results-college.html`,
  styleUrls: [`survey-phsp-results-college.scss`]
})
export class SurveyPhspResultsCollegeComponent implements OnInit {
  @Input() surveyResults: any;
  @Input() taskIsComplete: boolean;

  public collegeCharts: any = {};
  public planDisplayValues = {
    four_year: `4 year`,
    two_year: `2 year`
  };
  public scholarshipChart: any;

  get results() {
    return this.surveyResults.results;
  }

  constructor(private events: Events) { }

  ngOnInit() {
    const chartData = this.surveyResults.results;
    this.collegeCharts = {
      accepted: {
        color: `#30B982`,
        label: `Accepted`,
        value: chartData.percentage_institutions_accepted
      },
      declined: {
        color: `#F63B07`,
        label: `Declined`,
        value: chartData.percentage_institutions_declined
      },
      pending: {
        color: `#3692CC`,
        label: `Pending`,
        value: chartData.percentage_institutions_deferred + chartData.percentage_institutions_waitlisted
      },
      waiting: {
        color: `#717273`,
        label: `Waiting`,
        value: chartData.percentage_institutions_waiting
      }
    };
    this.scholarshipChart = {
      color: `#30B982`,
      label: `Scholarships won`,
      value: chartData.percentage_scholarships_won
    };
  }

  public previousPage() {
    this.events.publish(`previousPage`);
  }

  public surveyComplete() {
    this.events.publish(`surveyComplete`);
  }

}
