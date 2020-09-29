import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  public loading = false;
  public _progressPercent = 0;
  public progressMessage = 'Loading';
  public progressWidth = '0px';

  constructor() { }

  set progressPercent(percent) {
    this._progressPercent = percent;
    this.progressWidth = Math.floor(percent * 3) + 'px';
    // console.log(this.progressWidth);
  }

  get progressPercent() {
    return this._progressPercent;
  }

}
