import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {DogfactsDataSource} from '../datasources';

export interface Dogfact {
  text: string;
}

export interface Dogfacts {
  getFacts(): Promise<Dogfact[]>;
}

export class DogfactsProvider implements Provider<Dogfacts> {
  constructor(
    // dogfacts must match the name property in the datasource json file
    @inject('datasources.dogfacts')
    protected dataSource: DogfactsDataSource = new DogfactsDataSource(),
  ) {}

  value(): Promise<Dogfacts> {
    return getService(this.dataSource);
  }
}
