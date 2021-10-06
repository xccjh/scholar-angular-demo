import {NoFoundComponent} from 'layout/404/404.component';
import {SharedModule} from '@app/shared/shared.module';
import {ServicesModule} from '@app/service/service.module';
import {NgrxDataModule} from 'core/ngrx-data/ngrx-data.module';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreModule} from '@ngrx/store';
import {NgModule, SkipSelf, Optional, APP_INITIALIZER} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {APP_BASE_HREF, registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {NZ_I18N, zh_CN} from 'ng-zorro-antd';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {RouteReuseStrategy} from '@angular/router';
import {AtrReuseStrategy} from 'core/routereuse/atr-reuse-strategy';
import {RoutesModule} from '../routes/routes.module';
import {environment} from '../../environments/environment';

import { StartupService } from 'core/services/startup.service';
export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}
const APPINIT_PROVIDES = [
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true,
  },
];

registerLocaleData(zh);

@NgModule({
  declarations: [NoFoundComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    ServicesModule,

    StoreModule.forRoot({}, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true,
      }
    }),
    StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),
    NgrxDataModule,
    RoutesModule
  ],
  exports: [
    SharedModule,
    RoutesModule
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    // {provide: APP_BASE_HREF, useValue: process.env.environment !== 'development' ? '/scholar/' : '/'},
    {provide: NZ_I18N, useValue: zh_CN},
    {provide: RouteReuseStrategy, useClass: AtrReuseStrategy},
    ...APPINIT_PROVIDES
  ],
})
export class CoreModule {
  constructor(@SkipSelf() @Optional() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule 只能被appModule引入');
    }
  }
}
