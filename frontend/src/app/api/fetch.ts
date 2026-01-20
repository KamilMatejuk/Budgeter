"use server";

import { revalidateTag } from 'next/cache';
import { RequestInit } from 'next/dist/server/web/spec-extension/request';

type RESTMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type FetchArgs = {
  url: string;
  method: RESTMethod;
  body?: unknown;
  tags?: string[];
};

// has to be server function
export const customRevalidateTag = async (tag: string) => revalidateTag(tag);

// fetch from open endpoints with custom headers
async function fetchFromApi<T>({ url, method, body, tags }: FetchArgs) {
  const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (method === 'POST' || method === 'PATCH') { options.body = JSON.stringify(body || {}) }
  if (url.endsWith('/')) url = url.slice(0, -1);

  let res: Response | null = null;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, { next: { tags }, ...options });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err as string);
    console.error('FetchError: fetch() failed:', { url, status: res?.status });
    return { response: null, error };
  }

  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err as string);
    console.error('FetchError: response is not JSON serializable:', { url, status: res?.status, body: text.slice(0, 500) });
    return { response: null, error };
  }

  if (!res.ok) {
    const error = new Error(parseError(data as object));
    console.error('FetchError: response not ok:', { url, status: res.status, body: text.slice(0, 500), error });
    return { response: null, error };
  }

  return { response: data as T, error: null };
}

// GET / POST wrappers on fetchFromApi
export const get = async <T>(url: string, tags?: string[]) => await fetchFromApi<T>({ url, method: 'GET', tags });
export const post = async <T>(url: string, body: unknown) => await fetchFromApi<T>({ url, method: 'POST', body });
export const patch = async <T>(url: string, body: unknown) => await fetchFromApi<T>({ url, method: 'PATCH', body });
export const del = async (url: string) => await fetchFromApi({ url, method: 'DELETE' });


function parseError(data: object) {
  if ('message' in data) return data.message as string;
  if ('detail' in data) {
    const detail = data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(d => `${d.type} ${d.loc.join('/')}`).join(', ');
    }
  };
  return JSON.stringify(data);
}