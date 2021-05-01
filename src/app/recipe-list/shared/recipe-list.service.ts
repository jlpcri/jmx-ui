import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {ApiService} from '../../api/api.service';
import {Observable, Subject} from 'rxjs';
import {ProgressService} from '../../progress-bar/shared/progress.service';
import {RecipeListModel} from './recipe-list.model';
import {RecipeModel} from './recipe.model';
import {LocationModel, LocationResponseListModel} from '../../shared/location.model';
import {ErrorService} from '../../error/error.service';
import {User} from '../../shared/user.model';

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {
  constructor(private api: ApiService,
              private progress: ProgressService,
              private idbService: IndexedDatabaseService,
              private errorService: ErrorService) { }

  private retrieveAllRecipes(): Observable<RecipeModel[]> {
    let allRecipes: RecipeModel[] = [];
    const allRecipesSubject: Subject<any> = new Subject<any>();
    this.progress.loading = true;
    this.progress.progressMessage = 'Loading Recipes...';
    this.progress.progressPercent = 1;
    const self = this;
    let afterId = 0;

    const options = {
      params: new HttpParams()
        .set('sourceSystem', 'amvpos')
        .set('status', 'active')
        .set('afterId', '' + afterId)
        .set('size', '3000')
    };

    function getNext() {
      options.params = options.params.set('afterId', '' + afterId);
      self.api.get<RecipeListModel>('/recipes', options).subscribe(
        resp => {
          resp.recipes.forEach( recipe => {
            allRecipes.push(recipe);
            afterId = recipe.id;
          });
          self.progress.progressPercent = allRecipes.length * 100 / resp.totalRecipes;
          if (allRecipes.length < resp.totalRecipes) {
            getNext();
          } else {
            console.log('loaded ' + allRecipes.length + ' recipes');
            allRecipesSubject.next(allRecipes);
          }
        }, error => {
          console.log(error);
          allRecipes = [];
          allRecipesSubject.next(allRecipes);
        }
        );
    }

    getNext();
    return allRecipesSubject;
  }

  saveRecipesToIdb() {
    this.progress.loading = true;
    this.retrieveAllRecipes().subscribe(
      data => {
        this.progress.progressMessage = 'Saving Recipes...';
        this.idbService.syncRecipes(data).subscribe(
          products => {
            console.log(products.length + ' products saved to idb');
            this.progress.loading = false;
          }, error => {
            this.errorService.add(error);
            this.progress.loading = false;
          }
        );
      }
    );
  }

  retrieveLocations() {
    const allLocations: LocationModel[] = [];
    const allLocationsSubject: Subject<any> = new Subject<any>();
    let fullAddr = '';
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    this.api.get<LocationResponseListModel>('/locations', options).subscribe(
      resp => {
        for (const item of resp.content) {
          if (item.addrLine1 === '') {
            fullAddr = '';
          } else {
            fullAddr = item.addrLine1 + ' ' + item.addrLine2 + ', ' + item.city + ' ' + item.state + ', ' + item.zipCode;
          }
          allLocations.push({
            name: item.name,
            storeLocation: fullAddr
          });
        }
        console.log('loaded ' + allLocations.length + ' locations');
        allLocationsSubject.next(allLocations);
      },
      error => {
        this.errorService.add('Fetch API Locations: ' + error.message);
      }
    );
    return allLocationsSubject;
  }

  saveLocationsToIdb() {
    this.idbService.getLocationsObjectStoreCount().subscribe(
      count => {
        if (count === 0) {
          this.retrieveLocations().subscribe(
            data => {
              this.idbService.syncLocations(data);
            }
          );
        } else {
          console.log('ObjectStore locations exists. No need loading');
        }
      }
    );
  }

  saveUsersToIdb(user: User) {
    this.idbService.syncUsers({
      username: user.username,
      name: user.name,
      roles: user.roles,
      signed: user.signed
    });

  }
}
