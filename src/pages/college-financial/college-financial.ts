import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { CollegeTabsService } from '@nte/services/college-tabs.service';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-financial`,
  templateUrl: `college-financial.html`
})
export class CollegeFinancialPage implements OnInit {
  public undergradFinAidChart: any;

  get college() {
    return this.collegeTabsService.activeCollege;
  }

  get details() {
    return this.college ? this.college.details : null;
  }

  constructor(
    public alertCtrl: AlertController,
    public collegeService: CollegeService,
    public collegeTabsService: CollegeTabsService,
    public route: ActivatedRoute,
    public router: Router) { }

  ngOnInit() {
    this.setupUndergradFinAidChart();
  }

  public async openAlert(type: string) {
    let msg;
    switch (type) {
      case 'need blind':
        msg = `This institution does not consider an applicant's financial situation when deciding admission`;
        break;
    }
    const alert = await this.alertCtrl.create({
      message: msg
    });
    return await alert.present();
  }

  public setupUndergradFinAidChart() {
    if (this.details && this.details.initial_financial_aid) {
      this.undergradFinAidChart = {
        values: [
          this.details.initial_financial_aid,
          (100 - this.details.initial_financial_aid)
        ]
      };
    }
  }

}
