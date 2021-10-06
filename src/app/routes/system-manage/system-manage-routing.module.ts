import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminSecurityComponent } from './admin-security/admin-security.component';
import {NoFoundComponent} from '../../../../layout/404/404.component';

const routes: Routes = [
  { path: 'admin-security', component: AdminSecurityComponent },
  {
    path: '**',
    component: NoFoundComponent,
    data: { title: '404' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
