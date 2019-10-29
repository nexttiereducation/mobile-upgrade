import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ScholarshipPage } from './scholarship';
import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';

// const routes: Routes = [
//   {
//     path: 'app/scholarships/:id',
//     component: ScholarshipPage
//   }
// ];

@NgModule({
  declarations: [
    ScholarshipPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // RouterModule.forChild(routes),
    ComponentsModule,
    PipesModule
  ]
})
export class ScholarshipPageModule { }
