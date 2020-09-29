import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IndexedDatabaseService} from '../../shared/indexed-database.service';
import {RecipeListModel} from './recipe-list.model';
import {ProgressService} from '../../progress-bar/shared/progress.service';

@Injectable({
  providedIn: 'root'
})

export class RecipeListService implements OnInit {

  constructor(private http: HttpClient,
              private idbService: IndexedDatabaseService,
              private progressService: ProgressService) { }

  private retrieveFlag = false;
  private size = '100';
  private page = 0;
  private total_page = 5;
  private get_total_page_flag = true;
  private recipeUrl = `/jmx-ui/api/productComponents?projection=recipeProjection&size=${this.size}&page=`;
  private static handleError<T>(operation = 'operation', error) {
      console.error(operation, error);
  }

  ngOnInit() {
  }

  retrieveAll(): void {


    if (!this.retrieveFlag) {
      this.progressService.progressMessage = 'Loading Recipes ...';
      this.progressService.loading = true;

      const retrieveNextPage = () => {
        this.http.get<RecipeListModel>(this.recipeUrl + this.page.toString()).subscribe(
          resp => {
            this.idbService.syncRecipes(resp.content);

            // console.log(this.page)
            if (!this.get_total_page_flag) {
              this.total_page = resp.page.totalPages;
              console.log('Total Page: ', this.total_page);
              this.get_total_page_flag = true;
            }
            if (this.page <= this.total_page) {
              this.page++;
              this.progressService.progressPercent = (this.page / this.total_page * 100);
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
