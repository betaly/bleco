import {model, property} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {fail} from 'assert';

import {SoftCrudRepository} from '../../mixins';
import {SoftDeleteEntity} from '../../models';

/**
 * A mock up model class
 */
@model()
export class Customer extends SoftDeleteEntity {
  @property({
    id: true,
  })
  id: number;
  @property()
  email: string;
}

export function testSoftCrudRepository(
  name: string,
  // repoClass: Constructor<SoftCrudRepository<Customer, typeof Customer.prototype.id>>,
  getRepo: () => SoftCrudRepository<Customer, typeof Customer.prototype.id>,
) {
  describe(`${name} Suite Tests`, () => {
    let repo: SoftCrudRepository<Customer, typeof Customer.prototype.id>;

    beforeAll(async () => {
      repo = getRepo();
    });

    afterEach(clearTestData);

    // describe('query enhanced', function () {
    //   it('should enhanced by query', function () {
    //     expect(repo).to.have.property('query');
    //   });
    // });

    describe('find', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should find non soft deleted entries', async () => {
        const customers = await repo.find();
        expect(customers).to.have.length(3);
      });
      it('should find non soft deleted entries with and operator', async () => {
        const customers = await repo.find({
          where: {
            and: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        });
        expect(customers).to.have.length(1);
      });
      it('should not find soft deleted entries with and operator', async () => {
        const deletedCustomers = await repo.find({
          where: {
            and: [
              {
                email: 'alice@example.com',
              },
              {
                id: 2,
              },
            ],
          },
        });
        expect(deletedCustomers).to.have.length(0);
      });
      it('should find non soft deleted entries with or operator', async () => {
        const customers = await repo.find({
          where: {
            or: [
              {
                email: 'john@example.com',
              },
              {
                email: 'alice@example.com',
              },
            ],
          },
        });
        expect(customers).to.have.length(1);
      });
    });

    describe('findAll', () => {
      it('should find all entries, soft deleted and otherwise', async () => {
        await setupTestData();
        const customers = await repo.findAll();
        expect(customers).to.have.length(4);
      });
    });

    describe('findOne', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should find one non soft deleted entry', async () => {
        const customer = await repo.findOne({
          where: {
            email: 'john@example.com',
          },
        });
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find none soft deleted entries', async () => {
        const customer = await repo.findOne({
          where: {
            email: 'alice@example',
          },
        });
        expect(customer).to.be.null();
      });

      it('should find one non soft deleted entry using and operator', async () => {
        const customer = await repo.findOne({
          where: {
            and: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        });

        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find none soft deleted entry using and operator', async () => {
        const customer = await repo.findOne({
          where: {
            and: [
              {
                email: 'alice@example.com',
              },
              {
                id: 3,
              },
            ],
          },
        });

        expect(customer).to.be.null();
      });

      it('should find one non soft deleted entry using or operator', async () => {
        const customer = await repo.findOne({
          where: {
            or: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        });

        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('shound find none soft deleted entry using or operator', async () => {
        const customer = await repo.findOne({
          where: {
            or: [
              {
                email: 'alice@example.com',
              },
              {
                id: 3,
              },
            ],
          },
        });

        expect(customer).to.be.null();
      });
    });

    describe('findOneIncludeSoftDelete', () => {
      it('should find one soft deleted entry', async () => {
        await repo.create({id: 3, email: 'alice@example.com'});
        await repo.deleteById(3);
        const customer = await repo.findOneIncludeSoftDelete({
          where: {
            email: 'alice@example.com',
          },
        });

        expect(customer).to.have.property('email').equal('alice@example.com');
      });
    });

    describe('findById', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);

      it('should find one non soft deleted entry by id', async () => {
        const customer = await repo.findById(1);
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should reject on finding soft deleted entry by id', async () => {
        try {
          await repo.findById(3);
          fail();
        } catch (e) {
          expect(e.errorCode).to.be.equal('entity_not_found');
        }
      });

      it('should find one non soft deleted entry by id, using and operator', async () => {
        const customer = await repo.findById(1, {
          where: {
            and: [{email: 'john@example.com'}, {id: 1}],
          },
        });
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find no soft deleted entry by id, using and operator', async () => {
        try {
          await repo.findById(3, {
            where: {
              and: [{email: 'alice@example.com'}, {id: 3}],
            },
          });
          fail();
        } catch (e) {
          expect(e.errorCode).to.be.equal('entity_not_found');
        }
      });

      it('should find one non soft deleted entry by id, using or operator', async () => {
        const customer = await repo.findById(1, {
          where: {
            or: [{email: 'john@example.com'}, {id: 1}],
          },
        });
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find no soft entry by id, using or operator', async () => {
        try {
          await repo.findById(3, {
            where: {
              or: [{email: 'alice@example.com'}, {id: 3}],
            },
          });
          fail();
        } catch (e) {
          expect(e.errorCode).to.be.equal('entity_not_found');
        }
      });
    });

    describe('findByIdIncludeSoftDelete', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should find one by id', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(1);
        expect(customer).to.have.property('email').equal('john@example.com');
      });
      it('should find one by id even if soft deleted', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(3);
        expect(customer).to.have.property('email').equal('alice@example.com');
      });
      it('should find one by id with and operator', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(1, {
          where: {
            and: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        });
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find one soft deleted entry by id with and operator', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(3, {
          where: {
            and: [
              {
                email: 'alice@example.com',
              },
              {
                id: 3,
              },
            ],
          },
        });
        expect(customer).to.have.property('email').equal('alice@example.com');
      });

      it('should find one by id with or operator', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(1, {
          where: {
            or: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        });
        expect(customer).to.have.property('email').equal('john@example.com');
      });

      it('should find one soft deleted entry by id with or operator', async () => {
        const customer = await repo.findByIdIncludeSoftDelete(3, {
          where: {
            or: [
              {
                email: 'alice@example.com',
              },
              {
                id: 3,
              },
            ],
          },
        });
        expect(customer).to.have.property('email').equal('alice@example.com');
      });
    });

    describe('update', () => {
      beforeEach(async () => {
        await repo.create({id: 1, email: 'john@example.com'});
        await repo.create({id: 2, email: 'mary@example.com'});
        await repo.create({id: 3, email: 'alice@example.com'});
        await repo.create({id: 4, email: 'bob@example.com'});
        await repo.deleteById(3);
      });
      afterEach(async () => {
        await repo.deleteAllHard();
      });
      it('should update non soft deleted entries', async () => {
        const customers = await repo.updateAll(
          {
            email: 'johnupdated@example',
          },
          {
            id: 1,
          },
        );
        expect(customers.count).to.eql(1);
      });
      it('should update non soft deleted entries with and operator', async () => {
        const customers = await repo.updateAll(
          {
            email: 'johnupdated@example',
          },
          {
            and: [
              {
                email: 'john@example.com',
              },
              {
                id: 1,
              },
            ],
          },
        );
        expect(customers.count).to.eql(1);
        const deletedCustomers = await repo.updateAll(
          {
            email: 'aliceupdated@example',
          },
          {
            and: [
              {
                email: 'alice@example.com',
              },
              {
                id: 2,
              },
            ],
          },
        );
        expect(deletedCustomers.count).to.eql(0);
      });
      it('should update non soft deleted entries with or operator', async () => {
        const customers = await repo.updateAll(
          {
            email: 'updated@example.com',
          },
          {
            or: [
              {
                email: 'john@example.com',
              },
              {
                email: 'alice@example.com',
              },
            ],
          },
        );
        expect(customers.count).to.eql(1);
      });
    });

    describe('count', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should return count for non soft deleted entries', async () => {
        const count = await repo.count({
          email: 'john@example.com',
        });
        expect(count.count).to.be.equal(1);
      });
      it('should return zero count for soft deleted entries', async () => {
        const count = await repo.count({
          email: 'alice@example.com',
        });
        expect(count.count).to.be.equal(0);
      });
      it('should return count for non soft deleted entries with and operator', async () => {
        const count = await repo.count({
          and: [
            {
              email: 'john@example.com',
            },
            {
              id: 1,
            },
          ],
        });
        expect(count.count).to.be.equal(1);
      });
      it('should return zero count for soft deleted entries with and operator', async () => {
        const count = await repo.count({
          and: [
            {
              email: 'alice@example.com',
            },
            {
              id: 3,
            },
          ],
        });
        expect(count.count).to.be.equal(0);
      });
      it('should return count for non soft deleted entries with or operator', async () => {
        const count = await repo.count({
          or: [{email: 'john@example.com'}, {id: 1}],
        });
        expect(count.count).to.be.equal(1);
      });
      it('should return zero for soft deleted entries with or operator', async () => {
        const count = await repo.count({
          or: [{email: 'alice@example.com'}, {id: 3}],
        });
        expect(count.count).to.be.equal(0);
      });
    });

    describe('delete', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should soft delete entries', async () => {
        const entity = await repo.findById(1);
        await repo.delete(entity);
        try {
          await repo.findById(1);
          fail();
        } catch (e) {
          expect(e.errorCode).to.be.equal('entity_not_found');
        }
        const afterDeleteIncludeSoftDeleted = await repo.findByIdIncludeSoftDelete(1);
        expect(afterDeleteIncludeSoftDeleted).to.have.property('email').equal('john@example.com');
      });
    });

    describe('deleteAll', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should soft delete all entries', async () => {
        await repo.deleteAll();
        const customers = await repo.find();
        expect(customers).to.have.length(0);
        const afterDeleteAll = await repo.findAll();
        expect(afterDeleteAll).to.have.length(4);
      });
    });

    describe('deleteHard', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should hard delete an entry', async () => {
        const customer = await repo.findById(1);
        await repo.deleteHard(customer);
        try {
          await repo.findByIdIncludeSoftDelete(1);
          fail('should not reach here');
        } catch (e) {
          expect(e.message).to.be.equal('Entity not found: Customer with id 1');
        }
      });
    });

    describe('deleteByIdHard', () => {
      beforeEach(setupTestData);
      afterEach(clearTestData);
      it('should hard delete an entry by id', async () => {
        await repo.deleteByIdHard(1);
        try {
          await repo.findByIdIncludeSoftDelete(1);
          fail('should not reach here');
        } catch (e) {
          expect(e.message).to.be.equal('Entity not found: Customer with id 1');
        }
      });
    });

    async function setupTestData() {
      await repo.create({id: 1, email: 'john@example.com'});
      await repo.create({id: 2, email: 'mary@example.com'});
      await repo.create({id: 3, email: 'alice@example.com'});
      await repo.create({id: 4, email: 'bob@example.com'});
      await repo.deleteById(3);
    }

    async function clearTestData() {
      await repo.deleteAllHard();
    }
  });
}
