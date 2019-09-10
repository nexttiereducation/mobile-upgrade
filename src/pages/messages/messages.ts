import { Component, ViewChild } from '@angular/core';
import {
  Content,
  Events,
  InfiniteScroll,
  InfiniteScrollContent,
  IonicPage,
  NavController,
  NavParams
} from 'ionic-angular';
import { Observable } from 'rxjs';

import { IEmptyState } from '@nte/models/empty-state';
import { Message } from '@nte/models/message.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { CollegePage } from './../../pages/college/college';
import { ScholarshipPage } from './../../pages/scholarship/scholarship';
import { TaskPage } from './../../pages/task/task';
import { MessageService } from '@nte/services/message.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TaskService } from '@nte/services/task.service';

@IonicPage({
  name: `messages-page`
})
@Component({
  selector: `messages`,
  templateUrl: `messages.html`
})
export class MessagesPage {
  @ViewChild(Content) public content: Content;
  @ViewChild(`infiniteScroll`) public infiniteScroll: InfiniteScrollContent;
  @ViewChild(`messagesContainer`) public messagesContainer;

  public avatarPlaceholder: string = `assets/image/contact/avatar.svg`;
  public emptyState: IEmptyState;
  public hasScrolledDown: boolean = false;
  public keyboardShowing: boolean = false;
  public loadingMore: boolean;
  public messagesContainerClass: string;
  public messageType: string = `message`;
  public newMessage: string;
  public scrollDown?: boolean;
  public scrollingBottom: boolean = false;
  public scrollingTop: boolean = false;
  public status: string;
  public subtitle: string = ``;
  public teamMemberPhoto?: string;
  public taskTracker: TaskTracker;

  get hasNextPage() {
    switch (this.messageType) {
      case `message`:
        return this.messageService.nextPage && this.messageService.nextPage.length > 0;
      case `note`:
        return this.taskService.nextNotesPage && this.taskService.nextNotesPage.length > 0;
    }
  }

  get inputPlaceholder() {
    return `Write a ${this.messageType}...`;
  }

  get messages(): Message[] {
    switch (this.messageType) {
      case `message`:
        return this.messageService.messages;
      case `note`:
        return this.taskService.notes;
    }
  }

  get messages$(): Observable<Message[]> {
    switch (this.messageType) {
      case `message`:
        return this.messageService.messages$;
      case `note`:
        return this.taskService.notes$;
    }
  }

