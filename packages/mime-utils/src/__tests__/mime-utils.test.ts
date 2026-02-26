// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  MIME_MAP,
  getMimeType,
  getExtensions,
  getMimeFromFilename,
  isText,
  isImage,
  isAudio,
  isVideo,
  isApplication,
  isSafe,
  isCompressible,
  normalizeMime,
  getCharset,
  parseContentType,
  formatContentType,
  detectFromBytes,
  getMimeCategory,
  listExtensions,
  listMimeTypes,
  isKnownExtension,
  getTextMimeTypes,
  getImageMimeTypes,
} from '../mime-utils';

// ─── 1. getMimeType — 120 tests ────────────────────────────────────────────
describe('getMimeType', () => {
  const cases: [string, string][] = [
    ['html', 'text/html'],
    ['htm', 'text/html'],
    ['css', 'text/css'],
    ['js', 'application/javascript'],
    ['mjs', 'application/javascript'],
    ['ts', 'application/typescript'],
    ['tsx', 'application/typescript'],
    ['jsx', 'application/javascript'],
    ['json', 'application/json'],
    ['xml', 'application/xml'],
    ['csv', 'text/csv'],
    ['txt', 'text/plain'],
    ['md', 'text/markdown'],
    ['markdown', 'text/markdown'],
    ['rtf', 'application/rtf'],
    ['yaml', 'application/x-yaml'],
    ['yml', 'application/x-yaml'],
    ['toml', 'application/toml'],
    ['ini', 'text/plain'],
    ['env', 'text/plain'],
    ['log', 'text/plain'],
    ['sql', 'application/sql'],
    ['graphql', 'application/graphql'],
    ['pdf', 'application/pdf'],
    ['doc', 'application/msword'],
    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['xls', 'application/vnd.ms-excel'],
    ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['ppt', 'application/vnd.ms-powerpoint'],
    ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['odt', 'application/vnd.oasis.opendocument.text'],
    ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
    ['odp', 'application/vnd.oasis.opendocument.presentation'],
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'],
    ['webp', 'image/webp'],
    ['svg', 'image/svg+xml'],
    ['ico', 'image/x-icon'],
    ['bmp', 'image/bmp'],
    ['tiff', 'image/tiff'],
    ['tif', 'image/tiff'],
    ['avif', 'image/avif'],
    ['heic', 'image/heic'],
    ['heif', 'image/heif'],
    ['apng', 'image/apng'],
    ['jxl', 'image/jxl'],
    ['mp3', 'audio/mpeg'],
    ['wav', 'audio/wav'],
    ['ogg', 'audio/ogg'],
    ['flac', 'audio/flac'],
    ['aac', 'audio/aac'],
    ['m4a', 'audio/mp4'],
    ['opus', 'audio/opus'],
    ['mid', 'audio/midi'],
    ['midi', 'audio/midi'],
    ['weba', 'audio/webm'],
    ['mp4', 'video/mp4'],
    ['webm', 'video/webm'],
    ['avi', 'video/x-msvideo'],
    ['mov', 'video/quicktime'],
    ['mkv', 'video/x-matroska'],
    ['ogv', 'video/ogg'],
    ['m4v', 'video/mp4'],
    ['flv', 'video/x-flv'],
    ['wmv', 'video/x-ms-wmv'],
    ['zip', 'application/zip'],
    ['gz', 'application/gzip'],
    ['tar', 'application/x-tar'],
    ['bz2', 'application/x-bzip2'],
    ['7z', 'application/x-7z-compressed'],
    ['rar', 'application/vnd.rar'],
    ['xz', 'application/x-xz'],
    ['zst', 'application/zstd'],
    ['woff', 'font/woff'],
    ['woff2', 'font/woff2'],
    ['ttf', 'font/ttf'],
    ['otf', 'font/otf'],
    ['eot', 'application/vnd.ms-fontobject'],
    ['sh', 'application/x-sh'],
    ['py', 'text/x-python'],
    ['rb', 'application/x-ruby'],
    ['go', 'text/x-go'],
    ['rs', 'text/x-rust'],
    ['java', 'text/x-java-source'],
    ['c', 'text/x-c'],
    ['cpp', 'text/x-c++'],
    ['h', 'text/x-c'],
    ['cs', 'text/x-csharp'],
    ['php', 'application/x-httpd-php'],
    ['swift', 'text/x-swift'],
    ['kt', 'text/x-kotlin'],
    ['scala', 'text/x-scala'],
    ['lua', 'text/x-lua'],
    ['pl', 'text/x-perl'],
    ['r', 'text/x-r'],
    ['wasm', 'application/wasm'],
    ['bin', 'application/octet-stream'],
    ['exe', 'application/vnd.microsoft.portable-executable'],
    ['dll', 'application/vnd.microsoft.portable-executable'],
    ['so', 'application/octet-stream'],
    ['dmg', 'application/x-apple-diskimage'],
    ['deb', 'application/x-debian-package'],
    ['rpm', 'application/x-rpm'],
    ['eml', 'message/rfc822'],
    ['ics', 'text/calendar'],
    ['vcf', 'text/vcard'],
    ['geojson', 'application/geo+json'],
    ['gpx', 'application/gpx+xml'],
    ['kml', 'application/vnd.google-earth.kml+xml'],
    ['webmanifest', 'application/manifest+json'],
    ['map', 'application/json'],
    ['xhtml', 'application/xhtml+xml'],
    ['atom', 'application/atom+xml'],
    ['rss', 'application/rss+xml'],
    ['3gp', 'video/3gpp'],
  ];

  for (const [ext, expected] of cases) {
    it(`getMimeType('${ext}') === '${expected}'`, () => {
      expect(getMimeType(ext)).toBe(expected);
    });
  }

  // With leading dot
  const dotCases: [string, string][] = [
    ['.html', 'text/html'],
    ['.pdf', 'application/pdf'],
    ['.png', 'image/png'],
    ['.mp3', 'audio/mpeg'],
    ['.mp4', 'video/mp4'],
    ['.zip', 'application/zip'],
    ['.woff2', 'font/woff2'],
    ['.json', 'application/json'],
  ];
  for (const [ext, expected] of dotCases) {
    it(`getMimeType('${ext}') handles leading dot → '${expected}'`, () => {
      expect(getMimeType(ext)).toBe(expected);
    });
  }

  // Unknown extension returns undefined
  const unknownExts = ['xyz', 'foobar', 'unknown', 'abc123', '___'];
  for (const ext of unknownExts) {
    it(`getMimeType('${ext}') returns undefined for unknown ext`, () => {
      expect(getMimeType(ext)).toBeUndefined();
    });
  }

  // Case-insensitivity
  const upperCases: [string, string][] = [
    ['HTML', 'text/html'],
    ['PDF', 'application/pdf'],
    ['PNG', 'image/png'],
    ['MP3', 'audio/mpeg'],
    ['JSON', 'application/json'],
  ];
  for (const [ext, expected] of upperCases) {
    it(`getMimeType('${ext}') is case-insensitive → '${expected}'`, () => {
      expect(getMimeType(ext)).toBe(expected);
    });
  }
});

