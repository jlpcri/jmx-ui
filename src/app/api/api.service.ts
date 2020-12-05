import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = '/jmx-ui/api';

  constructor(private http: HttpClient) { }

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

}
