import { apiRequest } from './client'

export function submitApplication(payload) {
  return apiRequest('/applications', {
    method: 'POST',
    body: payload,
  })
}

export function createContactRequest(payload) {
  return apiRequest('/contact-requests', {
    method: 'POST',
    body: payload,
  })
}

