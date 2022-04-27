import {Class, Entity, juggler, Model, Repository} from '@loopback/repository';

// /**
//  * Decorator for repository injections on properties or method arguments
//  *
//  * @example
//  * ```ts
//  * class CustomerController {
//  *   @repository(CustomerRepository) public custRepo: CustomerRepository;
//  *
//  *   constructor(
//  *     @repository(ProductRepository) public prodRepo: ProductRepository,
//  *   ) {}
//  *   // ...
//  * }
//  * ```
//  *
//  * @param repositoryName - Name of the repo
//  */
//  export function objectQuery(
//   repositoryName: string | Class<Repository<Model>>,
// ): ObjectQueryDecorator;

// /**
//  * Decorator for DefaultCrudRepository generation and injection on properties
//  * or method arguments based on the given model and dataSource (or their names)
//  *
//  * @example
//  * ```ts
//  * class CustomerController {
//  *   @repository('Customer', 'mySqlDataSource')
//  *   public custRepo: DefaultCrudRepository<
//  *     Customer,
//  *     typeof Customer.prototype.id
//  *   >;
//  *
//  *   constructor(
//  *     @repository(Product, mySqlDataSource)
//  *     public prodRepo: DefaultCrudRepository<
//  *       Product,
//  *       typeof Product.prototype.id
//  *     >,
//  *   ) {}
//  *   // ...
//  * }
//  * ```
//  *
//  * @param model - Name/class of the model
//  * @param dataSource - Name/instance of the dataSource
//  */
// export function objectQuery(
//   model: string | typeof Entity,
//   dataSource: string | juggler.DataSource,
// ): ObjectQueryDecorator;

export function objectQuery(
  modelOrRepo: string | Class<Repository<Model>> | typeof Entity,
  dataSource?: string | juggler.DataSource,
) {}
