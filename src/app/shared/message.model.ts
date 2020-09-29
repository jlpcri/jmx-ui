export class Message {
  static ERROR = 3;
  static WARNING = 2;
  static INFO = 1;
  level: number;
  text: string;
  detail: string;
  constructor(level: number, text: string, detail: string) {
    this.level = level;
    this.text = text;
    this.detail = detail;
  }
}
