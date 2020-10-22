import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {RecipeListModel} from './recipe-list.model';
import {ProgressService} from '../../progress-bar/shared/progress.service';
import {Subject} from 'rxjs';
import {Locations} from '../../product';

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {

  constructor(private http: HttpClient,
              private idbService: IndexedDatabaseService,
              private progressService: ProgressService) { }

  private size = 1000;
  private page = 0;
  private totalPage = 5;
  private getTotalPageFlag = false;
  private recipeUrl = '/jmx-ui/api/productComponents/search/recipes';
  private locationUrl = '/jmx-ui/api/locations';

  retrieveAll(): void {
    this.progressService.progressMessage = 'Loading Recipes ...';
    this.progressService.loading = true;

    const retrieveNextPage = () => {
      const options = {
        params: new HttpParams()
          .set('projection', 'recipeProjection')
          .set('sourceSystem', 'amvpos')
          .set('status', 'active')
          .set('size', this.size.toString())
          .set('page', this.page.toString())
      };
      this.http.get<RecipeListModel>(this.recipeUrl, options).subscribe(
        resp => {
          this.idbService.syncRecipes(resp.content);

          if (!this.getTotalPageFlag) {
            this.totalPage = resp.page.totalPages;
            console.log('Total Page: ', this.totalPage);
            this.getTotalPageFlag = true;
          }
          if (this.page <= this.totalPage) {
            this.page++;
            this.progressService.progressPercent = (this.page / this.totalPage * 100);
            retrieveNextPage();
          } else {
            console.log('Fetched job done');
            this.progressService.progressPercent = 100;
            this.progressService.loading = false;
          }
        },
        error => {
          console.log('Fetched API: ', error.message);
          this.progressService.loading = false;
        }
      );
    };

    retrieveNextPage();
  }

  retrieveLocations() {
    let tmpAddr = '';
    const results: any[] = [];
    const options = {
      params: new HttpParams()
        .set('page', '0')
        .set('size', this.size.toString())
        .set('sort', 'name')
    };
    this.http.get<any>(this.locationUrl, options).subscribe(
      resp => {
        for (const item of resp.content) {
          tmpAddr = item.addrLine1 + ' ' + item.addrLine2 + ', ' + item.city + ' ' + item.state + ', ' +  item.zipCode;
          results.push({
            name: item.name,
            storeLocation: tmpAddr
          });
        }
      },
      error => {
        console.log('Fetch API Locations: ', error.message);
      }
    );

    return results;

  }
}
