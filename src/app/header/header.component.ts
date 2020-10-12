import {Component, OnInit} from '@angular/core';
import {User} from '../shared/user.model';
import {AuthService} from '../auth.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User;
  constructor(private auth: AuthService,
              private recipeListService: RecipeListService,
              private idbService: IndexedDatabaseService) { }

  ngOnInit(): void {
    this.auth.authorized().subscribe(
      user => { this.user = user; }
    );
  }

  logout(): void {
    this.auth.logout();
  }

  saveRecipesToIdb() {
    this.idbService.init(dbExisted => {
      if (!dbExisted) {
        this.recipeListService.retrieveAll();
      } else {
        console.log('IndexDB exists. No need loading');
      }
    });
  }

  eraseIdbData() {
    this.idbService.eraseIdbData();
  }

  isAdmin(): boolean {
    if (this.user === undefined) {
      return false;
    } else if (this.user.roles === undefined || this.user.roles.length === 0) {
      return false;
    } else {
      return this.user.roles.indexOf('GROUP - Alohma Admin') >= 0;
    }
  }
}
