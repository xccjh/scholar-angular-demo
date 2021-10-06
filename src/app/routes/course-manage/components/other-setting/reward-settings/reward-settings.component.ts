import {Component, Inject, Input, LOCALE_ID, OnInit, Renderer2,} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {AliOssService} from 'core/services/ali-oss.service';
import {FormBuilder} from '@angular/forms';
import {KnowledgeManageService} from 'src/app/busi-services/knowledge-manag.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzUploadXHRArgs} from 'ng-zorro-antd';
import {TrainManageService} from '@app/busi-services/train-manage.service';
import {WINDOW} from '@app/service/service.module';
import {DomSanitizer} from '@angular/platform-browser';
import {UploadDir} from 'core/utils/uploadDir';
import {UploadOssService} from 'core/services/upload-oss.service';
import {NzUploadFile} from 'ng-zorro-antd/upload/interface';
import {Json} from 'core/base/common';
import {Observable, Observer} from 'rxjs';
import {STATISTICALRULES} from 'core/base/static-data';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';

@Component({
  selector: 'app-reward-settings',
  templateUrl: './reward-settings.component.html',
  styleUrls: ['./reward-settings.component.less'],
})
export class RewardSettingsComponent implements OnInit {
  private limitTask = 10000;
  @Input() courseId: string;
  @Input() professionId: string;
  @Input() coursePacketId: string;
  @Input() currentCard: Json;
  rewardSettingsLoading = false;
  nzFileList: NzUploadFile[] = [];
  nzFileListBak: NzUploadFile[] = [];

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private nzMesService: NzMessageService,
    private courseMgService: CourseManageService,
    private nzModalService: NzModalService,
    private nzModalRef: NzModalRef,
    private aliOssService: AliOssService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService,
    private renderer2: Renderer2,
    private trainManageService: TrainManageService,
    private sanitizer: DomSanitizer,
    private uploadOssService: UploadOssService,
    private statisticsLogService: StatisticsLogService,
    @Inject(LOCALE_ID) public locale: string,
    @Inject(WINDOW) public win: any,
  ) {

  }

  ngOnInit() {
    this.nzFileList = this.currentCard.coursePacketCardRecourseList || [];
    this.nzFileListBak = JSON.parse(JSON.stringify(this.nzFileList));
  }

  beforeUpload = (item: NzUploadXHRArgs) => {
    return new Observable((observer: Observer<boolean>) => {
      if (item.name.length > 35) {
        this.nzMesService.error('文件名字太长啦，保证包含扩展名35个文字以内');
        observer.next(false);
        observer.complete();
        return;
      }
      if ('jpg,jpeg,png,doc,docx,xls,xlsx,ppt,pptx,pdf,mp4'.indexOf(ToolsUtil.getExt(item.name)) < 0) {
        this.nzMesService.error('请上传后缀名为jpg,jpeg,png,doc,docx,xls,xlsx,ppt,pptx,pdf,mp4类型的文件！');
        observer.next(false);
        observer.complete();
        return;
      }
      observer.next(true);
      observer.complete();
    });
  };

  customRewardRequest = (item: NzUploadXHRArgs) => {
    this.rewardSettingsLoading = true;
    this.uploadOssService
      .uploadOss(item.file, UploadDir.reward_file)
      .subscribe((result) => {
        this.rewardSettingsLoading = false;
        item.file.url = result;
        item.onSuccess({...item}, item.file, {});
      }, (err) => {
        this.rewardSettingsLoading = false;
        item.onError(err, item.file);
        this.nzMesService.error(JSON.stringify(err));
      });
  };

  resourceCall() {
    SessionStorageUtil.putScpResourceMaterial({
      type: 'scp-section-handout',
      professionId: this.professionId,
      sectionInfo: {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        coursePacketCardId: this.currentCard.id
      },
      seq: ToolsUtil.getMaxSeq(this.nzFileList),
      nodes: this.nzFileList ? this.nzFileList.map(el => {
        return {
          taskId: el.id,
          id: el.resourceId,
        };
      }) : [],
      isStandard: '',
      limit: this.limitTask
    });
    SessionStorageUtil.removeReadtree();
    this.nzModalRef.close(true);
    this.menuService.gotoUrl({
      url: '/m/rm/read',
      paramUrl: `?from=scp&task=2&reward=1`
    });
  }

  diffFileChange(nzFileList, nzFileListBak) {
    if (this.nzFileList.length !== this.nzFileListBak.length) {
      return true;
    } else {
      if (this.nzFileList.length) {
        if (this.nzFileList.filter(e => e.id).length !== this.nzFileList.length) {
          return true;
        }
        // const ids = this.nzFileListBak.map(i => i.id);
        // return !(this.nzFileList.every(item => {
        //   if (ids.indexOf(item.id) > -1) {
        //     return true;
        //   }
        // }));
      }
    }
  }


  save() {
    if (!this.nzFileList.length) {
      this.nzMesService.warning('请先上传文件');
      return;
    }
    this.rewardSettingsLoading = true;
    const params = [];
    this.nzFileList.forEach((itemP, iP) => {
      const param: any = {
        courseId: this.courseId,
        coursePacketId: this.coursePacketId,
        coursePacketCardId: this.currentCard.id,
        seq: iP,
        id: itemP.id
      };
      if (itemP.originFileObj) {
        param.attachmentPath = itemP.originFileObj['url'];
      }
      if (itemP.originFileObj) {
        param.title = itemP.originFileObj.name;
      }
      params.push(param);
    });
    this.courseMgService.levelInformationBatchUpload(params).subscribe(res => {
      this.rewardSettingsLoading = false;
      if (res.status === 201) {
        if (this.diffFileChange(this.nzFileList, this.nzFileListBak)) {
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '关卡奖励设置本地上传',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
            content: JSON.stringify(params),
          });
        }
        this.nzModalRef.close(true);
      } else {
        if (res.status === 500) {
          this.nzMesService.warning(res.message);
        }
      }
    }, () => {
      this.rewardSettingsLoading = false;
    });
  }


  cancel() {
    this.nzModalRef.close(false);
  }

}

