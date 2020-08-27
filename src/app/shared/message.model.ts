export class Message {
  static ERROR: number = 3;
  static WARNING: number = 2;
  static INFO: number = 1;
  level: number;
  text: string;
  detail: string;
  constructor(level: number, text: string, detail: string) {
    this.level = level;
    this.text = text;
    this.detail = detail;
  }
}
