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
      const dataObject = data as object;
      const errStr = 'message' in dataObject ? (dataObject.message as string) :
                     'detail' in dataObject ? (dataObject.detail as string) : 
                      JSON.stringify(data);
      return { response: null, error: new Error(errStr, { cause: res.status }) };
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
export const del = async <T>(url: string) => await fetchFromApi<T>({ url, method: 'DELETE' });
