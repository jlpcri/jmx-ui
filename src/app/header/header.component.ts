import { Component, OnInit } from '@angular/core';
import { User } from '../shared/user.model';
import { AuthService} from '../auth.service';
import {IndexedDatabaseService} from '../shared/indexed-database.service';
import {RecipeListService} from '../recipe-list/shared/recipe-list.service';

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
    this.recipeListService.retrieveAll();
  }

  emptyIdbData() {
    this.idbService.clearData();
  }

  isDeveloper(): boolean {
    return (typeof this.user !== 'undefined') && this.user.name === 'Songqing Liu';
  }
}