  get toolbarColor() {
    switch (this.messageType) {
      case `message`:
        return `grayLightest`;
      case `note`:
        return this.status ? this.status[`color`] : `primary`;
    }
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(params: NavParams,
    public events: Events,
    public messageService: MessageService,
    private navCtrl: NavController,
    private stakeholderService: StakeholderService,
    private taskService: TaskService) {
    this.emptyState = params.get(`emptyState`);
    this.messageType = params.get(`messageType`);
    this.scrollDown = params.get(`scrollDown`);
    this.status = params.get(`status`);
    this.subtitle = params.get(`subtitle`);
    this.taskTracker = params.get(`taskTracker`);
    this.teamMemberPhoto = params.get(`teamMemberPhoto`) || this.avatarPlaceholder;
  }

  ionViewDidEnter() {
    switch (this.messageType) {
      case `message`:
        this.messageService.getMessages(this.messageService.selectedTeamMember.id);
        break;
      case `note`:
        this.taskService.getNotes(this.taskService.activeTaskId);
        break;
      default:
        break;
    }
    this.scrollToBottom();
  }

  ionViewDidLeave() {
    this.clear();
    this.events.unsubscribe(`messageChange`);
    this.events.unsubscribe(`moreMessages`);
    this.events.unsubscribe(`moreNotes`);
    this.events.unsubscribe(`noteChange`);
  }

  ionViewDidLoad() {
    this.setupChangeSubs();
    this.setupKeyboardSubs();
    if (this.emptyState && this.emptyState.body) {
      this.emptyState.body = this.emptyState.body.replace(`{{subtitle}}`, this.subtitle);
    }
  }

  public back() {
    this.navCtrl.pop({ animation: `ios-transition` });
  }

  public clear() {
    this.messageService.clearMessages();
  }

  public getDate(msg: Message | any) {
    if (msg.created) {
      return msg.created;
    } else if (msg.created_on) {
      return msg.created_on;
    }
  }

  public isNewAuthor(msg: Message, indx: number) {
    const prevMsg = this.messages[indx - 1];
    return msg && msg.author && prevMsg && prevMsg.author && (msg.author.id !== prevMsg.author.id);
  }

  public isNewDate(msg: Message | any, indx: number) {
    const prevMsg = indx > 0 ? this.messages[indx - 1] : null;
    const mDate = (msg && this.getDate(msg)) ? this.getDate(msg).substr(0, 10) : null;
    const pDate = (prevMsg && this.getDate(prevMsg)) ? this.getDate(prevMsg).substr(0, 10) : null;
    return mDate && pDate && (mDate !== pDate);
  }

  public loadMoreMessages(infiniteScroll: InfiniteScroll) {
    this.loadingMore = true;
    this.events.subscribe(
      `moreMessages`,
      data => {
        infiniteScroll.complete();
        this.updateMessages(data);
      });
    this.events.subscribe(
      `moreNotes`,
      data => {
        infiniteScroll.complete();
        this.updateMessages(data);
      });
    this.events.publish(`loadMore`);
  }

  public openAttachment(attachment: any) {
    if (attachment && attachment.page) {
      switch (attachment.page) {
        case `colleges`:
          this.navCtrl.push(
            CollegePage,
            {
              college: {
                id: attachment.id,
                name: attachment.name
              },
              id: attachment.id
            }
          );
          break;
        case `scholarships`:
          this.navCtrl.push(
            ScholarshipPage,
            { id: attachment.id }
          );
          break;
        case `tasks`:
          this.taskService.getTaskTrackerById(attachment.id)
            .subscribe(response => {
              this.navCtrl.push(
                TaskPage,
                {
                  isParent: this.user.isParent,
                  task: response,
                  taskTypeImg: `assets/image/task/tile_all.svg`
                }
              );
            });
          break;
        default:
          break;
      }
    }
  }

  public scrollToBottom() {
    if (this.content) {
      setTimeout(
        () => {
          this.content.scrollToBottom(300)
            .then(() => { this.hasScrolledDown = true; })
            .catch((err) => console.error(err));
        },
        300
      );
    }
  }

  public send(msg: string) {
    switch (this.messageType) {
      case `message`:
        if (this.messageService.selectedTeamMember && this.messageService.selectedTeamMember.id) {
          this.messageService.send(this.messageService.selectedTeamMember.id, msg);
        }
        break;
      case `note`:
        this.taskService.createNote(this.taskTracker, msg);
        break;
    }
    this.newMessage = ``;
  }

  private setupChangeSubs() {
    this.events.subscribe(
      `${this.messageType}Change`,
      data => this.updateMessages(data)
    );
  }

  private setupKeyboardSubs() {
    // window.addEventListener(
    //   `keyboardDidShow`,
    //   () => {
    //     this.keyboardShowing = true;
    //     // this.content.scrollToBottom(300);
    //   });
    // window.addEventListener(
    //   `keyboardDidHide`,
    //   () => {
    //     this.keyboardShowing = false;
    //     // this.content.scrollToBottom(300);
    //   });
  }

  private updateMessages(data) {
    const msgs = data[`${this.messageType}s`];
    switch (this.messageType) {
      case `message`:
        if (msgs) {
          this.messageService.messages = msgs;
        }
        if (!this.loadingMore) {
          this.scrollToBottom();
        }
        this.messageService.isSending = false;
        break;
      case `note`:
        if (msgs) {
          this.taskService.notes = msgs;
        }
        break;
    }
    this.loadingMore = false;
  }

}
