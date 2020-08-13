import {Component, OnInit} from '@angular/core';
import {User} from "./shared/user.model";
import {AuthService} from "./auth.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: User;
  search = new FormControl('');

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => { this.user = user; }
    )
  }
}
