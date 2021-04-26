import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'dogfacts',
  connector: 'rest',
  baseURL: 'https://cat-fact.herokuapp.com/',
  crud: false,
  operations: [
    {
      template: {
        method: 'GET',
        url:
          'https://cat-fact.herokuapp.com/facts/random?animal_type=dog&amount=3',
      },
      functions: {
        getFacts: [],
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DogfactsDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'dogfacts';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.dogfacts', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
