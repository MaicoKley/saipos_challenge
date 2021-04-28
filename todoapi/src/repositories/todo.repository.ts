import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {compare} from 'bcrypt';
import {PostgresDataSource} from '../datasources';
import {Todo, TodoRelations} from '../models';

export interface MarkDoneStatus {
  status: number;
  message: string;
}

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {
  constructor(@inject('datasources.postgres') dataSource: PostgresDataSource) {
    super(Todo, dataSource);
  }

  async markTodoUndone(id: number, password: string) {
    const todo = await this.findById(id);

    const passwordHash =
      '$2b$10$8lUGtkbcivSY00GoM9Kex.jBUQNgqFGtJDltSw4mVrCK0woc7gbCu';

    if (!todo.isComplete) {
      return {status: 400, message: 'Todo is already marked as undone'};
    }

    if (todo.changes! >= 3) {
      return {
        status: 400,
        message: 'Todo item is no available to mark as undone',
      };
    }

    if (!password) {
      return {status: 401, message: 'No password has been provided'};
    }

    const match = await compare(password, passwordHash);

    if (!match) {
      return {status: 403, message: 'Invalid password'};
    }

    await this.updateById(id, {
      isComplete: false,
    });

    return {status: 200, message: 'Todo succesfully marked as undone'};
  }
}
