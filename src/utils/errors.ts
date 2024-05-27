export class MissingUserError extends Error {
  constructor() {
    super('Fields need an owner to be queried, created or or updated');
  }
}
