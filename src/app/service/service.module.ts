import {NgModule, InjectionToken, PLATFORM_ID} from '@angular/core';
import {environment} from '../../environments/environment';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {BaseInterceptor} from 'core/interceptor/base.interceptor';
import {isPlatformBrowser} from '@angular/common';

export const API_CONFIG = new InjectionToken('ApiConfigToken');
export const WINDOW = new InjectionToken('windowToken');

@NgModule({
  providers: [
    {provide: API_CONFIG, useValue: environment.production ? '/' : '/api/'},
    {
      provide: WINDOW, useFactory(platformId: object) {
        return isPlatformBrowser(platformId) ? window : {};
      },
      deps: [PLATFORM_ID]
    },
    {provide: HTTP_INTERCEPTORS, useClass: BaseInterceptor, multi: true},
  ]
})
export class ServicesModule {
}
