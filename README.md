## SeeAi教研工作台
提供给教研老师课程学科管理，课程资源管理，课包管理以及录播讲师管理，操作日志统计功能。

## 技术栈
angular9 + angular-router + typescript + webpack + ES6/7 + less + ng-zorro

## 项目运行
1. 拉取代码 `git clone git@gitee.com:qi-course/ky-scholar-web.git`
2. 安装依赖 `yarn`
3. 运行 `npm start`

## 安装很慢？
```
1.临时使用
npm --registry https://registry.npm.taobao.org install
2.持久使用
npm config set registry https://registry.npm.taobao.org
配置后可通过下面方式来验证是否成功 
npm config get registry 或 npm info express
3.通过cnpm使用
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## 目录结构
```sh
|- components-qkc/                        - 多项目共享公共组件
|- core/                                  - 多项目共享工具如拦截器，服务，指令等等
|- e2e/                                   - 用来端对端测试
|- layout/                                - 基础框架页面
|- public/                                - 本地devServer静态托管，用来多项目同域联调
|- src                                    - 项目代码入口
   |- app/                                - 主项目代码
   |- assets/                             - 静态资源文件
   |- environments/                       - 不同环境变量设置
   |- style/                              - 样式工具mixin，变量，reset,normalize
   |- main.ts                             - 入口 
   |- styles.less                         - 全局样式
|_  .env                                  - 环境变量配置相关，用来管理多项目环境变量注入问题
|_  angular.json                          - 相当于vue.config.js
|_  checkCommit.ts                        - 检查提交，为版本回滚做准备
|_  fileServer.ts                         - 本地文件服务器，用来测试文件上传服务
|_  localfile/                            - 本地文件服务器文件存储位置
|_  fixedPointPublish.ts                  - 定点发布脚本
|_  durationPointPublish.ts               - 定时发布脚本
|_  proxyConfig.json                      - 代理配置
|_  pull.ts                               - 发版前拉代码用，防止发版覆盖问题
|_  release-prod.log                      - 发版commit日志记录用来版本回滚，日志查询
|_  replace.ts                            - 打包替换用，用来检测服务端缓存用
|_  server.js                             - 本地服务托管用，用来本地模拟测试和生产环境
|_  upload-oss-prod.ts                    - 生成发版包含静态资源用
|_  upload-oss-test.ts                    - 测试发版包含静态资源用
|_  uploadOssTest.ts                      - 测试发版不包含静态资源用
|_  uploadOssProd.ts                      - 生成发版不包含静态资源用 
```

## angular-cli常用指令
```
你可以使用ng generate命令，为已有的 Angular 应用程序添加新的功能。
ng generate class my-new-class: 新建 class
ng generate component my-new-component: 新建组件
ng generate directive my-new-directive: 新建指令
ng generate enum my-new-enum: 新建枚举
ng generate module my-new-module: 新建模块
ng generate pipe my-new-pipe: 新建管道
ng generate service my-new-service: 新建服务

ng generate快捷键：
ng g cl my-new-class: 新建 class
ng g c my-new-component: 新建组件
ng g d my-new-directive: 新建指令
ng g e my-new-enum: 新建枚举
ng g m my-new-module: 新建模块
ng g p my-new-pipe: 新建管道
ng g s my-new-service: 新建服务

