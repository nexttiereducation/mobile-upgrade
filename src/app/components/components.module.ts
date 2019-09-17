import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MaterialIconsModule } from 'ionic2-material-icons';

import { ChartsModule } from './charts.module';
import { AnimateItemSlidingDirective } from '@nte/components/animate-item-sliding/animate-item-sliding';
import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { CardListDirective } from '@nte/components/card-list/card-list';
import { EmptyStateComponent } from '@nte/components/empty-state/empty-state';
import { HighSchoolComponent } from '@nte/components/high-school/high-school';
import { ListTabsComponent } from '@nte/components/list-tabs/list-tabs';
import { LoadingComponent } from '@nte/components/loading/loading';
import { MessagingButtonComponent } from '@nte/components/messaging-button/messaging-button';
import { NotificationsButtonComponent } from '@nte/components/notifications-button/notifications-button';
import { ProgressBarComponent } from '@nte/components/progress-bar/progress-bar';
import { SendComponent } from '@nte/components/send/send';
import { TilesDirective } from '@nte/components/tiles/tiles';
import { PipesModule } from '@nte/pipes/pipes.module';

// import { NvD3Module } from 'ngx-nvd3';

const components: any[] = [
  AnimateItemSlidingDirective,
  ApplicationDatesComponent,
  CardListDirective,
  EmptyStateComponent,
  HighSchoolComponent,
  ListTabsComponent,
  LoadingComponent,
  MessagingButtonComponent,
  NotificationsButtonComponent,
  ProgressBarComponent,
  SendComponent,
  TilesDirective
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    IonicModule,
    CommonModule,
    // NvD3Module,
    MaterialIconsModule,
    PipesModule,
    ChartsModule
  ]
})
export class ComponentsModule { }
