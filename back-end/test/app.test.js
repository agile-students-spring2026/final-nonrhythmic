const { expect } = require('chai')
const request = require('supertest')
const mongoose = require('mongoose')
require('dotenv').config()

const app = require('../app')
const Application = require('../models/Application')
const ContactRequest = require('../models/ContactRequest')
const Listing = require('../models/Listing')
const Notification = require('../models/Notification')
const SavedListing = require('../models/SavedListing')
const User = require('../models/User')

describe('Back-end API', () => {
  const uniqueSuffix = Date.now()
  const userEmail = `student-${uniqueSuffix}@example.com`
  let createdUserId = null
  let createdListingId = null
  let createdApplicationId = null
  let createdContactRequestId = null
  let authToken = null

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI)
    }
    await app.ensureSeedData()
  })

  after(async () => {
    if (createdContactRequestId !== null) {
      await ContactRequest.deleteOne({ id: createdContactRequestId })
    }

    if (createdApplicationId !== null) {
      await Application.deleteOne({ id: createdApplicationId })
    }

    if (createdListingId !== null) {
      await SavedListing.deleteMany({ listingId: createdListingId })
      await Listing.deleteOne({ id: createdListingId })
    }

    if (createdUserId !== null) {
      await SavedListing.deleteMany({ userId: createdUserId })
      await Notification.deleteMany({
        $or: [{ recipientUserId: createdUserId }, { fromUserId: createdUserId }],
      })
      await User.deleteOne({ id: createdUserId })
    }

    await mongoose.connection.close()
  })

  it('returns health status from /health', async () => {
    const res = await request(app).get('/health')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ ok: true })
  })

  it('rejects invalid registration payloads', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sprint Tester',
      email: 'not-an-email',
      password: 'safe-password-123',
    })

    expect(res.status).to.equal(400)
    expect(res.body.error).to.equal('email must be valid')
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
    expect(res.body).to.have.property('token')
    createdUserId = res.body.user.id
    authToken = res.body.token
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
    expect(res.body).to.have.property('token')
    authToken = res.body.token
  })

  it('requires auth for /api/listings', async () => {
    const res = await request(app).get('/api/listings')
    expect(res.status).to.equal(401)
    expect(res.body.error).to.equal('Authorization token is required')
  })

  it('returns listings from /api/listings when authenticated', async () => {
    const res = await request(app).get('/api/listings').set('Authorization', `Bearer ${authToken}`)
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
    expect(res.body.length).to.be.greaterThan(0)
  })

  it('returns 404 for unknown listing id', async () => {
    const res = await request(app)
      .get('/api/listings/999999')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).to.equal(404)
    expect(res.body.error).to.equal('Listing not found')
  })

  it('rejects invalid listing payloads before touching the database', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        location: 'Manhattan',
        price: '$1200/mo',
      })

    expect(res.status).to.equal(400)
    expect(res.body.error).to.equal('name is required')
  })

  it('creates a listing with POST /api/listings', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
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

  it('rejects protected requests without a token', async () => {
    const res = await request(app).post('/api/applications').send({
      listingId: createdListingId,
      userId: createdUserId,
    })

    expect(res.status).to.equal(401)
    expect(res.body.error).to.equal('Authorization token is required')
  })

  it('rejects protected requests for another user', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        listingId: createdListingId,
        userId: 'someone-else',
      })

    expect(res.status).to.equal(403)
    expect(res.body.error).to.equal('Forbidden for this user')
  })

  it('creates and persists a saved listing', async () => {
    const saveRes = await request(app)
      .post(`/api/users/${createdUserId}/saved-listings`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ listingId: createdListingId })

    expect(saveRes.status).to.equal(201)
    expect(saveRes.body).to.deep.equal({ ok: true })

    const savedDoc = await SavedListing.findOne({ userId: createdUserId, listingId: createdListingId }).lean()
    expect(savedDoc).to.not.equal(null)

    const getRes = await request(app)
      .get(`/api/users/${createdUserId}/saved-listings`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(getRes.status).to.equal(200)
    expect(getRes.body).to.be.an('array')
    expect(getRes.body.some((listing) => listing.id === createdListingId)).to.equal(true)
  })

  it('treats duplicate saves as idempotent', async () => {
    const res = await request(app)
      .post(`/api/users/${createdUserId}/saved-listings`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ listingId: createdListingId })

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ ok: true, message: 'Already saved' })
  })

  it('removes a saved listing from MongoDB', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}/saved-listings/${createdListingId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({ ok: true })

    const savedDoc = await SavedListing.findOne({ userId: createdUserId, listingId: createdListingId }).lean()
    expect(savedDoc).to.equal(null)
  })

  it('returns 404 when removing an unknown saved listing', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}/saved-listings/${createdListingId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).to.equal(404)
    expect(res.body.error).to.equal('Saved listing not found')
  })

  it('creates an application with /api/applications', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        listingId: createdListingId,
        userId: createdUserId,
      })

    expect(res.status).to.equal(201)
    expect(res.body.ok).to.equal(true)
    expect(res.body.application.listingId).to.equal(createdListingId)
    expect(res.body.application.userId).to.equal(createdUserId)
    createdApplicationId = res.body.application.id
  })

  it('rejects a duplicate application to the same listing', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        listingId: createdListingId,
        userId: createdUserId,
      })

    expect(res.status).to.equal(409)
    expect(res.body.error).to.equal('You have already applied to this listing')
  })

  it('creates and persists a contact request to a listing', async () => {
    const res = await request(app)
      .post('/api/contact-requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        targetType: 'listing',
        targetId: String(createdListingId),
        userId: createdUserId,
      })

    expect(res.status).to.equal(201)
    expect(res.body.ok).to.equal(true)
    expect(res.body.contactRequest.targetType).to.equal('listing')
    createdContactRequestId = res.body.contactRequest.id

    const contactDoc = await ContactRequest.findOne({ id: createdContactRequestId }).lean()
    expect(contactDoc).to.not.equal(null)
    expect(contactDoc.targetType).to.equal('listing')
  })

  it('updates a profile with PATCH /api/users/:id', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Sprint Tester',
        bio: 'Looking for summer housing',
        avatarSeed: `avatar-${uniqueSuffix}`,
      })

    expect(res.status).to.equal(200)
    expect(res.body.name).to.equal('Updated Sprint Tester')
    expect(res.body.bio).to.equal('Looking for summer housing')
  })
})
