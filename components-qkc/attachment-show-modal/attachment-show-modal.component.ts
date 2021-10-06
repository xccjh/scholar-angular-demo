import {
  Component, OnInit, Input, Output,
  EventEmitter, OnChanges, SimpleChange
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {environment} from 'src/environments/environment';
import Viewer from 'viewerjs';

// import { isNullOrUndefined } from 'util';


/**
 * 附件显示弹窗
 */
@Component({
  selector: 'qkc-attachment-show-modal',
  templateUrl: './attachment-show-modal.component.html',
  styleUrls: ['./attachment-show-modal.component.less']
})
export class AttachmentShowModalComponent implements OnInit, OnChanges {
  safeUrl: SafeResourceUrl;

  @Input() url: string;
  @Input() filePreviewName: string;

  /**
   * 附件类型, image: 图片， ow365: ow365能够显示的附件
   */
  @Input() type: 'image' | 'ow365' | 'audio' | 'ppt' | 'video' | '' = '';
  imageType = ['jpg', 'jpeg', 'png', 'bmp'];
  officeType = ['doc', 'docx', 'xls', 'xlsx'];
  pptType = ['ppt', 'pptx'];
  pdfType = ['pdf'];
  audioType = ['mp3'];
  //
  videoType = ['mp4', 'webm', 'ogg', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov'];
  // ow365Type = [...this.imageType, ...this.officeType, ...this.pdfType];
  ow365Type = [...this.officeType, ...this.pdfType];
  isShowVideo = false;
  @Input() isShow = false;
  @Output() isShowChange = new EventEmitter<boolean>();

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
  }

  ngOnChanges(chngs: { [key: string]: SimpleChange }) {
    const {url, isShow} = chngs;
    if (url) {
      this.type = this.getType(this.url);
      let str = this.url;
      if (this.type === 'ow365' || this.type === 'ppt') {
        if (!str.startsWith(environment.ow365)) {
          str = environment.ow365 + str;
        }
      } else if (this.type === 'image') {
        // this.showImage();
      } else if (this.type === 'video') {
        // this.isShowVideo = true;
      }
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(str);
    }

    if (isShow && isShow.currentValue) {
      if (this.type === 'image') {
        this.showImage();
      } else if (this.type === 'video') {
        this.isShowVideo = true;
      }
    }
  }


  close() {
    this.isShow = false;
    this.isShowChange.emit(this.isShow);
  }

  closeVideo() {
    this.isShowVideo = false;
    this.close();
  }

  contentClick(e: MouseEvent) {
    e.stopPropagation();
  }

  showImage() {
    setTimeout(() => {
      const imageEle = document.getElementById('__ATTACHMENT_IMAGE__');
      if (imageEle) {
        const viewer = new Viewer(imageEle, {
          button: true,
          navbar: false,
          hidden: () => {
            viewer.destroy();
            this.close();
          }
        });
        viewer.show();
      }
    }, 400);
  }

  getType(url: string): 'image' | 'ow365' | 'audio' | 'ppt' | 'video' | '' {
    if (!url) {
      return '';
    }
    const arr = url.split('.');
    const ext = arr[arr.length - 1].toLowerCase();
    if (this.ow365Type.includes(ext)) {
      return 'ow365';
    } else if (this.pptType.includes(ext)) {
      return 'ppt';
    } else if (this.audioType.includes(ext)) {
      return 'audio';
    } else if (this.imageType.includes(ext)) {
      return 'image';
    } else if (this.videoType.includes(ext)) {
      return 'video';
    } else {
      return '';
    }
  }

  downLoad() {
    const urlArr = this.url.split('&');
    const url = urlArr[1] ? urlArr[1].split('=')[1] : urlArr[0];
    window.open(url);
  }

}
