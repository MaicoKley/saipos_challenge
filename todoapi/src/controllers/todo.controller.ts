import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import {Todo} from '../models';
import {MarkDoneStatus, TodoRepository} from '../repositories';
import {Dogfacts} from '../services';

export class TodoController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
    @inject(RestBindings.Http.RESPONSE) private responsePtc: Response,
    @inject('services.Dogfacts') protected dogFacts: Dogfacts,
  ) {}

  @post('/todos')
  @response(200, {
    description: 'Todo model instance',
    content: {'application/json': {schema: getModelSchemaRef(Todo)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodo',
            exclude: ['id'],
          }),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todoRepository.create(todo);
  }

  @post('/todos/dogfacts')
  @response(200, {
    description: 'Create todos with random facts',
  })
  async createDogFacts(): Promise<Todo[]> {
    const facts = await this.dogFacts.getFacts();

    const todoFacts = facts.map(fact => {
      return {owner: 'Eu', description: fact.text, email: 'eu@me.com'};
    });

    return await this.todoRepository.createAll(todoFacts);
  }

  @get('/todo')
  @response(200, {
    description: 'Array of Todo mark as undone',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  })
  async findTodo(): Promise<Todo[]> {
    return this.todoRepository.find({where: {isComplete: false}});
  }

  @get('/done')
  @response(200, {
    description: 'Array of Todo mark as done',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  })
  async findDone(): Promise<Todo[]> {
    return this.todoRepository.find({where: {isComplete: true}});
  }

  @patch('/todo/markdone/{id}')
  async markTodoDoneById(
    @param.path.number('id') id: number,
  ): Promise<Response> {
    const todo = await this.todoRepository.findById(id);

    if (todo.isComplete) {
      return this.responsePtc.status(400).send({
        message: 'Todo is already marked as done',
      });
    }

    await this.todoRepository.updateById(id, {
      ...todo,
      changes: todo.changes! + 1,
      isComplete: true,
    });

    return this.responsePtc.status(200).send({
      message: 'Todo succesfully marked as done',
    });
  }

  @patch('/todo/markundone/{id}')
  async markTodoUndoneById(
    @param.path.number('id') id: number,
    @requestBody() {password}: {password: string},
  ): Promise<Response> {
    const {
      status,
      message,
    }: MarkDoneStatus = await this.todoRepository.markTodoUndone(id, password);

    return this.responsePtc.status(status).send({
      message: message,
    });
  }
}
