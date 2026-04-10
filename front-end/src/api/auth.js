import { apiRequest } from './client'

export function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

