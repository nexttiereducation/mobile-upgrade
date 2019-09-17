import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Subject } from 'rxjs';

import { emailRegex, registerMessage } from '@nte/constants/stakeholder.constants';
import { EnvironmentService } from '@nte/services/environment.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  animations: [
    trigger(`keyboardState`, [
      state(`closed, void`,
        style({})
      ),
      state(`open`,
        style({
          top: `5%`,
          transform: `scale(.65)`,
          'object-fit': `cover`,
          'object-position': `100% 0`,
          height: `10rem`
        })
      ),
      state(`closed`,
        style({})
      ),
      transition(`* => *`, [
        animate(`225ms ease-in-out`),
        // cubic-bezier(0.4,0.0,0.2,1)
        style({})
      ])
    ])
  ],
  selector: `login`,
  templateUrl: `login.html`,
  styleUrls: [`login.scss`]
})
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public email: string;
  public invalid: any = {};
  public isInitialEntry: any = {};
  public loginForm: FormGroup;
  public password: string;

  private _keyboardShowing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private ngUnsubscribe: Subject<any> = new Subject();

  get emailCtrl() {
    if (this.loginForm.contains('email')) {
      return this.loginForm.get('email');
    }
  }

  get keyboardShowing() {
    return this._keyboardShowing.asObservable();
  }

  get loggingIn() {
    return this.stakeholderService.loggingIn;
  }

  set loggingIn(loggingIn: boolean) {
    this.stakeholderService.loggingIn = loggingIn;
  }

  get passwordCtrl() {
    if (this.loginForm.contains('password')) {
      return this.loginForm.get('password');
    }
  }
  constructor(
    public environmentService: EnvironmentService,
    public platform: Platform,
    private alertCtrl: AlertController,
    private emailComposer: EmailComposer,
    private formBuilder: FormBuilder,
    private mixpanel: MixpanelService,
    private router: Router,
    private stakeholderService: StakeholderService,
    private storage: Storage) {
    this.loginForm = this.formBuilder.group({
      email: new FormControl(
        ``,
        Validators.compose([
          Validators.required,
          Validators.pattern(emailRegex)
        ])
      ),
      password: new FormControl(
        ``,
        Validators.compose([
          Validators.required,
          Validators.minLength(8)
        ])
      )
    });
  }

  ngOnInit() {
    this.stakeholderService.checkStorage().then(
      loggedIn => {
        this.loggingIn = !loggedIn;
        if (loggedIn) {
          this.router.navigateByUrl(`app/tasks`);
        }
      }
    );
    this.mixpanel.event(`$app_open`);
    this.mixpanel.event(`navigated_to-Login`);
    // this.setupLoginSub();
    this.setupKeyboardListeners();
    this.stakeholderService.checkStorage();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public checkValidate(ctrlName: string) {
    if (this.isInitialEntry[ctrlName] === false) {
      this.validate(ctrlName);
    }
  }

  public goToForgotPassword() {
    this.router.navigate([`forgot-password`]);
  }

  public login() {
    this.stakeholderService.loginSuccess
      .subscribe(loggedIn => {
        if (loggedIn) {
          this.router.navigateByUrl(`/app`);
        }
      });
    this.stakeholderService.login(this.loginForm.value);
  }

  public loginWithClever() {
    // const redirectUri = `https://nexttier.com/edu/clever`;
    // const clientId = this.getClientId(this.environmentService.name);
    // const cleverUrl =
    //   `https://clever.com/oauth/authorize?response_type=token` +
    //   `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    //   `&client_id=${clientId}`;
    // /*tslint:disable:no-unused-variable */
    // const browser = this.linkService.create(cleverUrl);
    // https://clever.com/oauth/authorize?client_id=<client id>
    //      &redirect_uri=<redirect uri>&response=code&state=<state input>
    // TODO: Fix Clever login
    // browser.addEventListener(`loadstart`, event => {
    //   this.handleCleverLogin(event.url, redirectUri, browser);
    // });
  }

  public setIsInitialEntry(ctrlName: string) {
    this._keyboardShowing.next(true);
    this.isInitialEntry[ctrlName] = !this.loginForm.controls[ctrlName].dirty;
  }

  public async showRegisterAlert() {
    const alert = await this.alertCtrl.create({
      buttons: [
        {
          handler: () => {
            if (this.platform.is(`android`) && this.emailComposer) {
              this.emailComposer.isAvailable().then(() => {
                this.emailComposer.open({
                  isHtml: true,
                  to: `signup@nexttier.com`
                });
              });
            } else {
              window.location.href = `mailto:signup@nexttier.com`;
            }
          },
          text: `Contact us`
        },
        `Dismiss`
      ],
      header: registerMessage.title,
      message: registerMessage.message,
      subHeader: registerMessage.subTitle
    });
    return await alert.present();
  }

  public validate(ctrlName: string) {
    if (this.isInitialEntry[ctrlName]) {
      this.loginForm.controls[ctrlName].markAsDirty();
    }
    this.invalid[ctrlName] = this.loginForm.controls[ctrlName].invalid;
  }

  /* PRIVATE METHODS */

  // private extractCodeFromUrl(url: string) {
  //   const queryString = url.split(`?`)[1];
  //   if (queryString) {
  //     const queryArray = queryString.split(`&`);
  //     const keyValuePair = queryArray[0].split(`=`);
  //     if (!(keyValuePair[0].search(`code`) === -1)) {
  //       return keyValuePair[1];
  //     }
  //     return null;
  //   }
  // }

  // private getClientId(environment: string) {
  //   switch (environment) {
  //     case `stg`:
  //     case `dev`:
  //       return `a61a4ca5ab881037cece`;
  //     case `prod`:
  //       return `88acf1cc240c3d334b2f`;
  //   }
  // }

  // private handleCleverLogin(url: string, redirectUri: string, browser: any) {
  //   const code = this.extractCodeFromUrl(url);
  //   if (!code) {
  //     return;
  //   }
  //   this.stakeholderService.getCleverAuthToken({
  //     code,
  //     redirect_uri: redirectUri
  //   });
  //   browser.close();
  // }

  private setupKeyboardListeners() {
    window.addEventListener(`keyboardDidShow`, () => {
      this._keyboardShowing.next(true);
    });
    window.addEventListener(`keyboardWillShow`, () => {
      this._keyboardShowing.next(true);
    });
    window.addEventListener(`keyboardDidHide`, () => {
      this._keyboardShowing.next(false);
    });
    window.addEventListener(`keyboardWillHide`, () => {
      this._keyboardShowing.next(false);
    });
  }
}
