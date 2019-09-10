import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { merge } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';

import { IResult } from '@nte/models/interest-profiler.models';
import { INewUser } from '@nte/models/new-user.interface';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { IStudent } from '@nte/models/student.interface';
import { NodeApiService } from '@nte/services/api-node.service';
import { ApiTokenService } from '@nte/services/api-token.service';
import { ApiService } from '@nte/services/api.service';
import { HighSchoolService } from '@nte/services/high-school.service';
import { MixpanelService } from '@nte/services/mixpanel.service';

@Injectable({ providedIn: 'root' })
export class StakeholderService {
  public loggingIn = false;
  public newUser: INewUser = {
    email: null,
    first_name: null,
    last_name: null,
    password: null,
    stakeholder_type: null
  };

  private _loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _loginSuccess: Subject<any> = new Subject<any>();
  private _logoutSuccess: Subject<any> = new Subject<any>();
  private _stakeholder: BehaviorSubject<Stakeholder> = new BehaviorSubject<Stakeholder>(null);

  get loggedIn(): boolean {
    return this._loggedIn.getValue();
  }

  get loggedIn$(): Observable<boolean> {
    return this._loggedIn.asObservable();
  }

  get loginSuccess(): Observable<boolean> {
    return this._loginSuccess.asObservable();
  }

  get logoutSuccess(): Observable<boolean> {
    return this._logoutSuccess.asObservable();
  }

  get stakeholder(): Stakeholder {
    return this._stakeholder.getValue();
  }

  get stakeholder$(): Observable<Stakeholder> {
    return this._stakeholder.asObservable();
  }

  set loggedIn(isLoggedIn: boolean) {
    this._loggedIn.next(isLoggedIn);
  }

  set stakeholder(stakeholder: Stakeholder) {
    this._stakeholder.next(stakeholder);
  }

  constructor(public api: ApiService,
    public apiToken: ApiTokenService,
    public nodeApi: NodeApiService,
    public storage: Storage,
    private highSchoolService: HighSchoolService,
    private mixpanel: MixpanelService,
    private toastCtrl: ToastController) {
    this.stakeholder = new Stakeholder({});
  }

  changePassword(currentPassword: string, newPassword: string, confirmedPassword) {
    return this.api.post(`/stakeholder/password/change/`, {
      new_password: newPassword,
      new_password_confirm: confirmedPassword,
      old_password: currentPassword
    });
  }

  public deleteUser() {
    this.api.delete(`/stakeholder/`)
      .subscribe(() => this.logout());
  }

  public getCleverAuthToken(cleverData: any) {
    const cleverAuthData = cleverData || {};
    return this.api.postWithoutAuthorization(`/clever/login/`, cleverAuthData)
      .subscribe(
        response => this.setStakeholder(response.json(), true, `clever`),
        err => console.error(err)
      );
  }

  public getGraduationYearOptions() {
    return this.api.optionsNoAuth(`/stakeholder/register/`)
      .map((response) => {
        const result = response.json();
        return result.actions.POST.graduation_year;
      });
  }

  public getNewUserForRegistration() {
    this.newUser.graduation_year = this.newUser.graduation.year;
    this.newUser.phase = this.newUser.graduation.phase;
    delete this.newUser.graduation;
    return this.newUser;
  }

  public getOverview() {
    return this.nodeApi.get(`/users/${this.stakeholder.id}/overview`)
      .map((response) => {
        this.stakeholder = Object.assign(this.stakeholder, response.json());
        return response.json();
      });
  }

  public getStakeholderInformation(isLoggingIn?: boolean, loginService?: string) {
    this.api.get(`/stakeholder`)
      .subscribe((response) => {
        const data = response.json();
        this.stakeholder = new Stakeholder(data);
        this.loggedIn = true;
        this.stakeholder.loggedIn = true;
        this.storage.get(`ls.token`).then((val) => {
          this.stakeholder.authToken = val;
        });
        this.stakeholder.id = data.id;
        this.populateEntitlements();
        this.mixpanel.start(this.stakeholder);
        if (this.stakeholder.highschool) {
          this.setHighSchool();
        }
        if (isLoggingIn) {
          if (loginService === `clever`) {
            this.mixpanel.event(`logged_in_with_clever`);
          } else {
            this.mixpanel.event(`logged_in_with_basic_login`);
          }
        }
        return this.stakeholder;
      });
  }

