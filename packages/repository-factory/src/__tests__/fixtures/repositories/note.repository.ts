import {inject} from '@loopback/context';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Note} from '../models/note.model';

export class NoteRepository extends DefaultCrudRepository<Note, typeof Note.prototype.id> {
  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
  ) {
    super(Note, dataSource);
  }
}
