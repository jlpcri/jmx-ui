import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {GlobalConstants} from '../shared/GlobalConstants';
import {User} from '../shared/user.model';

@Component({
  selector: 'app-guide',
  templateUrl: './bottle-scan.component.html',
  styleUrls: ['./bottle-scan.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BottleScanComponent implements OnInit {
  user: User;
  closeResult: string;

  @ViewChild('confirmModal') confirmModal: ElementRef;

  @Input() public scanData = GlobalConstants.scanDataInitial;
  constructor() { }

  ngOnInit(): void {
  }
}
