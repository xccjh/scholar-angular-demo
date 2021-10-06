import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from 'src/environments/environment';
import {timer} from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-resource-preview-modal',
  templateUrl: './resource-preview-modal.component.html',
  styleUrls: ['./resource-preview-modal.component.less'],
})
export class ResourcePreviewModalComponent implements OnInit, OnChanges {
  @Input() resourceUrl;
  @Input() hidden;
  @Input() isPreviewpolyway = false;
  @Input() previewTitle = '';
  @Output() closePreview = new EventEmitter();
  fullscreen = false;
  modalWidth: 1000 | '100%' = 1000;
  modalBodyStyle = {padding: 0, height: '600px'};
  preview = false;
  url;
  title = '';

  constructor(
    private sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit() {
    const {isPreviewpolyway, previewTitle, resourceUrl} = this;
    if (isPreviewpolyway) {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl
      (environment.ow365.substr(0, environment.ow365.length - 5) + 'polywayId=' + resourceUrl);
    } else {
      if (resourceUrl.indexOf('//') > -1) {
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
      } else {
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(environment.ow365 + resourceUrl);
      }
    }
    this.title = previewTitle;
    this.preview = isPreviewpolyway;
    if (isPreviewpolyway && process.env.environment !== 'development') {
      this.getIframe();
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const {isPreviewpolyway, resourceUrl, previewTitle} = changes;
    this.url = resourceUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl.currentValue) : '';
    this.title = previewTitle ? previewTitle.currentValue : '';
    if (isPreviewpolyway) {
      this.preview = isPreviewpolyway.currentValue;
      if (this.preview) {
        this.getIframe();
      }
    }
  }

  enterFullscreen(flag) {
    this.fullscreen = flag;
    flag ? this.fullScreens() : this.exitFullscreen();
    timer(0).subscribe(() => {
      this.modalWidth = flag ? '100%' : 1000;
      this.modalBodyStyle.height = flag ? '100%' : '600px';
    });
  }

  isFullScreen() {
    return !!(
      document.fullscreen ||
      (document as any).mozFullScreen ||
      (document as any).webkitIsFullScreen ||
      (document as any).webkitFullScreen ||
      (document as any).msFullScreen
    );
  }

  exitFullscreen() {
    if (!this.isFullScreen()) {
      return;
    }
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
  }

  fullScreens() {
    if (this.isFullScreen()) {
      return;
    }
    const elem = document.body;
    if ((elem as any).webkitRequestFullScreen) {
      (elem as any).webkitRequestFullScreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).requestFullScreen) {
      (elem as any).requestFullscreen();
    } else {
    }
  }



  cancelFullscreen() {
    this.isPreviewpolyway = false;
    this.enterFullscreen(false);
    this.closePreview.emit();
  }

  getIframe() {
    timer(100).subscribe(() => {
      const iframeObj = document.getElementById('iframeVideo');
      if (iframeObj) {
        this.getVideo(iframeObj);
        // (iframeObj as any).contentWindow.autoTogglePlayPc();
      } else {
        this.getIframe();
      }
    });
  }

  getVideo(iframe) {
    const win = iframe.contentWindow;
    timer(100).subscribe(
      () => {
        if (win.playerBLV && win.playerBLV.HTML5 && win.playerBLV.HTML5.video) {
          // 默认oss会自动播放不加密的视频,其他托管默认都不会自动播放
          // pc端如果想要自动播放用这个
          //  或 win.playerBLV.HTML5.play();
          // pc端如果想要禁止自动播放用这个
          win.playerBLV.HTML5.play();
          timer(100).subscribe(() => {
            win.playerBLV.j2s_pauseVideo();
          });
        } else {
          this.getVideo(iframe);
        }
      }
    );
  }

}
