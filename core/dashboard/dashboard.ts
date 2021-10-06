/**
 * 绘制刻度盘
 * 配置参数
 * @method [render]  绘制初始图形
 * @method [updatePercent] 示数动画开始
 * 使用方法
 *  var my_canvas_obj= document.getElementById("my-canvas");
 *  var gauge= new SOFAGauge({
 *      "tick_color": "#6C7179", // 未达到的刻度颜色
 *      "tick_on_color": "#00AB84", // // 已达到的刻度颜色
 *      "value": 120, // 当前数值
 *      "end_num": 200, // 总数值
 *      "container": my_canvas_obj || 'my-canvas', // 容器
 *      "center_bottom_text": '经验值', // 数值底部文案
 *      "center_text_color": '#6C7179', // 数值字体颜色
 *   });
 */
function Gauge(options) {
  const properties: any = {
    drawStarIf: false,
    drawStartStopNumIf: false, // 是否绘制起始位置数字
    drawTriangleIf: false, // 是否绘制游标
    outRadius: 0, // 外圆环半径
    outStartAngleUnComplete: undefined, // 外圆环未完成开始角度，东边为0，逆时针累加 '0'
    outEndAngleUnComplete: undefined, // 外圆环未完成结束角度，东边为0，顺时针累加 '360'
    innerStartAngleUnComplete: undefined, // 外圆环未完成开始角度，东边为0，逆时针累加 '0'
    innerEndAngleUnComplete: undefined, // 外圆环未完成结束角度，东边为0，顺时针累加 '360'
    grayCircleStartAngleUnComplete: undefined,  // 外圆环未完成开始角度，东边为0，逆时针累加 '0'
    grayCircleEndAngleUnComplete: undefined,   // 外圆环未完成开始角度，东边为0，逆时针累加 '360'
    innerRadius: 0, // 内圆环半径
    unCompleteStrikeBg: '#C0E6DD',  // 外圆环未完成颜色
    completeStrikeBg: '#00AB84', // 外圆环完成颜色
    outLineCap: 'round',   // 外圆环线头
    outLineWidth: 0,  // 外圆环线宽度
    innerLineWidth: 0,  // 内圆环线宽度
    innerLineCap: undefined,  // 内圆环线头
    grayCircleStrikeBg: '#F3FAF8', // 内圆环颜色
    tick_length: 0,  // 短刻度长度
    large_tick_length: 0, // 长刻度长度
    tick_thickness: 1,  // 刻度条宽度
    tick_group_length: 9, // 每组内的短刻度个数
    ticks_groups_begin: 0, // 起始点
    tick_color: '#555962', // 未达到的刻度颜色
    tick_on_color: '#527d98', // 已达到的刻度颜色
    total_tick: 101, // 刻度线总个数
    total_degrees: 360, // 刻度线占比的总角度
    startTickAngle: undefined, // 刻度线旋转开始角度,以西边为0，顺时针增加，选转到结束total_degrees
    num_offset: 10, // 刻度值距离刻度的间隔, 单位px,
    show_num: true, // 是否展示长刻度下的数字
    tick_text_inner: true, // 刻度线文字是否在里面，反之在外面
    num_gap: 1, // 每个刻度之间的间隔值，计算显示数字时需要
    num_begin: 0, // 起始刻度值，和 num_gap成对使用，永远比num_gap小1
    num_font_size: 16, // 刻度值字体大小
    num_font_family: 'HanHei SC,PingFang SC,Helvetica Neue Thin, Helvetica, STHeitiSC-Light, Arial, sans-serif',
    bg_image: null, // 刻度盘的背景图片
    gauge_scale: 1, // 缩放比例
    animation_duration: 550, // 达到目标值的动画时间
    show_center_num: true, // 是否显示中间大的数字
    only_percentage: false,  // 是否仅显示百分比
    show_percent: false,  // 是否仅显示百分比
    center_bottom_text: '', // 中心底部字体文案
    center_bottom_text_color: '', // 中心字体颜色
    center_bottom_font_size: 0, // 中心字体颜色
    center_bottom_font_family: 'HanHei SC,PingFang SC,Helvetica Neue Thin, Helvetica, STHeitiSC-Light, Arial, sans-serif', // 中心字体颜色
    center_text_color: '#5b73f2', // 中心字体颜色
    center_font_size: 0, // 中间数字font-size
    center_num_font_family: 'HanHei SC,PingFang SC,Helvetica Neue Thin, Helvetica, STHeitiSC-Light, Arial, sans-serif',
    center_percentage_font: 16, // 百分比模式数字字体大小
    triangle_height: 0,  // 刻度指示三角形的 高度+triangle_offset
    triangle_width: 16, // 刻度指示三角形的底部宽度
    triangle_offset: 8, // 刻度指示三角形距离刻度的空隙
    start_percent: 0, // 开始跳转数字
    //  end_percent: 50, // 百分比
    value: 0, // 数值
    end_num: 1, // 总数
    container: '',
    origin: {}, // 记录中心原点
    origin_center: false,
    starSize: 0, // 星星大小
    starDistance: 0 // 星星间距
  };

  if (!options.container) {
    return console.error('container必须');
  } else if (typeof (options.container) === 'string') {
    const container = document.getElementById(options.container);
    if (container) {
      options.container = container;
    } else {
      return console.error('找不到容器元素container，初始化失败');
    }
  } else if (!options.end_num) {
    return console.error('end_num必须');
  } else if (!options.value) {
    return console.error('value必须');
  } else if (typeof (options.value) !== 'number' || typeof (options.end_num) !== 'number') {
    return console.error('起止数字必须是数值');
  } else if (options.value > options.end_num) {
    return console.error('开始数值不能大于结束数值');
  }

  if (options.end_num === 0) {
    options.end_percent = 0;
    options.end_num = 0;
  } else {
    options.end_percent = (options.value / options.end_num) * 100;
  }

  // naive Object.keys shim, but I know what the object looks like (it's right above here)
  const objectKeys: any = Object.keys;

  this._property_list = objectKeys(properties);

  // set object properties based on options and defaults
  // tslint:disable-next-line:forin
  for (const k in properties) {
    this[k] = options[k] || properties[k];
  }
  // 处理特别字段
  if (options.end_num === 0) {
    this.end_num = 0;
  }

  // 取容器宽高
  const parentNodeWidth = options.container.offsetWidth || 400;
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');

  this.canvas.style.width = parentNodeWidth + 'px';
  this.canvas.style.height = parentNodeWidth + 'px';
  const pRatio = window.devicePixelRatio;
  if (pRatio) {
    this.canvas.width = parentNodeWidth * pRatio;
    this.canvas.height = parentNodeWidth * pRatio;
  } else {
    this.canvas.width = parentNodeWidth;
    this.canvas.height = parentNodeWidth;
  }
  if (!this.tick_length) {
    this.tick_length = this.canvas.width * 0.025; // 设置刻度线长度
  }
  if (!this.large_tick_length) {
    this.large_tick_length = this.tick_length * 1.4; // 设置长刻度线长度
  }

  this.center_font_size = this.center_font_size || this.canvas.width * 0.2; // 根据视窗设置中心数字大小
  if (!this.triangle_height) {
    this.triangle_height = this.canvas.width * 0.08; // 刻度指示三角形的 高度, 即三角游标的高度
  }

  this.delatLength = this.large_tick_length - this.tick_length;
  // 计算百分比
  this._percent = options.start_percent || 0;
  this._target_percent = this._percent;
  this.num_offset = this.num_offset + this.triangle_height / 2;

  options.container.appendChild(this.canvas);
  this.updatePercent(options.end_percent); // animate the gauge to 60%
  return this;
}

