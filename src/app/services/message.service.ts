import { Injectable } from '@angular/core';
import { Events, ToastController } from '@ionic/angular';
import { flatten, orderBy } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { IConnection } from '@nte/interfaces/connection.interface';
import { GroupMessage } from '@nte/models/group-message.model';
import { Message } from '@nte/models/message.model';
import { SelectedConnections } from '@nte/models/selected-connections.model';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Injectable({ providedIn: 'root' })
export class MessageService extends ListService {
  public newMessage: string = null;
  public show: boolean = false;

  private _filterMessaging: Subject<SelectedConnections> = new Subject<SelectedConnections>();
  private _messages: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>(null);
  private _selectedTeamMember: BehaviorSubject<IConnection> = new BehaviorSubject<IConnection>(null);
  private _isSending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private _unreadCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _unreadMessages: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  private polling: number;

  get filterMessaging() {
    return this._filterMessaging.asObservable();
  }

  set isSending(isSending: boolean) {
    this._isSending.next(isSending);
  }

  get isSending(): boolean {
    return this._isSending.getValue();
  }

  get isSending$(): Observable<boolean> {
    return this._isSending.asObservable();
  }

  set messages(messages: Message[]) {
    this._messages.next(messages);
  }
  get messages(): Message[] {
    return this._messages.getValue();
  }

  get messages$(): Observable<Message[]> {
    return this._messages.asObservable();
  }

  set selectedTeamMember(teamMember: IConnection) {
    if (teamMember !== this.selectedTeamMember) {
      this.clearMessages();
      // if (teamMember) {
      //   this.getMessages(teamMember.id);
      // }
      this._selectedTeamMember.next(teamMember);
    }
  }

  get selectedTeamMember(): IConnection {
    return this._selectedTeamMember.getValue();
  }

  get selectedTeamMember$(): Observable<IConnection> {
    return this._selectedTeamMember.asObservable();
  }

  get unreadCount$(): Observable<number> {
    return this._unreadCount.asObservable();
  }

  get unreadMessages$() {
    return this._unreadMessages.asObservable();
  }

  get unreadMessageSummary() {
    const unreadMessages = this._unreadMessages.getValue();
    if (unreadMessages) {
      const summary = {};
      unreadMessages.forEach(m => summary[m.id] = m.count);
      return summary;
    } else {
      return false;
    }
  }

  constructor(
    private api: ApiService,
    private events: Events,
    private mixpanel: MixpanelService,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController) {
    super();
  }

  public clearMessages() {
    this._messages.next(null);
  }

  public getMessages(connectionId?: number, nextPage: string = ``) {
    const url = connectionId ? `/messages/thread/${connectionId}` : nextPage;
    const isAbsUrl = nextPage.length > 0;
    this.isInitializing = !nextPage.length;
    this.isLoadingMore = !this.isInitializing;
    this.api
      .get(url, isAbsUrl)
      .subscribe(
        response => {
          const data = response.json();
          this.nextPage = data.next;
          const formattedMessages = flatten([this.getParsedMessages(data.results), ...this.messages]);
          this.messages = orderBy(formattedMessages, [`created_on`]);
          this.markRead(connectionId);
          this.events.publish(`moreMessages`, { messages: this.messages });
          this.isInitializing = false;
          this.isLoadingMore = false;
        },
        err => {
          console.error(err);
          this.isInitializing = false;
          this.isLoadingMore = false;
        }
      );
  }

  public getParsedMessage(message: any) {
    const regex = /(\s+)?https:\/\/(?:stg\.)?nexttier\.com\/edu\/#\//g;
    if (message.body.indexOf(`http`) > -1) {
      let messageArray = message.body
        .replace(`;;`, `;name=`)
        .replace(`colleges/`, `page=colleges;id=`)
        .replace(`scholarships/`, `page=scholarships;id=`)
        .replace(/\s*/, ``)
        .replace(`studentTasks`, `page=tasks`)
        .split(regex);
      if (messageArray && messageArray.length) {
        messageArray.filter(m => m !== null || m !== undefined || m !== `` || m !== ` ` || m !== `  `);
      } else {
        messageArray = [];
      }
      if (messageArray.length === 1) {
        message.linkOnly = true;
        message.note = ``;
      } else {
        message.linkOnly = false;
        message.note = messageArray[0];
      }
      const messageUrl = decodeURI(messageArray[messageArray.length - 1]);
      const messageUrlArray = messageUrl.split(`;`);
      message.attachment = {};
      messageUrlArray.forEach(pair => {
        const keyValue = pair.split(`=`);
        message.attachment[keyValue[0]] = keyValue[1];
      });
    }
    return message;
  }