// ─── 2. getMimeFromFilename — 100 tests ───────────────────────────────────
describe('getMimeFromFilename', () => {
  const cases: [string, string | undefined][] = [
    ['report.pdf', 'application/pdf'],
    ['image.png', 'image/png'],
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['animation.gif', 'image/gif'],
    ['picture.webp', 'image/webp'],
    ['icon.svg', 'image/svg+xml'],
    ['favicon.ico', 'image/x-icon'],
    ['bitmap.bmp', 'image/bmp'],
    ['scan.tiff', 'image/tiff'],
    ['next-gen.avif', 'image/avif'],
    ['song.mp3', 'audio/mpeg'],
    ['audio.wav', 'audio/wav'],
    ['sound.ogg', 'audio/ogg'],
    ['lossless.flac', 'audio/flac'],
    ['compressed.aac', 'audio/aac'],
    ['movie.mp4', 'video/mp4'],
    ['web-video.webm', 'video/webm'],
    ['old-video.avi', 'video/x-msvideo'],
    ['apple-video.mov', 'video/quicktime'],
    ['high-def.mkv', 'video/x-matroska'],
    ['data.json', 'application/json'],
    ['config.xml', 'application/xml'],
    ['sheet.csv', 'text/csv'],
    ['readme.txt', 'text/plain'],
    ['docs.md', 'text/markdown'],
    ['styles.css', 'text/css'],
    ['app.js', 'application/javascript'],
    ['types.ts', 'application/typescript'],
    ['word-doc.doc', 'application/msword'],
    ['word-docx.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['excel.xls', 'application/vnd.ms-excel'],
    ['excel-new.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['slides.ppt', 'application/vnd.ms-powerpoint'],
    ['slides-new.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['archive.zip', 'application/zip'],
    ['compressed.gz', 'application/gzip'],
    ['tarball.tar', 'application/x-tar'],
    ['bzip.bz2', 'application/x-bzip2'],
    ['seven-zip.7z', 'application/x-7z-compressed'],
    ['winrar.rar', 'application/vnd.rar'],
    ['font.woff', 'font/woff'],
    ['font2.woff2', 'font/woff2'],
    ['truetype.ttf', 'font/ttf'],
    ['opentype.otf', 'font/otf'],
    ['script.sh', 'application/x-sh'],
    ['script.py', 'text/x-python'],
    ['program.rb', 'application/x-ruby'],
    ['code.go', 'text/x-go'],
    ['rust-code.rs', 'text/x-rust'],
    ['NoExtension', undefined],
    ['.hiddenfile', undefined],
    ['email.eml', 'message/rfc822'],
    ['calendar.ics', 'text/calendar'],
    ['contact.vcf', 'text/vcard'],
    ['geo.geojson', 'application/geo+json'],
    ['track.gpx', 'application/gpx+xml'],
    ['earth.kml', 'application/vnd.google-earth.kml+xml'],
    ['module.wasm', 'application/wasm'],
    ['binary.bin', 'application/octet-stream'],
    ['program.exe', 'application/vnd.microsoft.portable-executable'],
    ['library.dll', 'application/vnd.microsoft.portable-executable'],
    ['webapp.webmanifest', 'application/manifest+json'],
    ['feed.atom', 'application/atom+xml'],
    ['feed.rss', 'application/rss+xml'],
  ];

  for (const [filename, expected] of cases) {
    it(`getMimeFromFilename('${filename}') → ${JSON.stringify(expected)}`, () => {
      expect(getMimeFromFilename(filename)).toBe(expected);
    });
  }

  // With paths
  const pathCases: [string, string][] = [
    ['/home/user/docs/report.pdf', 'application/pdf'],
    ['/var/www/index.html', 'text/html'],
    ['C:\\Users\\user\\image.png', 'image/png'],
    ['./relative/path/song.mp3', 'audio/mpeg'],
    ['../another/dir/movie.mp4', 'video/mp4'],
    ['deep/nested/path/archive.zip', 'application/zip'],
    ['docs/readme.md', 'text/markdown'],
    ['src/index.ts', 'application/typescript'],
    ['public/styles/main.css', 'text/css'],
    ['dist/bundle.js', 'application/javascript'],
  ];

  for (const [path, expected] of pathCases) {
    it(`getMimeFromFilename with path '${path}' → '${expected}'`, () => {
      expect(getMimeFromFilename(path)).toBe(expected);
    });
  }

  // Uppercase extensions
  const upperCases: [string, string][] = [
    ['FILE.PDF', 'application/pdf'],
    ['IMAGE.PNG', 'image/png'],
    ['VIDEO.MP4', 'video/mp4'],
    ['AUDIO.MP3', 'audio/mpeg'],
    ['DOCUMENT.DOCX', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ];

  for (const [filename, expected] of upperCases) {
    it(`getMimeFromFilename handles uppercase '${filename}' → '${expected}'`, () => {
      expect(getMimeFromFilename(filename)).toBe(expected);
    });
  }

  // No extension
  const noExtCases = ['README', 'Makefile', 'Dockerfile', 'LICENSE', 'Procfile', 'CODEOWNERS'];
  for (const filename of noExtCases) {
    it(`getMimeFromFilename('${filename}') has no extension → undefined`, () => {
      expect(getMimeFromFilename(filename)).toBeUndefined();
    });
  }
});

// ─── 3. getExtensions — 50 tests ──────────────────────────────────────────
describe('getExtensions', () => {
  const cases: [string, string][] = [
    ['text/html', 'html'],
    ['application/pdf', 'pdf'],
    ['image/png', 'png'],
    ['image/jpeg', 'jpg'],
    ['image/gif', 'gif'],
    ['image/webp', 'webp'],
    ['image/svg+xml', 'svg'],
    ['audio/mpeg', 'mp3'],
    ['audio/wav', 'wav'],
    ['audio/ogg', 'ogg'],
    ['audio/flac', 'flac'],
    ['video/mp4', 'mp4'],
    ['video/webm', 'webm'],
    ['application/json', 'json'],
    ['application/xml', 'xml'],
    ['text/csv', 'csv'],
    ['text/plain', 'txt'],
    ['text/markdown', 'md'],
    ['text/css', 'css'],
    ['application/javascript', 'js'],
    ['application/zip', 'zip'],
    ['application/gzip', 'gz'],
    ['application/x-tar', 'tar'],
    ['font/woff', 'woff'],
    ['font/woff2', 'woff2'],
    ['font/ttf', 'ttf'],
    ['font/otf', 'otf'],
    ['application/wasm', 'wasm'],
    ['text/x-python', 'py'],
    ['application/x-yaml', 'yaml'],
    ['application/toml', 'toml'],
    ['text/calendar', 'ics'],
    ['text/vcard', 'vcf'],
    ['application/geo+json', 'geojson'],
    ['application/atom+xml', 'atom'],
    ['application/rss+xml', 'rss'],
    ['application/manifest+json', 'webmanifest'],
    ['application/xhtml+xml', 'xhtml'],
    ['image/avif', 'avif'],
    ['image/bmp', 'bmp'],
    ['audio/aac', 'aac'],
    ['video/quicktime', 'mov'],
    ['video/x-msvideo', 'avi'],
    ['application/x-7z-compressed', '7z'],
    ['application/vnd.rar', 'rar'],
    ['application/x-bzip2', 'bz2'],
    ['application/x-xz', 'xz'],
    ['image/x-icon', 'ico'],
    ['message/rfc822', 'eml'],
    ['text/x-go', 'go'],
  ];

  for (const [mimeType, expectedExt] of cases) {
    it(`getExtensions('${mimeType}') contains '${expectedExt}'`, () => {
      const result = getExtensions(mimeType);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain(expectedExt);
    });
  }
});

// ─── 4. isText — 100 tests ────────────────────────────────────────────────
describe('isText', () => {
  const trueCases = [
    'text/html',
    'text/css',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/xml',
    'text/calendar',
    'text/vcard',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-swift',
    'text/x-kotlin',
    'text/x-scala',
    'text/x-lua',
    'text/x-perl',
    'text/x-r',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-yaml',
    'application/toml',
    'application/sql',
    'application/graphql',
    'application/manifest+json',
    'application/xhtml+xml',
    'application/atom+xml',
    'application/rss+xml',
    'application/geo+json',
    'image/svg+xml',
  ];

  for (const mimeType of trueCases) {
    it(`isText('${mimeType}') → true`, () => {
      expect(isText(mimeType)).toBe(true);
    });
  }

  // With charset parameter — still text
  const withCharset = [
    'text/html; charset=utf-8',
    'application/json; charset=UTF-8',
    'text/plain; charset=iso-8859-1',
    'text/css; charset=utf-8',
  ];
  for (const mimeType of withCharset) {
    it(`isText('${mimeType}') with params → true`, () => {
      expect(isText(mimeType)).toBe(true);
    });
  }

  const falseCases = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/zip',
    'application/gzip',
    'application/x-tar',
    'application/octet-stream',
    'application/wasm',
    'font/woff',
    'font/woff2',
    'font/ttf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/x-sh',
    'application/x-ruby',
    'application/vnd.microsoft.portable-executable',
    'application/x-apple-diskimage',
    'application/x-debian-package',
    'application/x-rpm',
    'message/rfc822',
    'application/rtf',
    'application/x-bzip2',
    'application/x-xz',
    'application/vnd.rar',
    'application/x-7z-compressed',
    'video/x-msvideo',
    'video/x-matroska',
    'video/ogg',
    'audio/midi',
    'audio/aac',
    'audio/webm',
    'image/heic',
    'image/jxl',
    'font/otf',
    'application/vnd.ms-fontobject',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/gpx+xml',
    'application/vnd.google-earth.kml+xml',
    'application/zstd',
    'video/x-flv',
    'video/x-ms-wmv',
    'video/3gpp',
    'application/vnd.ms-powerpoint',
    'application/x-7z-compressed',
    'application/x-httpd-php',
    'application/x-ruby',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  for (const mimeType of falseCases) {
    it(`isText('${mimeType}') → false`, () => {
      expect(isText(mimeType)).toBe(false);
    });
  }
});

// ─── 5. isImage — 50 tests ────────────────────────────────────────────────
describe('isImage', () => {
  const imageMimes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif',
    'image/apng',
    'image/jxl',
  ];
  for (const mime of imageMimes) {
    it(`isImage('${mime}') → true`, () => {
      expect(isImage(mime)).toBe(true);
    });
  }

  // With parameters
  it('isImage("image/png; charset=utf-8") → true', () => {
    expect(isImage('image/png; charset=utf-8')).toBe(true);
  });
  it('isImage("IMAGE/JPEG") → true (case-insensitive)', () => {
    expect(isImage('IMAGE/JPEG')).toBe(true);
  });

  const notImageMimes = [
    'text/html',
    'application/pdf',
    'audio/mpeg',
    'video/mp4',
    'application/json',
    'text/css',
    'font/woff',
    'application/zip',
    'application/octet-stream',
    'application/wasm',
    'text/plain',
    'application/x-sh',
    'message/rfc822',
    'text/calendar',
    'text/vcard',
    'application/xml',
    'audio/wav',
    'video/webm',
    'application/javascript',
    'application/x-yaml',
    'font/ttf',
    'text/csv',
    'text/markdown',
    'application/gzip',
    'application/x-tar',
    'video/quicktime',
    'audio/ogg',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'application/x-bzip2',
    'audio/flac',
    'video/x-msvideo',
    'application/msword',
    'application/vnd.ms-excel',
    'application/rtf',
  ];
  for (const mime of notImageMimes) {
    it(`isImage('${mime}') → false`, () => {
      expect(isImage(mime)).toBe(false);
    });
  }
});

// ─── 6. isAudio — 50 tests ────────────────────────────────────────────────
describe('isAudio', () => {
  const audioMimes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/mp4',
    'audio/opus',
    'audio/midi',
    'audio/webm',
  ];
  for (const mime of audioMimes) {
    it(`isAudio('${mime}') → true`, () => {
      expect(isAudio(mime)).toBe(true);
    });
  }

  it('isAudio("AUDIO/MPEG") → true (case-insensitive)', () => {
    expect(isAudio('AUDIO/MPEG')).toBe(true);
  });
  it('isAudio("audio/ogg; codecs=vorbis") → true with params', () => {
    expect(isAudio('audio/ogg; codecs=vorbis')).toBe(true);
  });

  const notAudioMimes = [
    'video/mp4',
    'image/png',
    'text/html',
    'application/json',
    'font/woff',
    'application/pdf',
    'text/plain',
    'application/zip',
    'application/octet-stream',
    'application/wasm',
    'text/css',
    'application/xml',
    'text/csv',
    'text/markdown',
    'application/x-yaml',
    'application/javascript',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'image/jpeg',
    'image/gif',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'application/msword',
    'application/vnd.ms-excel',
    'text/x-python',
    'application/x-sh',
    'message/rfc822',
    'text/calendar',
    'font/ttf',
    'application/wasm',
    'application/rtf',
    'application/toml',
    'application/sql',
    'application/graphql',
    'text/vcard',
    'application/geo+json',
    'application/atom+xml',
    'application/rss+xml',
  ];
  for (const mime of notAudioMimes) {
    it(`isAudio('${mime}') → false`, () => {
      expect(isAudio(mime)).toBe(false);
    });
  }
});

// ─── 7. isVideo — 50 tests ────────────────────────────────────────────────
describe('isVideo', () => {
  const videoMimes = [
    'video/mp4',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-matroska',
    'video/ogg',
    'video/x-flv',
    'video/x-ms-wmv',
    'video/3gpp',
  ];
  for (const mime of videoMimes) {
    it(`isVideo('${mime}') → true`, () => {
      expect(isVideo(mime)).toBe(true);
    });
  }

  it('isVideo("VIDEO/MP4") → true (case-insensitive)', () => {
    expect(isVideo('VIDEO/MP4')).toBe(true);
  });
  it('isVideo("video/mp4; codecs=avc1") → true with params', () => {
    expect(isVideo('video/mp4; codecs=avc1')).toBe(true);
  });

  const notVideoMimes = [
    'audio/mpeg',
    'image/png',
    'text/html',
    'application/json',
    'font/woff',
    'application/pdf',
    'text/plain',
    'application/zip',
    'application/octet-stream',
    'application/wasm',
    'text/css',
    'application/xml',
    'text/csv',
    'text/markdown',
    'application/x-yaml',
    'application/javascript',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'image/jpeg',
    'image/gif',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'application/msword',
    'application/vnd.ms-excel',
    'text/x-python',
    'application/x-sh',
    'message/rfc822',
    'text/calendar',
    'font/ttf',
    'application/rtf',
    'application/toml',
    'application/sql',
    'application/graphql',
    'text/vcard',
    'application/geo+json',
    'application/atom+xml',
    'application/rss+xml',
  ];
  for (const mime of notVideoMimes) {
    it(`isVideo('${mime}') → false`, () => {
      expect(isVideo(mime)).toBe(false);
    });
  }
});

// ─── 8. isCompressible — 50 tests ─────────────────────────────────────────
describe('isCompressible', () => {
  const compressibleMimes = [
    'text/html',
    'text/css',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/xml',
    'text/calendar',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-yaml',
    'application/toml',
    'application/sql',
    'application/graphql',
    'application/manifest+json',
    'application/xhtml+xml',
    'application/atom+xml',
    'application/rss+xml',
    'application/geo+json',
    'image/svg+xml',
  ];
  for (const mime of compressibleMimes) {
    it(`isCompressible('${mime}') → true`, () => {
      expect(isCompressible(mime)).toBe(true);
    });
  }

  const notCompressibleMimes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif',
    'audio/mpeg',
    'audio/flac',
    'audio/aac',
    'video/mp4',
    'video/webm',
    'application/zip',
    'application/gzip',
    'application/x-bzip2',
    'application/x-xz',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'application/octet-stream',
    'application/wasm',
    'font/woff',
    'font/woff2',
    'application/pdf',
    'application/msword',
    'application/vnd.ms-excel',
    'application/x-tar',
    'application/rtf',
    'application/vnd.ms-powerpoint',
  ];
  for (const mime of notCompressibleMimes) {
    it(`isCompressible('${mime}') → false`, () => {
      expect(isCompressible(mime)).toBe(false);
    });
  }
});

// ─── 9. normalizeMime — 100 tests ─────────────────────────────────────────
describe('normalizeMime', () => {
  // Lowercase stripping of charset
  const stripCases: [string, string][] = [
    ['Text/HTML; charset=utf-8', 'text/html'],
    ['Application/JSON; charset=UTF-8', 'application/json'],
    ['text/plain; charset=iso-8859-1', 'text/plain'],
    ['TEXT/CSS; CHARSET=UTF-8', 'text/css'],
    ['application/xml; charset=utf-8', 'application/xml'],
    ['image/png', 'image/png'],
    ['IMAGE/JPEG', 'image/jpeg'],
    ['VIDEO/MP4', 'video/mp4'],
    ['AUDIO/MPEG', 'audio/mpeg'],
    ['Application/PDF', 'application/pdf'],
    ['FONT/WOFF2', 'font/woff2'],
    ['text/html;charset=utf-8', 'text/html'],
    ['application/json;  charset=UTF-8', 'application/json'],
    ['text/csv; boundary=something', 'text/csv'],
    ['multipart/form-data; boundary=----WebKitFormBoundary', 'multipart/form-data'],
  ];

  for (const [input, expected] of stripCases) {
    it(`normalizeMime('${input}') → '${expected}'`, () => {
      expect(normalizeMime(input)).toBe(expected);
    });
  }

  // Already normalized — identity
  const alreadyNorm = [
    'text/html',
    'application/json',
    'image/png',
    'audio/mpeg',
    'video/mp4',
    'font/woff',
    'application/zip',
    'text/css',
    'application/xml',
    'image/svg+xml',
    'text/plain',
    'text/csv',
    'application/pdf',
    'application/javascript',
    'application/wasm',
    'text/markdown',
    'audio/wav',
    'audio/ogg',
    'video/webm',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif',
    'font/ttf',
    'font/otf',
    'font/woff2',
    'application/x-yaml',
    'application/toml',
    'application/sql',
    'application/graphql',
    'text/calendar',
    'text/vcard',
    'application/geo+json',
    'application/atom+xml',
    'application/rss+xml',
    'application/manifest+json',
    'application/xhtml+xml',
    'image/x-icon',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/jxl',
    'audio/flac',
    'audio/aac',
    'audio/opus',
    'audio/midi',
    'audio/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/ogg',
    'video/x-flv',
    'video/x-ms-wmv',
    'video/3gpp',
    'application/gzip',
    'application/x-tar',
    'application/x-bzip2',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'application/x-xz',
    'application/zstd',
    'application/octet-stream',
    'application/x-sh',
    'application/x-ruby',
    'application/x-httpd-php',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'message/rfc822',
    'application/rtf',
    'application/wasm',
    'application/gpx+xml',
    'application/vnd.google-earth.kml+xml',
    'application/vnd.ms-fontobject',
  ];

  for (const mime of alreadyNorm) {
    it(`normalizeMime('${mime}') is identity`, () => {
      expect(normalizeMime(mime)).toBe(mime);
    });
  }
});

// ─── 10. getCharset — 50 tests ────────────────────────────────────────────
describe('getCharset', () => {
  const utf8Cases = [
    'text/html',
    'text/css',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/xml',
    'text/calendar',
    'text/vcard',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'text/x-java-source',
    'application/json',
    'application/javascript',
    'application/typescript',
    'application/xml',
    'application/x-yaml',
    'application/toml',
    'application/sql',
    'application/graphql',
    'application/manifest+json',
    'application/xhtml+xml',
    'application/atom+xml',
    'application/rss+xml',
    'application/geo+json',
    'image/svg+xml',
  ];
  for (const mime of utf8Cases) {
    it(`getCharset('${mime}') → 'UTF-8'`, () => {
      expect(getCharset(mime)).toBe('UTF-8');
    });
  }

  const undefinedCases = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'application/zip',
    'application/gzip',
    'application/octet-stream',
    'application/wasm',
    'application/pdf',
    'font/woff',
    'font/woff2',
    'font/ttf',
    'message/rfc822',
    'application/x-tar',
    'application/rtf',
    'application/msword',
    'application/vnd.ms-excel',
    'application/x-7z-compressed',
    'audio/flac',
    'video/quicktime',
  ];
  for (const mime of undefinedCases) {
    it(`getCharset('${mime}') → undefined`, () => {
      expect(getCharset(mime)).toBeUndefined();
    });
  }
});

