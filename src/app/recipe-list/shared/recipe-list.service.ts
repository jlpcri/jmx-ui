import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {RecipeListModel} from './recipe-list.model';
import {ProgressService} from '../../progress-bar/shared/progress.service';

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {

  constructor(private http: HttpClient,
              private idbService: IndexedDatabaseService,
              private progressService: ProgressService) { }

  private retrieveFlag = false;
  private size = '100';
  private page: number;
  private totalPage: number;
  private getTotalPageFlag = true;
  private recipeUrl = `/jmx-ui/api/productComponents?projection=recipeProjection&size=${this.size}&page=`;
  private static handleError<T>(operation = 'operation', error) {
      console.error(operation, error);
  }

  retrieveAll(): void {
    this.page = 0;
    this.totalPage = 100;

    if (!this.retrieveFlag) {
      // this.progressService.progressMessage = 'Loading Recipes ...';
      this.progressService.loading = true;

      const retrieveNextPage = () => {
        this.http.get<RecipeListModel>(this.recipeUrl + this.page.toString()).subscribe(
          resp => {
            this.idbService.syncRecipes(resp.content);

            // console.log(this.page)
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
              this.retrieveFlag = true;
              this.progressService.progressPercent = 100;
              this.progressService.loading = false;
            }
          },
          error => {
            RecipeListService.handleError('Fetched API: ', error.message);
            this.page++;
            retrieveNextPage();
            // this.progressService.loading = false;
          }
        );

      };

      retrieveNextPage();
    } else {
      console.log('Fetched job no need.');
    }

  }

  emptyIdbData() {
    this.idbService.clearData();
    this.retrieveFlag = false;
  }

}
