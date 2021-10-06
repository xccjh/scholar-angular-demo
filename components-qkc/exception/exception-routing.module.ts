import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicenseErrorComponent } from './license-error/license-error.component';
import { LicenseError404Component } from './license-error404/license-error404.component';
import { LicenseError500Component } from './license-error500/license-error500.component';
import { LicenseForbidComponent } from './license-forbid/license-forbid.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { EmptyCodePageComponent } from './empty-code-page/empty-code-page.component';

const routes: Routes = [
  { path: 'license' , component: LicenseErrorComponent},
  { path: '404', component: LicenseError404Component },
  { path: '500', component: LicenseError500Component },
  { path: 'forbid', component: LicenseForbidComponent },
  { path: 'empty', component: EmptyPageComponent},
  { path: 'emptyCode', component: EmptyCodePageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExceptionRoutingModule {}
