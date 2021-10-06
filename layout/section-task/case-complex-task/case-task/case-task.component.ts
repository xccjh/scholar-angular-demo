import {Component, OnInit, Output, EventEmitter, Input, SimpleChange, OnChanges} from '@angular/core';
import {environment} from 'src/environments/environment';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AliOssService} from 'core/services/ali-oss.service';
import {TaskCenterService} from 'core/services/task-center.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {MaterialLibraryService} from '@app/busi-services';
import {getFileThumbUrl} from 'core/utils/common';

@Component({
  selector: 'app-case-task',
  templateUrl: './case-task.component.html',
  styleUrls: ['./case-task.component.less'],
})
export class CaseTaskComponent implements OnInit, OnChanges {

  @Input() data: any = {};
  @Input() id = '';
  @Output() finishTaskCallBack = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  // 附件
  curShowItem: any;
  // 附件展示
  isShow = false;

  // 是否是重做
  isRedo = false;

  // 是否展示案例解析
  isAnswerAnalysis = false;

  // 保存按钮loading
  isSaveLoading = false;

  // 我的发言
  speakContent = '';
  speakContentId = '';

  // 附件列表
  fileList = [];
  getFileType = ToolsUtil.getFileType;

  // 重做提交查询
  isVisible = false;

  constructor(
    private taskCenterService: TaskCenterService,
    private nzMsg: NzMessageService,
    private materialLibraryService: MaterialLibraryService,
    private aliOss: AliOssService
  ) {
  }

