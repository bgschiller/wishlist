import Knex from 'knex';
import { Model as Model_ } from 'objection';
import config from '../knexfile';

export const knex = Knex(config);

Model_.knex(knex);

export const Model = Model_;
