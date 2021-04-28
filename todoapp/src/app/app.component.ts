import { Component, OnInit } from '@angular/core';
import { MailValidator, TodoService } from './services/todo.service';
import { Todo } from './models/todo';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  newTodo = {} as Todo;
  mailValidation = {} as MailValidator;

  todoToUndoneId = 0;

  todoMarkedDone: Todo[];
  todoMarkedUndone: Todo[];

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.getToDoList();
    this.getDoneList();
  }

  getToDoList() {
    this.todoService.getTodo().subscribe((todo: Todo[]) => {
      this.todoMarkedUndone = todo;
    });
  }

  getDoneList() {
    this.todoService.getDone().subscribe((done: Todo[]) => {
      this.todoMarkedDone = done;
    });
  }

  markTodoAsDone(id: number) {
    this.todoService.markTodoAsDone(id).subscribe(() => {
      this.getToDoList();
      this.getDoneList();
    });
  }

  setTodoToUndoneId(id: number) {
    this.todoToUndoneId = id;
  }

  markTodoAsUndone(id: number, password: string) {
    this.todoService.markTodoAsUndone(id, password).subscribe((response) => {
      this.getToDoList();
      this.getDoneList();
      this.todoToUndoneId = 0;
    });
  }

  newTodoItems() {
    this.todoService.createDogFacts().subscribe(() => {
      this.getToDoList();
    });
  }

  saveTodo(form: NgForm) {
    if (this.mailValidation.format_valid && this.mailValidation.mx_found) {
      this.todoService.saveTodo(this.newTodo).subscribe(() => {
        form.resetForm();
        this.getToDoList();
      });
    }
  }

  mailValidator(email: string) {
    this.todoService
      .mailValidation(email)
      .subscribe((validation: MailValidator) => {
        this.mailValidation = validation;
      });
  }
}
