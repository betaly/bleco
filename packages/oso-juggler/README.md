# @bleco/oso-juggler

> An [oso](https://www.osohq.com/) [data filtering adapter](https://docs.osohq.com/guides/data_filtering.html) for
> [loopback juggler orm](https://loopback.io/doc/en/lb4/Model.html)

## Usage

Define a repository factory for `JugglerAdapter`. for example:

```ts
import {Context} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository, EntityClass} from '@bleco/query';
import {RepositoryFactory} from '@bleco/oso-juggler';

function repositoryFactory<T extends Entity = Entity>(context: Context, dsName: string): RepositoryFactory<T> {
  return async modelName => {
    const ds = await context.get<juggler.DataSource>(`datasources.${dsName}`);
    const entityClass = await context.get<EntityClass<T>>(`models.${modelName}`);
    return new QueryEnhancedCrudRepository(entityClass, ds);
  };
}
```

Create juggler adapter with the factory:

```ts
import {JugglerAdapter} from '@bleco/oso-juggler';

const adapter = new JugglerAdapter(repositoryFactory(context, 'db'));

const oso = new Oso();
oso.setDataFilteringAdapter(adapter);
```