Gauge.prototype._requestAnimFrame = (f) => {
  const win: any = window || {};
  const setTimeout = (callback, element) => {
    window.setTimeout(() => {
      // tslint:disable-next-line:new-parens
      callback(+new Date);
    }, 1000 / 60);
  };
  const anim = window.requestAnimationFrame
    || win.webkitRequestAnimationFrame
    || win.mozRequestAnimationFrame
    || win.oRequestAnimationFrame
    || win.msRequestAnimationFrame
    || setTimeout;
  anim(f);
};

Gauge.prototype.getCurrentState = function() {
  const state: any = {};
  // tslint:disable-next-line:forin
  for (const i in this._property_list) {
    const prop = this._property_list[i];
    state[prop] = this[prop];
  }
  state.percent = this._target_percent;
  return state;
};

// 设置背景
Gauge.prototype._applyBG = function() {
  const canvas = this.canvas;
  const context = this.context;
  if (this.bg_color) {
    context.save();
    context.fillStyle = this.bg_color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }
  if (this.bg_image) {
    if (!this.bg_image_obj) { // only load the image once
      this.bg_image_obj = new Image();
      const self = this;
      this.bg_image_obj.onload = () => {
        self.bg_image_loaded = true;
        context.drawImage(
          self.bg_image_obj,
          // tslint:disable-next-line:max-line-length
          canvas.width / 2 - self.bg_image.width / 2 + self.bg_image.xoffset, canvas.height - self.bg_image.height - self.bg_image.yoffset,
          self.bg_image.width,
          self.bg_image.height);
      };
      this.bg_image_obj.src = this.bg_image.url;
    } else {
      if (this.bg_image_loaded) {
        context.drawImage(
          this.bg_image_obj,
          canvas.width / 2 - this.bg_image.width / 2 + this.bg_image.xoffset,
          canvas.height - this.bg_image.height - this.bg_image.yoffset
        );
      }
    }
  }
};

