import {Injectable, OnInit} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {IndexedDatabaseService} from "../../shared/indexed-database.service";
import {RecipeListModel} from "./recipe-list.model";
import {from, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class RecipeListService implements OnInit{

  constructor(private http: HttpClient,
              private idbService: IndexedDatabaseService
  ) { }

  ngOnInit() {
  }

  private size: string = '100'
  private page: number = 0
  private total_page: number = 5
  private get_total_page_flag = false
  private recipeUrl = `/jmx-ui/api/productComponents?projection=recipeProjection&size=${this.size}&page=`;

  retrieveAll(){
    const recipes: any[] = [];

    // this.progressService.progressMessage = 'Loading Recipes ...';
    // this.progressService.loading = false;

    const retrieveNextPage = () => {
      this.http.get<RecipeListModel>(this.recipeUrl + this.page.toString()).subscribe(
        resp => {
          this.idbService.syncRecipes(resp.content);

          recipes.push(resp.content);
          // console.log(this.page)
          if (! this.get_total_page_flag){
            this.total_page = resp.page.totalPages;
            console.log('Total Page: ', this.total_page)
            this.get_total_page_flag = true
          }
          if (this.page <= this.total_page){
            this.page++;
            retrieveNextPage();
          } else {
            // this.progressService.progressPercent = 100;
            console.log("Fetched job done")
            // this.progressService.loading = false;
          }
        },
        error => {
          RecipeListService.handleError('Fetched API: ', error)
          this.page++;
          retrieveNextPage()
          // this.progressService.loading = false;
        }
      );

    };

    retrieveNextPage();
    // console.log(recipes)
    return recipes;

  }


  private static handleError<T>(operation = 'operation', error){
      console.error(operation, error);
  }

}
