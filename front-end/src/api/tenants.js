import { apiRequest } from './client'

export function getTenants() {
  return apiRequest('/tenants')
}

export function getTenantById(id) {
  return apiRequest(`/tenants/${id}`)
}

export function createTenant(payload) {
  return apiRequest('/tenants', {
    method: 'POST',
    body: payload,
  })
}

