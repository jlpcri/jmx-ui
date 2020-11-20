import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {ApiService} from '../../api/api.service';
import {Observable, Subject} from 'rxjs';
import {ProgressService} from '../../progress-bar/shared/progress.service';
import {RecipeListModel} from './recipe-list.model';
import {RecipeModel} from './recipe.model';

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {
  constructor(private api: ApiService,
              private progress: ProgressService,
              private idbService: IndexedDatabaseService) { }

  retrieveAllRecipes(): Observable<RecipeModel[]> {
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
            self.progress.loading = false;
            console.log('loaded ' + allRecipes.length + ' recipes');
            allRecipesSubject.next(allRecipes);
          }
        }, error => {
          self.progress.loading = false;
          allRecipes = [];
          allRecipesSubject.next(allRecipes);
        }
        );
    }

    getNext();
    return allRecipesSubject;
  }

  saveRecipesToIdb() {
    this.retrieveAllRecipes().subscribe(
      data => {
        this.idbService.syncRecipes(data);
      }
    );
  }

  retrieveLocations() {
    const allLocations: any[] = [];
    const allLocationsSubject: Subject<any> = new Subject<any>();
    const options = {
      params: new HttpParams()
        .set('size', '1000')
        .set('sort', 'name')
    };
    this.api.getAllPages('/locations', options).subscribe(
      resp => {
        for (const item of resp) {
          const fullAddr = item.addrLine1 + ' ' + item.addrLine2 + ', ' + item.city + ' ' + item.state + ', ' +  item.zipCode;
          allLocations.push({
            name: item.name,
            storeLocation: fullAddr
          });
        }
        console.log('loaded ' + allLocations.length + ' locations');
        allLocationsSubject.next(allLocations);
      },
      error => {
        console.log('Fetch API Locations: ', error.message);
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
        }
      }
    );
  }
}
