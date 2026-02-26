// Copyright (c) 2026 Nexara DMCC. All rights reserved.

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  svg: 'image/svg+xml', ico: 'image/x-icon', bmp: 'image/bmp', tiff: 'image/tiff',
  mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo', mov: 'video/quicktime', mkv: 'video/x-matroska',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', aac: 'audio/aac', m4a: 'audio/mp4',
  pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip', tar: 'application/x-tar', gz: 'application/gzip', rar: 'application/x-rar-compressed',
  json: 'application/json', xml: 'application/xml', csv: 'text/csv', txt: 'text/plain',
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'application/javascript', ts: 'application/typescript',
  md: 'text/markdown', yaml: 'application/x-yaml', yml: 'application/x-yaml',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
};
const MIME_TO_EXT: Record<string, string> = Object.fromEntries(Object.entries(EXT_TO_MIME).map(([k,v])=>[v,k]));

export function fromExtension(ext: string): string | null { return EXT_TO_MIME[ext.toLowerCase().replace('.','')]??null; }
export function fromMime(mime: string): string | null { return MIME_TO_EXT[mime.toLowerCase()]??null; }
export function isImage(mime: string): boolean { return mime.startsWith('image/'); }
export function isVideo(mime: string): boolean { return mime.startsWith('video/'); }
export function isAudio(mime: string): boolean { return mime.startsWith('audio/'); }
export function isText(mime: string): boolean { return mime.startsWith('text/'); }
export function isDocument(mime: string): boolean {
  return ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mime);
}
export function isArchive(mime: string): boolean {
  return ['application/zip','application/x-tar','application/gzip','application/x-rar-compressed'].includes(mime);
}
export function getCategory(mime: string): string {
  if (isImage(mime)) return 'image';
  if (isVideo(mime)) return 'video';
  if (isAudio(mime)) return 'audio';
  if (isDocument(mime)) return 'document';
  if (isArchive(mime)) return 'archive';
  if (isText(mime)) return 'text';
  return 'other';
}
export function normalize(mime: string): string { return mime.toLowerCase().split(';')[0].trim(); }
export function charset(mime: string): string | null { const m = mime.match(/charset=([\w-]+)/i); return m ? m[1] : null; }
export function allExtensions(): string[] { return Object.keys(EXT_TO_MIME); }
export function allMimeTypes(): string[] { return [...new Set(Object.values(EXT_TO_MIME))]; }
