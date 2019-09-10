import { Animation, PageTransition } from '@ionic/angular';

const CENTER = `0px`;
const OFF_BOTTOM = `400px`;
const SHOW_BACK_BTN_CSS = `show-back-button`;
const TRANSLATEY = `translateY`;

export class CustomTransition extends PageTransition {

  public init() {
    super.init();
    const that = this;

    const enteringView = that.enteringView;
    const leavingView = that.leavingView;
    const opts = that.opts;
    const plt = that.plt;

    // what direction is the transition going
    const backDirection = (opts.direction === `back`);

    if (enteringView) {
      if (backDirection) {
        that.duration(700).easing(`cubic-bezier(0.47,0,0.745,0.715)`);
      } else {
        that.duration(780).easing(`cubic-bezier(0.36,0.66,0.04,1)`);
        that.enteringPage
          .fromTo(TRANSLATEY, OFF_BOTTOM, CENTER, true)
          .fromTo(`opacity`, 0.01, 1, true);
      }

      if (enteringView.hasNavbar()) {
        const enteringPageEle: Element = enteringView.pageRef().nativeElement;
        const enteringNavbarEle: Element = enteringPageEle.querySelector(`ion-navbar`);

        const enteringTitle = new Animation(plt, enteringNavbarEle.querySelector(`ion-title`));
        const enteringNavBar = new Animation(plt, enteringNavbarEle);
        const enteringBackButton = new Animation(plt, enteringNavbarEle.querySelector(`.back-button`));

        that
          .add(enteringTitle)
          .add(enteringNavBar)
          .add(enteringBackButton);

        enteringTitle.fromTo(`color`, `red`, `yellow`, true);

        if (enteringView.enableBack()) {
          enteringBackButton.beforeAddClass(SHOW_BACK_BTN_CSS);
        } else {
          enteringBackButton.beforeRemoveClass(SHOW_BACK_BTN_CSS);
        }
      }
    }

    // setup leaving view
    if (leavingView && backDirection) {
      // leaving content
      that.duration(700).easing(`cubic-bezier(0.47,0,0.745,0.715)`);
      const leavingPage = new Animation(plt, leavingView.pageRef().nativeElement);
      that.add(
        leavingPage
          .fromTo(TRANSLATEY, CENTER, OFF_BOTTOM)
          .fromTo(`opacity`, 1, 0));
    }

  }

}