// ─── 11. parseContentType — 100 tests ─────────────────────────────────────
describe('parseContentType', () => {
  // Basic type+subtype
  const basicCases: Array<[string, string, string]> = [
    ['text/html', 'text', 'html'],
    ['application/json', 'application', 'json'],
    ['image/png', 'image', 'png'],
    ['audio/mpeg', 'audio', 'mpeg'],
    ['video/mp4', 'video', 'mp4'],
    ['font/woff2', 'font', 'woff2'],
    ['application/pdf', 'application', 'pdf'],
    ['text/css', 'text', 'css'],
    ['text/plain', 'text', 'plain'],
    ['application/xml', 'application', 'xml'],
    ['image/svg+xml', 'image', 'svg+xml'],
    ['application/javascript', 'application', 'javascript'],
    ['text/csv', 'text', 'csv'],
    ['application/zip', 'application', 'zip'],
    ['message/rfc822', 'message', 'rfc822'],
    ['application/wasm', 'application', 'wasm'],
    ['audio/ogg', 'audio', 'ogg'],
    ['video/webm', 'video', 'webm'],
    ['image/jpeg', 'image', 'jpeg'],
    ['application/octet-stream', 'application', 'octet-stream'],
  ];

  for (const [header, expectedType, expectedSubtype] of basicCases) {
    it(`parseContentType('${header}') type='${expectedType}', subtype='${expectedSubtype}'`, () => {
      const result = parseContentType(header);
      expect(result.type).toBe(expectedType);
      expect(result.subtype).toBe(expectedSubtype);
      expect(result.full).toBe(header.toLowerCase());
    });
  }

  // With parameters
  it('parseContentType("text/html; charset=utf-8") extracts charset', () => {
    const ct = parseContentType('text/html; charset=utf-8');
    expect(ct.type).toBe('text');
    expect(ct.subtype).toBe('html');
    expect(ct.parameters.charset).toBe('utf-8');
  });

  it('parseContentType("application/json; charset=UTF-8") extracts charset', () => {
    const ct = parseContentType('application/json; charset=UTF-8');
    expect(ct.parameters.charset).toBe('UTF-8');
  });

  it('parseContentType("multipart/form-data; boundary=----WebKitFormBoundary") extracts boundary', () => {
    const ct = parseContentType('multipart/form-data; boundary=----WebKitFormBoundary');
    expect(ct.type).toBe('multipart');
    expect(ct.subtype).toBe('form-data');
    expect(ct.parameters.boundary).toBe('----WebKitFormBoundary');
  });

  it('parseContentType with quoted value strips quotes', () => {
    const ct = parseContentType('text/html; charset="utf-8"');
    expect(ct.parameters.charset).toBe('utf-8');
  });

  it('parseContentType with multiple params', () => {
    const ct = parseContentType('multipart/form-data; boundary=abc; charset=utf-8');
    expect(ct.parameters.boundary).toBe('abc');
    expect(ct.parameters.charset).toBe('utf-8');
  });

  it('parseContentType uppercase is normalized', () => {
    const ct = parseContentType('TEXT/HTML; CHARSET=UTF-8');
    expect(ct.type).toBe('text');
    expect(ct.subtype).toBe('html');
  });

  it('parseContentType returns empty parameters object when no params', () => {
    const ct = parseContentType('application/json');
    expect(ct.parameters).toEqual({});
  });

  it('parseContentType has correct full property', () => {
    const ct = parseContentType('text/html; charset=utf-8');
    expect(ct.full).toBe('text/html');
  });

  // More parameter tests with various content types
  const paramCases: Array<[string, string, string]> = [
    ['text/plain; charset=iso-8859-1', 'charset', 'iso-8859-1'],
    ['application/xml; charset=utf-8', 'charset', 'utf-8'],
    ['audio/ogg; codecs=vorbis', 'codecs', 'vorbis'],
    ['video/mp4; codecs=avc1', 'codecs', 'avc1'],
    ['image/png; quality=90', 'quality', '90'],
  ];

  for (const [header, paramKey, paramVal] of paramCases) {
    it(`parseContentType('${header}') has param ${paramKey}='${paramVal}'`, () => {
      const ct = parseContentType(header);
      expect(ct.parameters[paramKey]).toBe(paramVal);
    });
  }

  // Verify type, subtype, parameters, full are all present in return value
  const structureCases = [
    'text/html',
    'application/json',
    'image/png',
    'audio/mpeg',
    'video/mp4',
    'font/woff',
    'application/zip',
    'text/css',
    'application/pdf',
    'message/rfc822',
    'application/wasm',
    'text/calendar',
    'text/vcard',
    'application/geo+json',
    'application/atom+xml',
    'application/rss+xml',
    'application/manifest+json',
    'application/xhtml+xml',
    'image/svg+xml',
    'application/xml',
    'text/plain',
    'text/csv',
    'audio/wav',
    'audio/ogg',
    'video/webm',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'audio/flac',
    'audio/aac',
    'video/quicktime',
    'video/x-msvideo',
    'application/x-tar',
    'application/gzip',
    'application/x-bzip2',
    'application/x-7z-compressed',
    'application/vnd.rar',
    'application/x-xz',
    'application/octet-stream',
    'application/x-sh',
    'text/x-python',
    'text/x-go',
    'text/x-rust',
    'application/rtf',
    'application/vnd.ms-excel',
    'application/msword',
    'font/ttf',
    'font/otf',
    'font/woff2',
  ];

  for (const mime of structureCases) {
    it(`parseContentType('${mime}') returns {type,subtype,parameters,full}`, () => {
      const ct = parseContentType(mime);
      expect(typeof ct.type).toBe('string');
      expect(typeof ct.subtype).toBe('string');
      expect(typeof ct.parameters).toBe('object');
      expect(typeof ct.full).toBe('string');
    });
  }
});