Gauge.prototype._prepareStage = function() {
  const canvas = this.canvas;
  const context = this.context;
  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  // set background
  this._applyBG();
  // set the center of rotation to the bottom/center of the canvas
  let origin;
  if (this.origin_center) {
    origin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
  } else {
    origin = {
      x: canvas.width / 2,
      y: canvas.height / 2 - this.tick_thickness / 2 + canvas.height * 0.08, ...this.origin
    };
  }
  context.translate(origin.x, origin.y);
  // set the scale of the gauge (will naturally fill the width of the canvas
  context.scale(1 / this.gauge_scale, 1 / this.gauge_scale);
  // draw center big num
  if (this.show_center_num) {
    if (this.only_percentage) {
      this.drawCenterPercentage();
    } else {
      this.drawCenterNum();
    }
  }
};


// 判断100条刻度线哪条是长的
Gauge.prototype.isLargeTick = function(currentNum) {
  return (currentNum + this.ticks_groups_begin - 1) % (this.tick_group_length + 1) === 0;
};

// 中心文案
Gauge.prototype.drawCenterNum = function() {
  const context = this.context;
  const canvas = this.canvas;
  context.save();
  context.fillStyle = this.center_text_color;
  context.font = this.center_font_size + 'px ' + this.center_num_font_family;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  let centerText: string = String(Math.floor((this._percent / 100) * this.end_num * ((this.total_tick - 1) * this.num_gap + this.num_begin) / 100));
  if (this._percent === this._target_percent) {
    if (this.show_percent) {
      centerText = this.value + '%';
    } else {
      centerText = this.value;
    }
  }
  context.fillText(centerText, 0, this.center_bottom_text ? -canvas.width * 0.05 : 0);
  if (this.center_bottom_text) {
    context.fillStyle = this.center_bottom_text_color || this.center_text_color;
    context.font = (this.center_bottom_font_size || this.center_font_size * 0.3) + 'px ' + (this.center_bottom_font_family || this.center_num_font_family);
    context.fillText(this.center_bottom_text, 0, canvas.width * 0.1);
  }
  context.restore();
};
// 中心文案
Gauge.prototype.drawCenterPercentage = function() {
  const context = this.context;
  const canvas = this.canvas;
  context.save();
  context.fillStyle = this.center_text_color;
  context.font = (this.center_percentage_font || (this.center_font_size * 0.8)) + 'px ' + this.center_num_font_family;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  let centerText = Math.floor((this._percent / 100) * this.end_num * ((this.total_tick - 1) * this.num_gap + this.num_begin) / 100);
  if (this._percent === this._target_percent) {
    centerText = this.value;
  }
  context.fillText(centerText + '%', 0, 0);
  context.restore();
};

