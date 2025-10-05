export const setJsonContentHeader = (request: Request) =>
  request.headers.set('Content-Type', 'application/json')