  public getStudentsForParent(queryString = ``): Observable<IStudent[]> {
    return this.api.get(`/students/${queryString}`)
      .map((response) => response.json().results)
      .do<IStudent[]>((students) => {
        this.stakeholder.students = students;
        return students;
      });
  }

  public login(loginData: any) {
    this.loggingIn = true;
    this.api.postWithoutAuthorization(`/stakeholder/login/`, loginData)
      .subscribe(
        response => {
          const data = response.json();
          this.setStakeholder(data, true);
          this.apiToken.token = data.token;
        },
        err => {
          this.loggingIn = false;
          let errorMessage = `Unable to log you in. Please try again!`;
          if (err && err._body) {
            if (this.isJson(err._body)) {
              errorMessage = JSON.parse(err._body).detail;
            }
          }
          this.toastCtrl.create({
            duration: 5000,
            message: errorMessage
          }).present();
        }
      );
  }

  public logout() {
    this.storage.remove(`ls.stakeholder`);
    this.storage.remove(`ls.token`);
    this.storage.remove(`ls.user.roleId`);
    this.storage.clear();
    this.stakeholder = new Stakeholder({});
    this.newUser = {
      email: null,
      first_name: null,
      last_name: null,
      password: null,
      stakeholder_type: null
    };
    this.mixpanel.event(`logout`);
    this.mixpanel.clearUser();
    this.loggedIn = false;
    this._logoutSuccess.next(true);
  }

  public populateEntitlements() {
    const entitlements = new Array();
    return this.api.getPaged(`/stakeholder/entitlement/all/`)
      .subscribe(data => {
        entitlements.push.apply(entitlements, data);
        this.stakeholder.entitlements = entitlements;
        this.refreshStakeholder();
        this._loginSuccess.next(true);
      });
  }

  public refreshStakeholder() {
    this.stakeholder = new Stakeholder(this.stakeholder);
    this.storage.set(`ls.stakeholder`, JSON.stringify(this.stakeholder));
  }

  public register(): Observable<any> {
    if (this.newUser.graduation) {
      this.newUser = this.getNewUserForRegistration();
    }
    return this.api.postWithoutAuthorization(`/stakeholder/register`, this.newUser)
      .map((response) => {
        this.mixpanel.event(`user_registered`);
        return response.json();
      });
  }

  public removeProfilePicture(userId: number) {
    return this.nodeApi.delete(`/users/${userId}/profile-pic`);
  }

  public sendForgotPasswordEmail(email: string): Observable<any> {
    return this.api.postWithoutAuthorization(`/stakeholder/forgot`, { email })
      .map(response => response.json());
  }

  public setHighSchool() {
    return this.highSchoolService.getDetails(this.stakeholder.highschool)
      .subscribe(() => {
        this.mixpanel.setHighSchool(
          this.stakeholder.district ? this.stakeholder.district.name : ``,
          this.stakeholder.highschool
        );
      });
  }

  public setInterestProfilerResult(result: IResult[]) {
    this.stakeholder.interest_profiler_result = result;
    this.storage.set(`ls.stakeholder`, JSON.stringify(this.stakeholder));
  }

  public setSessionStorage(token: string, isLoggingIn?: boolean, loginService?: string) {
    this.storage.set(`ls.token`, token);
    this.api.setupHeaders(token).then(() => {
      this.nodeApi.setupHeaders(token);
      this.getStakeholderInformation(isLoggingIn, loginService);
      // this.pnService.setToken();
    });
  }

  public setStakeholder(loginData: any, isLoggingIn?: boolean, loginService?: string) {
    this.stakeholder.authToken = loginData.token || loginData.authToken;
    this.stakeholder.id = loginData.id;
    this.setSessionStorage(this.stakeholder.authToken, isLoggingIn, loginService);
  }

  public updateProfilePicture(file: File) {
    const formData = new FormData();
    formData.append(`profile_photo`, file);
    formData.append(`type`, file.type);
    return this.api.patchFile(`/stakeholder/`, file)
      .map((response: any) => this.stakeholder = response);
  }

  public updateStakeholder() {
    this.api.get(`/stakeholder`)
      .map((response) => {
        const data = response.json();
        const updatedStakeholder = new Stakeholder(data);
        merge(this.stakeholder, updatedStakeholder);
      });
  }

  private isJson(jsonString: string) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return false;
    }
  }
}
