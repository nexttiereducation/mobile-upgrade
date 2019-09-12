import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `forgot-password`,
  templateUrl: `forgot-password.html`,
  styleUrls: [`forgot-password.scss`]
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public email: string;
  public forgotForm: FormGroup;
  public invalidEmail: boolean;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public router: Router,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    const regex = `^[a-z0-9!#$%&'*+\/=?^_\`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$`;
    this.forgotForm = this.formBuilder.group({
      email: [
        ``,
        Validators.compose([
          Validators.required,
          Validators.pattern(regex)
        ])
      ]
    });
  }

  ngOnInit() {
    this.mixpanel.event(`navigated_to-Forgot-Password`);
    window.addEventListener(`keyboardDidShow`, () => {
      this.content.scrollToBottom(300);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public backToLogin() {
    this.router.navigate(['login']);
  }

  public onBlur() {
    this.invalidEmail = this.email && this.email.length && this.forgotForm.controls.email.invalid;
  }

  public sendEmail() {
    this.stakeholderService.sendForgotPasswordEmail(this.email)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => this.openEmailSentToast(),
        (error) => {
          if (!error.status || error.status === 201) {
            this.openEmailSentToast();
          } else {
            this.openEmailNotFoundToast();
          }
        }
      );
  }

  private async openEmailNotFoundToast() {
    const toast = await this.toastCtrl.create({
      duration: 5000,
      message: `Account for email address not found. Please try again.`
    });
    toast.present();
  }

  private async openEmailSentToast() {
    const toast = await this.toastCtrl.create({
      duration: 5000,
      message: `A reset password link has been sent to your email.`
    });
    toast.present();
  }
}
