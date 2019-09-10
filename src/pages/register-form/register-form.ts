import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Content, IonicPage, NavController, Platform, ToastController } from 'ionic-angular';
import { escapeRegExp } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { emailRegex } from '@nte/constants/stakeholder.constants';
import { INewUser } from '@nte/models/new-user.interface';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TabsPage } from './../tabs/tabs';

@IonicPage({
  name: `register-form-page`
})
@Component({
  selector: `register-form`,
  templateUrl: `register-form.html`
})
export class RegisterFormPage {
  @ViewChild(Content) public content: Content;
  public invalid: any = {};
  public isInitialEntry: any = {};
  public loggingIn: boolean;
  public registerForm: FormGroup;
  public user: INewUser;

  private loginSub: Subscription;

  constructor(public navCtrl: NavController,
    public platform: Platform,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    this.setFormAndUser();
  }

  public checkConfirmEmail() {
    if (this.user.email) { return escapeRegExp(this.user.email); }
    return ``;
  }

  public checkValidate(ctrlName: string) {
    if (!this.isInitialEntry[ctrlName]) {
      this.validate(ctrlName);
    }
  }

  public register() {
    this.loggingIn = true;
    this.stakeholderService.newUser = Object.assign(this.stakeholderService.newUser, this.user);
    this.stakeholderService.register()
      .subscribe(
        (response) => {
          this.mixpanel.signUp(response, this.stakeholderService.newUser);
          const loginData = {
            email: this.stakeholderService.newUser.email,
            password: this.stakeholderService.newUser.password
          };
          this.loginSub = this.stakeholderService.loginSuccess.subscribe((success) => {
            if (!success) {
              return this.loginSub.unsubscribe();
            }
            this.navCtrl.setRoot(TabsPage);
          });
          this.stakeholderService.login(loginData);
        },
        (error) => {
          this.loggingIn = false;
          const parsedError = JSON.parse(error._body);
          const toast = this.toastCtrl.create({
            duration: 5000,
            message: parsedError.detail
          });
          toast.present();
        }
      );
  }

  public setIsInitialEntry(ctrlName: string) {
    const fieldIsClean = !this.registerForm.controls[ctrlName].dirty;
    this.isInitialEntry[ctrlName] = fieldIsClean;
  }

  public validate(ctrlName: string) {
    if (this.isInitialEntry[ctrlName]) {
      this.registerForm.controls[ctrlName].markAsDirty();
    }
    this.invalid[ctrlName] = this.registerForm.controls[ctrlName].invalid;
  }

  private setFormAndUser() {
    this.registerForm = this.formBuilder.group({
      confirm: [``,
        Validators.compose([
          Validators.required
        ])
      ],
      email: [``,
        Validators.compose([
          Validators.required,
          Validators.pattern(emailRegex)
        ])
      ],
      first: [``,
        Validators.compose([
          Validators.required
        ])
      ],
      last: [``,
        Validators.compose([
          Validators.required
        ])
      ],
      password: [``,
        Validators.compose([
          Validators.required,
          Validators.minLength(8)
        ])
      ]
    });
    this.user = {
      confirmEmail: ``,
      email: ``,
      first_name: ``,
      graduation: this.stakeholderService.newUser.graduation,
      last_name: ``,
      password: ``,
      stakeholder_type: this.stakeholderService.newUser.stakeholder_type
    };
  }
}
