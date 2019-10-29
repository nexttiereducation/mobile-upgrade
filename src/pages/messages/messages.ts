import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Events, IonContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ChatService } from '@nte/components/chat/chat.service';
import { MESSAGES_EMPTY_STATE } from '@nte/constants/messaging.constants';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { MessageService } from '@nte/services/message.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `messages`,
  templateUrl: `messages.html`,
  styleUrls: [`messages.scss`],
  encapsulation: ViewEncapsulation.None
})
export class MessagesPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content;

  public emptyState: IEmptyState = MESSAGES_EMPTY_STATE;

  private ngUnsubscribe: Subject<any> = new Subject();

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public events: Events,
    public chatService: ChatService,
    public messageService: MessageService,
    private stakeholderService: StakeholderService) { }

  ngOnInit() {
    this.messageService.getMessages(this.messageService.selectedTeamMember.id);
    this.chatService.messageType = `message`;
    this.chatService.subtitle = this.messageService.selectedTeamMember.get_full_name;
    this.chatService.scrollToBottom$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(scroll => {
        this.scrollToBottom(scroll);
      });
    if (this.emptyState && this.emptyState.body) {
      this.emptyState.body = this.emptyState.body.replace(`{{subtitle}}`, this.chatService.subtitle);
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public scrollToBottom(scroll: boolean = true) {
    if (this.content && scroll) {
      this.content.scrollToBottom(750);
      this.chatService.scrollToBottom = false;
    }
  }

  public send(msg: string) {
    if (this.messageService.selectedTeamMember && this.messageService.selectedTeamMember.id) {
      this.messageService.send(this.messageService.selectedTeamMember.id, msg);
    }
  }

}
