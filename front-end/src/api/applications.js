import { apiRequest } from './client'

export function getUserApplications(userId) {
  return apiRequest(`/users/${userId}/applications`)
}
