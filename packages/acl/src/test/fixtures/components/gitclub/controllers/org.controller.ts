import {Count, CountSchema, Filter, repository, Where} from '@loopback/repository';
import {get, getFilterSchemaFor, getModelSchemaRef, getWhereSchemaFor, param, patch, requestBody} from '@loopback/rest';
import {Org} from '../models';
import {OrgRepository} from '../repositories';

export class OrgController {
  constructor(@repository(OrgRepository) protected orgRepo: OrgRepository) {}

  @get('/orgs', {
    responses: {
      '200': {
        description: 'Array of Org model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Org),
            },
          },
        },
      },
    },
  })
  async find(@param.query.object('filter', getFilterSchemaFor(Org)) filter?: Filter<Org>): Promise<Org[]> {
    return this.orgRepo.find(filter);
  }

  @patch('/orgs', {
    responses: {
      '200': {
        description: 'Org PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Org, {partial: true}),
        },
      },
    })
    org: Org,
    @param.query.object('where', getWhereSchemaFor(Org)) where?: Where,
  ): Promise<Count> {
    return this.orgRepo.updateAll(org, where);
  }

  @get('/orgs/{id}', {
    responses: {
      '200': {
        description: 'Org model instance',
        content: {'application/json': {schema: getModelSchemaRef(Org)}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Org> {
    return this.orgRepo.findById(id);
  }
}
