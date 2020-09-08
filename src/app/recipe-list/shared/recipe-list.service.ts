import {Injectable} from "@angular/core";
import {Observable, of, Subject} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RecipeListModel} from "./recipe-list.model";
import {IndexedDatabaseService} from "../../shared/indexed-database.service";
import {catchError, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {
  constructor(private http: HttpClient,
              private idb: IndexedDatabaseService
  ) { }

  private recipeUrl = '/jmx-ui/api/productComponents?projection=recipeProjection&page=1&size=100';
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'}),
  }

  getRecipes(): Observable<RecipeListModel[]>{
    return this.http.get<RecipeListModel[]>(this.recipeUrl, this.httpOptions)
      .pipe(
        tap(_ => console.log('fetched recipes')),
        catchError(this.handleError<RecipeListModel[]>(`getRecipes`, []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T){
    return (error: any): Observable<T> => {
      console.error(error);

      return of(result as T);
    }
  }
}