// 绘画游标
Gauge.prototype.drawTriangle = function(beginX, beginY) {
  const context = this.context;
  context.save();
  context.fillStyle = this._percent < 0.1 ? this.tick_color : this.tick_on_color;
  context.rotate(this._percent * this.total_degrees / 100 * Math.PI / 180);
  context.beginPath();
  context.moveTo(-beginX, -beginY - this.triangle_width / 2);
  context.lineTo(-beginX, -beginY + this.triangle_width / 2);
  context.lineTo(-beginX + this.triangle_height - this.triangle_offset, -beginY);
  context.fill();
  context.restore();
};

// 表盘数字 （绘制刻度线长度，第几个刻度线）
Gauge.prototype.drawGaugeNum = function(tickLength, tickIndex) {
  const canvas = this.canvas;
  const context = this.context;
  const text = this.num_begin + this.num_gap * tickIndex - 1;
  context.save();
  // set the center of rotation to the text middle
  let x;
  if (this.tick_text_inner) {
    x = -1 * (canvas.width / 2) + tickLength + this.triangle_height + this.num_font_size / 2;
  } else {
    x = -(1 * (canvas.width / 2) + tickLength / 2 + this.num_font_size / 2);
  }
  context.translate(x, -this.tick_thickness / 2);
  context.rotate(-90 * Math.PI / 180);
  context.font = this.num_font_size + 'px ' + this.num_font_family;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 0, this.num_offset);
  context.restore();
};

// 绘制起止数
Gauge.prototype.drawStartStopNum = function() {
  const canvas = this.canvas;
  const context = this.context;
  context.save();
  context.font = this.center_font_size * 0.3 + 'px ' + this.num_font_family;
  context.fillStyle = this.center_text_color;
  context.textAlign = 'center';
  const y = canvas.height / 3.4;
  context.fillText('0', -canvas.width * 0.32, y);
  context.fillText(this.end_num, canvas.width * 0.32, y);
  context.restore();
};

// 绘制运动圆环
Gauge.prototype.drawgroundCircle = function() {
  const canvas = this.canvas;
  const context = this.context;
  const startRadian = -(Math.PI / 180) * (this.outStartAngleUnComplete || 90); // 开始弧度
  const endRadian = (Math.PI / 180) * (this.outEndAngleUnComplete || (this.outStartAngleUnComplete ? (this.outStartAngleUnComplete + 180) : 270)); // 结束弧度
  const radius = this.outRadius || canvas.width / 2 * 0.7; // 半径
  context.save();
  context.strokeStyle = this.unCompleteStrikeBg;
  context.lineWidth = this.outLineWidth || (canvas.width / 22);
  context.lineCap = this.outLineCap;
  context.beginPath();
  context.arc(
    0,
    0,
    radius,
    startRadian,
    endRadian,
    false
  ); // 用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
  context.stroke();
  context.closePath();
  context.restore();

  const radianPrecent = (Math.PI / 180) * this.total_degrees * (this._percent / 100); // 运动弧度数
  context.save();
  context.strokeStyle = this.completeStrikeBg;
  context.lineWidth = this.outLineWidth || (canvas.width / 22); // 圆弧边框长度
  if (this._percent) {
    context.lineCap = 'round';
  }
  context.beginPath();
  context.arc(
    0,
    0,
    radius,
    this.innerStartAngleUnComplete ? -(Math.PI / 180) * (this.innerStartAngleUnComplete || 90) : startRadian,
    this.innerEndAngleUnComplete ? ((Math.PI / 180) * this.innerEndAngleUnComplete) : (startRadian + radianPrecent),
    false
  )
  ; // 用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
  context.stroke();
  context.closePath();
  context.restore();
};

