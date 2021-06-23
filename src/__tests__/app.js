const app = require('../app')
const request = require('supertest')

describe('Test basic endpoints', () => {
  // GET /servers/<UID> -> 200 | 404 | 5XX
  test('GET /servers/<UID>', async () => {
    await request(app).get('/servers/<UID>')
      .expect(200)
  })

  // GET /servers/<UID>/users 200 | 403 | 404
  test('GET /servers/<UID>/users', async () => {
    await request(app).get('/servers/<UID>/users')
      .expect(200)
  })

  // GET /servers/<UID>/users/<UID> 200 | 403 | 404
  test('GET /servers/<UID>/users/<UID>', async () => {
    await request(app).get('/servers/<UID>/users/<UID>')
      .expect(200)
  })

  // POST /servers/<UID>/users/<UID>/mute 200 | 403 | 404
  test('POST /servers/<UID>/users/<UID>/<COMMAND>', async () => {
    await request(app).post('/servers/<UID>/users/<UID>/<COMMAND>')
      .expect(200)
  })
})
