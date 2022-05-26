import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Product, ProductRelations} from '../models/product.model';
import {inject} from '@loopback/context';

export class ProductRepository extends DefaultCrudRepository<Product, typeof Product.prototype.id, ProductRelations> {
  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
  ) {
    super(Product, dataSource);
  }
}
