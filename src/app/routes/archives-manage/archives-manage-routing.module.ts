import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TeacherPreviewComponent} from './teacher-preview/teacher-preview.component';
import {VideoPreviewComponent} from './video-preview/video-preview.component';
import {NoFoundComponent} from '../../../../layout/404/404.component';
import {AnnouncementManagementComponent} from './announcement-management/announcement-management.component';
import {RecordingLecturerComponent} from './recording-lecturer/recording-lecturer.component';

const routes: Routes = [
  {path: 'guide-teacher', component: RecordingLecturerComponent},
  {path: 'announcement-management', component: AnnouncementManagementComponent},
  {path: 'teacher-preview/:id', component: TeacherPreviewComponent},
  {path: 'video-preview/:id', component: VideoPreviewComponent},
  {
    path: '**',
    component: NoFoundComponent,
    data: {title: '404'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchivesManageRoutingModule {
}
