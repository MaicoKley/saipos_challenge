import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Todo } from '../models/todo';

export interface MailValidator {
  did_you_mean: string;
  format_valid: boolean;
  mx_found: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  url = 'http://localhost:3000/';
  urlMailValidation =
    'https://apilayer.net/api/check?access_key=f20f7ae318c34b92ee6a685fac758feb&email=';

  constructor(private httpClient: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    observe: 'response' as 'body',
  };

  getTodo(): Observable<Todo[]> {
    return this.httpClient
      .get<Todo[]>(this.url + 'todo')
      .pipe(retry(2), catchError(this.handleError));
  }

  getDone(): Observable<Todo[]> {
    return this.httpClient
      .get<Todo[]>(this.url + 'done')
      .pipe(retry(2), catchError(this.handleError));
  }

  saveTodo(todo: Todo): Observable<Todo> {
    return this.httpClient
      .post<Todo>(this.url + 'todos', JSON.stringify(todo), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  createDogFacts(): Observable<Todo> {
    return this.httpClient
      .post<Todo>(this.url + 'todos/dogfacts', {}, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  markTodoAsDone(id: number): Observable<Todo> {
    return this.httpClient
      .patch<Todo>(this.url + '/todo/markdone/' + id, {}, this.httpOptions)
      .pipe(retry(1), catchError(this.handleError));
  }

  markTodoAsUndone(id: number, password: string): Observable<Todo> {
    return this.httpClient
      .patch<Todo>(
        this.url + '/todo/markundone/' + id,
        JSON.stringify({ password: password }),
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  mailValidation(email: string): Observable<MailValidator> {
    return this.httpClient
      .get<MailValidator>(this.urlMailValidation + email)
      .pipe(retry(2), catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage =
        `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
