import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, Subject, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Pageable} from '../recipe-list/shared/pageable.model';
import {ProgressService} from '../progress-bar/shared/progress.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = '/jmx-ui/api';

  constructor(private http: HttpClient, private progress: ProgressService) { }

  private static errorHandler(error: HttpErrorResponse) {
    let message = 'API Error: ';
    if (error.error instanceof ErrorEvent) {
      message += error.error.message;
    } else {
      message += `${error.status}: ${error.error.message}`;
    }
    // Error modal goes here
    console.log(message);
    return throwError(message);
  }

  get<T>(url: string, options: {params: HttpParams}): Observable<T> {
    return this.http.get<T>(this.baseUrl + url, options).pipe(catchError(ApiService.errorHandler));
  }

  post<T>(url: string, postData: any): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, postData).pipe(catchError(ApiService.errorHandler));
  }

  getAllPages(url: string, options: {params: HttpParams}): Observable<any> {
    const allItems = [];
    const itemsSubject: Subject<any> = new Subject<any>();
    let page = 0;
    const self = this;
    self.progress.progressPercent = 1;

    function getNextPage() {
      const opts = {
        params: options.params
          .set('page', '' + page)
      };
      self.get(url, opts).subscribe(
        (resp: Pageable) => {
          for (const item of resp.content) {
            allItems.push(item);
          }
          ++page;
          if (page < resp.page.totalPages) {
            self.progress.loading = true;
            self.progress.progressPercent = page * 100 / resp.page.totalPages;
            getNextPage();
          } else {
            self.progress.progressPercent = 100;
            itemsSubject.next(allItems);
            self.progress.loading = false;
          }
        },
          error => {
          self.progress.loading = false;
          itemsSubject.next([]);
        }
      );

    }

    getNextPage();
    return itemsSubject;
  }

}
