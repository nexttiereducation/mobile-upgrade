import { NgModule } from '@angular/core';

import { ButtonizePipe } from './buttonize.pipe';
import { CollegeBgUrlPipe } from './college-bg-url.pipe';
import { CollegeNamePipe } from './college-name.pipe';
import { GerundizePipe } from './gerundize.pipe';
import { KeyValuePipe } from './key-value.pipe';
import { LinkPipe } from './link.pipe';
import { MomentPipe } from './moment.pipe';
import { PhonePipe } from './phone.pipe';

const pipes = [
  ButtonizePipe,
  CollegeBgUrlPipe,
  CollegeNamePipe,
  GerundizePipe,
  KeyValuePipe,
  LinkPipe,
  MomentPipe,
  PhonePipe
];

@NgModule({
  declarations: pipes,
  exports: pipes
})

export class PipesModule {
  public static forRoot() {
    return {
      ngModule: PipesModule,
      providers: []
    };
  }
}
