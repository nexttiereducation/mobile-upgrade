import { Component, Input, OnInit } from '@angular/core';

import { IEmptyState } from '@nte/models/empty-state';

@Component({
  selector: `empty-state`,
  templateUrl: `empty-state.html`
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
