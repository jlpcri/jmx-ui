import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  public loading = false;
  public progressValue = 0;
  public progressMessage = 'Loading';
  public progressWidth = '0px';

  constructor() { }

  set progressPercent(percent) {
    this.progressValue = percent;
    this.progressWidth = Math.floor(percent * 3) + 'px';
    // console.log(this.progressWidth);
  }

  get progressPercent() {
    return this.progressValue;
  }

}
