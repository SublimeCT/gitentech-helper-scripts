import { BaseResponse } from "../types/BaseResponse"

export async function toFetch<T = any>(url: string, options?: RequestInit) {
  const rawRes = await fetch(url, {
    headers: {
      token: getToken(),
    },
    method: 'GET',
    ...options,
  })
  const res = await rawRes.json() as BaseResponse<T>
  return res
}

export function getToken() {
  return JSON.parse(localStorage.getItem('token') || '').value
}

export function getTimeStamp(offset: number = 60 * 90 * 1000) {
  return Date.now() - offset
}

export function getCourseIdByURL() {
  const matchRes = location.href.match(/courseId=(\d+)/)
  const id = matchRes && matchRes[1]
  if (!id) throw new Error('Missing courseId')
  return id
}