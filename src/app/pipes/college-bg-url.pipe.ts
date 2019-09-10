import { Pipe, PipeTransform } from '@angular/core';
import { upperFirst } from 'lodash';

import { COLLEGES_WITH_BGS, REGION_PER_STATE } from '@nte/constants/colleges.constants';

@Pipe({ name: `collegeBgUrl` })
export class CollegeBgUrlPipe implements PipeTransform {
  private s3url: string = `https://next-tier.s3.amazonaws.com/img/college/photo`;

  transform(college: any): any {
    if (COLLEGES_WITH_BGS.has(college.id)) {
      return `${this.s3url}/${college.id}/640.jpg`;
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
}
