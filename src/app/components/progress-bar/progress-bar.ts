import { Component, Input } from '@angular/core';

@Component({
  selector: `progress-bar`,
  templateUrl: `progress-bar.html`,
  styles: [`progress-bar.scss`]
})
export class ProgressBarComponent {
  @Input() progress: number;
}
