import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IRecommendedScholarship, ISavedScholarship, IScholarship } from '@nte/interfaces/scholarship.interface';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `scholarship`,
  templateUrl: `scholarship.html`,
  styleUrls: [`scholarship.scss`]
})
export class ScholarshipPage implements OnDestroy {
  public isFalse: boolean = false;
  public isTrue: boolean = true;
  public recommendation: IRecommendedScholarship;
  public recommendationId: number;
  public scholarship: IScholarship;
  public tracker: ISavedScholarship;

  private ngUnsubscribe: Subject<any> = new Subject();

  get criteria() {
    if (this.scholarship && this.scholarship.criteria) {
      return this.scholarship.criteria;
    } else {
      return null;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public linkService: LinkService,
    private alertCtrl: AlertController,
    private mixpanel: MixpanelService,
    private scholarshipService: ScholarshipService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    route: ActivatedRoute) {
    const params: any = route.snapshot.params;
    this.scholarshipService.getById(params.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(s => this.scholarship = s);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.openRemoveToast());
  }

  public removeRecommendation(_event?: Event) {
    // event.stopPropagation();
    this.scholarshipService.studentRemoveRecommended(this.recommendation.id, this.user.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.openRemoveRecToast();
        // this.router.pop();
        // TODO: Check if routing is needed here
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
    //   applyModal.onDidDismiss().then((data, role) => {
    //     if (data.applying && this.recommendation && this.recommendation.id) {
    //       this.removeRecommendation();
    //     }
    //   });
    // } else {
    this.scholarship.saved = !isApplying;
    this.mixpanel.event(`scholarship saved`,
      { 'scholarship name': this.scholarship.name }
    );
    this.scholarshipService.saveScholarship(this.scholarship.id, isExisting, isApplying)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          if (this.recommendation && this.recommendation.id) {
            this.removeRecommendation();
          }
          this.openSaveToast();
        }
      );
    // }
  }

  public async openAlert(detail: string) {
    const alert = await this.alertCtrl.create({
      buttons: [`OK`],
      header: ``,
      subHeader: detail
    });
    return await alert.present();
  }

  public toggleSaved(event: Event) {
    if (this.scholarship.saved) {
      this.remove(event);
    } else {
      this.save(event);
    }
  }

  private async openRemoveToast() {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.save(null),
        text: `Undo`
      }],
      duration: 3000,
      message: `Scholarship removed.`,
      position: `bottom`
    });
    toast.present();
  }

  private async openRemoveRecToast() {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `Recommendation removed.`,
      position: `bottom`
    });
    toast.present();
  }

  private async openSaveToast() {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.remove(null),
        text: `Undo`
      }],
      duration: 3000,
      message: `Scholarship saved.`,
      position: `bottom`
    });
    toast.present();
  }

}