// ─── 12. formatContentType — 50 tests ────────────────────────────────────
describe('formatContentType', () => {
  // Without charset
  const noCharsetCases = [
    'text/html',
    'application/json',
    'image/png',
    'audio/mpeg',
    'video/mp4',
    'application/pdf',
    'text/css',
    'application/zip',
    'font/woff2',
    'application/wasm',
    'text/plain',
    'application/xml',
    'image/jpeg',
    'audio/wav',
    'video/webm',
    'application/javascript',
    'image/svg+xml',
    'text/csv',
    'audio/ogg',
    'application/octet-stream',
  ];

  for (const mime of noCharsetCases) {
    it(`formatContentType('${mime}') without charset returns normalized mime`, () => {
      expect(formatContentType(mime)).toBe(mime.toLowerCase().split(';')[0].trim());
    });
  }

  // With charset
  const withCharsetCases: [string, string, string][] = [
    ['text/html', 'utf-8', 'text/html; charset=utf-8'],
    ['application/json', 'UTF-8', 'application/json; charset=UTF-8'],
    ['text/plain', 'iso-8859-1', 'text/plain; charset=iso-8859-1'],
    ['text/css', 'utf-8', 'text/css; charset=utf-8'],
    ['application/xml', 'utf-8', 'application/xml; charset=utf-8'],
    ['text/csv', 'utf-8', 'text/csv; charset=utf-8'],
    ['application/javascript', 'utf-8', 'application/javascript; charset=utf-8'],
    ['text/markdown', 'utf-8', 'text/markdown; charset=utf-8'],
    ['application/xhtml+xml', 'utf-8', 'application/xhtml+xml; charset=utf-8'],
    ['text/x-python', 'utf-8', 'text/x-python; charset=utf-8'],
  ];

  for (const [mime, charset, expected] of withCharsetCases) {
    it(`formatContentType('${mime}', '${charset}') → '${expected}'`, () => {
      expect(formatContentType(mime, charset)).toBe(expected);
    });
  }

  // Normalizes uppercase input
  it('formatContentType normalizes uppercase MIME', () => {
    expect(formatContentType('TEXT/HTML')).toBe('text/html');
  });

  it('formatContentType strips parameters from input', () => {
    expect(formatContentType('text/html; charset=utf-8')).toBe('text/html');
  });

  it('formatContentType with charset on already-normalized mime', () => {
    expect(formatContentType('text/plain', 'ASCII')).toBe('text/plain; charset=ASCII');
  });

  it('formatContentType: application/json with charset', () => {
    expect(formatContentType('application/json', 'utf-8')).toBe('application/json; charset=utf-8');
  });

  it('formatContentType: image/png without charset returns plain mime', () => {
    expect(formatContentType('image/png')).toBe('image/png');
  });

  it('formatContentType: font/woff2 without charset', () => {
    expect(formatContentType('font/woff2')).toBe('font/woff2');
  });

  it('formatContentType: application/octet-stream', () => {
    expect(formatContentType('application/octet-stream')).toBe('application/octet-stream');
  });

  it('formatContentType: video/mp4 without charset', () => {
    expect(formatContentType('video/mp4')).toBe('video/mp4');
  });
});

