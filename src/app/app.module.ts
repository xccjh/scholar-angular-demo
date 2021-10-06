import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {CoreModule} from '@app/core/core.module';
import {LoadingBarRouterModule} from '@ngx-loading-bar/router';
import {LoadingBarModule} from '@ngx-loading-bar/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    LoadingBarModule,
    LoadingBarRouterModule,
    CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
