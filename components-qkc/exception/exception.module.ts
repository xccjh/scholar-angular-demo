import { NgModule } from '@angular/core';
import { NzButtonModule, NzResultModule } from 'ng-zorro-antd';
import { ExceptionRoutingModule } from './exception-routing.module';
import { LicenseErrorComponent } from './license-error/license-error.component';
import { LicenseError404Component } from './license-error404/license-error404.component';
import { LicenseError500Component } from './license-error500/license-error500.component';
import { LicenseForbidComponent } from './license-forbid/license-forbid.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';
import { EmptyCodePageComponent } from './empty-code-page/empty-code-page.component';

const THIRDMODULES = [
  NzButtonModule,
  NzResultModule
];

@NgModule({
  declarations: [
    LicenseErrorComponent,
    LicenseError404Component,
    LicenseError500Component,
    LicenseForbidComponent,
    EmptyPageComponent,
    EmptyCodePageComponent
  ],
  imports: [
    ...THIRDMODULES,
    ExceptionRoutingModule
  ]
})
export class ExceptionModule { }
