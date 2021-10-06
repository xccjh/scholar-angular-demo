import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.less']
})
export class VideoPreviewComponent implements OnInit {
  win: any = window
  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const myPlayer = document.querySelector('#myPlayer')
    if (myPlayer) {
      this.palyVideo()
    } else {
      this.creteScript()
    }
  }
  creteScript () {
    const scripts =  document.createElement('script')
    scripts.id = 'myPlayer'
    scripts.src = '//player.polyv.net/script/player.js'
    document.head.append(scripts)
    scripts.addEventListener('load', (e) => {
      this.palyVideo()
    })
  }
  palyVideo () {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // 88083abbf5535a4d7b4d8614427559e0_8
      console.log(id)
      const layoutContent = document.querySelector('.ant-layout-content')
      const styles = getComputedStyle(layoutContent)
      const w = styles.width
      const h = styles.height
      console.log(h, w);

      this.win.polyvPlayer({
        wrap: '#player',
        width: w,
        height: h,
        vid: id,
      });
    });
  }
}
