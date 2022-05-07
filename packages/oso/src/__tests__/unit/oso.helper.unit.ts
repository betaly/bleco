import {belongsTo, Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {resolveClassFields} from '../../helper';

describe('oso.helper', function () {
  describe('#resolveClassFields', function () {
    it('should resolve properties', function () {
      @model()
      class Note extends Entity {
        @property()
        title: string;

        @property()
        pages: number;

        @property()
        isCool: boolean;

        @property()
        lastModified: Date;
      }

      const fields = resolveClassFields(Note);
      expect(fields).toHaveProperty('title', String);
      expect(fields).toHaveProperty('pages', Number);
      expect(fields).toHaveProperty('isCool', Boolean);
      expect(fields).toHaveProperty('lastModified', Date);
    });

    it('should resolve belongsTo relation', function () {
      @model()
      class Folder extends Entity {
        @property({
          id: true,
        })
        id: number;
      }

      @model()
      class Note extends Entity {
        @belongsTo(() => Folder)
        folderId: number;
      }

      const fields = resolveClassFields(Note);
      expect(fields).toHaveProperty('folder', {
        kind: 'one',
        myField: 'folderId',
        otherField: 'id',
        otherType: 'Folder',
      });
    });

    it('should resolve hasOne relation', function () {
      @model()
      class Note extends Entity {
        @property()
        folderId: number;
      }

      @model()
      class Folder extends Entity {
        @property({
          id: true,
        })
        id: number;

        @hasOne(() => Note)
        note: Note;
      }

      const fields = resolveClassFields(Folder);
      expect(fields).toHaveProperty('note', {
        kind: 'one',
        myField: 'id',
        otherField: 'folderId',
        otherType: 'Note',
      });
    });

    it('should resolve hasMany relation', function () {
      @model()
      class Note extends Entity {
        @property()
        folderId: number;
      }

      @model()
      class Folder extends Entity {
        @property({
          id: true,
        })
        id: number;

        @hasMany(() => Note)
        notes: Note[];
      }

      const fields = resolveClassFields(Folder);
      expect(fields).toHaveProperty('notes', {
        kind: 'many',
        myField: 'id',
        otherField: 'folderId',
        otherType: 'Note',
      });
    });

    it('should skip hasManyThough relation', function () {
      @model()
      class NoteTag extends Entity {
        @property()
        noteId: number;

        @property()
        tagId: number;
      }

      @model()
      class Note extends Entity {
        @property({
          id: true,
        })
        id: number;

        @hasMany(() => Tag, {through: {model: () => NoteTag}})
        tags: Tag[];
      }

      @model()
      class Tag extends Entity {
        @property({
          id: true,
        })
        id: number;

        @hasMany(() => Note, {through: {model: () => NoteTag}})
        notes: Note[];
      }

      let fields = resolveClassFields(Tag);
      expect(fields).not.toHaveProperty('notes');
      fields = resolveClassFields(Note);
      expect(fields).not.toHaveProperty('tags');
    });
  });
});
