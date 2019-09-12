import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';

import { ConnectionService } from '@nte/services/connection.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { MessageService } from '@nte/services/message.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { UrlService } from '@nte/services/url.service';

@Component({
  selector: `send`,
  templateUrl: `send.html`,
  styleUrls: [`send.scss`],
  encapsulation: ViewEncapsulation.None
})
export class SendComponent implements OnInit, OnDestroy {
  public connections: any[];
  public imageUrl: string;
  public isSent: boolean = false;
  public item: any;
  public itemType: string;
  public message: string = ``;
  public selectedConnections;

  get isSending() {
    return this.messageService.isSending;
  }

  get shareUrl() {
    if (this.itemType === `Task`) {
      const stakeholder = this.stakeholderService.stakeholder;
      const timeStamp = new Date().getTime();
      const name = encodeURI(`${stakeholder.first_name} ` + stakeholder.last_name);
      const taskName = encodeURI(this.item.task.name);
      return `edu/#/studentTasks;id=${this.item.id};action=tasks;activity=1;` +
        `name=${name};stamp=${timeStamp};student=${stakeholder.id};;${taskName}`;
    } else if (this.itemType === `College`) {
      const id = this.item.id || this.item.institution.id || this.item.institution;
      let collegeName = this.item.name || this.item.institution_name || this.item.institution.name;
      collegeName = encodeURI(collegeName);
      return `edu/#/colleges/${id};;${collegeName}`;
    } else if (this.itemType === `Scholarship`) {
      const scholarshipName = encodeURI(this.item.name);
      return `edu/#/scholarships/${this.item.id};;${scholarshipName}`;
    }
  }

  constructor(public connectionService: ConnectionService,
    private keyboard: KeyboardService,
    private messageService: MessageService,
    private modalCtrl: ModalController,
    private stakeholderService: StakeholderService,
    private toastCtrl: ToastController,
    private urlService: UrlService,
    params: NavParams) {
    this.imageUrl = params.get(`imageUrl`);
    this.item = params.get(`item`);
    this.itemType = params.get(`type`);
    this.selectedConnections = new Set();
  }

  ngOnInit() {
    this.connectionService.initialize();
  }

  ngOnDestroy() {
    this.connectionService.unselectAll();
  }

  public closeShareModal() {
    this.modalCtrl.dismiss();
  }

  public send() {
    this.keyboard.close();
    if (this.isSent) { return; }
    const message = `${this.message} ${this.urlService.getDomain()}${this.shareUrl}`;
    let messagesSent = 0;
    this.selectedConnections.forEach((id) => {
      this.messageService.send(id, message, false);
      messagesSent++;
      if (messagesSent === this.selectedConnections.size) {
        this.isSent = true;
        this.openSentToast(messagesSent);
        this.modalCtrl.dismiss();
      }
    });
  }

  public toggleSelection(connection: any) {
    connection.isSelected = !connection.isSelected;
    if (this.selectedConnections.has(connection.id)) {
      this.selectedConnections.delete(connection.id);
    } else {
      this.selectedConnections.add(connection.id);
    }
  }

  private async openSentToast(numberSent: number) {
    const toast = await this.toastCtrl.create({
      duration: 3000,
      message: `${this.itemType} sent to ${numberSent} connections.`
    });
    toast.present();
  }

}
