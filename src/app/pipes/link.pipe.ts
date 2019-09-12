import { Pipe, PipeTransform } from '@angular/core';
import * as Autolinker from 'autolinker';

@Pipe({ name: `link` })
export class LinkPipe implements PipeTransform {
  public transform(value: string, options: any = {}): string {
    options.truncate = { length: 25, location: `smart` };
    options.replaceFn = (match) => {
      const tag = match.buildTag();  // returns an Autolinker.HtmlTag instance
      switch (match.getType()) {
        case `email`:
          tag.setClass(`external-link external-link-email`);
          return tag;
        case `phone`:
          tag.setClass(`external-link external-link-phone`);
          return tag;
        case `url`:
          if (options.truncateOnly) {
            tag.setTagName(`span`);
          } else {
            tag.setClass(`external-link external-link-url`);
          }
          return tag;
      }
    };
    const linker = new Autolinker.Autolinker(options);
    return linker.link(value);
  }
}
