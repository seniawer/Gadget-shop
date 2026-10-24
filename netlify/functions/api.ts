import { route } from '../../server/router'

export default (request: Request) => route(request)

export const config = { path: '/api/*' }
