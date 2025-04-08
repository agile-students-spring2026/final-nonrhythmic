import { apiUrl } from '../apiBase'

// import { normalizeProduct } from '../listings/normalizeProduct'

// export async function fetchProductById(id) {
//   const num = Number(id)
//   if (!Number.isFinite(num)) return null
//   const r = await fetch(`https://dummyjson.com/products/${num}`)
//   if (!r.ok) return null
//   const p = await r.json()
//   return normalizeProduct(p)
// }

export async function fetchProductById(id) {
  const num = Number(id)
  if (!Number.isFinite(num)) return null

  const res = await fetch(apiUrl(`/api/listings/${num}`))
  if (!res.ok) return null

  return await res.json()
}
