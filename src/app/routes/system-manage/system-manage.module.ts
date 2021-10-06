import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SettingRoutingModule } from './system-manage-routing.module';
import { AdminSecurityComponent } from './admin-security/admin-security.component';

const COMPONENTS = [
  AdminSecurityComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    SettingRoutingModule,
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class SystemManageModule { }
