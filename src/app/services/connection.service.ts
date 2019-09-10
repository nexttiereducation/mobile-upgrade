import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import 'rxjs/add/operator/map';

import { ConnectionInvites } from '@nte/models/connection-invites.model';
import { IPendingConnection } from '@nte/models/pending-connection.interface';
import { IStudent } from '@nte/models/student.interface';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

const accept = `Accept`;
const decline = `Ignore`;

@Injectable({ providedIn: 'root' })
export class ConnectionService extends ListService {
  private _invites: BehaviorSubject<ConnectionInvites> = new BehaviorSubject<ConnectionInvites>(null);
  private _students: IStudent[] = new Array<IStudent>();

  get invites() {
    return this._invites.getValue();
  }

  get invites$() {
    return this._invites.asObservable();
  }

  get students() {
    return this._students;
  }

  constructor(private apiService: ApiService,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    super();
  }

  public acceptInvite(token: string): void {
    this.respondToInvite(token, accept)
      .subscribe(
        () => {
          this.mixpanel.event(`connection_invite_accepted`);
          this.toastCtrl.create({
            duration: 3000,
            message: `Invitation accepted.`
          }).present();
          this.getPending();
          this.getAllConnections();
          // this.studentService.getStudents();
        },
        err => {
          console.error(err);
          this.toastCtrl.create({
            duration: 3000,
            message: `Can't accept invite; please try again.`
          }).present();
        }
      );
  }

  public clear() {
    this.all = new Array(null);
  }

  public declineInvite(token: string): void {
    this.respondToInvite(token, decline)
      .subscribe(
        () => {
          this.mixpanel.event(`connection_invite_declined`);
          this.toastCtrl.create({
            duration: 3000,
            message: `Invitation declined.`
          }).present();
          this.getPending();
        },
        err => {
          console.error(err);
          this.toastCtrl.create({
            duration: 3000,
            message: `Can't decline invite; please try again.`
          }).present();
        }
      );
  }

  public getAllConnections() {
    let connections = [];
    return this.apiService.get(`/stakeholder/connections/all`)
      .subscribe(
        response => {
          connections = response.json().results
            .sort((a, b) => (a.get_full_name > b.get_full_name) ? 1 : -1);
          this.all = connections;
        },
        err => console.error(err)
      );
  }

  public getPending(): void {
    this.isLoadingMore = true;
    this.apiService.get(`/stakeholder/connections/pending/`)
      .subscribe(
        response => {
          const data = response.json();
          this._invites.next(this.parseInvites(data.results));
          this.count = data.count;
          this.isLoadingMore = false;
        },
        err => {
          console.error(err);
          this.isLoadingMore = false;
        }
      );
  }

  public initialize() {
    this.getAllConnections();
  }

  public invite(email: string): void {
    this.apiService.post(`/stakeholder/invite/`, { email })
      .subscribe(
        () => {
          this.mixpanel.event(`connection_invite_sent`);
          this.toastCtrl.create({
            duration: 3000,
            message: `Invite sent to ${email}.`
          }).present();
          this.getPending();
        },
        err => {
          console.error(err);
          const errBody = JSON.parse(err._body);
          const errorMessage = (errBody && errBody.detail) ? errBody.detail : `Email address invalid; please try again.`;
          this.toastCtrl.create({
            duration: 3000,
            message: errorMessage
          }).present();
        }
      );
  }

  public respondToInvite(token: string, response: string): Observable<Response> {
    return this.apiService.post(
      `/stakeholder/invite/acceptance/${token}/`,
      { status: response }
    );
  }

  public revokeInvite(token: string): void {
    this.apiService.delete(`/stakeholder/invite/delete/${token}/`)
      .subscribe(
        () => {
          this.mixpanel.event(`connection_invite_revoked`);
          this.toastCtrl.create({
            duration: 3000,
            message: `Invitation revoked.`
          }).present();
          this.getPending();
        },
        err => {
          console.error(err);
          this.toastCtrl.create({
            duration: 3000,
            message: `Can't revoke invite; please try again.`
          }).present();
        }
      );
  }

  public searchConnections(name: string) {
    return this.apiService.get(`/stakeholder/connections/all?search=${name}`)
      .pipe(map((response) => response.json().results));
  }

  public unselectAll() {
    this.all = this.all.map(c => c.isSelected = false);
  }

  private parseInvites(pending: IPendingConnection[]): ConnectionInvites {
    const invites = new ConnectionInvites();
    invites.received = [...pending].filter(p => p.invite_email === this.stakeholderService.stakeholder.email);
    invites.sent = [...pending].filter(p => p.invite_email !== this.stakeholderService.stakeholder.email);
    return invites;
  }

}
