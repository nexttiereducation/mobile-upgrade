import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ToastController } from '@ionic/angular';

import { IRecommendedScholarship, ISavedScholarship, IScholarship } from '@nte/models/scholarship.interface';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@IonicPage({
  name: `scholarship-page`
})
@Component({
  selector: `scholarship`,
  templateUrl: `scholarship.html`
})
export class ScholarshipPage {
  public isFalse: boolean = false;
  public isTrue: boolean = true;
  public recommendation: IRecommendedScholarship;
  public recommendationId: number;
  public scholarship: IScholarship;
  public tracker: ISavedScholarship;

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(params: NavParams,
    public linkService: LinkService,
    private alertCtrl: AlertController,
    private mixpanel: MixpanelService,
    private navCtrl: NavController,
    private scholarshipService: ScholarshipService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    if (params.get(`scholarship`)) {
      this.scholarship = params.get(`scholarship`);
    } else {
      const sub = this.scholarshipService.getById(params.get(`id`))
        .subscribe((scholarship) => {
          this.scholarship = scholarship;
          sub.unsubscribe();
        });
    }
    this.recommendation = params.get(`recommendation`);
    this.tracker = params.get(`tracker`);
  }

  public hasRange(propSuffix: string, isNonCriteriaProp: boolean = false) {
    const minProp = `min_${propSuffix}`;
    const maxProp = `max_${propSuffix}`;
    const baseObject = isNonCriteriaProp ? this.scholarship : this.scholarship.criteria;
    if (baseObject[minProp] && baseObject[maxProp]) {
      return true;
    } else {
      return false;
    }
  }

  public recommend(_event: Event) {
    // event.stopPropagation();
    this.scholarshipService.setSelectedScholarship(this.scholarship);
    if (!this.user.isCounselor) {
      // this.openStudentPicker();
    }
  }

  public remove(_event: Event) {
    // event.stopPropagation();
    this.scholarship.saved = false;
    this.scholarship.applying = false;
    this.scholarshipService.removeScholarship(this.scholarship)
      .subscribe(
        () => {
          const toast = this.toastCtrl.create({
            closeButtonText: `UNDO`,
            duration: 3000,
            message: `Scholarship removed.`,
            position: `bottom`,
            showCloseButton: true
          });
          toast.present();
          toast.onDidDismiss((_data, role) => {
            if (role === `close`) { // this.listName !== 'Recommended' &&
              this.save(null);
            }
          });
        }
      );
  }

  public removeRecommendation(_event?: Event) {
    // event.stopPropagation();
    this.scholarshipService.studentRemoveRecommended(this.recommendation.id, this.user.id)
      .subscribe(() => {
        this.toastCtrl.create({
          duration: 3000,
          message: `Recommendation removed.`,
          position: `bottom`,
          showCloseButton: false
        }).present();
        this.navCtrl.pop();
      });
  }

  public save(_event: Event, isApplying?: boolean) {
    // event.stopPropagation();
    const isExisting = this.scholarship.saved;
    this.scholarship.applying = isApplying;
    // if (isApplying) {
    //   const applyModal = this.modalCtrl.create(
    //     ApplicationDatesComponent // TODO
    //   );
    //   applyModal.present();
    //   applyModal.onDidDismiss((data, role) => {
    //     if (data.applying && this.recommendation && this.recommendation.id) {
    //       this.removeRecommendation();
    //     }
    //   });
    // } else {
    this.scholarship.saved = !isApplying;
    this.mixpanel.event(`scholarship saved`, { 'scholarship name': this.scholarship.name });
    this.scholarshipService.saveScholarship(this.scholarship.id, isExisting, isApplying).subscribe(
      () => {
        if (this.recommendation && this.recommendation.id) {
          this.removeRecommendation();
        }
        const toast = this.toastCtrl.create({
          closeButtonText: `UNDO`,
          duration: 3000,
          message: `Saved!`,
          position: `bottom`,
          showCloseButton: true
        });
        toast.present();
        toast.onDidDismiss((_data, role) => {
          if (role === `close`) {
            this.remove(null);
          }
        });
      }
    );
    // }
  }

  public showMoreInfo(detail: string) {
    const alert = this.alertCtrl.create({
      buttons: [`OK`],
      subHeader: detail,
      header: ``
    });
    alert.present();
  }

  public toggleSaved(event: Event) {
    if (this.scholarship.saved) {
      this.remove(event);
    } else {
      this.save(event);
    }
  }

}
