import {Context} from '@loopback/core';
import {DefaultCrudRepository, Entity, juggler, ModelDefinition, Repository} from '@loopback/repository';
import {DefaultQuery, Query} from '../../../query';
import {query} from '../../../decorators/query.decorator';
import {getRepoFromQuery} from '../../support';

class MyController {
  @query('noteRepo')
  noteQuery2: Query<Entity>;

  constructor(@query('noteRepo') public noteQuery: Query<Entity>) {}
}

describe('query decorator', function () {
  let ctx: Context;
  let defaultRepo: Repository<Note>;
  let noteRepo: NoteRepository;
  let ds: juggler.DataSource;

  class Note extends Entity {
    static definition = new ModelDefinition({
      name: 'note',
      properties: {
        title: 'string',
        content: 'string',
        id: {type: 'number', id: true},
      },
    });
  }

  class NoteRepository extends DefaultCrudRepository<Note, number> {
    constructor(dataSource: juggler.DataSource) {
      super(Note, dataSource);
    }
  }

  beforeAll(function () {
    ds = new juggler.DataSource({
      name: 'db',
      connector: 'sqlite3',
      file: ':memory:',
    });

    defaultRepo = new DefaultCrudRepository(Note, ds);
    noteRepo = new NoteRepository(ds);
    ctx = new Context();
    ctx.bind('models.Note').to(Note);
    ctx.bind('datasources.memory').to(ds);
    ctx.bind('repositories.noteRepo').to(defaultRepo);
    ctx.bind(`repositories.${NoteRepository.name}`).to(noteRepo);
    ctx.bind('controllers.MyController').toClass(MyController);
  });

  it('supports referencing predefined repository by name via constructor', async () => {
    const myController = await ctx.get<MyController>('controllers.MyController');
    expect(getRepoFromQuery(myController.noteQuery)).toBe(defaultRepo);
  });

  it('supports referencing predefined repository by name via property', async () => {
    const myController = await ctx.get<MyController>('controllers.MyController');
    expect(getRepoFromQuery(myController.noteQuery2)).toBe(defaultRepo);
  });

  it('throws not implemented for class-level @repository', () => {
    expect(() => {
      @query('noteRepo')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Controller1 {}
    }).toThrow(/not implemented/);
  });

  it('supports @query(model, dataSource) by names', async () => {
    class Controller2 {
      constructor(@query('Note', 'memory') public query: Query<Note>) {}
    }
    ctx.bind('controllers.Controller2').toClass(Controller2);

    const myController = await ctx.get<Controller2>('controllers.Controller2');
    expect(myController.query).toBeTruthy();
  });

  it('supports @query(model, dataSource)', async () => {
    class Controller3 {
      constructor(@query(Note, ds) public query: Query<Note>) {}
    }
    ctx.bind('controllers.Controller3').toClass(Controller3);
    const myController = await ctx.get<Controller3>('controllers.Controller3');
    const q = myController.query;
    expect(q).toBeInstanceOf(DefaultQuery);
    expect((q as DefaultQuery<Note>).dataSource).toBe(ds);
  });

  it('rejects @query("")', async () => {
    class Controller4 {
      constructor(@query('') public query: Query<Note>) {}
    }
    ctx.bind('controllers.Controller4').toClass(Controller4);

    await expect(ctx.get('controllers.Controller4')).rejects.toThrow(/invalid query/i);
  });
});
