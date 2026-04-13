import { apiRequest } from './client'

export function getUserById(id) {
  return apiRequest(`/users/${id}`)
}

export function updateUserById(id, payload) {
  return apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

