import { apiRequest } from './client'

export function getNotifications(userId) {
  return apiRequest(`/users/${userId}/notifications`)
}

export function markNotificationRead(userId, notificationId) {
  return apiRequest(`/users/${userId}/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  })
}
