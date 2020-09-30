import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  public loading = false;
  public progressValue = 0;
  public progressMessage = 'Loading Data ...';
  public height = '2rem';

  constructor() { }

  set progressPercent(percent) {
    this.progressValue = percent;
    // console.log(this.progressWidth);
  }

  get progressPercent() {
    return this.progressValue;
  }

}
