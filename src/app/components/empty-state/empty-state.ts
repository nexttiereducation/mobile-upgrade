import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { IEmptyState } from '@nte/interfaces/empty-state.interface';

@Component({
  selector: `empty-state`,
  templateUrl: `empty-state.html`,
  styleUrls: [`empty-state.scss`],
  encapsulation: ViewEncapsulation.None
})
export class EmptyStateComponent implements OnInit {
  @Input() public emptyState?: IEmptyState;

  public imageUrl: string = ``;

  ngOnInit() {
    if (this.emptyState) {
      this.imageUrl = this.emptyState.isAbsoluteUrl
        ? this.emptyState.imagePath
        : `assets/image/${this.emptyState.imagePath}.svg`;
    }
  }
}
