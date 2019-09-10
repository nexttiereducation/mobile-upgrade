import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Content, IonicPage, NavController, NavParams, ToastController } from '@ionic/angular';

import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@IonicPage({
  name: `forgot-password-page`
})
@Component({
  selector: `forgot-password`,
  templateUrl: `forgot-password.html`
})
export class ForgotPasswordPage {
  @ViewChild(Content) public content;
  public email: string;
  public forgotForm: FormGroup;
  public invalidEmail: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    const regex = `^[a-z0-9!#$%&'*+\/=?^_\`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$`;
    this.forgotForm = this.formBuilder.group({
      email: [``,
        Validators.compose([
          Validators.required,
          Validators.pattern(regex)
        ])
      ]
    });
  }

  public backToLogin() {
    this.navCtrl.pop();
  }

  public ionViewDidEnter() {
    this.mixpanel.event(`navigated_to-Forgot-Password`);
  }

  public ionViewDidLoad() {
    window.addEventListener(`keyboardDidShow`, () => {
      this.content.scrollToBottom(300);
    });
  }

  public onBlur() {
    this.invalidEmail = this.email && this.email.length && this.forgotForm.controls.email.invalid;
  }

  public sendEmail() {
    const successToast = this.toastCtrl.create({
      duration: 5000,
      message: `A reset password link has been sent to your email.`
    });
    this.stakeholderService.sendForgotPasswordEmail(this.email)
      .subscribe(
        () => {
          successToast.present();
        },
        (error) => {
          if (!error.status || error.status === 201) {
            successToast.present();
          } else {
            const toast = this.toastCtrl.create({
              duration: 5000,
              message:
                `That email address is not affiliated with any NextTier account. Please double-check it & try again.`
            });
            toast.present();
          }
        }
      );
  }
}
