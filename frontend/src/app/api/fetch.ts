"use server";

import { revalidateTag } from 'next/cache';
import { RequestInit } from 'next/dist/server/web/spec-extension/request';

export type RESTMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export type FetchArgs = {
  url: string;
  method: RESTMethod;
  body?: unknown;
  tags?: string[];
};

// has to be server function
export const customRevalidateTag = async (tag: string) => revalidateTag(tag);

// fetch from open endpoints with custom headers
async function fetchFromApi<T>({ url, method, body, tags }: FetchArgs) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (method === 'POST' || method === 'PATCH') {
      options.body = JSON.stringify(body || {});
    }
    if (!url.endsWith('/')) url += '/';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      next: { tags },
      ...options,
    });
    const data: T = await res.json();
    if (!res.ok) {
      return { response: null, error: new Error(parseError(data as object), { cause: res.status }) };
    }
    return { response: data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(err as string);
    if (error.message.includes('Unexpected token')) {
      return { response: null, error: new Error('Response is not JSON serializable') };
    }
    return { response: null, error };
  }
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