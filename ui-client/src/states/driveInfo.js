import { writable } from "svelte/store";
export const currentItems = writable({});
export const currentPath = writable({});
export const currentSelectedItem = writable({});
export const currentSelectedMenu = writable("");
export const uploadState = writable([]);
