import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
    // { preloadingStrategy: PreloadAllModules }
  )]
})
export class AppRoutingModule { }
