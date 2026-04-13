const { expect } = require('chai')
const request = require('supertest')
const app = require('../app')

describe('Back-end API', () => {
  const uniqueSuffix = Date.now()
  const userEmail = `student-${uniqueSuffix}@example.com`
  let createdUserId = null
  let createdListingId = null

  it('returns health status from /health', async () => {
    const res = await request(app).get('/health')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ ok: true })
  })

  it('returns listings from /api/listings', async () => {
    const res = await request(app).get('/api/listings')
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.be.greaterThan(0)
  })

  it('returns 404 for unknown listing id', async () => {
    const res = await request(app).get('/api/listings/999999')
    expect(res.status).to.equal(404)
    expect(res.body.error).to.equal('Listing not found')
  })

  it('creates a listing with POST /api/listings', async () => {
    const res = await request(app).post('/api/listings').send({
      name: 'Test Listing',
      location: 'Manhattan',
      price: '$1200/mo',
      rating: 4.8,
      description: 'Sunny room near subway',
    })

    expect(res.status).to.equal(201)
    expect(res.body).to.include({
      name: 'Test Listing',
      location: 'Manhattan',
      price: '$1200/mo',
    })
    expect(res.body.id).to.be.a('number')
    createdListingId = res.body.id
  })

  it('registers a new user with /api/auth/register', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sprint Tester',
      email: userEmail,
      password: 'safe-password-123',
    })

    expect(res.status).to.equal(201)
    expect(res.body.ok).to.equal(true)
    expect(res.body.user.email).to.equal(userEmail)
    expect(res.body.user).to.have.property('id')
    createdUserId = res.body.user.id
  })

  it('rejects duplicate user registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sprint Tester',
      email: userEmail,
      password: 'safe-password-123',
    })

    expect(res.status).to.equal(409)
    expect(res.body.error).to.equal('An account with this email already exists')
  })

  it('logs in an existing user with /api/auth/login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userEmail,
      password: 'safe-password-123',
    })

    expect(res.status).to.equal(200)
    expect(res.body.ok).to.equal(true)
    expect(res.body.user.email).to.equal(userEmail)
  })

  it('creates an application with /api/applications', async () => {
    const res = await request(app).post('/api/applications').send({
      listingId: createdListingId,
      userId: createdUserId,
    })

    expect(res.status).to.equal(201)
    expect(res.body.ok).to.equal(true)
    expect(res.body.application.listingId).to.equal(createdListingId)
    expect(res.body.application.userId).to.equal(createdUserId)
  })

  it('creates a contact request to a listing', async () => {
    const res = await request(app).post('/api/contact-requests').send({
      targetType: 'listing',
      targetId: String(createdListingId),
      userId: createdUserId,
    })

    expect(res.status).to.equal(201)
    expect(res.body.ok).to.equal(true)
    expect(res.body.contactRequest.targetType).to.equal('listing')
  })

  it('updates a profile with PATCH /api/users/:id', async () => {
    const res = await request(app).patch(`/api/users/${createdUserId}`).send({
      name: 'Updated Sprint Tester',
      bio: 'Looking for summer housing',
      avatarSeed: `avatar-${uniqueSuffix}`,
    })

    expect(res.status).to.equal(200)
    expect(res.body.name).to.equal('Updated Sprint Tester')
    expect(res.body.bio).to.equal('Looking for summer housing')
  })
})
