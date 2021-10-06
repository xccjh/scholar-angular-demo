import {NgModule} from '@angular/core';
import {CourseManageService} from '@app/busi-services';
import {SharedModule} from '@app/shared/shared.module';
import {StudyOutlineFl} from './study-outline-fl.component';
import {StudyOutlineFlRoutingModule} from './study-outline-fl-routes.module';

@NgModule({
  declarations: [ StudyOutlineFl],
  imports: [
    StudyOutlineFlRoutingModule,
    SharedModule,
  ],
  providers: [ CourseManageService]
})
export class StudyOutlineFlModule {
}
