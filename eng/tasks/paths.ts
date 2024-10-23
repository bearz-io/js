import { dirname, fromFileUrl, join } from "jsr:@std/path";

const __dirname = dirname(fromFileUrl(import.meta.url));
export const tasksDir = join(__dirname);
export const engDir = join(__dirname, "..");
export const projectRoot = join(__dirname, "..", "..");
