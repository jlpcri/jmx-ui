import { Injectable } from '@angular/core';
import {User} from './shared/user.model';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: User = null;

  constructor(private http: HttpClient) { }

  authorized(): Observable<User> {
    const subject: Subject<User> = new Subject();
    if (this.user) {
      return of(this.user);
    }
    this.http.get<User>('/jmx-ui/user/user-info').subscribe(
      user => {
        this.user = user;
        subject.next(user);
      }, error => {
        if (error.url.endsWith('html')) {
          location.href = error.url;
        }
      }
    ) ;
    return subject;
  }

  logout(): void {
    this.http.get('/jmx-ui/logout').subscribe(
      resp => {
        location.href = '/jmx-ui/login/login.html';
      }, error => {
        location.href = '/jmx-ui/login/login.html';
      }
    );
  }
}
