import {DefaultCrudRepository, Entity, EntityCrudRepository, belongsTo, juggler, property} from '@loopback/repository';

import {entity} from '../../decorators';

describe('@entity decorator', function () {
  let ds: juggler.DataSource;
  let tenantRepo: EntityCrudRepository<Tenant, typeof Tenant.prototype.id>;
  let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id, OrderRelations>;
  let fooOrderRepo: EntityCrudRepository<FooOrder, typeof FooOrder.prototype.id, FooOrderRelations>;

  beforeAll(givenCrudRepository);

  it('should support inheritance relations', function () {
    expect(Order.definition.relations.tenant.source).toBe(Order);
    expect(FooOrder.definition.relations.tenant.source).toBe(FooOrder);
  });

  it('should work with inheritance', async () => {
    const tenant = await tenantRepo.create({name: 'Tenant 1'});
    await orderRepo.create({name: 'Order 1', tenantId: tenant.id});

    const [order] = await orderRepo.find({where: {name: 'Order 1'}});
    expect(order.tenantId).toEqual(tenant.id);
  });

  it('should work with deep inheritance', async () => {
    const tenant = await tenantRepo.create({name: 'Tenant 1'});
    await fooOrderRepo.create({name: 'Order 1', tenantId: tenant.id});

    const [order] = await fooOrderRepo.find({where: {name: 'Order 1'}});
    expect(order.tenantId).toEqual(tenant.id);
  });

  function givenCrudRepository() {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
    tenantRepo = new DefaultCrudRepository(Tenant, ds);
    orderRepo = new DefaultCrudRepository<Order, typeof Order.prototype.id, OrderRelations>(Order, ds);
    fooOrderRepo = new DefaultCrudRepository<FooOrder, typeof FooOrder.prototype.id, FooOrderRelations>(FooOrder, ds);
  }
});

// --- HELPERS --- //

@entity()
class Tenant extends Entity {
  @property({type: 'number', id: true})
  id: number;

  @property()
  name: string;
}

class TenantScope extends Entity {
  @belongsTo(() => Tenant)
  tenantId: number;
}

@entity()
class Order extends TenantScope {
  @property({type: 'number', id: true})
  id: number;

  @property()
  name: string;
}

interface OrderRelations {
  tenant: Tenant;
}

@entity()
class FooOrder extends Order {}

interface FooOrderRelations {
  tenant: Tenant;
}
