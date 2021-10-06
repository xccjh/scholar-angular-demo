import {Component, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MaterialLibraryService} from '../../../../busi-services/material-library.service';
import {ActivatedRoute} from '@angular/router';
import {environment} from 'src/environments/environment';
import {MenuService} from 'core/services/menu.service';
import {QkcScrollService} from 'core/directive';
import {getFileThumbUrl} from 'core/utils/common';
import {EDITOR_CONFIG} from 'core/base/static-data';
import {NzMessageService} from 'ng-zorro-antd';
import ClassicEditor from '@xccjh/xccjh-ckeditor5-video-file-upload';
import {UploadOssService} from 'core/services/upload-oss.service';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-material-preview-case',
  templateUrl: './material-preview-case.component.html',
  styleUrls: ['./material-preview-case.component.less'],

})
export class MaterialPreviewCaseComponent implements OnInit {

  data: any = {};

  id = '';
  type = '';
  professionId = '';

  activeId = '';
  typeList = [
    {id: '1', name: '案例背景'},
    {id: '2', name: '案例解析'},
    {id: '3', name: '教学指导'}
  ];

  curShowItem: any;
  isShow = false;
  isLoading = false;
  isFullScreen = false;
  Editor = ClassicEditor;
  config = Object.assign({}, EDITOR_CONFIG);
  resourceUrl: any; // 预览地址
  previewTitle = '';
  isPreviewpolyway = false; // 保利威
  previewStart = false;

  constructor(
    private materialLibService: MaterialLibraryService,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private scrollService: QkcScrollService,
    private message: NzMessageService,
    private uploadOssService: UploadOssService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private doc: Document
  ) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');
    this.professionId = this.route.snapshot.paramMap.get('professionId');
    this.getResourceDetail();
  }


  getResourceDetail() {
    this.isLoading = true;
    this.materialLibService.getResourceDetail(this.id, this.type).subscribe(result => {
      this.isLoading = false;
      if (result.status === 200) {
        const attchArr: any[] = result.data.attachment;
        const audioInfo = attchArr.find(el => el.aattachmentExt === 'mp3');
        if (audioInfo) {
          audioInfo.attachmentPath = environment.OSS_URL + audioInfo.attachmentPath;
        }
        const caseAttch = attchArr.filter(el => el.aattachmentExt !== 'mp3').map(el => {
          const isPic = this.isPicture(el.aattachmentExt);
          const isVideo = this.isVideo(el.aattachmentExt);
          const originAttachmentPath = el.attachmentPath;
          const path = environment.OSS_URL + el.attachmentPath;
          const attachmentPath = (isPic || isVideo) ? path : environment.ow365 + path;
          const thumbnail = getFileThumbUrl(el.aattachmentExt);
          return {...el, attachmentPath, isPic, isVideo, thumbnail, originAttachmentPath};
        });
        result.data.audioInfo = audioInfo;
        result.data.caseAttch = caseAttch;
        this.data = result.data;
      }
    }, error => {
      this.isLoading = false;
    });
  }


  closePreview() {
    this.isPreviewpolyway = false;
    this.resourceUrl = '';
    this.previewTitle = '';
    this.previewStart = false;
  }

  getContentLength(title) {
    return title.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, 'a').replace(/\s/g, 'a').replace(/[\u0391-\uFFE5]/g, 'a').length;
  }


  isPicture(ext: string) {
    const picExt = 'jpg,jpeg,png';
    return picExt.indexOf(ext) > -1;
  }

  isVideo(ext: string) {
    return /mp4|m2v|mkv|rmvb|wmv|avi|flv|mov/.test(ext);
  }

  fullChange(isFullScreen: boolean) {
    this.isFullScreen = isFullScreen;
  }

  edit() {
    this.menuService.gotoUrl({
      url: '/m/sel/material-details',
      paramUrl: `/${this.id}/${this.type}/${this.professionId}`
    });
  }

  previewAttachment(data: any) {
    if (data.sourceType === '2') {
      this.resourceUrl = data.originAttachmentPath;
      this.previewTitle = '';
      this.isPreviewpolyway = true;
      this.previewStart = true;
    } else {
      this.isPreviewpolyway = false;
      this.resourceUrl = data.originAttachmentPath;
      this.previewTitle = data.attachmentName;
      this.previewStart = true;
    }
    // this.curShowItem = item;
    // this.isShow = true;
  }

  menuChange({id}) {
    this.scrollService.scrollToAnchor(`materialSection${id}`);
  }

  backtolist() {
    this.menuService.goBack();
  }


  downloadAttachments() {
    window.open();
  }
}