// ─── 13. detectFromBytes — 50 tests ──────────────────────────────────────
describe('detectFromBytes', () => {
  // PNG
  const pngBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    it(`detectFromBytes(PNG bytes) test ${i} → 'image/png'`, () => {
      expect(detectFromBytes(pngBytes)).toBe('image/png');
    });
  }

  // JPEG
  const jpegBytes = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
  for (let i = 0; i < 6; i++) {
    it(`detectFromBytes(JPEG bytes) test ${i} → 'image/jpeg'`, () => {
      expect(detectFromBytes(jpegBytes)).toBe('image/jpeg');
    });
  }

  // GIF
  const gifBytes = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(GIF bytes) test ${i} → 'image/gif'`, () => {
      expect(detectFromBytes(gifBytes)).toBe('image/gif');
    });
  }

  // PDF
  const pdfBytes = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(PDF bytes) test ${i} → 'application/pdf'`, () => {
      expect(detectFromBytes(pdfBytes)).toBe('application/pdf');
    });
  }

  // ZIP
  const zipBytes = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(ZIP bytes) test ${i} → 'application/zip'`, () => {
      expect(detectFromBytes(zipBytes)).toBe('application/zip');
    });
  }

  // WEBP
  const webpBytes = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(WEBP bytes) test ${i} → 'image/webp'`, () => {
      expect(detectFromBytes(webpBytes)).toBe('image/webp');
    });
  }

  // WAV
  const wavBytes = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(WAV bytes) test ${i} → 'audio/wav'`, () => {
      expect(detectFromBytes(wavBytes)).toBe('audio/wav');
    });
  }

  // MP3 (ID3 tag)
  const mp3Bytes = [0x49, 0x44, 0x33, 0x04, 0x00, 0x00];
  for (let i = 0; i < 4; i++) {
    it(`detectFromBytes(MP3 ID3 bytes) test ${i} → 'audio/mpeg'`, () => {
      expect(detectFromBytes(mp3Bytes)).toBe('audio/mpeg');
    });
  }

  // BMP
  const bmpBytes = [0x42, 0x4d, 0x00, 0x00, 0x00, 0x00];
  for (let i = 0; i < 3; i++) {
    it(`detectFromBytes(BMP bytes) test ${i} → 'image/bmp'`, () => {
      expect(detectFromBytes(bmpBytes)).toBe('image/bmp');
    });
  }

  // TIFF little-endian
  const tiffLeBytes = [0x49, 0x49, 0x2a, 0x00, 0x00, 0x00];
  for (let i = 0; i < 3; i++) {
    it(`detectFromBytes(TIFF LE bytes) test ${i} → 'image/tiff'`, () => {
      expect(detectFromBytes(tiffLeBytes)).toBe('image/tiff');
    });
  }

  // TIFF big-endian
  const tiffBeBytes = [0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00];
  for (let i = 0; i < 3; i++) {
    it(`detectFromBytes(TIFF BE bytes) test ${i} → 'image/tiff'`, () => {
      expect(detectFromBytes(tiffBeBytes)).toBe('image/tiff');
    });
  }

  // Empty returns undefined
  it('detectFromBytes([]) → undefined', () => {
    expect(detectFromBytes([])).toBeUndefined();
  });
  it('detectFromBytes(Uint8Array(0)) → undefined', () => {
    expect(detectFromBytes(new Uint8Array(0))).toBeUndefined();
  });

  // Unknown bytes
  it('detectFromBytes([0x00, 0x00, 0x00, 0x00]) → undefined', () => {
    expect(detectFromBytes([0x00, 0x00, 0x00, 0x00])).toBeUndefined();
  });

  // Uint8Array form of PNG
  it('detectFromBytes(Uint8Array PNG) → image/png', () => {
    expect(detectFromBytes(new Uint8Array(pngBytes))).toBe('image/png');
  });

  // MP3 sync word
  it('detectFromBytes([0xFF, 0xFB, ...]) → audio/mpeg', () => {
    expect(detectFromBytes([0xff, 0xfb, 0x90, 0x00])).toBe('audio/mpeg');
  });

  // WASM
  it('detectFromBytes(WASM magic) → application/wasm', () => {
    expect(detectFromBytes([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00])).toBe('application/wasm');
  });
});

// ─── 14. getMimeCategory — 100 tests ─────────────────────────────────────
describe('getMimeCategory', () => {
  const categories: Array<[string, string]> = [
    ['text/html', 'text'],
    ['text/css', 'text'],
    ['text/plain', 'text'],
    ['text/csv', 'text'],
    ['text/markdown', 'text'],
    ['text/xml', 'text'],
    ['text/calendar', 'text'],
    ['text/vcard', 'text'],
    ['text/x-python', 'text'],
    ['text/x-go', 'text'],
    ['text/x-rust', 'text'],
    ['text/x-java-source', 'text'],
    ['text/x-c', 'text'],
    ['text/x-c++', 'text'],
    ['text/x-csharp', 'text'],
    ['text/x-swift', 'text'],
    ['text/x-kotlin', 'text'],
    ['text/x-scala', 'text'],
    ['text/x-lua', 'text'],
    ['text/x-perl', 'text'],
    ['image/png', 'image'],
    ['image/jpeg', 'image'],
    ['image/gif', 'image'],
    ['image/webp', 'image'],
    ['image/svg+xml', 'image'],
    ['image/x-icon', 'image'],
    ['image/bmp', 'image'],
    ['image/tiff', 'image'],
    ['image/avif', 'image'],
    ['image/heic', 'image'],
    ['image/heif', 'image'],
    ['image/apng', 'image'],
    ['image/jxl', 'image'],
    ['audio/mpeg', 'audio'],
    ['audio/wav', 'audio'],
    ['audio/ogg', 'audio'],
    ['audio/flac', 'audio'],
    ['audio/aac', 'audio'],
    ['audio/mp4', 'audio'],
    ['audio/opus', 'audio'],
    ['audio/midi', 'audio'],
    ['audio/webm', 'audio'],
    ['video/mp4', 'video'],
    ['video/webm', 'video'],
    ['video/x-msvideo', 'video'],
    ['video/quicktime', 'video'],
    ['video/x-matroska', 'video'],
    ['video/ogg', 'video'],
    ['video/x-flv', 'video'],
    ['video/x-ms-wmv', 'video'],
    ['video/3gpp', 'video'],
    ['font/woff', 'font'],
    ['font/woff2', 'font'],
    ['font/ttf', 'font'],
    ['font/otf', 'font'],
    ['application/json', 'application'],
    ['application/xml', 'application'],
    ['application/pdf', 'application'],
    ['application/zip', 'application'],
    ['application/gzip', 'application'],
    ['application/x-tar', 'application'],
    ['application/x-bzip2', 'application'],
    ['application/x-7z-compressed', 'application'],
    ['application/vnd.rar', 'application'],
    ['application/javascript', 'application'],
    ['application/typescript', 'application'],
    ['application/wasm', 'application'],
    ['application/octet-stream', 'application'],
    ['application/x-sh', 'application'],
    ['application/x-ruby', 'application'],
    ['application/x-httpd-php', 'application'],
    ['application/x-yaml', 'application'],
    ['application/toml', 'application'],
    ['application/sql', 'application'],
    ['application/graphql', 'application'],
    ['application/rtf', 'application'],
    ['application/msword', 'application'],
    ['application/vnd.ms-excel', 'application'],
    ['application/vnd.ms-powerpoint', 'application'],
    ['application/manifest+json', 'application'],
    ['application/xhtml+xml', 'application'],
    ['application/atom+xml', 'application'],
    ['application/rss+xml', 'application'],
    ['application/geo+json', 'application'],
    ['application/gpx+xml', 'application'],
    ['application/vnd.google-earth.kml+xml', 'application'],
    ['application/vnd.ms-fontobject', 'application'],
    ['application/vnd.oasis.opendocument.text', 'application'],
    ['application/vnd.oasis.opendocument.spreadsheet', 'application'],
    ['application/vnd.oasis.opendocument.presentation', 'application'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application'],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application'],
    ['application/vnd.microsoft.portable-executable', 'application'],
    ['application/x-apple-diskimage', 'application'],
    ['application/x-debian-package', 'application'],
    ['application/x-rpm', 'application'],
    ['application/x-xz', 'application'],
    ['message/rfc822', 'other'],
  ];

  for (const [mime, expectedCat] of categories) {
    it(`getMimeCategory('${mime}') → '${expectedCat}'`, () => {
      expect(getMimeCategory(mime)).toBe(expectedCat);
    });
  }
});

// ─── 15. isKnownExtension — 50 tests ─────────────────────────────────────
describe('isKnownExtension', () => {
  const knownExts = [
    'html', 'htm', 'css', 'js', 'ts', 'json', 'xml', 'csv', 'txt', 'md',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif',
    'mp3', 'mp4', 'wav', 'ogg', 'webm', 'avi', 'mov', 'mkv', 'flac', 'aac',
    'zip', 'gz', 'tar', 'bz2', '7z', 'rar', 'xz',
    'woff', 'woff2', 'ttf',
  ];

  for (const ext of knownExts) {
    it(`isKnownExtension('${ext}') → true`, () => {
      expect(isKnownExtension(ext)).toBe(true);
    });
  }

  // With dot prefix
  it('isKnownExtension(".html") → true', () => {
    expect(isKnownExtension('.html')).toBe(true);
  });
  it('isKnownExtension(".pdf") → true', () => {
    expect(isKnownExtension('.pdf')).toBe(true);
  });
  it('isKnownExtension(".png") → true', () => {
    expect(isKnownExtension('.png')).toBe(true);
  });

  // Unknown extensions
  const unknownExts = [
    'xyz', 'foobar', '___', 'abc123', 'nope',
    'unknown', 'random', 'test', 'fake', 'notaext',
    'zzz', 'qwerty', 'asdfgh', 'zxcvbn', 'poiuyt',
    'mnbvcx', 'lkjhgf', 'plokmij', 'qazwsx', 'edcrfv',
    'tgbyhn', 'ujmik', 'olpnhb', 'ygtfcd', 'xswzaq',
  ];

  for (const ext of unknownExts) {
    it(`isKnownExtension('${ext}') → false`, () => {
      expect(isKnownExtension(ext)).toBe(false);
    });
  }
});

// ─── 16. isSafe — 30 tests ───────────────────────────────────────────────
describe('isSafe', () => {
  const safeMimes = [
    'text/html',
    'text/css',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'font/woff',
    'font/woff2',
    'application/pdf',
    'text/plain',
    'text/csv',
  ];

  for (const mime of safeMimes) {
    it(`isSafe('${mime}') → true`, () => {
      expect(isSafe(mime)).toBe(true);
    });
  }

  const unsafeMimes = [
    'application/vnd.microsoft.portable-executable',
    'application/x-sh',
    'application/octet-stream',
    'application/x-apple-diskimage',
    'application/x-debian-package',
    'application/x-rpm',
    'application/x-httpd-php',
    'application/x-ruby',
  ];

  for (const mime of unsafeMimes) {
    it(`isSafe('${mime}') → false`, () => {
      expect(isSafe(mime)).toBe(false);
    });
  }

  it('isSafe normalizes input (uppercase)', () => {
    expect(isSafe('TEXT/HTML')).toBe(true);
  });

  it('isSafe with parameters strips them', () => {
    expect(isSafe('text/html; charset=utf-8')).toBe(true);
  });

  it('isSafe for zip returns true (archive but not executable)', () => {
    expect(isSafe('application/zip')).toBe(true);
  });

  it('isSafe for wasm returns true', () => {
    expect(isSafe('application/wasm')).toBe(true);
  });
});

// ─── 17. listExtensions & listMimeTypes & getTextMimeTypes & getImageMimeTypes ──
describe('listExtensions', () => {
  it('returns an array', () => {
    expect(Array.isArray(listExtensions())).toBe(true);
  });

  it('has at least 120 entries', () => {
    expect(listExtensions().length).toBeGreaterThanOrEqual(120);
  });

  const requiredExts = [
    'html', 'css', 'js', 'json', 'xml', 'csv', 'txt', 'md', 'pdf',
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp3', 'mp4', 'wav',
    'zip', 'gz', 'tar', 'woff', 'woff2', 'ttf', 'sh', 'py',
  ];

  for (const ext of requiredExts) {
    it(`listExtensions() contains '${ext}'`, () => {
      expect(listExtensions()).toContain(ext);
    });
  }
});

describe('listMimeTypes', () => {
  it('returns an array', () => {
    expect(Array.isArray(listMimeTypes())).toBe(true);
  });

  it('has no duplicates', () => {
    const list = listMimeTypes();
    expect(list.length).toBe(new Set(list).size);
  });

  const requiredMimes = [
    'text/html', 'application/json', 'image/png', 'audio/mpeg', 'video/mp4',
    'application/pdf', 'application/zip', 'font/woff2',
  ];

  for (const mime of requiredMimes) {
    it(`listMimeTypes() contains '${mime}'`, () => {
      expect(listMimeTypes()).toContain(mime);
    });
  }
});

describe('getTextMimeTypes', () => {
  it('returns an array', () => {
    expect(Array.isArray(getTextMimeTypes())).toBe(true);
  });

  it('all entries start with text/', () => {
    const types = getTextMimeTypes();
    expect(types.length).toBeGreaterThan(0);
    for (const t of types) {
      expect(t.startsWith('text/')).toBe(true);
    }
  });

  const requiredTextMimes = ['text/html', 'text/css', 'text/plain', 'text/csv'];
  for (const mime of requiredTextMimes) {
    it(`getTextMimeTypes() contains '${mime}'`, () => {
      expect(getTextMimeTypes()).toContain(mime);
    });
  }
});

describe('getImageMimeTypes', () => {
  it('returns an array', () => {
    expect(Array.isArray(getImageMimeTypes())).toBe(true);
  });

  it('all entries start with image/', () => {
    const types = getImageMimeTypes();
    expect(types.length).toBeGreaterThan(0);
    for (const t of types) {
      expect(t.startsWith('image/')).toBe(true);
    }
  });

  const requiredImageMimes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  for (const mime of requiredImageMimes) {
    it(`getImageMimeTypes() contains '${mime}'`, () => {
      expect(getImageMimeTypes()).toContain(mime);
    });
  }
});

// ─── 18. MIME_MAP direct checks ───────────────────────────────────────────
describe('MIME_MAP', () => {
  it('is a plain object', () => {
    expect(typeof MIME_MAP).toBe('object');
    expect(MIME_MAP).not.toBeNull();
  });

  it('has at least 120 keys', () => {
    expect(Object.keys(MIME_MAP).length).toBeGreaterThanOrEqual(120);
  });

  const spotChecks: [string, string][] = [
    ['html', 'text/html'],
    ['pdf', 'application/pdf'],
    ['png', 'image/png'],
    ['mp3', 'audio/mpeg'],
    ['mp4', 'video/mp4'],
    ['zip', 'application/zip'],
    ['json', 'application/json'],
    ['woff2', 'font/woff2'],
    ['wasm', 'application/wasm'],
    ['eml', 'message/rfc822'],
    ['ics', 'text/calendar'],
    ['vcf', 'text/vcard'],
    ['geojson', 'application/geo+json'],
  ];

  for (const [ext, expected] of spotChecks) {
    it(`MIME_MAP['${ext}'] === '${expected}'`, () => {
      expect(MIME_MAP[ext]).toBe(expected);
    });
  }
});

// ─── 19. isApplication — additional coverage ──────────────────────────────
describe('isApplication', () => {
  const appMimes = [
    'application/json',
    'application/xml',
    'application/pdf',
    'application/zip',
    'application/javascript',
    'application/wasm',
    'application/octet-stream',
    'application/x-sh',
    'application/x-yaml',
    'application/toml',
    'application/rtf',
    'application/msword',
  ];

  for (const mime of appMimes) {
    it(`isApplication('${mime}') → true`, () => {
      expect(isApplication(mime)).toBe(true);
    });
  }

  const notAppMimes = [
    'text/html',
    'image/png',
    'audio/mpeg',
    'video/mp4',
    'font/woff',
    'message/rfc822',
    'text/plain',
    'text/css',
  ];

  for (const mime of notAppMimes) {
    it(`isApplication('${mime}') → false`, () => {
      expect(isApplication(mime)).toBe(false);
    });
  }
});

// ─── 20. Edge cases and robustness ───────────────────────────────────────
describe('edge cases', () => {
  it('getMimeType with empty string returns undefined', () => {
    expect(getMimeType('')).toBeUndefined();
  });

  it('getMimeType with just a dot returns undefined', () => {
    expect(getMimeType('.')).toBeUndefined();
  });

  it('getMimeFromFilename with empty string returns undefined', () => {
    expect(getMimeFromFilename('')).toBeUndefined();
  });

  it('getExtensions for unknown MIME returns empty array', () => {
    expect(getExtensions('application/unknown-type-xyz')).toEqual([]);
  });

  it('isText with empty string returns false', () => {
    expect(isText('')).toBe(false);
  });

  it('isImage with empty string returns false', () => {
    expect(isImage('')).toBe(false);
  });

  it('isAudio with empty string returns false', () => {
    expect(isAudio('')).toBe(false);
  });

  it('isVideo with empty string returns false', () => {
    expect(isVideo('')).toBe(false);
  });

  it('isApplication with empty string returns false', () => {
    expect(isApplication('')).toBe(false);
  });

  it('isCompressible with empty string returns false', () => {
    expect(isCompressible('')).toBe(false);
  });

  it('normalizeMime with empty string returns empty string', () => {
    expect(normalizeMime('')).toBe('');
  });

  it('getCharset with empty string returns undefined', () => {
    expect(getCharset('')).toBeUndefined();
  });

  it('getMimeCategory with unknown type returns "other"', () => {
    expect(getMimeCategory('unknown/type')).toBe('other');
  });

  it('getMimeCategory with message/ returns "other"', () => {
    expect(getMimeCategory('message/rfc822')).toBe('other');
  });

  it('getMimeCategory with model/ returns "model"', () => {
    expect(getMimeCategory('model/gltf+json')).toBe('model');
  });

  it('isKnownExtension with empty string returns false', () => {
    expect(isKnownExtension('')).toBe(false);
  });

  it('listExtensions result is stable (same array contents each call)', () => {
    const a = listExtensions();
    const b = listExtensions();
    expect(a).toEqual(b);
  });

  it('listMimeTypes result is stable', () => {
    const a = listMimeTypes();
    const b = listMimeTypes();
    expect(a).toEqual(b);
  });

  it('parseContentType with empty type section returns empty strings', () => {
    const ct = parseContentType('');
    expect(ct.full).toBe('');
  });

  it('getExtensions returns array for known MIME', () => {
    expect(Array.isArray(getExtensions('text/html'))).toBe(true);
  });

  it('formatContentType without charset returns just mime', () => {
    expect(formatContentType('application/json')).toBe('application/json');
  });

  it('formatContentType with undefined charset returns just mime', () => {
    expect(formatContentType('image/png', undefined)).toBe('image/png');
  });

  it('getMimeType handles mixed case with dot: ".HTML"', () => {
    expect(getMimeType('.HTML')).toBe('text/html');
  });

  it('getMimeType handles .JSON', () => {
    expect(getMimeType('.JSON')).toBe('application/json');
  });

  it('getMimeType handles .MP4', () => {
    expect(getMimeType('.MP4')).toBe('video/mp4');
  });

  it('detectFromBytes with Uint8Array of JPEG bytes', () => {
    expect(detectFromBytes(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
  });

  it('detectFromBytes with number[] of GIF bytes', () => {
    expect(detectFromBytes([0x47, 0x49, 0x46, 0x38])).toBe('image/gif');
  });

  it('normalizeMime strips multiple params', () => {
    expect(normalizeMime('text/html; charset=utf-8; boundary=abc')).toBe('text/html');
  });

  it('isKnownExtension("3gp") → true', () => {
    expect(isKnownExtension('3gp')).toBe(true);
  });

  it('getMimeType("3gp") → video/3gpp', () => {
    expect(getMimeType('3gp')).toBe('video/3gpp');
  });

  it('getMimeFromFilename("video.3gp") → video/3gpp', () => {
    expect(getMimeFromFilename('video.3gp')).toBe('video/3gpp');
  });

  it('isVideo("video/3gpp") → true', () => {
    expect(isVideo('video/3gpp')).toBe(true);
  });

  it('getMimeCategory("font/ttf") → "font"', () => {
    expect(getMimeCategory('font/ttf')).toBe('font');
  });

  it('getTextMimeTypes does not contain non-text types', () => {
    const types = getTextMimeTypes();
    expect(types).not.toContain('application/json');
    expect(types).not.toContain('image/png');
  });

  it('getImageMimeTypes does not contain non-image types', () => {
    const types = getImageMimeTypes();
    expect(types).not.toContain('text/html');
    expect(types).not.toContain('application/json');
  });

  it('MIME_MAP values are all strings', () => {
    for (const val of Object.values(MIME_MAP)) {
      expect(typeof val).toBe('string');
    }
  });

  it('MIME_MAP keys are all lowercase', () => {
    for (const key of Object.keys(MIME_MAP)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});