// 绘画灰色圆环
Gauge.prototype.drawgrayCircle = function(argument) {
  const canvas = this.canvas;
  const context = this.context;
  const radius = this.innerRadius || canvas.width * 0.3; // 半径
  context.save();
  context.strokeStyle = this.grayCircleStrikeBg;
  context.lineWidth = this.innerLineWidth || (canvas.width / 10);  // 圆弧边框长度
  context.lineCap = this.innerLineCap;
  context.beginPath();

  const startRadian = -(Math.PI / 180) * (this.grayCircleStartAngleUnComplete || 90) || 0; // 开始弧度
  const endRadian = (Math.PI / 180) *
    (this.grayCircleEndAngleUnComplete || (this.grayCircleStartAngleUnComplete ? (this.grayCircleStartAngleUnComplete + 180) : 270))
    || (Math.PI / 180) * 360; // 结束弧度
  context.arc(
    0,
    0,
    radius,
    startRadian,
    endRadian
  ); // 用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
  context.stroke();
  context.closePath();
  context.restore();
};

// 画星星
Gauge.prototype.drawStar = function() {
  const canvas = this.canvas;
  const context = this.context;
  const radius = this.starSize || canvas.width * 0.025; // 半径
  const ratio = this.starDistance || 5; // 宽度比例
  context.save();

  context.fillStyle = this._percent >= (1 / 3 * 100) ? '#00AB84' : '#C0E6DD';
  context.beginPath();
  // 设置是个顶点的坐标，根据顶点制定路径
  for (let i = 0; i < 5; i++) {
    const line1 = Math.cos((18 + i * 72) / 180 * Math.PI) * radius;
    const line2 = -Math.sin((18 + i * 72) / 180 * Math.PI) * radius;
    const line3 = Math.cos((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    const line4 = -Math.sin((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    context.lineTo(line1 - canvas.width / ratio, line2 + 0);
    context.lineTo(line3 - canvas.width / ratio, line4 + 0);
  }
  context.fill();
  context.closePath();

  context.fillStyle = this._percent >= (2 / 3 * 100) ? '#00AB84' : '#C0E6DD';
  context.beginPath();
  // 设置是个顶点的坐标，根据顶点制定路径
  for (let i = 0; i < 5; i++) {
    const line1 = Math.cos((18 + i * 72) / 180 * Math.PI) * radius;
    const line2 = -Math.sin((18 + i * 72) / 180 * Math.PI) * radius;
    const line3 = Math.cos((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    const line4 = -Math.sin((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    context.lineTo(line1 + 0, line2 + -canvas.width / ratio);
    context.lineTo(line3 + 0, line4 + -canvas.width / ratio);
  }
  context.fill();
  context.closePath();

  context.fillStyle = this._percent >= 100 ? '#00AB84' : '#C0E6DD';
  context.beginPath();
  // 设置是个顶点的坐标，根据顶点制定路径
  for (let i = 0; i < 5; i++) {
    const line1 = Math.cos((18 + i * 72) / 180 * Math.PI) * radius;
    const line2 = -Math.sin((18 + i * 72) / 180 * Math.PI) * radius;
    const line3 = Math.cos((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    const line4 = -Math.sin((54 + i * 72) / 180 * Math.PI) * radius / 5 * 2;
    context.lineTo(line1 + canvas.width / ratio, line2 + 0);
    context.lineTo(line3 + canvas.width / ratio, line4 + 0);
  }
  context.fill();
  context.closePath();

  context.restore();
};

Gauge.prototype.render = function() {
  const canvas = this.canvas;
  const context = this.context;
  context.save(); // save original state of context to that it can be restore after rendering
  this._prepareStage(); // 准备绘画
  if (this.drawStartStopNumIf) {
    this.drawStartStopNum(); // 画起止数字
  }
  this.drawgrayCircle(); // 画灰色圆
  this.drawgroundCircle(); // 画运动圆环
  if (this.drawStarIf) {
    this.drawStar(); // 画星星
  }
  // figure out how many degrees between each tick
  const numTicks = this.total_tick;
  const rotationDeg = this.total_degrees / (numTicks - 1); // 每一份旋转间距
  // adjust for smaller than 180 degree gauges
  const startingDeg = this.startTickAngle || (180 - this.total_degrees) / 2; // 开始角度
  context.rotate(startingDeg * Math.PI / 180); // 以东边为0顺时针根据刻度总值增加

  // 绘制游标
  if (this.drawTriangleIf) {
    this.drawTriangle(canvas.width / 2, this.tick_thickness / 2, 0);
  }
  // draw all of the ticks
  for (let i = 1; i <= numTicks; i++) {
    // should this tick be on or off?
    const isOn = (((i - 1) / numTicks) * 100 < this._percent);
    // scale the ticks at group split
    const isLargeTick = this.isLargeTick(i);
    // const rect_scale = isLargeTick ? this.large_tick_scale : 1;
    const tickLength = isLargeTick ? this.large_tick_length : this.tick_length;
    // draw tick
    const color = isOn ? this.tick_on_color : this.tick_color;
    context.fillStyle = color;
    if (isLargeTick) { // 只有长的才绘制数字
      context.fillRect(-1 * (canvas.width / 2) + this.triangle_height, -this.tick_thickness / 2, tickLength, this.tick_thickness); // 绘制刻度线
      if (this.show_num) { // 绘制表盘数字
        this.drawGaugeNum(tickLength, i);
      }
    } else {
      const x = -1 * (canvas.width / 2) + this.triangle_height + this.delatLength;
      const y = -this.tick_thickness / 2;
      context.fillRect(
        x,
        y,
        tickLength,
        this.tick_thickness);
    }

    // rotate for next tick to be placed
    context.rotate(rotationDeg * Math.PI / 180);
  }
  context.restore(); // set back to original state
  return true;
};

// Gauge.prototype.setTickOnColor = function(colorStr) {
//   this.tick_on_color = colorStr;
// };
// Gauge.prototype.setAnimaDur = function(duration) {
//   this.animation_duration = duration;
// };

Gauge.prototype.updatePercent = function(percent, options) {
  if (percent < 0) {
    return;
  } else if (percent > 100) {
    percent = 100;
  }
  const self = this;
  this._target_percent = percent;
  options = options || {};
  const duration = ('animation_duration' in options) ? options.animation_duration : self.animation_duration;
  if (duration) {
    let lastUpdate = new Date().getTime();
    const start = this._percent;
    const end = this._target_percent;
    const changePerms = (end - start) / duration;
    const increasing = changePerms > 0 ? 1 : 0;
    const update = () => {
      const now = new Date().getTime();
      const elapsed = now - lastUpdate;
      self._percent += elapsed * changePerms;
      lastUpdate = now;
      // check if we've made it to our stopping point
      if ((increasing && self._percent < self._target_percent)
        || (!increasing && self._percent > self._target_percent)) {
        self.render();
        self._requestAnimFrame(update);
      } else {
        self._percent = self._target_percent;
        self.render();
      }
    };
    self._requestAnimFrame(update);
  } else {
    self._percent = percent;
    self.render();
  }
};

Gauge.prototype.refresh = function(value, total) {
  if (typeof value !== 'number' || typeof total !== 'number') {
    console.error('参数必须是number');
    return;
  }
  const percent = total === 0 ? 0 : (value / total) * 100;
  this.value = value;
  this.end_num = total;
  this.updatePercent(percent);
};

export default Gauge as any;
