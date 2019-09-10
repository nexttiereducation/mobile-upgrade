import { Component } from '@angular/core';
import { NavParams, ViewController } from '@ionic/angular';

import { ConnectionProvider } from '@nte/services/connection.service';
import { KeyboardProvider } from '@nte/services/keyboard.service';
import { MessageProvider } from '@nte/services/message.service';
import { StakeholderProvider } from '@nte/services/stakeholder.service';
import { UrlProvider } from '@nte/services/url.service';

@Component({
  selector: `send`,
  templateUrl: `send.html`
})
export class SendComponent {
  public connections: any[];
  public imageUrl: string;
  public isSent: boolean = false;
  public item: any;
  public itemType: string;
  public message: string = ``;
  public selectedConnections;

  get isSending() {
    return this.messageProvider.isSending;
  }

  get shareUrl() {
    if (this.itemType === `Task`) {
      const stakeholder = this.stakeholderProvider.stakeholder;
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

  constructor(public viewCtrl: ViewController,
    public connectionProvider: ConnectionProvider,
    private keyboard: KeyboardProvider,
    private messageProvider: MessageProvider,
    private urlProvider: UrlProvider,
    private stakeholderProvider: StakeholderProvider,
    params: NavParams) {
    this.imageUrl = params.get(`imageUrl`);
    this.item = params.get(`item`);
    this.itemType = params.get(`type`);
    this.selectedConnections = new Set();
  }

  ionViewDidLeave() {
    this.connectionProvider.unselectAll();
  }

  ionViewDidLoad() {
    this.connectionProvider.initialize();
  }

  public closeShareModal() {
    this.viewCtrl.dismiss();
  }

  public send() {
    this.keyboard.close();
    if (this.isSent) { return; }
    const message = `${this.message} ${this.urlProvider.getDomain()}${this.shareUrl}`;
    let messagesSent = 0;
    this.selectedConnections.forEach((id) => {
      this.messageProvider.send(id, message);
      messagesSent++;
      if (messagesSent === this.selectedConnections.size) {
        this.isSent = true;
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

}
