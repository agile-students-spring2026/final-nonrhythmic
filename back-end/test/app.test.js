const { expect } = require('chai')
const request = require('supertest')
const app = require('../app')

describe('Express app', () => {
  describe('health', () => {
    it('GET /api/health responds with ok', async () => {
      const res = await request(app).get('/api/health').expect(200)
      expect(res.body).to.deep.equal({ ok: true })
    })
  })

  describe('/api/listings', () => {
    it('GET returns an array of listings', async () => {
      const res = await request(app).get('/api/listings').expect(200)
      expect(res.body).to.be.an('array').that.has.length.at.least(40)
      expect(res.body[0]).to.include.keys('id', 'name', 'location', 'price')
    })

    it('GET by id returns one listing', async () => {
      const res = await request(app).get('/api/listings/1').expect(200)
      expect(res.body.id).to.equal(1)
    })

    it('GET by id returns 400 for invalid id', async () => {
      await request(app).get('/api/listings/nope').expect(400)
    })

    it('GET by id returns 404 for missing listing', async () => {
      await request(app).get('/api/listings/999999999').expect(404)
    })

    it('POST returns 400 when required fields missing', async () => {
      const res = await request(app).post('/api/listings').send({ name: 'x' }).expect(400)
      expect(res.body.error).to.be.a('string')
    })

    it('POST creates a listing', async () => {
      const payload = {
        name: 'Mocha test listing',
        location: 'Queens',
        price: '$888/mo',
        rating: 4.11,
        description: 'Test description',
        owner: 'test-owner',
      }
      const res = await request(app).post('/api/listings').send(payload).expect(201)
      expect(res.body.name).to.equal(payload.name)
      expect(res.body.rentUsd).to.equal(888)
      expect(res.body.mapQuery).to.equal('Queens, New York, NY')
    })
  })

  describe('/api/tenants', () => {
    it('GET returns tenants array', async () => {
      const res = await request(app).get('/api/tenants').expect(200)
      expect(res.body).to.be.an('array').that.is.not.empty
    })
  })

  describe('auth stubs', () => {
    it('POST /api/auth/login returns ok', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@b.com' })
        .expect(200)
      expect(res.body.ok).to.equal(true)
    })

    it('POST /api/auth/register returns 201', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' }).expect(201)
      expect(res.body.ok).to.equal(true)
    })
  })

  describe('static files', () => {
    it('serves public/static.txt', async () => {
      const res = await request(app).get('/static.txt').expect(200)
      expect(res.text).to.include('SubVet')
    })
  })

  describe('not found', () => {
    it('returns JSON 404 for unknown API path', async () => {
      const res = await request(app).get('/api/does-not-exist').expect(404)
      expect(res.body.error).to.equal('Not Found')
    })
  })
})
