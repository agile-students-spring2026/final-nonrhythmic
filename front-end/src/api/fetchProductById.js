import { getListingById } from './listings'

export async function fetchProductById(id) {
  const num = Number(id)
  if (!Number.isFinite(num)) return null

  try {
    return await getListingById(num)
  } catch {
    return null
  }
}
