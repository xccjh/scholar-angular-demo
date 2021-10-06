import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ChapterStudy } from './chapter-study.component';
import { ChapterVideo } from './components/video/video.component';
import { RecordedInfo } from './components/recorded-info/recorded-info.component';
import {SectionStudySlideComponent} from './components/section-study-slide/section-study-slide.component';
import {KnowledgeStudySlideComponent} from './components/knowledge-study-slide/knowledge-study-slide.component';


const routes: Routes = [
  { path: '', component: ChapterStudy }
];

const ZORRO_MODULES = [
  NzButtonModule,
  NzSpinModule,
  NzLayoutModule,
  NzMenuModule,
  NzEmptyModule,
  NzTableModule,
  NzIconModule,
  NzBadgeModule,
  NzProgressModule,
  NzModalModule,
  NzSelectModule,
];


@NgModule({
  declarations: [
    ChapterStudy,
    ChapterVideo,
    RecordedInfo,
    SectionStudySlideComponent,
    KnowledgeStudySlideComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ...ZORRO_MODULES,
    RouterModule.forChild(routes)
  ]
})
export class ChapterStudyModule { }
