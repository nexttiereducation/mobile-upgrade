import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { escapeRegExp } from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { emailRegex } from '@nte/constants/stakeholder.constants';
import { INewUser } from '@nte/interfaces/new-user.interface';
import { TabsPage } from '@nte/pages/tabs/tabs';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `register-form`,
  templateUrl: `register-form.html`,
  styles: [`
    button:last-child {
      margin-bottom: 10px;
    }
  `]
})
export class RegisterFormPage implements OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public invalid: any = {};
  public isInitialEntry: any = {};
  public loggingIn: boolean;
  public registerForm: FormGroup;
  public user: INewUser;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public router: Router,
    public platform: Platform,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    this.setFormAndUser();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.mixpanel.signUp(response, this.stakeholderService.newUser);
          this.stakeholderService.loginSuccess
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              (success) => {
                this.router.navigate([TabsPage]);
              }
            );
          this.stakeholderService.login({
            email: this.stakeholderService.newUser.email,
            password: this.stakeholderService.newUser.password
          });
        },
        (error) => {
          this.loggingIn = false;
          this.showErrorToast(JSON.parse(error._body).detail);
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
      confirm: [
        ``,
        Validators.compose([
          Validators.required
        ])
      ],
      email: [
        ``,
        Validators.compose([
          Validators.required,
          Validators.pattern(emailRegex)
        ])
      ],
      first: [
        ``,
        Validators.compose([
          Validators.required
        ])
      ],
      last: [
        ``,
        Validators.compose([
          Validators.required
        ])
      ],
      password: [
        ``,
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

  private async showErrorToast(errorMsg: string) {
    const toast = await this.toastCtrl.create({
      duration: 5000,
      message: errorMsg
    });
    toast.present();
  }
}