其他添加功能用法：
创建带路由的模块ng generate module 模块名 --routing
创建模块下的组件ng generate component 模块名/组件名
创建全局服务ng generate service hero --module=app
创建路由控制器ng generate module app -routing --flat --module=app
--flat：不单独创建一个文件夹。只创建文件
--module=app ：告诉 CLI 把它注册到 AppModule 的 imports 数组中。
运行程序：ng serve --port 8990 --open --host 0.0.0.0
--port：表示程序运行的端口号为8990
--open：打开到浏览器，访问程序
--host: 设置host
```

## 项目注意点
1. [ow365](https://officeweb365.com/Help/Default/5)
2. [wps-jsSDK](https://wwo.wps.cn/docs-js-sdk/#/)
3. [百度统计](https://tongji.baidu.com/web/welcome/login)
    - 公共账号 xxx
    - 公共密码 xxx
4. [保利威](https://dev.polyv.net/2020/videoproduct/v-player-sdk/v-player-sdk-web/v-player-sdk-web-feature/play/)
    - 公共账号 xxx
    - 公共密码 xxx
5. 测试线：可用实训资源 （note:  账期ID不能重复录入 ，实训跳转，只有内网才能打开 ）
    - 课程账套名称  账套编码
    - 恒生塑胶  0006
    - 恒图科技  0007
    - 恒润物流  0008
    - 恒然建筑  0009
    - 恒兆物业  0010
    - 铭诚塑料  0011
    - 凌阳科技  0012
    - 港通物流  0013
    - 金桥建筑  0014
    - 宝利物业  0015
    - 启特地产  0016
    - 恒沐大酒店  0017
    - 恒远旅游  0018
    - 恒陵国际  0019
    - 启盟电子商务  0020
    - 测试课程（三赢）  Sample
    
6. seeai项目操作指引：
    1. 创建渠道：超级管理员账号登录「总控制台」——》创建渠道(其中渠道code需要记住，登录其他工作台需要带上)
    2. 创建员工账号：运营管理员账号登录「运营工作台」(地址带上渠道code)——》创建校区——》创建员工账号——》授权需要登录的工作台和角色
    3. 创建资源和课程：教研账号登录「教研工作台」(地址带上渠道code)——》创建学科、学科结构、资源——》创建专业、课程、课包
    4. 进行排课：教务账号登录「教务工作台」(地址带上渠道code)——》创建时点档案、教室档案、班型档案、学员档案——》创建排课计划——》审核通过后加入学员
    5. 讲师上课：讲师账号登录「讲师工作台」(地址带上渠道code)——》操作自己领悟
    6. 学员上课：学员账号登录「学员工作台」——》操作自己领悟
    
## 部署情况
1. 网校WEB地址
- 测试地址：xxx
- 正式地址：xxx
﻿
2. seeai-测试线地址
- 总控制台：http://seeai-test.beta.hqjy.com/console﻿
- 运营工作台：http://seeai-test.beta.hqjy.com/operator/?xxx﻿
- 教务工作台：http://seeai-test.beta.hqjy.com/officer/?xxx﻿
- 教研工作台：http://seeai-test.beta.hqjy.com/scholar/?xxx﻿
- 讲师工作台：http://seeai-test.beta.hqjy.com/teacher/?xxx﻿
- 学生工作台PC：http://seeai-test.beta.hqjy.com/student/?xxx﻿
﻿
3. seeai-正式线地址
- 总控制台：https://﻿seeai.hqjy.com/console/   
- 运营工作台：https://﻿seeai.hqjy.com﻿/operator/?xxx﻿
- 教务工作台：https://﻿seeai.hqjy.com﻿/officer/?xxx﻿
- 教研工作台：https://﻿seeai.hqjy.com﻿/scholar/?xxx﻿
- 讲师工作台：https://﻿seeai.hqjy.com﻿/teacher/?xxx﻿
- 学生工作台PC：https://﻿seeai.hqjy.com﻿/student/?xxx﻿
﻿
4. 账号规则
- 总控制台：xxx/xxx
- 运营工作台：xxx/xxx
- 其他工作台：xxx/xxx
﻿
5. jenkins发布平台
- 地址：http://123.57.223.188:8088/﻿
- 账号：xxx/xxx

6. 99数字：http://dev.99shuzi.com/

7. 剧本平台（具体使用细节可以咨询-张小玲）
管理端测试地址：xxx/xxx
- http://ky.qicourse.cn/scenario/manage/#/login

剧本平台教师端测试地址：xxx/xxx
- http://ky.qicourse.cn/scenario/scholar/#/login

学生端和h5需基于某个剧本打开，类似：
- http://ky.qicourse.cn/scenario/student/#/login/7a5d328fce9ef21a476141e227bff544/2fc54ce3088edc557560b2deb0f955fb/1
- http://ky.qicourse.cn/scenario/student/#/login/剧本id/剧本版本id/剧本版本

## 项目优化点建议
+ 公共组件文档待补充

## 分支介绍
+ feature-12-13：1.7开发 最新分支 最后更新时间2020.01.06
+ computer_exam 功能分支 最后更新时间2019.12.03
+ dev 主分支 最后更新时间2019.12.06
+ 其他都是功能分支  可删除

## 主要原型地址
+ [seeai蓝湖原型地址](https://lanhuapp.com/web/#/item/project/stage?pid=13decb9b-f44d-439a-811e-df5c54f16636)
+ [题库axhub原型地址](https://axhub.im/ax9/5f51a1202a64b135/#g=1&id=zbdj8b&p=%E5%90%8E%E5%8F%B0%E4%B8%80%E6%9C%9F%E4%BF%AE%E8%AE%A2%E8%AE%B0%E5%BD%95)
+ 蓝湖公共账号：
    - xxx/xxx（郑光勇）
    - xxx/xxx（谭宇栩、苏善泳）
    - xxx/xxx（叶雷、邹家和）
    - xxx/xxx（马景文、隆双风）

## swagger-ui/yapi
+ [统计信息服务接口地址](http://10.0.98.148:20210/doc.html)
+ [教研Yapi](http://10.0.103.2:3000/project/23/interface/api/1319)
+ [题库内核层接口文档V1.0](http://10.0.98.146:6001/tk/swagger-ui.html#/)

## 项目团队成员
1. 负责测试：罗文峰，谢久蜜，聂艳杰
2. 负责产品：何烨
3. 负责后台：里扬荣，唐赞勇，高到马，王吕伊华
4. 负责前端：邹家和

### 前端各板块负责人
1. 教务工作台：郑佳锚
2. 教研工作台：邹家和
3. 运营工作台：邹家和，梁国泉
4. 讲师端：邹家和，陈泓智
5. 学员PC端：邹家和，马景文，谭宇栩
6. 学员H5端：邹家和，叶雷，双风，苏善泳
7. 剧本平台：张小玲，郑光勇



