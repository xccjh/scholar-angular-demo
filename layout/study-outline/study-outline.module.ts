import {NgModule} from '@angular/core';
import {CourseManageService} from '@app/busi-services';
import {StudyOutlineComponent} from './study-outline.component';
import {SharedModule} from '@app/shared/shared.module';
import {StudyOutlineRoutingModule} from './study-outline-routes.module';

@NgModule({
  declarations: [ StudyOutlineComponent],
  imports: [
    StudyOutlineRoutingModule,
    SharedModule,
  ],
  providers: [ CourseManageService]
})
export class StudyOutlineModule {
}
