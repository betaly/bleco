import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Note} from '../models/note.model';
import {inject} from '@loopback/context';

export class NoteRepository extends DefaultCrudRepository<Note, typeof Note.prototype.id> {
  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
  ) {
    super(Note, dataSource);
  }
}
