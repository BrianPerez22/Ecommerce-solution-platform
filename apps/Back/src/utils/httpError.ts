/** Error con un código HTTP asociado, para que el manejador global responda `{ message }`. */
export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export const notFound = (entity: string) => new HttpError(404, `${entity} no encontrado.`)
