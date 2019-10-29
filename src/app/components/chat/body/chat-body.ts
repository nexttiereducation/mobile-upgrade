import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Events, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ChatService } from '@nte/components/chat/chat.service';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { Message } from '@nte/models/message.model';
import { CollegePage } from '@nte/pages/college/college';
import { ScholarshipPage } from '@nte/pages/scholarship/scholarship';
import { TaskPage } from '@nte/pages/task/task';
import { MessageService } from '@nte/services/message.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `chat-body`,
  templateUrl: `chat-body.html`,
  styleUrls: [`chat-body.scss`],
  encapsulation: ViewEncapsulation.None
})
export class ChatBodyComponent implements OnInit, OnDestroy {
  @ViewChild(`infiniteScroll`, { static: false }) infiniteScroll: IonInfiniteScroll;
  @ViewChild(`infiniteScrollContent`, { static: false }) infiniteScrollContent: IonInfiniteScrollContent;

  @Input() public emptyState: IEmptyState;
  @Input() public isSending: boolean;
  @Input() public messages: any[];
  @Input() public nextPage?: string;
  @Input() public teamMemberPhoto?: string;

  @Output() clear: EventEmitter<void> = new EventEmitter();
  @Output() loadMore: EventEmitter<void> = new EventEmitter();

  public avatarPlaceholder: string = `assets/image/contact/avatar.svg`;
  public hasScrolledDown: boolean = false;
  public keyboardShowing: boolean = false;
  public loadingMore: boolean;
  public messagesContainerClass: string;
  public scrollDown?: boolean;
  public scrollingBottom: boolean = false;
  public scrollingTop: boolean = false;

  private ngUnsubscribe: Subject<any> = new Subject();
  private rootEl;

  get hasNextPage() {
    return this.nextPage && this.nextPage.length > 0;
    // TODO: Move to messages page
    // this.messageService.nextPage && this.messageService.nextPage.length > 0;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public chatService: ChatService,
    public events: Events,
    public messageService: MessageService,
    private router: Router,
    private stakeholderService: StakeholderService,
    private taskService: TaskService) { }

  ngOnInit() {
    this.chatService.scrollToBottom = true;
    // this.setupChangeSubs();
    if (this.emptyState && this.emptyState.body) {
      this.emptyState.body = this.emptyState.body.replace(`{{subtitle}}`, this.chatService.subtitle);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.clear.emit();
    this.events.unsubscribe(this.chatService.changeEvent);
    this.events.unsubscribe(this.chatService.moreEvent);
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

  public openAttachment(attachment: any) {
    if (attachment && attachment.page) {
      switch (attachment.page) {
        case `colleges`:
          this.router.navigate([
            CollegePage,
            {
              college: {
                id: attachment.id,
                name: attachment.name
              },
              id: attachment.id
            }
          ]);
          break;
        case `scholarships`:
          this.router.navigate(
            [ScholarshipPage],
            { state: { id: attachment.id } }
          );
          break;
        case `tasks`:
          this.taskService.getTaskTrackerById(attachment.id)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(response => {
              this.router.navigate(
                [TaskPage],
                {
                  state: {
                    isParent: this.user.isParent,
                    task: response,
                    taskTypeImg: `assets/image/task/tile_all.svg`
                  }
                }
              );
            });
          break;
        default:
          break;
      }
    }
  }

  public typeIs(type: string) {
    return this.chatService.messageType === type;
  }

  private setupChangeSubs() {
    // this.events.subscribe(
    //   this.chatService.changeEvent,
    //   data => this.updateMessages(data)
    // );
    // this.events.subscribe(
    //   this.chatService.moreEvent,
    //   data => {
    //     this.infiniteScroll.complete();
    //     this.updateMessages(data);
    //   });
  }

  private updateMessages(data) {
    // TODO: Determine if this logic is needed / where to implement
    // const msgs = data[`${this.chatService.messageType}s`];
    // switch (this.chatService.messageType) {
    //   case `message`:
    //     if (msgs) {
    //       this.messageService.messages = msgs;
    //     }
    //     if (!this.loadingMore) {
    //       this.scrollToBottom();
    //     }
    //     this.loadingMore = false;
    //     this.messageService.isSending = false;
    //     break;
    //   case `note`:
    //     if (msgs) {
    //       this.taskNotesService.all = msgs;
    //     }
    //     break;
    // }
    // this.loadingMore = false;
  }

}
