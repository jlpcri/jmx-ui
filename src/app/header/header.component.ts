import { Component, OnInit } from '@angular/core';
import { User } from '../shared/user.model';
import { AuthService} from "../auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User;
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => { this.user = user; }
    )
  }

}
