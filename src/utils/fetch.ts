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

/** 默认的时间偏移量 */
export const defaultTimeOffset = 60 * 90 * 1000

export function getTimeStamp(offset: number = defaultTimeOffset) {
  return Date.now() - offset
}

export function getCourseIdByURL() {
  const matchRes = location.href.match(/courseId=(\d+)/)
  const id = matchRes && matchRes[1]
  if (!id) throw new Error('Missing courseId')
  return id
}