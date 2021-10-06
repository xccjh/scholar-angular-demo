import {Component, OnInit, Input} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {NodeChangeEvent} from '../course-structure-tree/course-structure-tree.component';

@Component({
  selector: 'app-upload-handout',
  templateUrl: './upload-handout.component.html',
  styleUrls: ['./upload-handout.component.less'],
})
export class UploadHandoutComponent implements OnInit {
  isLoading = false;
  files = [];
  acceptTypeFile = {
    acceptType: '',
    desc: '',
  };
  acceptTypeFiles = {
    deafult: {
      acceptType: 'pdf,doc,ppt,docx,xls,xlsx,pptx,png,jpg,jpeg,mp4,rar,zip',
      desc:
        '支持扩展名：pdf、doc、docx、xls、xlsx、ppt、pptx、png、jpg、mp4、rar、zip',
    },
    courseTimeDivision: {
      acceptType: 'pdf,doc,ppt,docx,xls,xlsx,pptx,png,jpg,jpeg,mp4',
      desc: '支持扩展名：pdf、doc、docx、xls、xlsx、ppt、pptx、png、jpg、mp4',
    },
  };
  @Input() node: NodeChangeEvent;
  @Input() seq: number;
  @Input() type: string;
  @Input() limit = 0;
  @Input() maxSize;
  learningTarget = '1';

  constructor(
    private nzModalRef: NzModalRef,
    private courseMgService: CourseManageService,
    private nzMsg: NzMessageService
  ) {

  }

  ngOnInit(): void {
    this.setAcceptType();

  }

  setAcceptType() {
    if (this.node.type === 'course-time-division') {
      this.acceptTypeFile = this.acceptTypeFiles.courseTimeDivision;
    } else {
      this.acceptTypeFile = this.acceptTypeFiles.deafult;
    }
  }

  cancel() {
    this.nzModalRef.destroy();
  }

  confirm() {
    const params: any = this.formatPostData(this.node);
    if (!this.learningTarget) {
      this.nzMsg.warning('请选择学习目标');
      return;
    }
    if (params.length === 0) {
      this.nzMsg.warning('请上传文件');
      return;
    }
    let source$ = null;
    switch (this.node.type) {
      case 'chapter':
        source$ = this.courseMgService.batchSave_courseChapterFile(params);
        break;
      case 'section':
        if (this.type === '104') {
          source$ = this.courseMgService.batchSave_courseSectionTaskFile(params);
        } else {
          source$ = this.courseMgService.batchSave_courseSectionFile(params);
        }
        break;
      case 'course-time-division':
        source$ = this.courseMgService.batchSave_courseTimeFile(params);
        break;
      default:
        source$ = null;
    }
    if (!source$) {
      return;
    }

    this.isLoading = true;
    source$.subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status !== 201) {
          this.nzMsg.error(res.message || '未知错误');
          return;
        }
        this.nzModalRef.destroy(params);
      },
      (err) => {
        this.isLoading = false;
        this.nzMsg.error(JSON.stringify(err));
      }
    );
  }

  formatPostData(node: NodeChangeEvent) {
    const data = node.data;
    return this.files.map((file, i) => {
      if (node.type === 'chapter') {
        return {
          courseId: data.courseId,
          coursePacketId: data.coursePacketId,
          courseChapterId: data.id,
          attachmentName: file.name,
          attachmentPath: file.path,
          aattachmentExt: ToolsUtil.getExt(file.name),
          seq: this.seq + i,
        };
      } else if (node.type === 'section') {

        const obj: any = {
          courseId: data.courseId,
          coursePacketId: data.coursePacketId,
          courseChapterId: data.courseChapterId,
          courseSectionId: data.id,
          attachmentName: file.name,
          attachmentPath: file.path,
          aattachmentExt: ToolsUtil.getExt(file.name),
          sourceType: 1,
          seq: this.seq + i,
          type: this.type,
          learningGoalCode: this.learningTarget
        };
        if (this.type === '104' || this.type === '101') {
          obj.name = file.name;
          obj.status = '1';
          obj.isNeed = 0;
          obj.downloadType = '0';
          obj.gradeType = '1';
          obj.taskType = '0';
        } else {
          obj.downloadType = '2';
        }
        return obj;
      } else if (node.type === 'course-time-division') {
        return {
          courseId: data.courseId,
          coursePacketId: data.coursePacketId,
          courseTimeId: data.id,
          attachmentName: file.name,
          attachmentPath: file.path,
          aattachmentExt: ToolsUtil.getExt(file.name),
          seq: this.seq + i,
        };
      }
    });
  }
}
