import { Pipe, PipeTransform } from '@angular/core';
import * as Autolinker from 'autolinker';

@Pipe({ name: `link` })
export class LinkPipe implements PipeTransform {
  public transform(value: string, options: Autolinker.AutolinkerConfig | any = {}): string {
    const labels = [];
    // options.context = this;
    options.truncate = {
      length: 35,
      location: `smart`
    };
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
          const matchString = `[\\n]?([a-zA-Z' ]+: @?[a-zA-Z\-\_ ]*)` + match.getMatchedText().replace('/', '\/').replace('.', '\.');
          const innerText = value.match(matchString);
          if (innerText && innerText.length > 1) {
            let linkText = innerText[1];
            labels.push(linkText);
            // value = value.replace(`${linkText}: `, '');
            if (linkText.endsWith(`- `) || linkText.endsWith(`: `)) {
              linkText = linkText.slice(0, linkText.length - 2);
            }
            tag.setInnerHtml(linkText.trim());
          }
          return tag;
      }
    };
    let output = new Autolinker.Autolinker(options).link(value);
    if (labels && labels.length) {
      labels.forEach(l => {
        output = output.replace(l, '');
      });
    }
    return output;
  }

  stringAsRegex(pattern, flags) {
    return new RegExp(pattern.replace(/[\[\]\\{}()+*?.$^|]/g, (match) => '\\' + match), flags);
  }
}
