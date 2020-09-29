import { Component, OnInit } from '@angular/core';
import {ProgressService} from "./shared/progress.service";

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {

  constructor(public progressService: ProgressService) { }

  ngOnInit(): void {
  }

}
