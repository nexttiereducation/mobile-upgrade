import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: `buttonize` })
export class ButtonizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any, justRetag: boolean = false): any {
    if (justRetag) {
      const regex = new RegExp(/(<\/?)([\w-]+)/g);
      const result = value.replace(regex, `$1ion-button`);
      return this.sanitizer.bypassSecurityTrustHtml(result);
    } else {
      const regex = /(\n+)([\w\s]*):?\s?<a href="([^"]+)"([^>]*) class="(external-link external-link-[\w]+)">[^<]*<\/a>/gm;
      const classes = [
        `button`,
        `button-block`,
        `button-block-ios`,
        `button-ios`,
        // `button-outline`,
        // `button-outline-ios`,
        `disable-hover`
      ];
      const subst =
        `<a href="$3"$4
           class="$5 ${classes.join(` `)}"
           [attr.ion-button]="true">
          <span class="button-inner">$2</span>
        </a>`;
      const result = value.replace(regex, subst);
      return result;
    }
  }
}
