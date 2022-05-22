export class Repository<T extends object, ID> {
  find(): T[] {
    throw new Error('Method not implemented.');
  }

  findById(id: ID): T {
    throw new Error('Method not implemented.');
  }

  // ...
}