  get submitDisabled() {
    return this.speakContent === '' && this.fileList.length === 0;
  }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.id && this.id) {
      this.initData();
    }
  }

  isPicture(ext: string) {
    const picExt = 'jpg,jpeg,png';
    return picExt.indexOf(ext) > -1;
  }

  isVideo(ext: string) {
    return /mp4|m2v|mkv|rmvb|wmv|avi|flv|mov/.test(ext);
  }

  getPreview(item) {
    const attachmentPath = item.attachmentPath;
    const ext = ToolsUtil.getExt(attachmentPath);
    if (this.isPicture(ext)) {
      if (attachmentPath.indexOf('http') > -1) {
        return attachmentPath + '?x-oss-process=image/resize,m_fill,h_50,w_50';
      } else {
        return environment.OSS_URL + attachmentPath + '?x-oss-process=image/resize,m_fill,h_50,w_50';
      }
    } else {
      return getFileThumbUrl(ext);
    }
  }

  initData() {
    this.materialLibraryService.getResourceDetail(this.data.resourceId, '104').subscribe((res) => {
      if (res.status === 200) {
        const attchArr: any[] = res.data.attachment;
        const audioInfo = attchArr.find(el => el.aattachmentExt === 'mp3');
        if (audioInfo) {
          audioInfo.attachmentPath = environment.OSS_URL + audioInfo.attachmentPath;
        }
        const caseAttch = attchArr.filter(el => el.aattachmentExt !== 'mp3').map(el => {
          const isPic = this.isPicture(el.aattachmentExt);
          const isVideo = this.isVideo(el.aattachmentExt);
          const path = environment.OSS_URL + el.attachmentPath;
          const attachmentPath = (isPic || isVideo) ? path : environment.ow365 + path;
          const thumbnail = getFileThumbUrl(el.aattachmentExt);
          return {...el, attachmentPath, isPic, isVideo, thumbnail};
        });
        res.data.audioInfo = audioInfo;
        res.data.caseAttch = caseAttch;
        this.data = Object.assign({}, this.data, res.data);
      }
    });
    // if (!this.data) {
    //   return;
    // }
    // this.isRedo = this.data.status === '2' && this.ckeckCanRedo(this.data.endTime);
    // this.isAnswerAnalysis = this.data.taskFinish === '1' && !this.isRedo;
    // this.fileList = [];
    // if (this.data.speakwallSingle && this.data.speakwallSingle.length > 0) {
    //   const speakData = this.data.speakwallSingle[0];
    //   this.speakContent = speakData.content;
    //   this.speakContentId = speakData.id;
    // } else {
    //   this.speakContent = '';
    //   this.speakContentId = '';
    // }
    // // 附件初始化
    // this.initilizeAttachmentData();
  }

  // 判断能否开启重做
  ckeckCanRedo(endTime) {
    const nowTime = new Date().getTime();
    return nowTime - endTime < 0;
  }

  initilizeAttachmentData() {
    const attchArr: any[] = this.data.attachmentInfo;
    if (Array.isArray(attchArr)) {
      const caseAttch = attchArr.filter(el => el.aattachmentExt !== 'mp3').map(el => {
        const attachmentPath = environment.OSS_URL + el.attachmentPath;
        el.showPath = ToolsUtil.getThumbUrl(el.attachmentPath);
        return {...el, attachmentPath};
      });
      this.data.caseAttch = caseAttch;
    }

    // 个人发言的附件
    if ((this.data.speakwallSingle instanceof Array) &&
      this.data.speakwallSingle.length > 0 &&
      (this.data.speakwallSingle[0].children instanceof Array)) {

      this.fileList = this.data.speakwallSingle[0].children.map(item => {
        return {
          name: item.attachmentName || item.attachmentPath,
          path: item.attachmentPath
        };
      });
      const fileAttch = this.data.speakwallSingle[0].children.map(el => {
        const attachmentPath = environment.OSS_URL + el.attachmentPath;
        el.showPath = ToolsUtil.getThumbUrl(el.attachmentPath);
        return {...el, attachmentPath};
      });

      this.data.speakwallSingle[0].fileAttch = fileAttch;
    }
  }

  previewAttachment(item: any) {
    this.curShowItem = item;
    this.isShow = true;
  }

  gotoSpeakWall() {
    this.pageChange.emit(1);
  }

  checkSubmit() {
    if (this.speakContent === '' && this.fileList.length === 0) {
      return false;
    }
    this.isRedo ? this.isVisible = true : this.saveSpeakWall();
  }

  saveSpeakWall() {
    if (this.speakContent === '' && this.fileList.length === 0) {
      return false;
    }
    const data = this.getPostData();
    this.isSaveLoading = true;
    this.taskCenterService.saveStuSpeakwall(data).subscribe(res => {
      this.isSaveLoading = false;
      if (res.status === 201) {
        this.nzMsg.success('保存成功！');
        this.finishTaskCallBack.emit(this.data);
        this.speakContentId = res.data.id;
        this.isVisible = false;
      } else {
        this.nzMsg.error(res.message);
      }
    });
  }

  getPostData() {
    const postData = {
      id: this.speakContentId,
      studentGroupId: this.data.studentGroupId ? this.data.studentGroupId : '',
      courseTaskId: this.data.busId,
      content: this.speakContent,
      resourceId: this.data.resourceId,
      isLeader: this.data.isLeader ? this.data.isLeader : '',
      speakType: this.data.speakType,
      speakwallAttachment: [],
      redo: this.isRedo ? 1 : 0,
      studentTaskId: this.data.id || this.data.studentTaskId
    };
    this.fileList.forEach(item => {
      const attachmentExt = item.path.substring(item.path.lastIndexOf('.'), item.path.length);
      postData.speakwallAttachment.push({
        attachmentName: item.name,
        attachmentPath: item.path,
        attachmentExt
      });
    });
    return postData;
  }

  download() {
    const attachments = (this.data.attachmentInfo as any[])
      .filter(ele => ele.aattachmentExt !== 'mp3')
      .map(file => {
        return {
          filename: file.attachmentName.indexOf(file.aattachmentExt) !== -1
            ?
            file.attachmentName
            :
            `${file.attachmentName}.${file.aattachmentExt}`,
          path: file.attachmentPath
        };
      });
    this.aliOss.patchDownloadFileStudent(attachments).subscribe(
      res => {
      },
      err => {
        this.nzMsg.error(err);
      }
    );
  }


}
