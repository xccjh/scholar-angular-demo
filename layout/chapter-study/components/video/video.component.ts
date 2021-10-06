import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from 'src/environments/environment';

@Component({
  // tslint:disable-next-line:component-selector
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.less'],
  selector: 'app-chapter-video',
})
// tslint:disable-next-line:component-class-suffix
export class ChapterVideo implements OnInit, OnChanges {

  @Input() isVisible = true;
  @Input() chapterStudyVideo: any = {};
  environment = environment;
  showVideo = '1';
  sourceType = '';
  baoliUrl: any;
  mp4Url: any;
  fullLoading = false;

  constructor(
    private sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit() {
    this.showVideo = '1';
    this.sourceType = '';
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.fullLoading = true;
    const value = changes.chapterStudyVideo.currentValue;
    if (!value) {
      this.showVideo = '0';
      this.fullLoading = false;
      this.showVideo = '0';
      return false;
    }
    if (value.attachmentPath) {
      this.showVideo = '1';
      if (value.sourceType === '3') {
        this.sourceType = '3';
        this.baoliUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value.videoUrl);
      } else if (!value?.attachmentPath.includes('.mp4')) {
        this.sourceType = '2';
        this.baoliUrl = environment.ow365.indexOf('?') === -1 ? environment.ow365 + '?polywayId=' + value.attachmentPath :
          environment.ow365.slice(0, environment.ow365.indexOf('?')) + '?polywayId=' + value.attachmentPath;
        this.baoliUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.baoliUrl);
      } else {
        this.fullLoading = false;
        this.sourceType = '1';
        this.mp4Url = environment.OSS_URL + value.attachmentPath;
      }
    } else if (value?.videoUrl) {
      this.showVideo = '1';
      if (value.sourceType === '3') {
        this.sourceType = '3';
        this.baoliUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value.videoUrl);
      } else if (!value?.videoUrl.includes('.mp4')) {
        this.sourceType = '2';
        this.baoliUrl = environment.ow365.indexOf('?') === -1 ? environment.ow365 + '?polywayId=' + value.attachmentPath :
          environment.ow365.slice(0, environment.ow365.indexOf('?')) + '?polywayId=' + value?.videoUrl;
        this.baoliUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.baoliUrl);
      } else {
        this.fullLoading = false;
        this.sourceType = '1';
        this.mp4Url = environment.OSS_URL + value.videoUrl;
      }
    } else {
      this.showVideo = '0';
    }
    setTimeout(() => {
      this.fullLoading = false;
    }, 1500);
  }

}
