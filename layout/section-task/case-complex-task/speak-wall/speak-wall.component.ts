import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChange
} from '@angular/core';
// import { Router, ActivatedRoute } from "@angular/router";
import { environment } from 'src/environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as TASK from 'core/base/task';
import {TaskCenterService} from 'core/services/task-center.service';
import {ToolsUtil} from 'core/utils/tools.util';

@Component({
  selector: 'app-speak-wall',
  templateUrl: './speak-wall.component.html',
  styleUrls: ['./speak-wall.component.less']
})
export class SpeakWallComponent implements OnInit, OnChanges {
  @Input() id: string;
  @Output() pageChange = new EventEmitter<number>();

  isGroupLeader = true;
  isLoading = false;

  speakTypeRemark = TASK.speakTypeRemark;

  color = ['#ECA392', '#ADADA7', '#96B5D5', '#EFB8D1', '#D68199'];

  resultName = {
    0: '待评价',
    1: '及格',
    2: '良好',
    3: '优秀',
    99: '无效'
  };

  scoreName = {
    0: '等待评分',
    1: '优秀（100%）',
    2: '良好（80%）',
    3: '及格（60%）',
    99: '无效'
  };

  scoreType: any = [[], [], [], []];

  taskData: any = {
    speakwallAll: []
  };

  selectedData: any = {};

  groupSpeak: any = [];

  curShowItem: any;
  isShow = false;


  constructor(
    private taskCenterService: TaskCenterService,
    private nzMsg: NzMessageService
  ) {}

  ngOnInit() {
    this.initScoreType();
  }
  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.id) {
      this.getAllSpeak();
    }
  }
  initScoreType() {
    this.scoreType = [0, 1, 2, 3, 4].map(ele => ({
      scoreName: this.scoreName[ele],
      data: []
    }));
  }

  getOssUrl(url) {
    return ToolsUtil.getOssUrl(url);
  }

  gotoCase() {
    this.pageChange.emit(0);
  }

  getAllSpeak() {
    this.isLoading = true;
    this.initScoreType();
    this.taskCenterService.getAllSpeak(this.id).subscribe( res => {
      this.isLoading = false;
      if (res.status === 200) {
        this.taskData = res.data;
        this.taskData.speakwallAll.forEach(item => {
          item.caseAttch = this.initilizeAttachmentData(item);
          item.color = this.color[Math.floor(Math.random() * 5)];
          switch (item.resultType) {
            case '0':
              this.scoreType[0].data.push(item);
              break;
            case '1':
              this.scoreType[3].data.push(item);
              break;
            case '2':
              this.scoreType[2].data.push(item);
              break;
            case '3':
              this.scoreType[1].data.push(item);
              break;
            case '99':
              this.scoreType[4].data.push(item);
              break;
          }

          if ( this.selectedData.id === item.id ) {
            this.selectedData = item;
          }
        });

      } else {
        this.nzMsg.error('获取发言墙失败');
      }
    }, err => {
      this.isLoading = false;
    });
  }

  initilizeAttachmentData(data) {
    const attchArr: any[] = data.children || [];
    const caseAttch = attchArr
      .filter(el => el.aattachmentExt !== 'mp3')
      .map(el => {
        const attachmentPath = environment.OSS_URL + el.attachmentPath;
        el.showPath = ToolsUtil.getThumbUrl(el.attachmentPath);
        return { ...el, attachmentPath };
      });
    return caseAttch;
  }
  previewAttachment(item: any) {
    this.curShowItem = item;
    this.isShow = true;
  }
  selectedItem(item) {
    this.selectedData = item;
  }
}
