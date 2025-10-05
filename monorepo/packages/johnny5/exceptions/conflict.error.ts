export class ConflictError extends Error {
  public readonly code: number = 409

  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}
