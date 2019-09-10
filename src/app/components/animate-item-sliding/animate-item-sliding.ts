import { Directive, ElementRef, EventEmitter, Input, OnInit, Output, Renderer } from '@angular/core';

@Directive({
  selector: `[animateItemSliding]`
})
export class AnimateItemSlidingDirective implements OnInit {
  @Input(`animateItemSliding`) public shouldAnimate: boolean;

  @Output() public animationCompleted = new EventEmitter();

  get nativeEl() {
    return this.element.nativeElement;
  }

  constructor(
    public element: ElementRef,
    public renderer: Renderer) {
  }

  ngOnInit() {
    if (this.shouldAnimate) {
      this.renderer.setElementClass(
        this.nativeEl,
        `active-slide`,
        true
      );
      this.renderer.setElementClass(
        this.nativeEl,
        `active-options-right`,
        true
      );
      setTimeout(() => {
        this.renderer.setElementClass(
          this.nativeEl.firstElementChild,
          `itemSlidingAnimation`,
          true
        );
      }, 1000);
      setTimeout(() => {
        this.animationCompleted.emit();
      }, 3000);
    }
  }
}
