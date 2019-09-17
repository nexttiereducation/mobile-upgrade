import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { ICollegeDetails } from '@nte/interfaces/college-details.interface';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-financial`,
  templateUrl: `college-financial.html`,
  encapsulation: ViewEncapsulation.None
})
export class CollegeFinancialPage {
  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get details(): ICollegeDetails {
    return this.college ? this.college.details : null;
  }

  get finAidChart() {
    if (this.details && this.details.initial_financial_aid) {
      return {
        label: `of Undergrads receive financial aid`,
        value: this.details.initial_financial_aid
      };
    }
  }

  constructor(
    public alertCtrl: AlertController,
    public collegeService: CollegeService,
    public route: ActivatedRoute,
    public router: Router) { }

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

}
