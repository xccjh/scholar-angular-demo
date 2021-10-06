import {Component, OnInit} from '@angular/core';
import {ArchivesManageServer} from 'src/app/busi-services/archives-manage.server';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-teacher-preview',
  templateUrl: './teacher-preview.component.html',
  styleUrls: ['./teacher-preview.component.less']
})
export class TeacherPreviewComponent implements OnInit {
  desColumn = {xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1};
  data: any = {};

  constructor(
    private httpServer: ArchivesManageServer,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.httpServer.guideTeacherDetails({id}).subscribe(res => {
        console.log(res);
        if (!res) return
        this.data = res.data
      })
    });
  }

}
