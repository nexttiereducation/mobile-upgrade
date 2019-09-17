import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(
    routes,
    { preloadingStrategy: PreloadAllModules }
    // , { preloadingStrategy: PreloadAllModules }
  )]
})
export class AppRoutingModule { }
