import { apiRequest } from './client'

export function getListings() {
  return apiRequest('/listings')
}

export function getListingById(id) {
  return apiRequest(`/listings/${id}`)
}

export function createListing(payload) {
  return apiRequest('/listings', {
    method: 'POST',
    body: payload,
  })
}

export function deleteListing(id) {
  return apiRequest(`/listings/${id}`, {
    method: 'DELETE',
  })
}