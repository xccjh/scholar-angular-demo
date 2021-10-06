export interface SaveTags {
  id: string;
  tagName: string;
  pid: string;
  tagType: string; // 11:学科标签，12：知识标签
  tagLevel: string;
  seq: number;
  technologyId?: string;
}
