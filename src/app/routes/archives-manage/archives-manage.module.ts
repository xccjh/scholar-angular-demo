import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArchivesManageRoutingModule } from './archives-manage-routing.module';
import { GuideTeacherComponent } from './guide-teacher/guide-teacher.component';
import { AddEditComponent } from './guide-teacher/add-edit/add-edit.component';
import { BatchUploadComponent } from './guide-teacher/batch-upload/batch-upload.component';
import { TeacherPreviewComponent } from './teacher-preview/teacher-preview.component';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import {AnnouncementManagementComponent} from './announcement-management/announcement-management.component';
import {RecordingLecturerComponent} from './recording-lecturer/recording-lecturer.component';


@NgModule({
  declarations: [GuideTeacherComponent, AddEditComponent, RecordingLecturerComponent,
    BatchUploadComponent, TeacherPreviewComponent, VideoPreviewComponent, AnnouncementManagementComponent],
  imports: [
    SharedModule,
    ArchivesManageRoutingModule
  ]
})
export class ArchivesManageModule { }
