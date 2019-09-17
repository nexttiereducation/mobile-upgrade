import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegePage } from './college';
import { ComponentsModule } from '@nte/components/components.module';
import { CollegeAcademicPage } from '@nte/pages/college-academic/college-academic';
import { CollegeApplicationPage } from '@nte/pages/college-application/college-application';
import { CollegeCampusPage } from '@nte/pages/college-campus/college-campus';
import { CollegeFinancialPage } from '@nte/pages/college-financial/college-financial';
import { CollegeGeneralPage } from '@nte/pages/college-general/college-general';

const routes: Routes = [
  {
    path: 'app/colleges/:id',
    component: CollegePage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'general'
      },
      {
        path: 'general',
        // loadChildren: '@nte/pages/college-general/college-general.module#CollegeGeneralPageModule'
        component: CollegeGeneralPage
      },
      {
        path: 'campus',
        // loadChildren: '@nte/pages/college-campus/college-campus.module#CollegeCampusPageModule'
        component: CollegeCampusPage
      },
      {
        path: 'academic',
        // loadChildren: '@nte/pages/college-academic/college-academic.module#CollegeAcademicPageModule'
        component: CollegeAcademicPage
      },
      {
        path: 'financial',
        // loadChildren: '@nte/pages/college-financial/college-financial.module#CollegeFinancialPageModule'
        component: CollegeFinancialPage
      },
      {
        path: 'application',
        // loadChildren: '@nte/pages/college-application/college-application.module#CollegeApplicationPageModule'
        component: CollegeApplicationPage
      }
    ]
  }
];

@NgModule({
  declarations: [
    CollegePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class CollegePageModule { }
