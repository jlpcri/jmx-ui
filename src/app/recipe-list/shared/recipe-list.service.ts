import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, Subject } from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { RecipeListModel } from "./recipe-list.model";
import { IndexedDatabaseService } from "../../shared/indexed-database.service";

@Injectable({
  providedIn: 'root'
})

export class RecipeListService {
  constructor(private http: HttpClient,
              private idb: IndexedDatabaseService
  ) { }

  retrieve(id: string){
    let recipeList = new Subject<RecipeListModel[]>();

    let httpUrl = '/jmx-ui/api/productComponents/' + id;
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic' + btoa("amvapi:password"))

    let httpParams = new HttpParams()
      .set('projection', 'recipeProjection');

    let options = {
      headers: httpHeaders,
      params: httpParams,
      responseType: 'json'
    };

    console.log(httpParams.toString())
    console.log(httpHeaders)

    this.http.get<RecipeListModel[]>(httpUrl, {
      headers: httpHeaders,
      params: httpParams,
      responseType: 'json'
    }).subscribe(
      resp => {
        recipeList.next(resp);
      }
    );

    console.log(recipeList)
    return recipeList;
  }
}
