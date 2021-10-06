import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouteRoutingModule } from './routes-routing.module';
import { LoginComponent } from './passport/login/login.component';
import { LayoutPassportComponent } from 'layout/passport/passport.component';
import { LayoutMainComponent } from 'layout/main/main.component';
import { DictService } from 'core/services/dict/dict.service';
import {CodePageComponent} from '@app/routes/course-manage/code-page/code-page.component';

const COMPONENTS = [LoginComponent, CodePageComponent];

const LAYCOMPONENTS = [LayoutPassportComponent, LayoutMainComponent];
const SERVICE_PROVIDES = [
  DictService
];

@NgModule({
  declarations: [...COMPONENTS, ...LAYCOMPONENTS],
  imports: [
    SharedModule,
    RouteRoutingModule
  ],
  providers: [
    ...SERVICE_PROVIDES
  ]
})
export class RoutesModule { }