  public getParsedMessages(messages: any[]) {
    if (messages && messages.length) {
      return [...messages].map(m => this.getParsedMessage(m));
    } else {
      return messages;
    }
  }

  public getUnread() {
    this.isInitializing = true;
    this.api
      .get(`/messages/unread/`)
      .subscribe(
        data => {
          const unreads = data.json();
          if (unreads && unreads.length) {
            this._unreadMessages.next(
              orderBy([...unreads], [`count`, `get_full_name`], [`desc`, `asc`])
            );
            this._unreadCount.next([...unreads]
              .map(u => u.count)
              .reduce((acc, val) => acc + val));
            this.isInitializing = false;
          }
        },
        err => {
          console.error(err);
          this.isInitializing = false;
        }
      );
  }

  public init() {
    this.setupPolling();
  }

  public markRead(stakeholderId: number) {
    this.api
      .patch(`/messages/update/${stakeholderId}`)
      .subscribe(
        () => this.getUnread(),
        err => console.error(err)
      );
  }

  public openFilteredChat(selectedConnections: SelectedConnections) {
    this._filterMessaging.next(selectedConnections);
  }

  public send(stakeholderId: number, message: string, midChat: boolean = true) {
    if (this.isSending) { return; }
    this.isSending = true;
    if (message.endsWith(`\n`)) {
      message = message.slice(0, message.length - 2);
    }
    this.api
      .post(`/messages/`, { body: message, id: stakeholderId })
      .subscribe(
        response => {
          this.isSending = false;
          if (midChat) {
            this.messages.push(this.getParsedMessage(response.json()));
            this.events.publish(`messageChange`, { messages: this.messages });
          }
          if (this.selectedTeamMember) {
            this.mixpanel.event(`sent_message`, {
              body: message,
              recipient: this.selectedTeamMember.get_full_name,
              recipient_grad_year: this.selectedTeamMember.graduation_year
            });
          }
        },
        err => {
          console.error(err);
          this.isSending = false;
        }
      );
  }

  public sendToGroup(groupMessage: GroupMessage) {
    this.api
      .post(`/messages/group/`, groupMessage)
      .subscribe(
      () => this.showMessageSuccessToast(),
      () => this.showMessageErrorToast()
    );
  }

  public sendToStudents(
    _studentsToMessage: number[],
    _message: string,
    _filter?: string[]
  ) {
    // let data = {
    //   additional_ids: filter ? [] : studentsToMessage,
    //   filters: filter || [],
    //   ids_to_ignore: filter ? studentsToMessage : [],
    //   new_message: message
    // };
    // this.api.patch('/stakeholder/bulk-update', data)
    //   .subscribe(
    //     response => {
    //       this.showMessageSuccessToast();
    //       this.getUnread();
    //     },
    //     error => {
    //       this.showMessageErrorToast();
    //     }
    //   );
  }

  private setupPolling() {
    if (this.stakeholderService.loggedIn && !this.polling) {
      this.startPolling();
    } else if (!this.stakeholderService.loggedIn && this.polling) {
      this.stopPolling();
    }
    this.stakeholderService.loggedIn$
      .subscribe(
        (isLoggedIn: boolean) => {
          if (isLoggedIn) {
            if (!this.polling) {
              this.startPolling();
            }
          } else if (this.polling) {
            this.stopPolling();
          }
        }
      );
  }

  // --------------------

  private async showMessageErrorToast() {
    const toast = await this.toastCtrl.create({
        duration: 3000,
        message: `Can't send message; please try again`
      });
    toast.present();
  }

  private async showMessageSuccessToast() {
    const toast = await this.toastCtrl.create({
        duration: 3000,
        message: `Message sent`
      });
    toast.present();
  }

  private startPolling() {
    this.polling = setInterval(() => {
      this.getUnread();
    }, 15000);
  }

  private stopPolling() {
    clearInterval(this.polling);
  }
}
