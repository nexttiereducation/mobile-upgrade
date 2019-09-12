import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MESSAGES_EMPTY_STATE, MESSAGING_EMPTY_STATE } from '@nte/constants/messaging.constants';
import { IConnection } from '@nte/interfaces/connection.interface';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { IPendingConnection } from '@nte/interfaces/pending-connection.interface';
import { ConnectionService } from '@nte/services/connection.service';
import { MessageService } from '@nte/services/message.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Component({
  selector: `messaging`,
  templateUrl: `messaging.html`,
  styleUrls: [`messaging.scss`]
})
export class MessagingPage implements OnInit {
  public emptyState: IEmptyState = MESSAGING_EMPTY_STATE;
  public messagesEmptyState: IEmptyState = MESSAGES_EMPTY_STATE;
  public scrollDown: boolean = false;

  get messageSummary() {
    return this.messageService.unreadMessageSummary;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public connectionService: ConnectionService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholderService: StakeholderService) { }

  ngOnInit() {
    if (!this.connectionService.all
      || !this.connectionService.all.length) {
      this.connectionService.getAllConnections();
    }
    if (!this.connectionService.invites
      || !this.connectionService.invites.received.length
      || !this.connectionService.invites.sent.length) {
      this.connectionService.getPending();
    }
  }

  public acceptInvite(pendingConnection: IPendingConnection) {
    this.connectionService.acceptInvite(pendingConnection.invite_token);
  }

  public back() {
    // this.navCtrl.pop({ animation: `ios-transition` });
  }

  public cancelInvite(pendingConnection: IPendingConnection) {
    this.connectionService.revokeInvite(pendingConnection.invite_token);
  }

  public clear() {
    this.messageService.clearMessages();
  }

  public declineInvite(pendingConnection: IPendingConnection) {
    this.connectionService.declineInvite(pendingConnection.invite_token);
  }

  public getPhoto(user: any) {
    if (user) {
      if (user.profile_photo && user.profile_photo.length) {
        return user.profile_photo;
      } else if (this.messageSummary[user.id]
        && this.messageSummary[user.id].photo_url
        && this.messageSummary[user.id].photo_url.length) {
        return this.messageSummary[user.id].photo_url;
      } else {
        return `assets/image/contact/avatar-gray.svg`;
      }
    }
  }

  public getSummary(connection: any) {
    return this.messageService.unreadMessageSummary[connection.id];
  }

  public loadMore() {
    this.messageService.getMessages(null, this.messageService.nextPage);
  }

  public selectTeamMember(teamMember: IConnection | any) {
    this.messageService.selectedTeamMember = teamMember;
    this.router.navigate(
      [teamMember.id],
      {
        relativeTo: this.route,
        state: {
          emptyState: this.messagesEmptyState,
          messageType: `message`,
          scrollDown: this.scrollDown,
          subtitle: teamMember.get_full_name,
          teamMemberPhoto: teamMember.profile_photo
        }
      }
    );
  }

}
