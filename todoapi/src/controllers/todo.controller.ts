import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
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
import {TodoRepository} from '../repositories';
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

  // @get('/todos/count')
  // @response(200, {
  //   description: 'Todo model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Todo) where?: Where<Todo>,
  // ): Promise<Count> {
  //   return this.todoRepository.count(where);
  // }

  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Todo) filter?: Filter<Todo>): Promise<Todo[]> {
    return this.todoRepository.find(filter);
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

  // @patch('/todos')
  // @response(200, {
  //   description: 'Todo PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todo, {partial: true}),
  //       },
  //     },
  //   })
  //   todo: Todo,
  //   @param.where(Todo) where?: Where<Todo>,
  // ): Promise<Count> {
  //   return this.todoRepository.updateAll(todo, where);
  // }

  // @get('/todos/{id}')
  // @response(200, {
  //   description: 'Todo model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Todo, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.number('id') id: number,
  //   @param.filter(Todo, {exclude: 'where'}) filter?: FilterExcludingWhere<Todo>
  // ): Promise<Todo> {
  //   return this.todoRepository.findById(id, filter);
  // }

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
    const todo = await this.todoRepository.findById(id);

    if (!todo.isComplete) {
      return this.responsePtc.status(400).send({
        message: 'Todo is already marked as undone',
      });
    }

    if (todo.changes! >= 2) {
      return this.responsePtc.status(400).send({
        message: 'Todo item is no available to mark as undone',
      });
    }

    if (!password) {
      return this.responsePtc.status(401).send({
        message: 'No password has been provided',
      });
    }

    if (password !== 'TrabalheNaSaipos') {
      return this.responsePtc.status(403).send({
        message: 'Invalid password',
      });
    }

    await this.todoRepository.updateById(id, {
      isComplete: false,
    });

    return this.responsePtc.status(200).send({
      message: 'Todo succesfully marked as undone',
    });
  }

  // @patch('/todos/done/{id}')
  // @response(204, {
  //   description: 'Todo check as done',
  // })
  // async markTodoDoneById(@param.path.number('id') id: number): Promise<void> {
  //   await this.todoRepository.updateById(id);
  // }

  // @put('/todos/{id}')
  // @response(204, {
  //   description: 'Todo PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() todo: Todo,
  // ): Promise<void> {
  //   await this.todoRepository.replaceById(id, todo);
  // }

  // @del('/todos/{id}')
  // @response(204, {
  //   description: 'Todo DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.todoRepository.deleteById(id);
  // }
}
