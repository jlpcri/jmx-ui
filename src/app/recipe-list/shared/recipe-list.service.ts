import {Injectable, OnInit} from "@angular/core";
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {IndexedDatabaseService} from "../../shared/indexed-database.service";

@Injectable({
  providedIn: 'root'
})

export class RecipeListService implements OnInit{

  constructor(private http: HttpClient,
              private idb: IndexedDatabaseService
  ) { }

  ngOnInit() {
  }

  private size: string = '100'
  //Todo:  if first_page is 0, it will throw HttpErrorResponse
  private first_page: number = 1
  private recipeUrl = `/jmx-ui/api/productComponents?projection=recipeProjection&size=${this.size}&page=`;

  getRecipesPerPage(page: number){
    return this.http.get(this.recipeUrl + page.toString()).toPromise();
  }

  async getRecipesAll(){
    let result = [];

    result[0] = await this.getRecipesPerPage(this.first_page)
    let lastHref = result[0]['links'][4]['href']
    let lastPage = this.getLastPageIndex(lastHref)
    console.log(lastPage)

    // Todo: need find the approach to fetch more than 3400 async requests
    for (let i = this.first_page; i < 100; i++){
      result[i] = await this.getRecipesPerPage(i);
    }

    console.log(result[99])
  }

  getLastPageIndex(href: string){
    const left = "page=";
    const right = "&size";
    return parseInt(href.slice(href.indexOf(left) + left.length, href.indexOf(right)));
  }

  private handleError<T>(operation = 'operation', result?: T){
    return (error: any): Observable<T> => {
      console.error(error);

      return of(result as T);
    }
  }
}
