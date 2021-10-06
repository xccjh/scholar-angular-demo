import {ToolsUtil} from './tools.util';

export class UploadDir {
  /**
   * 学生头像
   */
    // tslint:disable-next-line:variable-name
  public static avatar_student = 'image/avatar/student/' + ToolsUtil.getRandomFileName();

  /**
   * 教师头像
   */
    // tslint:disable-next-line:variable-name
  public static avatar_teacher = 'image/avatar/teacher/' + ToolsUtil.getRandomFileName();


  /**
   * 班级头像
   */
    // tslint:disable-next-line:variable-name
  public static avatar_class = 'image/avatar/class/' + ToolsUtil.getRandomFileName();


  /**
   * 奖励设置
   */
    // tslint:disable-next-line:variable-name
  public static reward_file = 'image/reward_file/' + ToolsUtil.getRandomFileName();


  /**
   * 公司数据包
   */
    // tslint:disable-next-line:variable-name
  public static company_file = 'image/company_file/' + ToolsUtil.getRandomFileName();

  /**
   * 素材文件
   */
    // tslint:disable-next-line:variable-name
  public static courseware_doc = 'courseware/doc/' + ToolsUtil.getRandomFileName();

  /**
   * 素材视频
   */
    // tslint:disable-next-line:variable-name
  public static courseware_video = 'courseware/video/' + ToolsUtil.getRandomFileName();

  /**
   * 案例静态化文件
   */
    // tslint:disable-next-line:variable-name
  public static courseware_case_static = 'courseware/case/static/' + ToolsUtil.getRandomFileName();

  /**
   * 案例音频文件
   */
    // tslint:disable-next-line:variable-name
  public static courseware_case_audio = 'courseware/case/audio/' + ToolsUtil.getRandomFileName();

  /**
   * 案例附件文件
   */
    // tslint:disable-next-line:variable-name
  public static courseware_case_doc = 'courseware/case/doc/' + ToolsUtil.getRandomFileName();

  /**
   * 案例附件文件
   */
  public static editor = 'editor/' + ToolsUtil.getRandomFileName();

  // 导入习题
  // tslint:disable-next-line:variable-name
  public static question_upload = 'data/questionUpload/' + ToolsUtil.getRandomFileName();

  // 官网banner
  // tslint:disable-next-line:variable-name
  public static offical_image = 'official/image/' + ToolsUtil.getRandomFileName();

  // 官网banner
  // tslint:disable-next-line:variable-name
  public static offical_video = 'official/video/' + ToolsUtil.getRandomFileName();


  // 知识图谱
  // tslint:disable-next-line:variable-name
  public static knowledge_graph = 'knowledge/grap/' + ToolsUtil.getRandomFileName();


  // 知识图谱视频
  // tslint:disable-next-line:variable-name
  public static knowledge_video = 'knowledge/video/' + ToolsUtil.getRandomFileName();


  // 知识图谱文件
  // tslint:disable-next-line:variable-name
  public static knowledge_file = 'knowledge/file/' + ToolsUtil.getRandomFileName();


  /**
   * 任务
   */
  public static task = 'task';
}
