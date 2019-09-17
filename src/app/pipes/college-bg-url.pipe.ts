import { Pipe, PipeTransform } from '@angular/core';
import { Platform } from '@ionic/angular';
import { upperFirst } from 'lodash';

import { COLLEGES_WITH_BGS, REGION_PER_STATE } from '@nte/constants/colleges.constants';

@Pipe({ name: `collegeBgUrl` })
export class CollegeBgUrlPipe implements PipeTransform {
  private s3url: string = `https://next-tier.s3.amazonaws.com/img/college/photo`;

  constructor(private platform: Platform) { }

  transform(college: any): any {
    if (COLLEGES_WITH_BGS.has(college.id)) {
      return `${this.s3url}/${college.id}/${this.getSize()}.jpg`;
    } else {
      const urlRegex = new RegExp(
        `https:\/\/(?:next\-tier\.)?s3\.amazonaws\.com\/(?:next\-tier\/)?build\/images\/institutions\/([a-z]+)\-[a-z]+\-\d\.jpg`,
        `gm`
      );
      const bgUrl = college.background_url;
      const setting = (bgUrl && bgUrl.length && bgUrl.search(urlRegex) !== -1) ? bgUrl.replace(urlRegex, `$1`) : `town`;
      const stateRegion = REGION_PER_STATE[college.state] || `GreatLakes`;
      return `${this.s3url}/${upperFirst(setting)}_${stateRegion.replace(` `, ``)}/640.jpg`;
    }
  }



  private getSize() {
    const width: number = this.platform.width();
    if (width > 1920) {
      return 'full';
    } else if (width > 1600) {
      return '1920';
    } else if (width > 1366) {
      return '1600';
    } else if (width > 1024) {
      return '1366';
    } else if (width > 768) {
      return '1024';
    } else if (width > 640) {
      return '768';
    } else {
      return '640';
    }
  }
}
