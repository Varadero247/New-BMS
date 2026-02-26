// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  join, dirname, basename, extname, normalize, isAbsolute, relative, resolve,
  toUnix, toWindows,
  getMimeType, getExtensionForMime, isImageFile, isVideoFile, isAudioFile,
  isDocumentFile, isArchiveFile,
  formatFileSize, parseFileSize,
  bytesToKb, bytesToMb, bytesToGb, kbToBytes, mbToBytes, gbToBytes,
  sanitizeFilename, isValidFilename, addExtension, changeExtension,
  stripExtension, generateUniqueFilename,
} from '../file-utils';

describe('join', () => {
  it(`join 1: foo+bar => foo/bar`, () => {
    expect(join('foo', 'bar')).toBe('foo/bar');
  });
  it(`join 2: a+b+c => a/b/c`, () => {
    expect(join('a', 'b', 'c')).toBe('a/b/c');
  });
  it(`join 3: /usr+local+bin => /usr/local/bin`, () => {
    expect(join('/usr', 'local', 'bin')).toBe('/usr/local/bin');
  });
  it(`join 4: usr+local+bin => usr/local/bin`, () => {
    expect(join('usr', 'local', 'bin')).toBe('usr/local/bin');
  });
  it(`join 5: foo+bar+baz => foo/bar/baz`, () => {
    expect(join('foo', 'bar', 'baz')).toBe('foo/bar/baz');
  });
  it(`join 6: a+b+c+d+e => a/b/c/d/e`, () => {
    expect(join('a', 'b', 'c', 'd', 'e')).toBe('a/b/c/d/e');
  });
  it(`join 7: src+index.ts => src/index.ts`, () => {
    expect(join('src', 'index.ts')).toBe('src/index.ts');
  });
  it(`join 8: packages+file-utils+src => packages/file-utils/src`, () => {
    expect(join('packages', 'file-utils', 'src')).toBe('packages/file-utils/src');
  });
  it(`join 9: /home+user+docs => /home/user/docs`, () => {
    expect(join('/home', 'user', 'docs')).toBe('/home/user/docs');
  });
  it(`join 10: a++b => a/b`, () => {
    expect(join('a', '', 'b')).toBe('a/b');
  });
  it(`join 11: dist+bundle.js => dist/bundle.js`, () => {
    expect(join('dist', 'bundle.js')).toBe('dist/bundle.js');
  });
  it(`join 12: apps+api-gateway+src => apps/api-gateway/src`, () => {
    expect(join('apps', 'api-gateway', 'src')).toBe('apps/api-gateway/src');
  });
  it(`join 13: one+two => one/two`, () => {
    expect(join('one', 'two')).toBe('one/two');
  });
  it(`join 14: alpha+beta => alpha/beta`, () => {
    expect(join('alpha', 'beta')).toBe('alpha/beta');
  });
  it(`join 15: gamma+delta => gamma/delta`, () => {
    expect(join('gamma', 'delta')).toBe('gamma/delta');
  });
  it(`join 16: x+y+z => x/y/z`, () => {
    expect(join('x', 'y', 'z')).toBe('x/y/z');
  });
  it(`join 17: root+child+grandchild => root/child/grandchild`, () => {
    expect(join('root', 'child', 'grandchild')).toBe('root/child/grandchild');
  });
  it(`join 18: a+b => a/b`, () => {
    expect(join('a', 'b')).toBe('a/b');
  });
  it(`join 19: p+q => p/q`, () => {
    expect(join('p', 'q')).toBe('p/q');
  });
  it(`join 20: m+n+o => m/n/o`, () => {
    expect(join('m', 'n', 'o')).toBe('m/n/o');
  });
  it(`join 21: alpha+one => alpha/one`, () => {
    expect(join('alpha', 'one')).toBe('alpha/one');
  });
  it(`join 22: alpha+two => alpha/two`, () => {
    expect(join('alpha', 'two')).toBe('alpha/two');
  });
  it(`join 23: alpha+three => alpha/three`, () => {
    expect(join('alpha', 'three')).toBe('alpha/three');
  });
  it(`join 24: alpha+four => alpha/four`, () => {
    expect(join('alpha', 'four')).toBe('alpha/four');
  });
  it(`join 25: alpha+five => alpha/five`, () => {
    expect(join('alpha', 'five')).toBe('alpha/five');
  });
  it(`join 26: alpha+six => alpha/six`, () => {
    expect(join('alpha', 'six')).toBe('alpha/six');
  });
  it(`join 27: alpha+seven => alpha/seven`, () => {
    expect(join('alpha', 'seven')).toBe('alpha/seven');
  });
  it(`join 28: alpha+eight => alpha/eight`, () => {
    expect(join('alpha', 'eight')).toBe('alpha/eight');
  });
  it(`join 29: alpha+nine => alpha/nine`, () => {
    expect(join('alpha', 'nine')).toBe('alpha/nine');
  });
  it(`join 30: alpha+ten => alpha/ten`, () => {
    expect(join('alpha', 'ten')).toBe('alpha/ten');
  });
  it(`join 31: beta+one => beta/one`, () => {
    expect(join('beta', 'one')).toBe('beta/one');
  });
  it(`join 32: beta+two => beta/two`, () => {
    expect(join('beta', 'two')).toBe('beta/two');
  });
  it(`join 33: beta+three => beta/three`, () => {
    expect(join('beta', 'three')).toBe('beta/three');
  });
  it(`join 34: beta+four => beta/four`, () => {
    expect(join('beta', 'four')).toBe('beta/four');
  });
  it(`join 35: beta+five => beta/five`, () => {
    expect(join('beta', 'five')).toBe('beta/five');
  });
  it(`join 36: beta+six => beta/six`, () => {
    expect(join('beta', 'six')).toBe('beta/six');
  });
  it(`join 37: beta+seven => beta/seven`, () => {
    expect(join('beta', 'seven')).toBe('beta/seven');
  });
  it(`join 38: beta+eight => beta/eight`, () => {
    expect(join('beta', 'eight')).toBe('beta/eight');
  });
  it(`join 39: beta+nine => beta/nine`, () => {
    expect(join('beta', 'nine')).toBe('beta/nine');
  });
  it(`join 40: beta+ten => beta/ten`, () => {
    expect(join('beta', 'ten')).toBe('beta/ten');
  });
  it(`join 41: gamma+one => gamma/one`, () => {
    expect(join('gamma', 'one')).toBe('gamma/one');
  });
  it(`join 42: gamma+two => gamma/two`, () => {
    expect(join('gamma', 'two')).toBe('gamma/two');
  });
  it(`join 43: gamma+three => gamma/three`, () => {
    expect(join('gamma', 'three')).toBe('gamma/three');
  });
  it(`join 44: gamma+four => gamma/four`, () => {
    expect(join('gamma', 'four')).toBe('gamma/four');
  });
  it(`join 45: gamma+five => gamma/five`, () => {
    expect(join('gamma', 'five')).toBe('gamma/five');
  });
  it(`join 46: gamma+six => gamma/six`, () => {
    expect(join('gamma', 'six')).toBe('gamma/six');
  });
  it(`join 47: gamma+seven => gamma/seven`, () => {
    expect(join('gamma', 'seven')).toBe('gamma/seven');
  });
  it(`join 48: gamma+eight => gamma/eight`, () => {
    expect(join('gamma', 'eight')).toBe('gamma/eight');
  });
  it(`join 49: gamma+nine => gamma/nine`, () => {
    expect(join('gamma', 'nine')).toBe('gamma/nine');
  });
  it(`join 50: gamma+ten => gamma/ten`, () => {
    expect(join('gamma', 'ten')).toBe('gamma/ten');
  });
  it(`join 51: delta+one => delta/one`, () => {
    expect(join('delta', 'one')).toBe('delta/one');
  });
  it(`join 52: delta+two => delta/two`, () => {
    expect(join('delta', 'two')).toBe('delta/two');
  });
  it(`join 53: delta+three => delta/three`, () => {
    expect(join('delta', 'three')).toBe('delta/three');
  });
  it(`join 54: delta+four => delta/four`, () => {
    expect(join('delta', 'four')).toBe('delta/four');
  });
  it(`join 55: delta+five => delta/five`, () => {
    expect(join('delta', 'five')).toBe('delta/five');
  });
  it(`join 56: delta+six => delta/six`, () => {
    expect(join('delta', 'six')).toBe('delta/six');
  });
  it(`join 57: delta+seven => delta/seven`, () => {
    expect(join('delta', 'seven')).toBe('delta/seven');
  });
  it(`join 58: delta+eight => delta/eight`, () => {
    expect(join('delta', 'eight')).toBe('delta/eight');
  });
  it(`join 59: delta+nine => delta/nine`, () => {
    expect(join('delta', 'nine')).toBe('delta/nine');
  });
  it(`join 60: delta+ten => delta/ten`, () => {
    expect(join('delta', 'ten')).toBe('delta/ten');
  });
  it(`join 61: epsilon+one => epsilon/one`, () => {
    expect(join('epsilon', 'one')).toBe('epsilon/one');
  });
  it(`join 62: epsilon+two => epsilon/two`, () => {
    expect(join('epsilon', 'two')).toBe('epsilon/two');
  });
  it(`join 63: epsilon+three => epsilon/three`, () => {
    expect(join('epsilon', 'three')).toBe('epsilon/three');
  });
  it(`join 64: epsilon+four => epsilon/four`, () => {
    expect(join('epsilon', 'four')).toBe('epsilon/four');
  });
  it(`join 65: epsilon+five => epsilon/five`, () => {
    expect(join('epsilon', 'five')).toBe('epsilon/five');
  });
  it(`join 66: epsilon+six => epsilon/six`, () => {
    expect(join('epsilon', 'six')).toBe('epsilon/six');
  });
  it(`join 67: epsilon+seven => epsilon/seven`, () => {
    expect(join('epsilon', 'seven')).toBe('epsilon/seven');
  });
  it(`join 68: epsilon+eight => epsilon/eight`, () => {
    expect(join('epsilon', 'eight')).toBe('epsilon/eight');
  });
  it(`join 69: epsilon+nine => epsilon/nine`, () => {
    expect(join('epsilon', 'nine')).toBe('epsilon/nine');
  });
  it(`join 70: epsilon+ten => epsilon/ten`, () => {
    expect(join('epsilon', 'ten')).toBe('epsilon/ten');
  });
  it(`join 71: zeta+one => zeta/one`, () => {
    expect(join('zeta', 'one')).toBe('zeta/one');
  });
  it(`join 72: zeta+two => zeta/two`, () => {
    expect(join('zeta', 'two')).toBe('zeta/two');
  });
  it(`join 73: zeta+three => zeta/three`, () => {
    expect(join('zeta', 'three')).toBe('zeta/three');
  });
  it(`join 74: zeta+four => zeta/four`, () => {
    expect(join('zeta', 'four')).toBe('zeta/four');
  });
  it(`join 75: zeta+five => zeta/five`, () => {
    expect(join('zeta', 'five')).toBe('zeta/five');
  });
  it(`join 76: zeta+six => zeta/six`, () => {
    expect(join('zeta', 'six')).toBe('zeta/six');
  });
  it(`join 77: zeta+seven => zeta/seven`, () => {
    expect(join('zeta', 'seven')).toBe('zeta/seven');
  });
  it(`join 78: zeta+eight => zeta/eight`, () => {
    expect(join('zeta', 'eight')).toBe('zeta/eight');
  });
  it(`join 79: zeta+nine => zeta/nine`, () => {
    expect(join('zeta', 'nine')).toBe('zeta/nine');
  });
  it(`join 80: zeta+ten => zeta/ten`, () => {
    expect(join('zeta', 'ten')).toBe('zeta/ten');
  });
  it(`join 81: eta+one => eta/one`, () => {
    expect(join('eta', 'one')).toBe('eta/one');
  });
  it(`join 82: eta+two => eta/two`, () => {
    expect(join('eta', 'two')).toBe('eta/two');
  });
  it(`join 83: eta+three => eta/three`, () => {
    expect(join('eta', 'three')).toBe('eta/three');
  });
  it(`join 84: eta+four => eta/four`, () => {
    expect(join('eta', 'four')).toBe('eta/four');
  });
  it(`join 85: eta+five => eta/five`, () => {
    expect(join('eta', 'five')).toBe('eta/five');
  });
  it(`join 86: eta+six => eta/six`, () => {
    expect(join('eta', 'six')).toBe('eta/six');
  });
  it(`join 87: eta+seven => eta/seven`, () => {
    expect(join('eta', 'seven')).toBe('eta/seven');
  });
  it(`join 88: eta+eight => eta/eight`, () => {
    expect(join('eta', 'eight')).toBe('eta/eight');
  });
  it(`join 89: eta+nine => eta/nine`, () => {
    expect(join('eta', 'nine')).toBe('eta/nine');
  });
  it(`join 90: eta+ten => eta/ten`, () => {
    expect(join('eta', 'ten')).toBe('eta/ten');
  });
  it(`join 91: theta+one => theta/one`, () => {
    expect(join('theta', 'one')).toBe('theta/one');
  });
  it(`join 92: theta+two => theta/two`, () => {
    expect(join('theta', 'two')).toBe('theta/two');
  });
  it(`join 93: theta+three => theta/three`, () => {
    expect(join('theta', 'three')).toBe('theta/three');
  });
  it(`join 94: theta+four => theta/four`, () => {
    expect(join('theta', 'four')).toBe('theta/four');
  });
  it(`join 95: theta+five => theta/five`, () => {
    expect(join('theta', 'five')).toBe('theta/five');
  });
  it(`join 96: theta+six => theta/six`, () => {
    expect(join('theta', 'six')).toBe('theta/six');
  });
  it(`join 97: theta+seven => theta/seven`, () => {
    expect(join('theta', 'seven')).toBe('theta/seven');
  });
  it(`join 98: theta+eight => theta/eight`, () => {
    expect(join('theta', 'eight')).toBe('theta/eight');
  });
  it(`join 99: theta+nine => theta/nine`, () => {
    expect(join('theta', 'nine')).toBe('theta/nine');
  });
  it(`join 100: theta+ten => theta/ten`, () => {
    expect(join('theta', 'ten')).toBe('theta/ten');
  });
});

describe('dirname', () => {
  it(`dirname 1`, () => {
    expect(dirname('/foo/bar/baz.ts')).toBe('/foo/bar');
  });
  it(`dirname 2`, () => {
    expect(dirname('/foo/bar')).toBe('/foo');
  });
  it(`dirname 3`, () => {
    expect(dirname('/foo')).toBe('/');
  });
  it(`dirname 4`, () => {
    expect(dirname('/')).toBe('/');
  });
  it(`dirname 5`, () => {
    expect(dirname('foo/bar')).toBe('foo');
  });
  it(`dirname 6`, () => {
    expect(dirname('foo')).toBe('.');
  });
  it(`dirname 7`, () => {
    expect(dirname('')).toBe('.');
  });
  it(`dirname 8`, () => {
    expect(dirname('./foo/bar.txt')).toBe('./foo');
  });
  it(`dirname 9`, () => {
    expect(dirname('/a/b/c/d')).toBe('/a/b/c');
  });
  it(`dirname 10`, () => {
    expect(dirname('a/b/c')).toBe('a/b');
  });
  it(`dirname 11`, () => {
    expect(dirname('/usr/local/bin/node')).toBe('/usr/local/bin');
  });
  it(`dirname 12`, () => {
    expect(dirname('src/routes/auth.ts')).toBe('src/routes');
  });
  it(`dirname 13`, () => {
    expect(dirname('index.ts')).toBe('.');
  });
  it(`dirname 14`, () => {
    expect(dirname('/var/log/app.log')).toBe('/var/log');
  });
  it(`dirname 15`, () => {
    expect(dirname('packages/ui/src/modal.tsx')).toBe('packages/ui/src');
  });
  it(`dirname 16`, () => {
    expect(dirname('apps/api-gateway/src/index.ts')).toBe('apps/api-gateway/src');
  });
  it(`dirname 17`, () => {
    expect(dirname('/home/user/.bashrc')).toBe('/home/user');
  });
  it(`dirname 18`, () => {
    expect(dirname('dist/bundle.js')).toBe('dist');
  });
  it(`dirname 19`, () => {
    expect(dirname('a')).toBe('.');
  });
  it(`dirname 20`, () => {
    expect(dirname('/x/y')).toBe('/x');
  });
  it(`dirname 21`, () => {
    expect(dirname('/a/b/c')).toBe('/a/b');
  });
  it(`dirname 22`, () => {
    expect(dirname('src/lib')).toBe('src');
  });
  it(`dirname 23`, () => {
    expect(dirname('packages/utils/src/index.ts')).toBe('packages/utils/src');
  });
  it(`dirname 24`, () => {
    expect(dirname('apps/web/public')).toBe('apps/web');
  });
  it(`dirname 25`, () => {
    expect(dirname('/etc/nginx/nginx.conf')).toBe('/etc/nginx');
  });
  it(`dirname 26`, () => {
    expect(dirname('/home/ubuntu')).toBe('/home');
  });
  it(`dirname 27`, () => {
    expect(dirname('foo/bar/baz')).toBe('foo/bar');
  });
  it(`dirname 28`, () => {
    expect(dirname('one/two/three')).toBe('one/two');
  });
  it(`dirname 29`, () => {
    expect(dirname('a/b')).toBe('a');
  });
  it(`dirname 30`, () => {
    expect(dirname('/tmp/file.txt')).toBe('/tmp');
  });
  it(`dirname 31`, () => {
    expect(dirname('deep/nested/path/file.ts')).toBe('deep/nested/path');
  });
  it(`dirname 32`, () => {
    expect(dirname('single')).toBe('.');
  });
  it(`dirname 33`, () => {
    expect(dirname('a/b/c/d')).toBe('a/b/c');
  });
  it(`dirname 34`, () => {
    expect(dirname('root/sub')).toBe('root');
  });
});

describe('basename', () => {
  it(`basename 1`, () => {
    expect(basename('/foo/bar/baz.ts')).toBe('baz.ts');
  });
  it(`basename 2`, () => {
    expect(basename('/foo/bar/baz.ts', '.ts')).toBe('baz');
  });
  it(`basename 3`, () => {
    expect(basename('/foo/bar/baz')).toBe('baz');
  });
  it(`basename 4`, () => {
    expect(basename('index.ts')).toBe('index.ts');
  });
  it(`basename 5`, () => {
    expect(basename('index.ts', '.ts')).toBe('index');
  });
  it(`basename 6`, () => {
    expect(basename('src/routes/auth.ts')).toBe('auth.ts');
  });
  it(`basename 7`, () => {
    expect(basename('src/routes/auth.ts', '.ts')).toBe('auth');
  });
  it(`basename 8`, () => {
    expect(basename('file.test.ts')).toBe('file.test.ts');
  });
  it(`basename 9`, () => {
    expect(basename('file.test.ts', '.ts')).toBe('file.test');
  });
  it(`basename 10`, () => {
    expect(basename('readme.md')).toBe('readme.md');
  });
  it(`basename 11`, () => {
    expect(basename('/usr/local/bin/node')).toBe('node');
  });
  it(`basename 12`, () => {
    expect(basename('.gitignore')).toBe('.gitignore');
  });
  it(`basename 13`, () => {
    expect(basename('a.b.c.d')).toBe('a.b.c.d');
  });
  it(`basename 14`, () => {
    expect(basename('a.b.c.d', '.d')).toBe('a.b.c');
  });
  it(`basename 15`, () => {
    expect(basename('noext')).toBe('noext');
  });
  it(`basename 16`, () => {
    expect(basename('/deep/path/to/file.json')).toBe('file.json');
  });
  it(`basename 17`, () => {
    expect(basename('/deep/path/to/file.json', '.json')).toBe('file');
  });
  it(`basename 18`, () => {
    expect(basename('archive.tar.gz')).toBe('archive.tar.gz');
  });
  it(`basename 19`, () => {
    expect(basename('photo.jpg')).toBe('photo.jpg');
  });
  it(`basename 20`, () => {
    expect(basename('style.min.css')).toBe('style.min.css');
  });
  it(`basename 21`, () => {
    expect(basename('style.min.css', '.css')).toBe('style.min');
  });
  it(`basename 22`, () => {
    expect(basename('bundle.js')).toBe('bundle.js');
  });
  it(`basename 23`, () => {
    expect(basename('bundle.js', '.js')).toBe('bundle');
  });
  it(`basename 24`, () => {
    expect(basename('data.csv')).toBe('data.csv');
  });
  it(`basename 25`, () => {
    expect(basename('config.yaml')).toBe('config.yaml');
  });
  it(`basename 26`, () => {
    expect(basename('image.png')).toBe('image.png');
  });
  it(`basename 27`, () => {
    expect(basename('image.png', '.png')).toBe('image');
  });
  it(`basename 28`, () => {
    expect(basename('video.mp4')).toBe('video.mp4');
  });
  it(`basename 29`, () => {
    expect(basename('audio.mp3')).toBe('audio.mp3');
  });
  it(`basename 30`, () => {
    expect(basename('slide.pptx')).toBe('slide.pptx');
  });
  it(`basename 31`, () => {
    expect(basename('slide.pptx', '.pptx')).toBe('slide');
  });
  it(`basename 32`, () => {
    expect(basename('report.pdf')).toBe('report.pdf');
  });
  it(`basename 33`, () => {
    expect(basename('report.pdf', '.pdf')).toBe('report');
  });
  it(`basename 34`, () => {
    expect(basename('app.ts', '.ts')).toBe('app');
  });
});

describe('extname', () => {
  it(`extname 1`, () => {
    expect(extname('file.ts')).toBe('.ts');
  });
  it(`extname 2`, () => {
    expect(extname('file.test.ts')).toBe('.ts');
  });
  it(`extname 3`, () => {
    expect(extname('archive.tar.gz')).toBe('.gz');
  });
  it(`extname 4`, () => {
    expect(extname('photo.jpg')).toBe('.jpg');
  });
  it(`extname 5`, () => {
    expect(extname('photo.JPEG')).toBe('.JPEG');
  });
  it(`extname 6`, () => {
    expect(extname('document.pdf')).toBe('.pdf');
  });
  it(`extname 7`, () => {
    expect(extname('noext')).toBe('');
  });
  it(`extname 8`, () => {
    expect(extname('.gitignore')).toBe('');
  });
  it(`extname 9`, () => {
    expect(extname('.env')).toBe('');
  });
  it(`extname 10`, () => {
    expect(extname('index.html')).toBe('.html');
  });
  it(`extname 11`, () => {
    expect(extname('bundle.min.js')).toBe('.js');
  });
  it(`extname 12`, () => {
    expect(extname('data.json')).toBe('.json');
  });
  it(`extname 13`, () => {
    expect(extname('style.css')).toBe('.css');
  });
  it(`extname 14`, () => {
    expect(extname('image.png')).toBe('.png');
  });
  it(`extname 15`, () => {
    expect(extname('video.mp4')).toBe('.mp4');
  });
  it(`extname 16`, () => {
    expect(extname('audio.mp3')).toBe('.mp3');
  });
  it(`extname 17`, () => {
    expect(extname('spreadsheet.xlsx')).toBe('.xlsx');
  });
  it(`extname 18`, () => {
    expect(extname('presentation.pptx')).toBe('.pptx');
  });
  it(`extname 19`, () => {
    expect(extname('word.docx')).toBe('.docx');
  });
  it(`extname 20`, () => {
    expect(extname('archive.zip')).toBe('.zip');
  });
  it(`extname 21`, () => {
    expect(extname('archive.tar')).toBe('.tar');
  });
  it(`extname 22`, () => {
    expect(extname('archive.7z')).toBe('.7z');
  });
  it(`extname 23`, () => {
    expect(extname('script.sh')).toBe('.sh');
  });
  it(`extname 24`, () => {
    expect(extname('config.yaml')).toBe('.yaml');
  });
  it(`extname 25`, () => {
    expect(extname('config.yml')).toBe('.yml');
  });
  it(`extname 26`, () => {
    expect(extname('data.csv')).toBe('.csv');
  });
  it(`extname 27`, () => {
    expect(extname('readme.md')).toBe('.md');
  });
  it(`extname 28`, () => {
    expect(extname('image.svg')).toBe('.svg');
  });
  it(`extname 29`, () => {
    expect(extname('binary.bin')).toBe('.bin');
  });
  it(`extname 30`, () => {
    expect(extname('executable.exe')).toBe('.exe');
  });
  it(`extname 31`, () => {
    expect(extname('a.b')).toBe('.b');
  });
  it(`extname 32`, () => {
    expect(extname('/path/to/file.ts')).toBe('.ts');
  });
  it(`extname 33`, () => {
    expect(extname('report.xlsx')).toBe('.xlsx');
  });
  it(`extname 34`, () => {
    expect(extname('notes.txt')).toBe('.txt');
  });
});

describe('normalize', () => {
  it(`normalize 1`, () => {
    expect(normalize('foo/bar')).toBe('foo/bar');
  });
  it(`normalize 2`, () => {
    expect(normalize('./foo/bar')).toBe('foo/bar');
  });
  it(`normalize 3`, () => {
    expect(normalize('foo/./bar')).toBe('foo/bar');
  });
  it(`normalize 4`, () => {
    expect(normalize('foo/../bar')).toBe('bar');
  });
  it(`normalize 5`, () => {
    expect(normalize('foo/bar/../baz')).toBe('foo/baz');
  });
  it(`normalize 6`, () => {
    expect(normalize('/foo/bar')).toBe('/foo/bar');
  });
  it(`normalize 7`, () => {
    expect(normalize('/foo/../bar')).toBe('/bar');
  });
  it(`normalize 8`, () => {
    expect(normalize('/foo/./bar')).toBe('/foo/bar');
  });
  it(`normalize 9`, () => {
    expect(normalize('')).toBe('.');
  });
  it(`normalize 10`, () => {
    expect(normalize('.')).toBe('.');
  });
  it(`normalize 11`, () => {
    expect(normalize('..')).toBe('..');
  });
  it(`normalize 12`, () => {
    expect(normalize('../foo')).toBe('../foo');
  });
  it(`normalize 13`, () => {
    expect(normalize('../../foo')).toBe('../../foo');
  });
  it(`normalize 14`, () => {
    expect(normalize('foo//bar')).toBe('foo/bar');
  });
  it(`normalize 15`, () => {
    expect(normalize('/foo//bar')).toBe('/foo/bar');
  });
  it(`normalize 16`, () => {
    expect(normalize('foo/bar/')).toBe('foo/bar');
  });
  it(`normalize 17`, () => {
    expect(normalize('/foo/bar/')).toBe('/foo/bar');
  });
  it(`normalize 18`, () => {
    expect(normalize('./')).toBe('.');
  });
  it(`normalize 19`, () => {
    expect(normalize('a/b/c/../../d')).toBe('a/d');
  });
  it(`normalize 20`, () => {
    expect(normalize('a/b/c/../../../d')).toBe('d');
  });
  it(`normalize 21`, () => {
    expect(normalize('/a/b/c/../../../d')).toBe('/d');
  });
  it(`normalize 22`, () => {
    expect(normalize('foo/bar/baz/../..')).toBe('foo');
  });
  it(`normalize 23`, () => {
    expect(normalize('./foo/./bar/./baz')).toBe('foo/bar/baz');
  });
  it(`normalize 24`, () => {
    expect(normalize('a//b//c')).toBe('a/b/c');
  });
  it(`normalize 25`, () => {
    expect(normalize('/a//b//c')).toBe('/a/b/c');
  });
  it(`normalize 26`, () => {
    expect(normalize('src/../dist/index.js')).toBe('dist/index.js');
  });
  it(`normalize 27`, () => {
    expect(normalize('./src/./index.ts')).toBe('src/index.ts');
  });
  it(`normalize 28`, () => {
    expect(normalize('a/b/../../c/d')).toBe('c/d');
  });
  it(`normalize 29`, () => {
    expect(normalize('a/b/../c/../d')).toBe('a/d');
  });
  it(`normalize 30`, () => {
    expect(normalize('/usr/local/../bin')).toBe('/usr/bin');
  });
  it(`normalize 31`, () => {
    expect(normalize('./alpha/bar')).toBe('alpha/bar');
  });
  it(`normalize 32`, () => {
    expect(normalize('alpha/./bar')).toBe('alpha/bar');
  });
  it(`normalize 33`, () => {
    expect(normalize('alpha/../bar')).toBe('bar');
  });
  it(`normalize 34`, () => {
    expect(normalize('/root/alpha/sub')).toBe('/root/alpha/sub');
  });
  it(`normalize 35`, () => {
    expect(normalize('alpha/sub/../other')).toBe('alpha/other');
  });
  it(`normalize 36`, () => {
    expect(normalize('./beta/bar')).toBe('beta/bar');
  });
  it(`normalize 37`, () => {
    expect(normalize('beta/./bar')).toBe('beta/bar');
  });
  it(`normalize 38`, () => {
    expect(normalize('beta/../bar')).toBe('bar');
  });
  it(`normalize 39`, () => {
    expect(normalize('/root/beta/sub')).toBe('/root/beta/sub');
  });
  it(`normalize 40`, () => {
    expect(normalize('beta/sub/../other')).toBe('beta/other');
  });
  it(`normalize 41`, () => {
    expect(normalize('./gamma/bar')).toBe('gamma/bar');
  });
  it(`normalize 42`, () => {
    expect(normalize('gamma/./bar')).toBe('gamma/bar');
  });
  it(`normalize 43`, () => {
    expect(normalize('gamma/../bar')).toBe('bar');
  });
  it(`normalize 44`, () => {
    expect(normalize('/root/gamma/sub')).toBe('/root/gamma/sub');
  });
  it(`normalize 45`, () => {
    expect(normalize('gamma/sub/../other')).toBe('gamma/other');
  });
  it(`normalize 46`, () => {
    expect(normalize('./delta/bar')).toBe('delta/bar');
  });
  it(`normalize 47`, () => {
    expect(normalize('delta/./bar')).toBe('delta/bar');
  });
  it(`normalize 48`, () => {
    expect(normalize('delta/../bar')).toBe('bar');
  });
  it(`normalize 49`, () => {
    expect(normalize('/root/delta/sub')).toBe('/root/delta/sub');
  });
  it(`normalize 50`, () => {
    expect(normalize('delta/sub/../other')).toBe('delta/other');
  });
  it(`normalize 51`, () => {
    expect(normalize('./epsilon/bar')).toBe('epsilon/bar');
  });
  it(`normalize 52`, () => {
    expect(normalize('epsilon/./bar')).toBe('epsilon/bar');
  });
  it(`normalize 53`, () => {
    expect(normalize('epsilon/../bar')).toBe('bar');
  });
  it(`normalize 54`, () => {
    expect(normalize('/root/epsilon/sub')).toBe('/root/epsilon/sub');
  });
  it(`normalize 55`, () => {
    expect(normalize('epsilon/sub/../other')).toBe('epsilon/other');
  });
  it(`normalize 56`, () => {
    expect(normalize('./zeta/bar')).toBe('zeta/bar');
  });
  it(`normalize 57`, () => {
    expect(normalize('zeta/./bar')).toBe('zeta/bar');
  });
  it(`normalize 58`, () => {
    expect(normalize('zeta/../bar')).toBe('bar');
  });
  it(`normalize 59`, () => {
    expect(normalize('/root/zeta/sub')).toBe('/root/zeta/sub');
  });
  it(`normalize 60`, () => {
    expect(normalize('zeta/sub/../other')).toBe('zeta/other');
  });
  it(`normalize 61`, () => {
    expect(normalize('./eta/bar')).toBe('eta/bar');
  });
  it(`normalize 62`, () => {
    expect(normalize('eta/./bar')).toBe('eta/bar');
  });
  it(`normalize 63`, () => {
    expect(normalize('eta/../bar')).toBe('bar');
  });
  it(`normalize 64`, () => {
    expect(normalize('/root/eta/sub')).toBe('/root/eta/sub');
  });
  it(`normalize 65`, () => {
    expect(normalize('eta/sub/../other')).toBe('eta/other');
  });
  it(`normalize 66`, () => {
    expect(normalize('./theta/bar')).toBe('theta/bar');
  });
  it(`normalize 67`, () => {
    expect(normalize('theta/./bar')).toBe('theta/bar');
  });
  it(`normalize 68`, () => {
    expect(normalize('theta/../bar')).toBe('bar');
  });
  it(`normalize 69`, () => {
    expect(normalize('/root/theta/sub')).toBe('/root/theta/sub');
  });
  it(`normalize 70`, () => {
    expect(normalize('theta/sub/../other')).toBe('theta/other');
  });
  it(`normalize 71`, () => {
    expect(normalize('./iota/bar')).toBe('iota/bar');
  });
  it(`normalize 72`, () => {
    expect(normalize('iota/./bar')).toBe('iota/bar');
  });
  it(`normalize 73`, () => {
    expect(normalize('iota/../bar')).toBe('bar');
  });
  it(`normalize 74`, () => {
    expect(normalize('/root/iota/sub')).toBe('/root/iota/sub');
  });
  it(`normalize 75`, () => {
    expect(normalize('iota/sub/../other')).toBe('iota/other');
  });
  it(`normalize 76`, () => {
    expect(normalize('./kappa/bar')).toBe('kappa/bar');
  });
  it(`normalize 77`, () => {
    expect(normalize('kappa/./bar')).toBe('kappa/bar');
  });
  it(`normalize 78`, () => {
    expect(normalize('kappa/../bar')).toBe('bar');
  });
  it(`normalize 79`, () => {
    expect(normalize('/root/kappa/sub')).toBe('/root/kappa/sub');
  });
  it(`normalize 80`, () => {
    expect(normalize('kappa/sub/../other')).toBe('kappa/other');
  });
  it(`normalize 81`, () => {
    expect(normalize('./lambda/bar')).toBe('lambda/bar');
  });
  it(`normalize 82`, () => {
    expect(normalize('lambda/./bar')).toBe('lambda/bar');
  });
  it(`normalize 83`, () => {
    expect(normalize('lambda/../bar')).toBe('bar');
  });
  it(`normalize 84`, () => {
    expect(normalize('/root/lambda/sub')).toBe('/root/lambda/sub');
  });
  it(`normalize 85`, () => {
    expect(normalize('lambda/sub/../other')).toBe('lambda/other');
  });
  it(`normalize 86`, () => {
    expect(normalize('./mu/bar')).toBe('mu/bar');
  });
  it(`normalize 87`, () => {
    expect(normalize('mu/./bar')).toBe('mu/bar');
  });
  it(`normalize 88`, () => {
    expect(normalize('mu/../bar')).toBe('bar');
  });
  it(`normalize 89`, () => {
    expect(normalize('/root/mu/sub')).toBe('/root/mu/sub');
  });
  it(`normalize 90`, () => {
    expect(normalize('mu/sub/../other')).toBe('mu/other');
  });
  it(`normalize 91`, () => {
    expect(normalize('./nu/bar')).toBe('nu/bar');
  });
  it(`normalize 92`, () => {
    expect(normalize('nu/./bar')).toBe('nu/bar');
  });
  it(`normalize 93`, () => {
    expect(normalize('nu/../bar')).toBe('bar');
  });
  it(`normalize 94`, () => {
    expect(normalize('/root/nu/sub')).toBe('/root/nu/sub');
  });
  it(`normalize 95`, () => {
    expect(normalize('nu/sub/../other')).toBe('nu/other');
  });
  it(`normalize 96`, () => {
    expect(normalize('./xi/bar')).toBe('xi/bar');
  });
  it(`normalize 97`, () => {
    expect(normalize('xi/./bar')).toBe('xi/bar');
  });
  it(`normalize 98`, () => {
    expect(normalize('xi/../bar')).toBe('bar');
  });
  it(`normalize 99`, () => {
    expect(normalize('/root/xi/sub')).toBe('/root/xi/sub');
  });
  it(`normalize 100`, () => {
    expect(normalize('xi/sub/../other')).toBe('xi/other');
  });
});

describe('isAbsolute', () => {
  it(`isAbsolute 1`, () => {
    expect(isAbsolute('/foo/bar')).toBe(true);
  });
  it(`isAbsolute 2`, () => {
    expect(isAbsolute('/')).toBe(true);
  });
  it(`isAbsolute 3`, () => {
    expect(isAbsolute('/usr/local')).toBe(true);
  });
  it(`isAbsolute 4`, () => {
    expect(isAbsolute('foo/bar')).toBe(false);
  });
  it(`isAbsolute 5`, () => {
    expect(isAbsolute('.')).toBe(false);
  });
  it(`isAbsolute 6`, () => {
    expect(isAbsolute('..')).toBe(false);
  });
  it(`isAbsolute 7`, () => {
    expect(isAbsolute('')).toBe(false);
  });
  it(`isAbsolute 8`, () => {
    expect(isAbsolute('./foo')).toBe(false);
  });
  it(`isAbsolute 9`, () => {
    expect(isAbsolute('../foo')).toBe(false);
  });
  it(`isAbsolute 10`, () => {
    expect(isAbsolute('relative/path')).toBe(false);
  });
  it(`isAbsolute 11`, () => {
    expect(isAbsolute('C:/Windows')).toBe(true);
  });
  it(`isAbsolute 12`, () => {
    expect(isAbsolute('D:/Users')).toBe(true);
  });
  it(`isAbsolute 13`, () => {
    expect(isAbsolute('c:/windows')).toBe(true);
  });
  it(`isAbsolute 14`, () => {
    expect(isAbsolute('notabs')).toBe(false);
  });
  it(`isAbsolute 15`, () => {
    expect(isAbsolute('a/b/c')).toBe(false);
  });
  it(`isAbsolute 16`, () => {
    expect(isAbsolute('/a')).toBe(true);
  });
  it(`isAbsolute 17`, () => {
    expect(isAbsolute('/home/user/.bashrc')).toBe(true);
  });
  it(`isAbsolute 18`, () => {
    expect(isAbsolute('home/user/.bashrc')).toBe(false);
  });
  it(`isAbsolute 19`, () => {
    expect(isAbsolute('/tmp')).toBe(true);
  });
  it(`isAbsolute 20`, () => {
    expect(isAbsolute('tmp')).toBe(false);
  });
});

describe('relative', () => {
  it(`relative 1`, () => {
    expect(relative('/foo/bar', '/foo/baz')).toBe('../baz');
  });
  it(`relative 2`, () => {
    expect(relative('/foo/bar', '/foo/bar/baz')).toBe('baz');
  });
  it(`relative 3`, () => {
    expect(relative('/foo/bar/baz', '/foo/bar')).toBe('..');
  });
  it(`relative 4`, () => {
    expect(relative('/foo', '/bar')).toBe('../bar');
  });
  it(`relative 5`, () => {
    expect(relative('a/b', 'a/b/c')).toBe('c');
  });
  it(`relative 6`, () => {
    expect(relative('a/b/c', 'a/b')).toBe('..');
  });
  it(`relative 7`, () => {
    expect(relative('a/b', 'a/c')).toBe('../c');
  });
  it(`relative 8`, () => {
    expect(relative('.', 'foo')).toBe('foo');
  });
  it(`relative 9`, () => {
    expect(relative('foo', 'foo')).toBe('.');
  });
  it(`relative 10`, () => {
    expect(relative('src', 'dist')).toBe('../dist');
  });
  it(`relative 11`, () => {
    expect(relative('src/a', 'src/b')).toBe('../b');
  });
  it(`relative 12`, () => {
    expect(relative('src/a/b', 'src/a/c')).toBe('../c');
  });
  it(`relative 13`, () => {
    expect(relative('src/a/b/c', 'src/a')).toBe('../..');
  });
  it(`relative 14`, () => {
    expect(relative('a/b/c/d', 'a/b/e')).toBe('../../e');
  });
  it(`relative 15`, () => {
    expect(relative('.', '.')).toBe('.');
  });
  it(`relative 16`, () => {
    expect(relative('a', 'a')).toBe('.');
  });
  it(`relative 17`, () => {
    expect(relative('a/b', 'c/d')).toBe('../../c/d');
  });
  it(`relative 18`, () => {
    expect(relative('x/y/z', 'x')).toBe('../..');
  });
  it(`relative 19`, () => {
    expect(relative('x', 'x/y/z')).toBe('y/z');
  });
  it(`relative 20`, () => {
    expect(relative('a/b/c', 'd/e/f')).toBe('../../../d/e/f');
  });
});

describe('toUnix', () => {
  it(`toUnix 1`, () => {
    expect(toUnix('C:\\Users\\foo\\bar')).toBe('C:/Users/foo/bar');
  });
  it(`toUnix 2`, () => {
    expect(toUnix('foo\\bar\\baz')).toBe('foo/bar/baz');
  });
  it(`toUnix 3`, () => {
    expect(toUnix('no\\slashes\\here')).toBe('no/slashes/here');
  });
  it(`toUnix 4`, () => {
    expect(toUnix('already/unix')).toBe('already/unix');
  });
  it(`toUnix 5`, () => {
    expect(toUnix('mixed\\path/here')).toBe('mixed/path/here');
  });
  it(`toUnix 6`, () => {
    expect(toUnix('')).toBe('');
  });
  it(`toUnix 7`, () => {
    expect(toUnix('single\\')).toBe('single/');
  });
  it(`toUnix 8`, () => {
    expect(toUnix('\\root')).toBe('/root');
  });
  it(`toUnix 9`, () => {
    expect(toUnix('C:\\Windows\\System32')).toBe('C:/Windows/System32');
  });
  it(`toUnix 10`, () => {
    expect(toUnix('a\\b\\c\\d')).toBe('a/b/c/d');
  });
});

describe('toWindows', () => {
  it(`toWindows 1`, () => {
    expect(toWindows('C:/Users/foo/bar')).toBe('C:\\Users\\foo\\bar');
  });
  it(`toWindows 2`, () => {
    expect(toWindows('foo/bar/baz')).toBe('foo\\bar\\baz');
  });
  it(`toWindows 3`, () => {
    expect(toWindows('already\\windows')).toBe('already\\windows');
  });
  it(`toWindows 4`, () => {
    expect(toWindows('mixed/path\\here')).toBe('mixed\\path\\here');
  });
  it(`toWindows 5`, () => {
    expect(toWindows('')).toBe('');
  });
  it(`toWindows 6`, () => {
    expect(toWindows('single/')).toBe('single\\');
  });
  it(`toWindows 7`, () => {
    expect(toWindows('/root')).toBe('\\root');
  });
  it(`toWindows 8`, () => {
    expect(toWindows('/usr/local/bin')).toBe('\\usr\\local\\bin');
  });
  it(`toWindows 9`, () => {
    expect(toWindows('a/b/c/d')).toBe('a\\b\\c\\d');
  });
  it(`toWindows 10`, () => {
    expect(toWindows('src/index.ts')).toBe('src\\index.ts');
  });
});

describe('getMimeType', () => {
  it(`getMimeType 1: photo.jpg`, () => {
    expect(getMimeType('photo.jpg')).toBe('image/jpeg');
  });
  it(`getMimeType 2: photo.jpeg`, () => {
    expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
  });
  it(`getMimeType 3: image.png`, () => {
    expect(getMimeType('image.png')).toBe('image/png');
  });
  it(`getMimeType 4: anim.gif`, () => {
    expect(getMimeType('anim.gif')).toBe('image/gif');
  });
  it(`getMimeType 5: icon.bmp`, () => {
    expect(getMimeType('icon.bmp')).toBe('image/bmp');
  });
  it(`getMimeType 6: web.webp`, () => {
    expect(getMimeType('web.webp')).toBe('image/webp');
  });
  it(`getMimeType 7: logo.svg`, () => {
    expect(getMimeType('logo.svg')).toBe('image/svg+xml');
  });
  it(`getMimeType 8: fav.ico`, () => {
    expect(getMimeType('fav.ico')).toBe('image/x-icon');
  });
  it(`getMimeType 9: scan.tiff`, () => {
    expect(getMimeType('scan.tiff')).toBe('image/tiff');
  });
  it(`getMimeType 10: scan.tif`, () => {
    expect(getMimeType('scan.tif')).toBe('image/tiff');
  });
  it(`getMimeType 11: next.avif`, () => {
    expect(getMimeType('next.avif')).toBe('image/avif');
  });
  it(`getMimeType 12: apple.heic`, () => {
    expect(getMimeType('apple.heic')).toBe('image/heic');
  });
  it(`getMimeType 13: apple.heif`, () => {
    expect(getMimeType('apple.heif')).toBe('image/heif');
  });
  it(`getMimeType 14: clip.mp4`, () => {
    expect(getMimeType('clip.mp4')).toBe('video/mp4');
  });
  it(`getMimeType 15: web.webm`, () => {
    expect(getMimeType('web.webm')).toBe('video/webm');
  });
  it(`getMimeType 16: video.ogg`, () => {
    expect(getMimeType('video.ogg')).toBe('video/ogg');
  });
  it(`getMimeType 17: old.avi`, () => {
    expect(getMimeType('old.avi')).toBe('video/x-msvideo');
  });
  it(`getMimeType 18: apple.mov`, () => {
    expect(getMimeType('apple.mov')).toBe('video/quicktime');
  });
  it(`getMimeType 19: hd.mkv`, () => {
    expect(getMimeType('hd.mkv')).toBe('video/x-matroska');
  });
  it(`getMimeType 20: old.flv`, () => {
    expect(getMimeType('old.flv')).toBe('video/x-flv');
  });
  it(`getMimeType 21: win.wmv`, () => {
    expect(getMimeType('win.wmv')).toBe('video/x-ms-wmv');
  });
  it(`getMimeType 22: itunes.m4v`, () => {
    expect(getMimeType('itunes.m4v')).toBe('video/x-m4v');
  });
  it(`getMimeType 23: mobile.3gp`, () => {
    expect(getMimeType('mobile.3gp')).toBe('video/3gpp');
  });
  it(`getMimeType 24: song.mp3`, () => {
    expect(getMimeType('song.mp3')).toBe('audio/mpeg');
  });
  it(`getMimeType 25: sound.wav`, () => {
    expect(getMimeType('sound.wav')).toBe('audio/wav');
  });
  it(`getMimeType 26: lossless.flac`, () => {
    expect(getMimeType('lossless.flac')).toBe('audio/flac');
  });
  it(`getMimeType 27: aac.aac`, () => {
    expect(getMimeType('aac.aac')).toBe('audio/aac');
  });
  it(`getMimeType 28: itunes.m4a`, () => {
    expect(getMimeType('itunes.m4a')).toBe('audio/mp4');
  });
  it(`getMimeType 29: vorbis.oga`, () => {
    expect(getMimeType('vorbis.oga')).toBe('audio/ogg');
  });
  it(`getMimeType 30: opus.opus`, () => {
    expect(getMimeType('opus.opus')).toBe('audio/opus');
  });
  it(`getMimeType 31: wm.wma`, () => {
    expect(getMimeType('wm.wma')).toBe('audio/x-ms-wma');
  });
  it(`getMimeType 32: cd.aiff`, () => {
    expect(getMimeType('cd.aiff')).toBe('audio/aiff');
  });
  it(`getMimeType 33: doc.pdf`, () => {
    expect(getMimeType('doc.pdf')).toBe('application/pdf');
  });
  it(`getMimeType 34: old.doc`, () => {
    expect(getMimeType('old.doc')).toBe('application/msword');
  });
  it(`getMimeType 35: new.docx`, () => {
    expect(getMimeType('new.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });
  it(`getMimeType 36: sheet.xls`, () => {
    expect(getMimeType('sheet.xls')).toBe('application/vnd.ms-excel');
  });
  it(`getMimeType 37: sheet.xlsx`, () => {
    expect(getMimeType('sheet.xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
  it(`getMimeType 38: slide.ppt`, () => {
    expect(getMimeType('slide.ppt')).toBe('application/vnd.ms-powerpoint');
  });
  it(`getMimeType 39: slide.pptx`, () => {
    expect(getMimeType('slide.pptx')).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
  });
  it(`getMimeType 40: notes.txt`, () => {
    expect(getMimeType('notes.txt')).toBe('text/plain');
  });
  it(`getMimeType 41: data.csv`, () => {
    expect(getMimeType('data.csv')).toBe('text/csv');
  });
  it(`getMimeType 42: readme.md`, () => {
    expect(getMimeType('readme.md')).toBe('text/markdown');
  });
  it(`getMimeType 43: page.html`, () => {
    expect(getMimeType('page.html')).toBe('text/html');
  });
  it(`getMimeType 44: page.htm`, () => {
    expect(getMimeType('page.htm')).toBe('text/html');
  });
  it(`getMimeType 45: config.xml`, () => {
    expect(getMimeType('config.xml')).toBe('application/xml');
  });
  it(`getMimeType 46: data.json`, () => {
    expect(getMimeType('data.json')).toBe('application/json');
  });
  it(`getMimeType 47: rtf.rtf`, () => {
    expect(getMimeType('rtf.rtf')).toBe('application/rtf');
  });
  it(`getMimeType 48: package.zip`, () => {
    expect(getMimeType('package.zip')).toBe('application/zip');
  });
  it(`getMimeType 49: backup.tar`, () => {
    expect(getMimeType('backup.tar')).toBe('application/x-tar');
  });
  it(`getMimeType 50: comp.gz`, () => {
    expect(getMimeType('comp.gz')).toBe('application/gzip');
  });
  it(`getMimeType 51: comp.bz2`, () => {
    expect(getMimeType('comp.bz2')).toBe('application/x-bzip2');
  });
  it(`getMimeType 52: seven.7z`, () => {
    expect(getMimeType('seven.7z')).toBe('application/x-7z-compressed');
  });
  it(`getMimeType 53: win.rar`, () => {
    expect(getMimeType('win.rar')).toBe('application/vnd.rar');
  });
  it(`getMimeType 54: comp.xz`, () => {
    expect(getMimeType('comp.xz')).toBe('application/x-xz');
  });
  it(`getMimeType 55: fast.zst`, () => {
    expect(getMimeType('fast.zst')).toBe('application/zstd');
  });
  it(`getMimeType 56: app.js`, () => {
    expect(getMimeType('app.js')).toBe('application/javascript');
  });
  it(`getMimeType 57: app.ts`, () => {
    expect(getMimeType('app.ts')).toBe('application/typescript');
  });
  it(`getMimeType 58: style.css`, () => {
    expect(getMimeType('style.css')).toBe('text/css');
  });
  it(`getMimeType 59: wasm.wasm`, () => {
    expect(getMimeType('wasm.wasm')).toBe('application/wasm');
  });
  it(`getMimeType 60: binary.bin`, () => {
    expect(getMimeType('binary.bin')).toBe('application/octet-stream');
  });
  it(`getMimeType 61: prog.exe`, () => {
    expect(getMimeType('prog.exe')).toBe('application/octet-stream');
  });
  it(`getMimeType 62: config.yaml`, () => {
    expect(getMimeType('config.yaml')).toBe('application/yaml');
  });
  it(`getMimeType 63: config.yml`, () => {
    expect(getMimeType('config.yml')).toBe('application/yaml');
  });
  it(`getMimeType 64: config.toml`, () => {
    expect(getMimeType('config.toml')).toBe('application/toml');
  });
  it(`getMimeType 65: script.sh`, () => {
    expect(getMimeType('script.sh')).toBe('application/x-sh');
  });
  it(`getMimeType 66: run.bat`, () => {
    expect(getMimeType('run.bat')).toBe('application/x-msdos-program');
  });
  it(`getMimeType 67: unknown.xyz`, () => {
    expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
  });
  it(`getMimeType 68: noext`, () => {
    expect(getMimeType('noext')).toBe('application/octet-stream');
  });
  it(`getMimeType 69: /path/to/file.pdf`, () => {
    expect(getMimeType('/path/to/file.pdf')).toBe('application/pdf');
  });
  it(`getMimeType 70: deep/path/image.png`, () => {
    expect(getMimeType('deep/path/image.png')).toBe('image/png');
  });
  it(`getMimeType 71: /var/data/notes.txt`, () => {
    expect(getMimeType('/var/data/notes.txt')).toBe('text/plain');
  });
  it(`getMimeType 72: src/styles/main.css`, () => {
    expect(getMimeType('src/styles/main.css')).toBe('text/css');
  });
  it(`getMimeType 73: apps/api/src/index.ts`, () => {
    expect(getMimeType('apps/api/src/index.ts')).toBe('application/typescript');
  });
  it(`getMimeType 74: icon2.ico`, () => {
    expect(getMimeType('icon2.ico')).toBe('image/x-icon');
  });
  it(`getMimeType 75: anim2.gif`, () => {
    expect(getMimeType('anim2.gif')).toBe('image/gif');
  });
  it(`getMimeType 76: photo2.jpg`, () => {
    expect(getMimeType('photo2.jpg')).toBe('image/jpeg');
  });
  it(`getMimeType 77: music.flac`, () => {
    expect(getMimeType('music.flac')).toBe('audio/flac');
  });
  it(`getMimeType 78: podcast.aac`, () => {
    expect(getMimeType('podcast.aac')).toBe('audio/aac');
  });
  it(`getMimeType 79: film.mkv`, () => {
    expect(getMimeType('film.mkv')).toBe('video/x-matroska');
  });
  it(`getMimeType 80: archive2.zip`, () => {
    expect(getMimeType('archive2.zip')).toBe('application/zip');
  });
  it(`getMimeType 81: source.tar`, () => {
    expect(getMimeType('source.tar')).toBe('application/x-tar');
  });
  it(`getMimeType 82: odt.odt`, () => {
    expect(getMimeType('odt.odt')).toBe('application/vnd.oasis.opendocument.text');
  });
  it(`getMimeType 83: ods.ods`, () => {
    expect(getMimeType('ods.ods')).toBe('application/vnd.oasis.opendocument.spreadsheet');
  });
  it(`getMimeType 84: odp.odp`, () => {
    expect(getMimeType('odp.odp')).toBe('application/vnd.oasis.opendocument.presentation');
  });
  it(`getMimeType 85: img.avif`, () => {
    expect(getMimeType('img.avif')).toBe('image/avif');
  });
  it(`getMimeType 86: clip2.mp4`, () => {
    expect(getMimeType('clip2.mp4')).toBe('video/mp4');
  });
  it(`getMimeType 87: sound2.wav`, () => {
    expect(getMimeType('sound2.wav')).toBe('audio/wav');
  });
  it(`getMimeType 88: doc2.docx`, () => {
    expect(getMimeType('doc2.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });
  it(`getMimeType 89: xls2.xlsx`, () => {
    expect(getMimeType('xls2.xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
  it(`getMimeType 90: ppt2.pptx`, () => {
    expect(getMimeType('ppt2.pptx')).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
  });
  it(`getMimeType 91: zip2.zip`, () => {
    expect(getMimeType('zip2.zip')).toBe('application/zip');
  });
  it(`getMimeType 92: gz2.gz`, () => {
    expect(getMimeType('gz2.gz')).toBe('application/gzip');
  });
  it(`getMimeType 93: file.bz2`, () => {
    expect(getMimeType('file.bz2')).toBe('application/x-bzip2');
  });
  it(`getMimeType 94: extra.7z`, () => {
    expect(getMimeType('extra.7z')).toBe('application/x-7z-compressed');
  });
  it(`getMimeType 95: extra.rar`, () => {
    expect(getMimeType('extra.rar')).toBe('application/vnd.rar');
  });
  it(`getMimeType 96: extra.xz`, () => {
    expect(getMimeType('extra.xz')).toBe('application/x-xz');
  });
});

describe('getExtensionForMime', () => {
  it(`getExtensionForMime 1: image/jpeg`, () => {
    expect(getExtensionForMime('image/jpeg')).toBe('.jpg');
  });
  it(`getExtensionForMime 2: image/png`, () => {
    expect(getExtensionForMime('image/png')).toBe('.png');
  });
  it(`getExtensionForMime 3: image/gif`, () => {
    expect(getExtensionForMime('image/gif')).toBe('.gif');
  });
  it(`getExtensionForMime 4: video/mp4`, () => {
    expect(getExtensionForMime('video/mp4')).toBe('.mp4');
  });
  it(`getExtensionForMime 5: audio/mpeg`, () => {
    expect(getExtensionForMime('audio/mpeg')).toBe('.mp3');
  });
  it(`getExtensionForMime 6: application/pdf`, () => {
    expect(getExtensionForMime('application/pdf')).toBe('.pdf');
  });
  it(`getExtensionForMime 7: application/zip`, () => {
    expect(getExtensionForMime('application/zip')).toBe('.zip');
  });
  it(`getExtensionForMime 8: text/plain`, () => {
    expect(getExtensionForMime('text/plain')).toBe('.txt');
  });
  it(`getExtensionForMime 9: text/html`, () => {
    expect(getExtensionForMime('text/html')).toBe('.html');
  });
  it(`getExtensionForMime 10: application/json`, () => {
    expect(getExtensionForMime('application/json')).toBe('.json');
  });
  it(`getExtensionForMime 11: text/css`, () => {
    expect(getExtensionForMime('text/css')).toBe('.css');
  });
  it(`getExtensionForMime 12: application/javascript`, () => {
    expect(getExtensionForMime('application/javascript')).toBe('.js');
  });
  it(`getExtensionForMime 13: image/webp`, () => {
    expect(getExtensionForMime('image/webp')).toBe('.webp');
  });
  it(`getExtensionForMime 14: audio/wav`, () => {
    expect(getExtensionForMime('audio/wav')).toBe('.wav');
  });
  it(`getExtensionForMime 15: video/webm`, () => {
    expect(getExtensionForMime('video/webm')).toBe('.webm');
  });
  it(`getExtensionForMime 16: application/xml`, () => {
    expect(getExtensionForMime('application/xml')).toBe('.xml');
  });
  it(`getExtensionForMime 17: text/csv`, () => {
    expect(getExtensionForMime('text/csv')).toBe('.csv');
  });
  it(`getExtensionForMime 18: application/gzip`, () => {
    expect(getExtensionForMime('application/gzip')).toBe('.gz');
  });
  it(`getExtensionForMime 19: image/svg+xml`, () => {
    expect(getExtensionForMime('image/svg+xml')).toBe('.svg');
  });
  it(`getExtensionForMime 20: unknown/type`, () => {
    expect(getExtensionForMime('unknown/type')).toBe('');
  });
});

describe('isImageFile', () => {
  it(`isImageFile true 1: photo.jpg`, () => {
    expect(isImageFile('photo.jpg')).toBe(true);
  });
  it(`isImageFile true 2: image.jpeg`, () => {
    expect(isImageFile('image.jpeg')).toBe(true);
  });
  it(`isImageFile true 3: logo.png`, () => {
    expect(isImageFile('logo.png')).toBe(true);
  });
  it(`isImageFile true 4: anim.gif`, () => {
    expect(isImageFile('anim.gif')).toBe(true);
  });
  it(`isImageFile true 5: icon.bmp`, () => {
    expect(isImageFile('icon.bmp')).toBe(true);
  });
  it(`isImageFile true 6: web.webp`, () => {
    expect(isImageFile('web.webp')).toBe(true);
  });
  it(`isImageFile true 7: vector.svg`, () => {
    expect(isImageFile('vector.svg')).toBe(true);
  });
  it(`isImageFile true 8: fav.ico`, () => {
    expect(isImageFile('fav.ico')).toBe(true);
  });
  it(`isImageFile true 9: scan.tiff`, () => {
    expect(isImageFile('scan.tiff')).toBe(true);
  });
  it(`isImageFile true 10: scan.tif`, () => {
    expect(isImageFile('scan.tif')).toBe(true);
  });
  it(`isImageFile true 11: modern.avif`, () => {
    expect(isImageFile('modern.avif')).toBe(true);
  });
  it(`isImageFile true 12: iphone.heic`, () => {
    expect(isImageFile('iphone.heic')).toBe(true);
  });
  it(`isImageFile true 13: iphone.heif`, () => {
    expect(isImageFile('iphone.heif')).toBe(true);
  });
  it(`isImageFile false 1: video.mp4`, () => {
    expect(isImageFile('video.mp4')).toBe(false);
  });
  it(`isImageFile false 2: audio.mp3`, () => {
    expect(isImageFile('audio.mp3')).toBe(false);
  });
  it(`isImageFile false 3: doc.pdf`, () => {
    expect(isImageFile('doc.pdf')).toBe(false);
  });
  it(`isImageFile false 4: archive.zip`, () => {
    expect(isImageFile('archive.zip')).toBe(false);
  });
  it(`isImageFile false 5: script.js`, () => {
    expect(isImageFile('script.js')).toBe(false);
  });
  it(`isImageFile false 6: data.csv`, () => {
    expect(isImageFile('data.csv')).toBe(false);
  });
  it(`isImageFile false 7: config.yaml`, () => {
    expect(isImageFile('config.yaml')).toBe(false);
  });
  it(`isImageFile false 8: noext`, () => {
    expect(isImageFile('noext')).toBe(false);
  });
  it(`isImageFile false 9: file.ts`, () => {
    expect(isImageFile('file.ts')).toBe(false);
  });
  it(`isImageFile false 10: readme.md`, () => {
    expect(isImageFile('readme.md')).toBe(false);
  });
  it(`isImageFile false 11: bundle.exe`, () => {
    expect(isImageFile('bundle.exe')).toBe(false);
  });
  it(`isImageFile false 12: data.json`, () => {
    expect(isImageFile('data.json')).toBe(false);
  });
});

describe('isVideoFile', () => {
  it(`isVideoFile true 1: clip.mp4`, () => {
    expect(isVideoFile('clip.mp4')).toBe(true);
  });
  it(`isVideoFile true 2: web.webm`, () => {
    expect(isVideoFile('web.webm')).toBe(true);
  });
  it(`isVideoFile true 3: video.ogg`, () => {
    expect(isVideoFile('video.ogg')).toBe(true);
  });
  it(`isVideoFile true 4: old.avi`, () => {
    expect(isVideoFile('old.avi')).toBe(true);
  });
  it(`isVideoFile true 5: apple.mov`, () => {
    expect(isVideoFile('apple.mov')).toBe(true);
  });
  it(`isVideoFile true 6: hd.mkv`, () => {
    expect(isVideoFile('hd.mkv')).toBe(true);
  });
  it(`isVideoFile true 7: old.flv`, () => {
    expect(isVideoFile('old.flv')).toBe(true);
  });
  it(`isVideoFile true 8: win.wmv`, () => {
    expect(isVideoFile('win.wmv')).toBe(true);
  });
  it(`isVideoFile true 9: itunes.m4v`, () => {
    expect(isVideoFile('itunes.m4v')).toBe(true);
  });
  it(`isVideoFile true 10: mobile.3gp`, () => {
    expect(isVideoFile('mobile.3gp')).toBe(true);
  });
  it(`isVideoFile false 1: photo.jpg`, () => {
    expect(isVideoFile('photo.jpg')).toBe(false);
  });
  it(`isVideoFile false 2: song.mp3`, () => {
    expect(isVideoFile('song.mp3')).toBe(false);
  });
  it(`isVideoFile false 3: doc.pdf`, () => {
    expect(isVideoFile('doc.pdf')).toBe(false);
  });
  it(`isVideoFile false 4: archive.zip`, () => {
    expect(isVideoFile('archive.zip')).toBe(false);
  });
  it(`isVideoFile false 5: code.ts`, () => {
    expect(isVideoFile('code.ts')).toBe(false);
  });
  it(`isVideoFile false 6: readme.md`, () => {
    expect(isVideoFile('readme.md')).toBe(false);
  });
  it(`isVideoFile false 7: config.json`, () => {
    expect(isVideoFile('config.json')).toBe(false);
  });
  it(`isVideoFile false 8: style.css`, () => {
    expect(isVideoFile('style.css')).toBe(false);
  });
  it(`isVideoFile false 9: script.sh`, () => {
    expect(isVideoFile('script.sh')).toBe(false);
  });
  it(`isVideoFile false 10: binary.bin`, () => {
    expect(isVideoFile('binary.bin')).toBe(false);
  });
});

describe('isAudioFile', () => {
  it(`isAudioFile true 1: song.mp3`, () => {
    expect(isAudioFile('song.mp3')).toBe(true);
  });
  it(`isAudioFile true 2: sound.wav`, () => {
    expect(isAudioFile('sound.wav')).toBe(true);
  });
  it(`isAudioFile true 3: lossless.flac`, () => {
    expect(isAudioFile('lossless.flac')).toBe(true);
  });
  it(`isAudioFile true 4: audio.aac`, () => {
    expect(isAudioFile('audio.aac')).toBe(true);
  });
  it(`isAudioFile true 5: apple.m4a`, () => {
    expect(isAudioFile('apple.m4a')).toBe(true);
  });
  it(`isAudioFile true 6: vorbis.oga`, () => {
    expect(isAudioFile('vorbis.oga')).toBe(true);
  });
  it(`isAudioFile true 7: voice.opus`, () => {
    expect(isAudioFile('voice.opus')).toBe(true);
  });
  it(`isAudioFile true 8: wma.wma`, () => {
    expect(isAudioFile('wma.wma')).toBe(true);
  });
  it(`isAudioFile true 9: cd.aiff`, () => {
    expect(isAudioFile('cd.aiff')).toBe(true);
  });
  it(`isAudioFile false 1: photo.jpg`, () => {
    expect(isAudioFile('photo.jpg')).toBe(false);
  });
  it(`isAudioFile false 2: video.mp4`, () => {
    expect(isAudioFile('video.mp4')).toBe(false);
  });
  it(`isAudioFile false 3: doc.pdf`, () => {
    expect(isAudioFile('doc.pdf')).toBe(false);
  });
  it(`isAudioFile false 4: archive.zip`, () => {
    expect(isAudioFile('archive.zip')).toBe(false);
  });
  it(`isAudioFile false 5: code.ts`, () => {
    expect(isAudioFile('code.ts')).toBe(false);
  });
  it(`isAudioFile false 6: readme.md`, () => {
    expect(isAudioFile('readme.md')).toBe(false);
  });
  it(`isAudioFile false 7: config.json`, () => {
    expect(isAudioFile('config.json')).toBe(false);
  });
  it(`isAudioFile false 8: style.css`, () => {
    expect(isAudioFile('style.css')).toBe(false);
  });
  it(`isAudioFile false 9: script.sh`, () => {
    expect(isAudioFile('script.sh')).toBe(false);
  });
  it(`isAudioFile false 10: binary.bin`, () => {
    expect(isAudioFile('binary.bin')).toBe(false);
  });
  it(`isAudioFile false 11: icon.svg`, () => {
    expect(isAudioFile('icon.svg')).toBe(false);
  });
});

describe('isDocumentFile', () => {
  it(`isDocumentFile true 1: report.pdf`, () => {
    expect(isDocumentFile('report.pdf')).toBe(true);
  });
  it(`isDocumentFile true 2: letter.doc`, () => {
    expect(isDocumentFile('letter.doc')).toBe(true);
  });
  it(`isDocumentFile true 3: letter.docx`, () => {
    expect(isDocumentFile('letter.docx')).toBe(true);
  });
  it(`isDocumentFile true 4: sheet.xls`, () => {
    expect(isDocumentFile('sheet.xls')).toBe(true);
  });
  it(`isDocumentFile true 5: sheet.xlsx`, () => {
    expect(isDocumentFile('sheet.xlsx')).toBe(true);
  });
  it(`isDocumentFile true 6: slides.ppt`, () => {
    expect(isDocumentFile('slides.ppt')).toBe(true);
  });
  it(`isDocumentFile true 7: slides.pptx`, () => {
    expect(isDocumentFile('slides.pptx')).toBe(true);
  });
  it(`isDocumentFile true 8: notes.txt`, () => {
    expect(isDocumentFile('notes.txt')).toBe(true);
  });
  it(`isDocumentFile true 9: data.csv`, () => {
    expect(isDocumentFile('data.csv')).toBe(true);
  });
  it(`isDocumentFile true 10: readme.md`, () => {
    expect(isDocumentFile('readme.md')).toBe(true);
  });
  it(`isDocumentFile true 11: page.html`, () => {
    expect(isDocumentFile('page.html')).toBe(true);
  });
  it(`isDocumentFile true 12: page.htm`, () => {
    expect(isDocumentFile('page.htm')).toBe(true);
  });
  it(`isDocumentFile true 13: config.xml`, () => {
    expect(isDocumentFile('config.xml')).toBe(true);
  });
  it(`isDocumentFile true 14: data.json`, () => {
    expect(isDocumentFile('data.json')).toBe(true);
  });
  it(`isDocumentFile true 15: rtf.rtf`, () => {
    expect(isDocumentFile('rtf.rtf')).toBe(true);
  });
  it(`isDocumentFile false 1: photo.jpg`, () => {
    expect(isDocumentFile('photo.jpg')).toBe(false);
  });
  it(`isDocumentFile false 2: video.mp4`, () => {
    expect(isDocumentFile('video.mp4')).toBe(false);
  });
  it(`isDocumentFile false 3: song.mp3`, () => {
    expect(isDocumentFile('song.mp3')).toBe(false);
  });
  it(`isDocumentFile false 4: archive.zip`, () => {
    expect(isDocumentFile('archive.zip')).toBe(false);
  });
  it(`isDocumentFile false 5: script.sh`, () => {
    expect(isDocumentFile('script.sh')).toBe(false);
  });
  it(`isDocumentFile false 6: binary.bin`, () => {
    expect(isDocumentFile('binary.bin')).toBe(false);
  });
  it(`isDocumentFile false 7: prog.exe`, () => {
    expect(isDocumentFile('prog.exe')).toBe(false);
  });
  it(`isDocumentFile false 8: style.css`, () => {
    expect(isDocumentFile('style.css')).toBe(false);
  });
  it(`isDocumentFile false 9: code.ts`, () => {
    expect(isDocumentFile('code.ts')).toBe(false);
  });
  it(`isDocumentFile false 10: noext`, () => {
    expect(isDocumentFile('noext')).toBe(false);
  });
});

describe('isArchiveFile', () => {
  it(`isArchiveFile true 1: backup.zip`, () => {
    expect(isArchiveFile('backup.zip')).toBe(true);
  });
  it(`isArchiveFile true 2: source.tar`, () => {
    expect(isArchiveFile('source.tar')).toBe(true);
  });
  it(`isArchiveFile true 3: data.gz`, () => {
    expect(isArchiveFile('data.gz')).toBe(true);
  });
  it(`isArchiveFile true 4: log.bz2`, () => {
    expect(isArchiveFile('log.bz2')).toBe(true);
  });
  it(`isArchiveFile true 5: archive.7z`, () => {
    expect(isArchiveFile('archive.7z')).toBe(true);
  });
  it(`isArchiveFile true 6: files.rar`, () => {
    expect(isArchiveFile('files.rar')).toBe(true);
  });
  it(`isArchiveFile true 7: compressed.xz`, () => {
    expect(isArchiveFile('compressed.xz')).toBe(true);
  });
  it(`isArchiveFile true 8: ultra.zst`, () => {
    expect(isArchiveFile('ultra.zst')).toBe(true);
  });
  it(`isArchiveFile false 1: photo.jpg`, () => {
    expect(isArchiveFile('photo.jpg')).toBe(false);
  });
  it(`isArchiveFile false 2: video.mp4`, () => {
    expect(isArchiveFile('video.mp4')).toBe(false);
  });
  it(`isArchiveFile false 3: song.mp3`, () => {
    expect(isArchiveFile('song.mp3')).toBe(false);
  });
  it(`isArchiveFile false 4: report.pdf`, () => {
    expect(isArchiveFile('report.pdf')).toBe(false);
  });
  it(`isArchiveFile false 5: code.ts`, () => {
    expect(isArchiveFile('code.ts')).toBe(false);
  });
  it(`isArchiveFile false 6: readme.md`, () => {
    expect(isArchiveFile('readme.md')).toBe(false);
  });
  it(`isArchiveFile false 7: config.json`, () => {
    expect(isArchiveFile('config.json')).toBe(false);
  });
  it(`isArchiveFile false 8: style.css`, () => {
    expect(isArchiveFile('style.css')).toBe(false);
  });
  it(`isArchiveFile false 9: binary.bin`, () => {
    expect(isArchiveFile('binary.bin')).toBe(false);
  });
  it(`isArchiveFile false 10: noext`, () => {
    expect(isArchiveFile('noext')).toBe(false);
  });
  it(`isArchiveFile false 11: page.html`, () => {
    expect(isArchiveFile('page.html')).toBe(false);
  });
  it(`isArchiveFile false 12: data.csv`, () => {
    expect(isArchiveFile('data.csv')).toBe(false);
  });
});

describe('formatFileSize', () => {
  it(`formatFileSize 1: 0 bytes d=2`, () => {
    expect(formatFileSize(0, 2)).toBe('0 B');
  });
  it(`formatFileSize 2: 1 bytes d=2`, () => {
    expect(formatFileSize(1, 2)).toBe('1.00 B');
  });
  it(`formatFileSize 3: 512 bytes d=2`, () => {
    expect(formatFileSize(512, 2)).toBe('512.00 B');
  });
  it(`formatFileSize 4: 1023 bytes d=2`, () => {
    expect(formatFileSize(1023, 2)).toBe('1023.00 B');
  });
  it(`formatFileSize 5: 1024 bytes d=2`, () => {
    expect(formatFileSize(1024, 2)).toBe('1.00 KB');
  });
  it(`formatFileSize 6: 1536 bytes d=2`, () => {
    expect(formatFileSize(1536, 2)).toBe('1.50 KB');
  });
  it(`formatFileSize 7: 2048 bytes d=2`, () => {
    expect(formatFileSize(2048, 2)).toBe('2.00 KB');
  });
  it(`formatFileSize 8: 10240 bytes d=2`, () => {
    expect(formatFileSize(10240, 2)).toBe('10.00 KB');
  });
  it(`formatFileSize 9: 102400 bytes d=2`, () => {
    expect(formatFileSize(102400, 2)).toBe('100.00 KB');
  });
  it(`formatFileSize 10: 1048576 bytes d=2`, () => {
    expect(formatFileSize(1048576, 2)).toBe('1.00 MB');
  });
  it(`formatFileSize 11: 1572864 bytes d=2`, () => {
    expect(formatFileSize(1572864, 2)).toBe('1.50 MB');
  });
  it(`formatFileSize 12: 2097152 bytes d=2`, () => {
    expect(formatFileSize(2097152, 2)).toBe('2.00 MB');
  });
  it(`formatFileSize 13: 10485760 bytes d=2`, () => {
    expect(formatFileSize(10485760, 2)).toBe('10.00 MB');
  });
  it(`formatFileSize 14: 104857600 bytes d=2`, () => {
    expect(formatFileSize(104857600, 2)).toBe('100.00 MB');
  });
  it(`formatFileSize 15: 1073741824 bytes d=2`, () => {
    expect(formatFileSize(1073741824, 2)).toBe('1.00 GB');
  });
  it(`formatFileSize 16: 1610612736 bytes d=2`, () => {
    expect(formatFileSize(1610612736, 2)).toBe('1.50 GB');
  });
  it(`formatFileSize 17: 10737418240 bytes d=2`, () => {
    expect(formatFileSize(10737418240, 2)).toBe('10.00 GB');
  });
  it(`formatFileSize 18: 1099511627776 bytes d=2`, () => {
    expect(formatFileSize(1099511627776, 2)).toBe('1.00 TB');
  });
  it(`formatFileSize 19: 1 bytes d=0`, () => {
    expect(formatFileSize(1, 0)).toBe('1 B');
  });
  it(`formatFileSize 20: 1024 bytes d=0`, () => {
    expect(formatFileSize(1024, 0)).toBe('1 KB');
  });
  it(`formatFileSize 21: 1024 bytes d=1`, () => {
    expect(formatFileSize(1024, 1)).toBe('1.0 KB');
  });
  it(`formatFileSize 22: 1024 bytes d=3`, () => {
    expect(formatFileSize(1024, 3)).toBe('1.000 KB');
  });
  it(`formatFileSize 23: 1500 bytes d=2`, () => {
    expect(formatFileSize(1500, 2)).toBe('1.46 KB');
  });
  it(`formatFileSize 24: 1500000 bytes d=2`, () => {
    expect(formatFileSize(1500000, 2)).toBe('1.43 MB');
  });
  it(`formatFileSize 25: 1500000000 bytes d=2`, () => {
    expect(formatFileSize(1500000000, 2)).toBe('1.40 GB');
  });
  it(`formatFileSize extra 1: 100`, () => {
    expect(formatFileSize(100)).toBe('100.00 B');
  });
  it(`formatFileSize extra 2: 200`, () => {
    expect(formatFileSize(200)).toBe('200.00 B');
  });
  it(`formatFileSize extra 3: 300`, () => {
    expect(formatFileSize(300)).toBe('300.00 B');
  });
  it(`formatFileSize extra 4: 400`, () => {
    expect(formatFileSize(400)).toBe('400.00 B');
  });
  it(`formatFileSize extra 5: 500`, () => {
    expect(formatFileSize(500)).toBe('500.00 B');
  });
  it(`formatFileSize extra 6: 600`, () => {
    expect(formatFileSize(600)).toBe('600.00 B');
  });
  it(`formatFileSize extra 7: 700`, () => {
    expect(formatFileSize(700)).toBe('700.00 B');
  });
  it(`formatFileSize extra 8: 800`, () => {
    expect(formatFileSize(800)).toBe('800.00 B');
  });
  it(`formatFileSize extra 9: 900`, () => {
    expect(formatFileSize(900)).toBe('900.00 B');
  });
  it(`formatFileSize extra 10: 1100`, () => {
    expect(formatFileSize(1100)).toBe('1.07 KB');
  });
  it(`formatFileSize extra 11: 2000`, () => {
    expect(formatFileSize(2000)).toBe('1.95 KB');
  });
  it(`formatFileSize extra 12: 3000`, () => {
    expect(formatFileSize(3000)).toBe('2.93 KB');
  });
  it(`formatFileSize extra 13: 4000`, () => {
    expect(formatFileSize(4000)).toBe('3.91 KB');
  });
  it(`formatFileSize extra 14: 5000`, () => {
    expect(formatFileSize(5000)).toBe('4.88 KB');
  });
  it(`formatFileSize extra 15: 6000`, () => {
    expect(formatFileSize(6000)).toBe('5.86 KB');
  });
  it(`formatFileSize extra 16: 7000`, () => {
    expect(formatFileSize(7000)).toBe('6.84 KB');
  });
  it(`formatFileSize extra 17: 8000`, () => {
    expect(formatFileSize(8000)).toBe('7.81 KB');
  });
  it(`formatFileSize extra 18: 9000`, () => {
    expect(formatFileSize(9000)).toBe('8.79 KB');
  });
  it(`formatFileSize extra 19: 102400`, () => {
    expect(formatFileSize(102400)).toBe('100.00 KB');
  });
  it(`formatFileSize extra 20: 204800`, () => {
    expect(formatFileSize(204800)).toBe('200.00 KB');
  });
  it(`formatFileSize extra 21: 307200`, () => {
    expect(formatFileSize(307200)).toBe('300.00 KB');
  });
  it(`formatFileSize extra 22: 409600`, () => {
    expect(formatFileSize(409600)).toBe('400.00 KB');
  });
  it(`formatFileSize extra 23: 512000`, () => {
    expect(formatFileSize(512000)).toBe('500.00 KB');
  });
  it(`formatFileSize extra 24: 614400`, () => {
    expect(formatFileSize(614400)).toBe('600.00 KB');
  });
  it(`formatFileSize extra 25: 716800`, () => {
    expect(formatFileSize(716800)).toBe('700.00 KB');
  });
  it(`formatFileSize extra 26: 819200`, () => {
    expect(formatFileSize(819200)).toBe('800.00 KB');
  });
  it(`formatFileSize extra 27: 921600`, () => {
    expect(formatFileSize(921600)).toBe('900.00 KB');
  });
  it(`formatFileSize extra 28: 2097152`, () => {
    expect(formatFileSize(2097152)).toBe('2.00 MB');
  });
  it(`formatFileSize extra 29: 3145728`, () => {
    expect(formatFileSize(3145728)).toBe('3.00 MB');
  });
  it(`formatFileSize extra 30: 4194304`, () => {
    expect(formatFileSize(4194304)).toBe('4.00 MB');
  });
  it(`formatFileSize extra 31: 5242880`, () => {
    expect(formatFileSize(5242880)).toBe('5.00 MB');
  });
  it(`formatFileSize extra 32: 6291456`, () => {
    expect(formatFileSize(6291456)).toBe('6.00 MB');
  });
  it(`formatFileSize extra 33: 7340032`, () => {
    expect(formatFileSize(7340032)).toBe('7.00 MB');
  });
  it(`formatFileSize extra 34: 8388608`, () => {
    expect(formatFileSize(8388608)).toBe('8.00 MB');
  });
  it(`formatFileSize extra 35: 9437184`, () => {
    expect(formatFileSize(9437184)).toBe('9.00 MB');
  });
  it(`formatFileSize extra 36: 10485760`, () => {
    expect(formatFileSize(10485760)).toBe('10.00 MB');
  });
  it(`formatFileSize extra 37: 20971520`, () => {
    expect(formatFileSize(20971520)).toBe('20.00 MB');
  });
  it(`formatFileSize extra 38: 52428800`, () => {
    expect(formatFileSize(52428800)).toBe('50.00 MB');
  });
  it(`formatFileSize extra 39: 104857600`, () => {
    expect(formatFileSize(104857600)).toBe('100.00 MB');
  });
  it(`formatFileSize extra 40: 209715200`, () => {
    expect(formatFileSize(209715200)).toBe('200.00 MB');
  });
  it(`formatFileSize extra 41: 524288000`, () => {
    expect(formatFileSize(524288000)).toBe('500.00 MB');
  });
  it(`formatFileSize extra 42: 2147483648`, () => {
    expect(formatFileSize(2147483648)).toBe('2.00 GB');
  });
  it(`formatFileSize extra 43: 5368709120`, () => {
    expect(formatFileSize(5368709120)).toBe('5.00 GB');
  });
  it(`formatFileSize extra 44: 10737418240`, () => {
    expect(formatFileSize(10737418240)).toBe('10.00 GB');
  });
  it(`formatFileSize throws for negative`, () => {
    expect(() => formatFileSize(-1)).toThrow(RangeError);
  });
});

describe('parseFileSize', () => {
  it(`parseFileSize 1: 0 B`, () => {
    expect(parseFileSize('0 B')).toBe(0);
  });
  it(`parseFileSize 2: 1 B`, () => {
    expect(parseFileSize('1 B')).toBe(1);
  });
  it(`parseFileSize 3: 512 B`, () => {
    expect(parseFileSize('512 B')).toBe(512);
  });
  it(`parseFileSize 4: 1 KB`, () => {
    expect(parseFileSize('1 KB')).toBe(1024);
  });
  it(`parseFileSize 5: 1.5 KB`, () => {
    expect(parseFileSize('1.5 KB')).toBe(1536);
  });
  it(`parseFileSize 6: 2 KB`, () => {
    expect(parseFileSize('2 KB')).toBe(2048);
  });
  it(`parseFileSize 7: 10 KB`, () => {
    expect(parseFileSize('10 KB')).toBe(10240);
  });
  it(`parseFileSize 8: 1 MB`, () => {
    expect(parseFileSize('1 MB')).toBe(1048576);
  });
  it(`parseFileSize 9: 1.5 MB`, () => {
    expect(parseFileSize('1.5 MB')).toBe(1572864);
  });
  it(`parseFileSize 10: 2 MB`, () => {
    expect(parseFileSize('2 MB')).toBe(2097152);
  });
  it(`parseFileSize 11: 10 MB`, () => {
    expect(parseFileSize('10 MB')).toBe(10485760);
  });
  it(`parseFileSize 12: 1 GB`, () => {
    expect(parseFileSize('1 GB')).toBe(1073741824);
  });
  it(`parseFileSize 13: 1.5 GB`, () => {
    expect(parseFileSize('1.5 GB')).toBe(1610612736);
  });
  it(`parseFileSize 14: 2 GB`, () => {
    expect(parseFileSize('2 GB')).toBe(2147483648);
  });
  it(`parseFileSize 15: 1 TB`, () => {
    expect(parseFileSize('1 TB')).toBe(1099511627776);
  });
  it(`parseFileSize 16: 1 PB`, () => {
    expect(parseFileSize('1 PB')).toBe(1125899906842624);
  });
  it(`parseFileSize 17: 100 B`, () => {
    expect(parseFileSize('100 B')).toBe(100);
  });
  it(`parseFileSize 18: 100 KB`, () => {
    expect(parseFileSize('100 KB')).toBe(102400);
  });
  it(`parseFileSize 19: 100 MB`, () => {
    expect(parseFileSize('100 MB')).toBe(104857600);
  });
  it(`parseFileSize 20: 100 GB`, () => {
    expect(parseFileSize('100 GB')).toBe(107374182400);
  });
  it(`parseFileSize 21: 1 B`, () => {
    expect(parseFileSize('1 B')).toBe(1);
  });
  it(`parseFileSize 22: 1 KB`, () => {
    expect(parseFileSize('1 KB')).toBe(1024);
  });
  it(`parseFileSize 23: 1 MB`, () => {
    expect(parseFileSize('1 MB')).toBe(1048576);
  });
  it(`parseFileSize 24: 1 GB`, () => {
    expect(parseFileSize('1 GB')).toBe(1073741824);
  });
  it(`parseFileSize 25: 1.0 MB`, () => {
    expect(parseFileSize('1.0 MB')).toBe(1048576);
  });
  it(`parseFileSize 26: 2 B`, () => {
    expect(parseFileSize('2 B')).toBe(2);
  });
  it(`parseFileSize 27: 2 KB`, () => {
    expect(parseFileSize('2 KB')).toBe(2048);
  });
  it(`parseFileSize 28: 2 MB`, () => {
    expect(parseFileSize('2 MB')).toBe(2097152);
  });
  it(`parseFileSize 29: 2 GB`, () => {
    expect(parseFileSize('2 GB')).toBe(2147483648);
  });
  it(`parseFileSize 30: 2.0 MB`, () => {
    expect(parseFileSize('2.0 MB')).toBe(2097152);
  });
  it(`parseFileSize 31: 3 B`, () => {
    expect(parseFileSize('3 B')).toBe(3);
  });
  it(`parseFileSize 32: 3 KB`, () => {
    expect(parseFileSize('3 KB')).toBe(3072);
  });
  it(`parseFileSize 33: 3 MB`, () => {
    expect(parseFileSize('3 MB')).toBe(3145728);
  });
  it(`parseFileSize 34: 3 GB`, () => {
    expect(parseFileSize('3 GB')).toBe(3221225472);
  });
  it(`parseFileSize 35: 3.0 MB`, () => {
    expect(parseFileSize('3.0 MB')).toBe(3145728);
  });
  it(`parseFileSize 36: 4 B`, () => {
    expect(parseFileSize('4 B')).toBe(4);
  });
  it(`parseFileSize 37: 4 KB`, () => {
    expect(parseFileSize('4 KB')).toBe(4096);
  });
  it(`parseFileSize 38: 4 MB`, () => {
    expect(parseFileSize('4 MB')).toBe(4194304);
  });
  it(`parseFileSize 39: 4 GB`, () => {
    expect(parseFileSize('4 GB')).toBe(4294967296);
  });
  it(`parseFileSize 40: 4.0 MB`, () => {
    expect(parseFileSize('4.0 MB')).toBe(4194304);
  });
  it(`parseFileSize 41: 5 B`, () => {
    expect(parseFileSize('5 B')).toBe(5);
  });
  it(`parseFileSize 42: 5 KB`, () => {
    expect(parseFileSize('5 KB')).toBe(5120);
  });
  it(`parseFileSize 43: 5 MB`, () => {
    expect(parseFileSize('5 MB')).toBe(5242880);
  });
  it(`parseFileSize 44: 5 GB`, () => {
    expect(parseFileSize('5 GB')).toBe(5368709120);
  });
  it(`parseFileSize 45: 5.0 MB`, () => {
    expect(parseFileSize('5.0 MB')).toBe(5242880);
  });
  it(`parseFileSize 46: 6 B`, () => {
    expect(parseFileSize('6 B')).toBe(6);
  });
  it(`parseFileSize 47: 6 KB`, () => {
    expect(parseFileSize('6 KB')).toBe(6144);
  });
  it(`parseFileSize 48: 6 MB`, () => {
    expect(parseFileSize('6 MB')).toBe(6291456);
  });
  it(`parseFileSize 49: 6 GB`, () => {
    expect(parseFileSize('6 GB')).toBe(6442450944);
  });
  it(`parseFileSize 50: 6.0 MB`, () => {
    expect(parseFileSize('6.0 MB')).toBe(6291456);
  });
  it(`parseFileSize 51: 7 B`, () => {
    expect(parseFileSize('7 B')).toBe(7);
  });
  it(`parseFileSize 52: 7 KB`, () => {
    expect(parseFileSize('7 KB')).toBe(7168);
  });
  it(`parseFileSize 53: 7 MB`, () => {
    expect(parseFileSize('7 MB')).toBe(7340032);
  });
  it(`parseFileSize 54: 7 GB`, () => {
    expect(parseFileSize('7 GB')).toBe(7516192768);
  });
  it(`parseFileSize 55: 7.0 MB`, () => {
    expect(parseFileSize('7.0 MB')).toBe(7340032);
  });
  it(`parseFileSize 56: 8 B`, () => {
    expect(parseFileSize('8 B')).toBe(8);
  });
  it(`parseFileSize 57: 8 KB`, () => {
    expect(parseFileSize('8 KB')).toBe(8192);
  });
  it(`parseFileSize 58: 8 MB`, () => {
    expect(parseFileSize('8 MB')).toBe(8388608);
  });
  it(`parseFileSize 59: 8 GB`, () => {
    expect(parseFileSize('8 GB')).toBe(8589934592);
  });
  it(`parseFileSize 60: 8.0 MB`, () => {
    expect(parseFileSize('8.0 MB')).toBe(8388608);
  });
  it(`parseFileSize 61: 9 B`, () => {
    expect(parseFileSize('9 B')).toBe(9);
  });
  it(`parseFileSize 62: 9 KB`, () => {
    expect(parseFileSize('9 KB')).toBe(9216);
  });
  it(`parseFileSize 63: 9 MB`, () => {
    expect(parseFileSize('9 MB')).toBe(9437184);
  });
  it(`parseFileSize 64: 9 GB`, () => {
    expect(parseFileSize('9 GB')).toBe(9663676416);
  });
  it(`parseFileSize 65: 9.0 MB`, () => {
    expect(parseFileSize('9.0 MB')).toBe(9437184);
  });
  it(`parseFileSize 66: 10 B`, () => {
    expect(parseFileSize('10 B')).toBe(10);
  });
  it(`parseFileSize 67: 10 KB`, () => {
    expect(parseFileSize('10 KB')).toBe(10240);
  });
  it(`parseFileSize 68: 10 MB`, () => {
    expect(parseFileSize('10 MB')).toBe(10485760);
  });
  it(`parseFileSize 69: 10 GB`, () => {
    expect(parseFileSize('10 GB')).toBe(10737418240);
  });
  it(`parseFileSize 70: 10.0 MB`, () => {
    expect(parseFileSize('10.0 MB')).toBe(10485760);
  });
  it(`parseFileSize 71: 20 B`, () => {
    expect(parseFileSize('20 B')).toBe(20);
  });
  it(`parseFileSize 72: 20 KB`, () => {
    expect(parseFileSize('20 KB')).toBe(20480);
  });
  it(`parseFileSize 73: 20 MB`, () => {
    expect(parseFileSize('20 MB')).toBe(20971520);
  });
  it(`parseFileSize 74: 20 GB`, () => {
    expect(parseFileSize('20 GB')).toBe(21474836480);
  });
  it(`parseFileSize 75: 20.0 MB`, () => {
    expect(parseFileSize('20.0 MB')).toBe(20971520);
  });
  it(`parseFileSize 76: 50 B`, () => {
    expect(parseFileSize('50 B')).toBe(50);
  });
  it(`parseFileSize 77: 50 KB`, () => {
    expect(parseFileSize('50 KB')).toBe(51200);
  });
  it(`parseFileSize 78: 50 MB`, () => {
    expect(parseFileSize('50 MB')).toBe(52428800);
  });
  it(`parseFileSize 79: 50 GB`, () => {
    expect(parseFileSize('50 GB')).toBe(53687091200);
  });
  it(`parseFileSize 80: 50.0 MB`, () => {
    expect(parseFileSize('50.0 MB')).toBe(52428800);
  });
  it(`parseFileSize throws for invalid string`, () => {
    expect(() => parseFileSize('not a size')).toThrow();
  });
  it(`parseFileSize throws for unknown unit`, () => {
    expect(() => parseFileSize('1 XB')).toThrow();
  });
});

describe('byte conversion functions', () => {
  it(`bytesToKb 1: 0`, () => {
    expect(bytesToKb(0)).toBeCloseTo(0.0, 6);
  });
  it(`bytesToKb 2: 512`, () => {
    expect(bytesToKb(512)).toBeCloseTo(0.5, 6);
  });
  it(`bytesToKb 3: 1024`, () => {
    expect(bytesToKb(1024)).toBeCloseTo(1.0, 6);
  });
  it(`bytesToKb 4: 2048`, () => {
    expect(bytesToKb(2048)).toBeCloseTo(2.0, 6);
  });
  it(`bytesToKb 5: 4096`, () => {
    expect(bytesToKb(4096)).toBeCloseTo(4.0, 6);
  });
  it(`bytesToKb 6: 8192`, () => {
    expect(bytesToKb(8192)).toBeCloseTo(8.0, 6);
  });
  it(`bytesToKb 7: 10240`, () => {
    expect(bytesToKb(10240)).toBeCloseTo(10.0, 6);
  });
  it(`bytesToKb 8: 20480`, () => {
    expect(bytesToKb(20480)).toBeCloseTo(20.0, 6);
  });
  it(`bytesToKb 9: 51200`, () => {
    expect(bytesToKb(51200)).toBeCloseTo(50.0, 6);
  });
  it(`bytesToKb 10: 102400`, () => {
    expect(bytesToKb(102400)).toBeCloseTo(100.0, 6);
  });
  it(`bytesToMb 11: 0`, () => {
    expect(bytesToMb(0)).toBeCloseTo(0.0, 6);
  });
  it(`bytesToMb 12: 1048576`, () => {
    expect(bytesToMb(1048576)).toBeCloseTo(1.0, 6);
  });
  it(`bytesToMb 13: 2097152`, () => {
    expect(bytesToMb(2097152)).toBeCloseTo(2.0, 6);
  });
  it(`bytesToMb 14: 5242880`, () => {
    expect(bytesToMb(5242880)).toBeCloseTo(5.0, 6);
  });
  it(`bytesToMb 15: 10485760`, () => {
    expect(bytesToMb(10485760)).toBeCloseTo(10.0, 6);
  });
  it(`bytesToMb 16: 52428800`, () => {
    expect(bytesToMb(52428800)).toBeCloseTo(50.0, 6);
  });
  it(`bytesToMb 17: 104857600`, () => {
    expect(bytesToMb(104857600)).toBeCloseTo(100.0, 6);
  });
  it(`bytesToMb 18: 524288000`, () => {
    expect(bytesToMb(524288000)).toBeCloseTo(500.0, 6);
  });
  it(`bytesToMb 19: 1073741824`, () => {
    expect(bytesToMb(1073741824)).toBeCloseTo(1024.0, 6);
  });
  it(`bytesToMb 20: 2147483648`, () => {
    expect(bytesToMb(2147483648)).toBeCloseTo(2048.0, 6);
  });
  it(`bytesToGb 21: 0`, () => {
    expect(bytesToGb(0)).toBeCloseTo(0.0, 6);
  });
  it(`bytesToGb 22: 1073741824`, () => {
    expect(bytesToGb(1073741824)).toBeCloseTo(1.0, 6);
  });
  it(`bytesToGb 23: 2147483648`, () => {
    expect(bytesToGb(2147483648)).toBeCloseTo(2.0, 6);
  });
  it(`bytesToGb 24: 5368709120`, () => {
    expect(bytesToGb(5368709120)).toBeCloseTo(5.0, 6);
  });
  it(`bytesToGb 25: 10737418240`, () => {
    expect(bytesToGb(10737418240)).toBeCloseTo(10.0, 6);
  });
  it(`bytesToGb 26: 21474836480`, () => {
    expect(bytesToGb(21474836480)).toBeCloseTo(20.0, 6);
  });
  it(`bytesToGb 27: 53687091200`, () => {
    expect(bytesToGb(53687091200)).toBeCloseTo(50.0, 6);
  });
  it(`bytesToGb 28: 107374182400`, () => {
    expect(bytesToGb(107374182400)).toBeCloseTo(100.0, 6);
  });
  it(`bytesToGb 29: 214748364800`, () => {
    expect(bytesToGb(214748364800)).toBeCloseTo(200.0, 6);
  });
  it(`bytesToGb 30: 1099511627776`, () => {
    expect(bytesToGb(1099511627776)).toBeCloseTo(1024.0, 6);
  });
  it(`kbToBytes 31: 0`, () => {
    expect(kbToBytes(0)).toBeCloseTo(0, 6);
  });
  it(`kbToBytes 32: 1`, () => {
    expect(kbToBytes(1)).toBeCloseTo(1024, 6);
  });
  it(`kbToBytes 33: 2`, () => {
    expect(kbToBytes(2)).toBeCloseTo(2048, 6);
  });
  it(`kbToBytes 34: 4`, () => {
    expect(kbToBytes(4)).toBeCloseTo(4096, 6);
  });
  it(`kbToBytes 35: 8`, () => {
    expect(kbToBytes(8)).toBeCloseTo(8192, 6);
  });
  it(`kbToBytes 36: 16`, () => {
    expect(kbToBytes(16)).toBeCloseTo(16384, 6);
  });
  it(`kbToBytes 37: 32`, () => {
    expect(kbToBytes(32)).toBeCloseTo(32768, 6);
  });
  it(`kbToBytes 38: 64`, () => {
    expect(kbToBytes(64)).toBeCloseTo(65536, 6);
  });
  it(`kbToBytes 39: 128`, () => {
    expect(kbToBytes(128)).toBeCloseTo(131072, 6);
  });
  it(`kbToBytes 40: 256`, () => {
    expect(kbToBytes(256)).toBeCloseTo(262144, 6);
  });
  it(`mbToBytes 41: 0`, () => {
    expect(mbToBytes(0)).toBeCloseTo(0, 6);
  });
  it(`mbToBytes 42: 1`, () => {
    expect(mbToBytes(1)).toBeCloseTo(1048576, 6);
  });
  it(`mbToBytes 43: 2`, () => {
    expect(mbToBytes(2)).toBeCloseTo(2097152, 6);
  });
  it(`mbToBytes 44: 4`, () => {
    expect(mbToBytes(4)).toBeCloseTo(4194304, 6);
  });
  it(`mbToBytes 45: 8`, () => {
    expect(mbToBytes(8)).toBeCloseTo(8388608, 6);
  });
  it(`mbToBytes 46: 16`, () => {
    expect(mbToBytes(16)).toBeCloseTo(16777216, 6);
  });
  it(`mbToBytes 47: 32`, () => {
    expect(mbToBytes(32)).toBeCloseTo(33554432, 6);
  });
  it(`mbToBytes 48: 64`, () => {
    expect(mbToBytes(64)).toBeCloseTo(67108864, 6);
  });
  it(`mbToBytes 49: 128`, () => {
    expect(mbToBytes(128)).toBeCloseTo(134217728, 6);
  });
  it(`mbToBytes 50: 256`, () => {
    expect(mbToBytes(256)).toBeCloseTo(268435456, 6);
  });
  it(`gbToBytes 51: 0`, () => {
    expect(gbToBytes(0)).toBeCloseTo(0, 6);
  });
  it(`gbToBytes 52: 1`, () => {
    expect(gbToBytes(1)).toBeCloseTo(1073741824, 6);
  });
  it(`gbToBytes 53: 2`, () => {
    expect(gbToBytes(2)).toBeCloseTo(2147483648, 6);
  });
  it(`gbToBytes 54: 4`, () => {
    expect(gbToBytes(4)).toBeCloseTo(4294967296, 6);
  });
  it(`gbToBytes 55: 8`, () => {
    expect(gbToBytes(8)).toBeCloseTo(8589934592, 6);
  });
  it(`gbToBytes 56: 16`, () => {
    expect(gbToBytes(16)).toBeCloseTo(17179869184, 6);
  });
  it(`gbToBytes 57: 32`, () => {
    expect(gbToBytes(32)).toBeCloseTo(34359738368, 6);
  });
  it(`gbToBytes 58: 64`, () => {
    expect(gbToBytes(64)).toBeCloseTo(68719476736, 6);
  });
  it(`gbToBytes 59: 128`, () => {
    expect(gbToBytes(128)).toBeCloseTo(137438953472, 6);
  });
  it(`gbToBytes 60: 256`, () => {
    expect(gbToBytes(256)).toBeCloseTo(274877906944, 6);
  });
});

describe('sanitizeFilename', () => {
  it(`sanitizeFilename 1`, () => {
    expect(sanitizeFilename('normal.txt')).toBe('normal.txt');
  });
  it(`sanitizeFilename 2`, () => {
    expect(sanitizeFilename('file name.txt')).toBe('file name.txt');
  });
  it(`sanitizeFilename 3`, () => {
    expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt');
  });
  it(`sanitizeFilename 4`, () => {
    expect(sanitizeFilename('file:name.txt')).toBe('file_name.txt');
  });
  it(`sanitizeFilename 5`, () => {
    expect(sanitizeFilename('good-file_name.txt')).toBe('good-file_name.txt');
  });
  it(`sanitizeFilename 6`, () => {
    expect(sanitizeFilename('CON.txt')).toBe('_CON.txt');
  });
  it(`sanitizeFilename 7`, () => {
    expect(sanitizeFilename('PRN.txt')).toBe('_PRN.txt');
  });
  it(`sanitizeFilename 8`, () => {
    expect(sanitizeFilename('AUX.txt')).toBe('_AUX.txt');
  });
  it(`sanitizeFilename 9`, () => {
    expect(sanitizeFilename('NUL.txt')).toBe('_NUL.txt');
  });
  it(`sanitizeFilename 10`, () => {
    expect(sanitizeFilename('COM1.txt')).toBe('_COM1.txt');
  });
  it(`sanitizeFilename 11`, () => {
    expect(sanitizeFilename('LPT1.txt')).toBe('_LPT1.txt');
  });
  it(`sanitizeFilename 12`, () => {
    expect(sanitizeFilename('')).toBe('_');
  });
  it(`sanitizeFilename 13`, () => {
    expect(sanitizeFilename('valid.pdf')).toBe('valid.pdf');
  });
  it(`sanitizeFilename 14`, () => {
    expect(sanitizeFilename('report 2026.docx')).toBe('report 2026.docx');
  });
  it(`sanitizeFilename 15`, () => {
    expect(sanitizeFilename('hello-world.ts')).toBe('hello-world.ts');
  });
  it(`sanitizeFilename 16`, () => {
    expect(sanitizeFilename('my_file.json')).toBe('my_file.json');
  });
  it(`sanitizeFilename 17`, () => {
    expect(sanitizeFilename('data123.csv')).toBe('data123.csv');
  });
  it(`sanitizeFilename 18`, () => {
    expect(sanitizeFilename('README.md')).toBe('README.md');
  });
  it(`sanitizeFilename 19`, () => {
    expect(sanitizeFilename('package.json')).toBe('package.json');
  });
  it(`sanitizeFilename 20`, () => {
    expect(sanitizeFilename('index.html')).toBe('index.html');
  });
  it(`sanitizeFilename 21`, () => {
    expect(sanitizeFilename('style.css')).toBe('style.css');
  });
  it(`sanitizeFilename 22`, () => {
    expect(sanitizeFilename('app.ts')).toBe('app.ts');
  });
  it(`sanitizeFilename valid 23: file01.txt`, () => {
    expect(sanitizeFilename('file01.txt')).toBe('file01.txt');
  });
  it(`sanitizeFilename valid 24: file02.txt`, () => {
    expect(sanitizeFilename('file02.txt')).toBe('file02.txt');
  });
  it(`sanitizeFilename valid 25: file03.txt`, () => {
    expect(sanitizeFilename('file03.txt')).toBe('file03.txt');
  });
  it(`sanitizeFilename valid 26: file04.txt`, () => {
    expect(sanitizeFilename('file04.txt')).toBe('file04.txt');
  });
  it(`sanitizeFilename valid 27: file05.txt`, () => {
    expect(sanitizeFilename('file05.txt')).toBe('file05.txt');
  });
  it(`sanitizeFilename valid 28: file06.txt`, () => {
    expect(sanitizeFilename('file06.txt')).toBe('file06.txt');
  });
  it(`sanitizeFilename valid 29: file07.txt`, () => {
    expect(sanitizeFilename('file07.txt')).toBe('file07.txt');
  });
  it(`sanitizeFilename valid 30: file08.txt`, () => {
    expect(sanitizeFilename('file08.txt')).toBe('file08.txt');
  });
  it(`sanitizeFilename valid 31: file09.txt`, () => {
    expect(sanitizeFilename('file09.txt')).toBe('file09.txt');
  });
  it(`sanitizeFilename valid 32: file10.txt`, () => {
    expect(sanitizeFilename('file10.txt')).toBe('file10.txt');
  });
  it(`sanitizeFilename valid 33: file11.txt`, () => {
    expect(sanitizeFilename('file11.txt')).toBe('file11.txt');
  });
  it(`sanitizeFilename valid 34: file12.txt`, () => {
    expect(sanitizeFilename('file12.txt')).toBe('file12.txt');
  });
  it(`sanitizeFilename valid 35: file13.txt`, () => {
    expect(sanitizeFilename('file13.txt')).toBe('file13.txt');
  });
  it(`sanitizeFilename valid 36: file14.txt`, () => {
    expect(sanitizeFilename('file14.txt')).toBe('file14.txt');
  });
  it(`sanitizeFilename valid 37: file15.txt`, () => {
    expect(sanitizeFilename('file15.txt')).toBe('file15.txt');
  });
  it(`sanitizeFilename valid 38: file16.txt`, () => {
    expect(sanitizeFilename('file16.txt')).toBe('file16.txt');
  });
  it(`sanitizeFilename valid 39: file17.txt`, () => {
    expect(sanitizeFilename('file17.txt')).toBe('file17.txt');
  });
  it(`sanitizeFilename valid 40: file18.txt`, () => {
    expect(sanitizeFilename('file18.txt')).toBe('file18.txt');
  });
  it(`sanitizeFilename valid 41: file19.txt`, () => {
    expect(sanitizeFilename('file19.txt')).toBe('file19.txt');
  });
  it(`sanitizeFilename valid 42: file20.txt`, () => {
    expect(sanitizeFilename('file20.txt')).toBe('file20.txt');
  });
  it(`sanitizeFilename valid 43: file21.txt`, () => {
    expect(sanitizeFilename('file21.txt')).toBe('file21.txt');
  });
  it(`sanitizeFilename valid 44: file22.txt`, () => {
    expect(sanitizeFilename('file22.txt')).toBe('file22.txt');
  });
  it(`sanitizeFilename valid 45: file23.txt`, () => {
    expect(sanitizeFilename('file23.txt')).toBe('file23.txt');
  });
  it(`sanitizeFilename valid 46: file24.txt`, () => {
    expect(sanitizeFilename('file24.txt')).toBe('file24.txt');
  });
  it(`sanitizeFilename valid 47: file25.txt`, () => {
    expect(sanitizeFilename('file25.txt')).toBe('file25.txt');
  });
  it(`sanitizeFilename valid 48: file26.txt`, () => {
    expect(sanitizeFilename('file26.txt')).toBe('file26.txt');
  });
  it(`sanitizeFilename valid 49: file27.txt`, () => {
    expect(sanitizeFilename('file27.txt')).toBe('file27.txt');
  });
  it(`sanitizeFilename valid 50: file28.txt`, () => {
    expect(sanitizeFilename('file28.txt')).toBe('file28.txt');
  });
  it(`sanitizeFilename valid 51: file29.txt`, () => {
    expect(sanitizeFilename('file29.txt')).toBe('file29.txt');
  });
  it(`sanitizeFilename valid 52: file30.txt`, () => {
    expect(sanitizeFilename('file30.txt')).toBe('file30.txt');
  });
  it(`sanitizeFilename valid 53: file31.txt`, () => {
    expect(sanitizeFilename('file31.txt')).toBe('file31.txt');
  });
  it(`sanitizeFilename valid 54: file32.txt`, () => {
    expect(sanitizeFilename('file32.txt')).toBe('file32.txt');
  });
  it(`sanitizeFilename valid 55: file33.txt`, () => {
    expect(sanitizeFilename('file33.txt')).toBe('file33.txt');
  });
  it(`sanitizeFilename valid 56: file34.txt`, () => {
    expect(sanitizeFilename('file34.txt')).toBe('file34.txt');
  });
  it(`sanitizeFilename valid 57: file35.txt`, () => {
    expect(sanitizeFilename('file35.txt')).toBe('file35.txt');
  });
  it(`sanitizeFilename valid 58: file36.txt`, () => {
    expect(sanitizeFilename('file36.txt')).toBe('file36.txt');
  });
  it(`sanitizeFilename valid 59: file37.txt`, () => {
    expect(sanitizeFilename('file37.txt')).toBe('file37.txt');
  });
  it(`sanitizeFilename valid 60: file38.txt`, () => {
    expect(sanitizeFilename('file38.txt')).toBe('file38.txt');
  });
});

describe('isValidFilename', () => {
  it(`isValidFilename 1: normal.txt`, () => {
    expect(isValidFilename('normal.txt')).toBe(true);
  });
  it(`isValidFilename 2: file name.txt`, () => {
    expect(isValidFilename('file name.txt')).toBe(true);
  });
  it(`isValidFilename 3: good-file.ts`, () => {
    expect(isValidFilename('good-file.ts')).toBe(true);
  });
  it(`isValidFilename 4: report_2026.pdf`, () => {
    expect(isValidFilename('report_2026.pdf')).toBe(true);
  });
  it(`isValidFilename 5: a`, () => {
    expect(isValidFilename('a')).toBe(true);
  });
  it(`isValidFilename 6: file.test.ts`, () => {
    expect(isValidFilename('file.test.ts')).toBe(true);
  });
  it(`isValidFilename 7: data.json`, () => {
    expect(isValidFilename('data.json')).toBe(true);
  });
  it(`isValidFilename 8: image.png`, () => {
    expect(isValidFilename('image.png')).toBe(true);
  });
  it(`isValidFilename 9: archive.tar.gz`, () => {
    expect(isValidFilename('archive.tar.gz')).toBe(true);
  });
  it(`isValidFilename 10: My Document.docx`, () => {
    expect(isValidFilename('My Document.docx')).toBe(true);
  });
  it(`isValidFilename 11: `, () => {
    expect(isValidFilename('')).toBe(false);
  });
  it(`isValidFilename 12: CON.txt`, () => {
    expect(isValidFilename('CON.txt')).toBe(false);
  });
  it(`isValidFilename 13: PRN.txt`, () => {
    expect(isValidFilename('PRN.txt')).toBe(false);
  });
  it(`isValidFilename 14: NUL.txt`, () => {
    expect(isValidFilename('NUL.txt')).toBe(false);
  });
  it(`isValidFilename 15: AUX.txt`, () => {
    expect(isValidFilename('AUX.txt')).toBe(false);
  });
  it(`isValidFilename 16: COM1.txt`, () => {
    expect(isValidFilename('COM1.txt')).toBe(false);
  });
  it(`isValidFilename 17: LPT1.txt`, () => {
    expect(isValidFilename('LPT1.txt')).toBe(false);
  });
  it(`isValidFilename 18: .hidden`, () => {
    expect(isValidFilename('.hidden')).toBe(false);
  });
  it(`isValidFilename 19: trailing.`, () => {
    expect(isValidFilename('trailing.')).toBe(false);
  });
  it(`isValidFilename 20: trailing `, () => {
    expect(isValidFilename('trailing ')).toBe(false);
  });
  it(`isValidFilename valid extra 21: document-1.pdf`, () => {
    expect(isValidFilename('document-1.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 22: document-2.pdf`, () => {
    expect(isValidFilename('document-2.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 23: document-3.pdf`, () => {
    expect(isValidFilename('document-3.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 24: document-4.pdf`, () => {
    expect(isValidFilename('document-4.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 25: document-5.pdf`, () => {
    expect(isValidFilename('document-5.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 26: document-6.pdf`, () => {
    expect(isValidFilename('document-6.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 27: document-7.pdf`, () => {
    expect(isValidFilename('document-7.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 28: document-8.pdf`, () => {
    expect(isValidFilename('document-8.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 29: document-9.pdf`, () => {
    expect(isValidFilename('document-9.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 30: document-10.pdf`, () => {
    expect(isValidFilename('document-10.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 31: document-11.pdf`, () => {
    expect(isValidFilename('document-11.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 32: document-12.pdf`, () => {
    expect(isValidFilename('document-12.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 33: document-13.pdf`, () => {
    expect(isValidFilename('document-13.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 34: document-14.pdf`, () => {
    expect(isValidFilename('document-14.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 35: document-15.pdf`, () => {
    expect(isValidFilename('document-15.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 36: document-16.pdf`, () => {
    expect(isValidFilename('document-16.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 37: document-17.pdf`, () => {
    expect(isValidFilename('document-17.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 38: document-18.pdf`, () => {
    expect(isValidFilename('document-18.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 39: document-19.pdf`, () => {
    expect(isValidFilename('document-19.pdf')).toBe(true);
  });
  it(`isValidFilename valid extra 40: document-20.pdf`, () => {
    expect(isValidFilename('document-20.pdf')).toBe(true);
  });
});

describe('addExtension', () => {
  it(`addExtension 1`, () => {
    expect(addExtension('file', '.txt')).toBe('file.txt');
  });
  it(`addExtension 2`, () => {
    expect(addExtension('file', 'txt')).toBe('file.txt');
  });
  it(`addExtension 3`, () => {
    expect(addExtension('file.ts', '.bak')).toBe('file.ts.bak');
  });
  it(`addExtension 4`, () => {
    expect(addExtension('archive', '.tar.gz')).toBe('archive.tar.gz');
  });
  it(`addExtension 5`, () => {
    expect(addExtension('noext', '.pdf')).toBe('noext.pdf');
  });
  it(`addExtension 6`, () => {
    expect(addExtension('image', '.png')).toBe('image.png');
  });
  it(`addExtension 7`, () => {
    expect(addExtension('data', 'json')).toBe('data.json');
  });
  it(`addExtension 8`, () => {
    expect(addExtension('readme', '.md')).toBe('readme.md');
  });
  it(`addExtension 9`, () => {
    expect(addExtension('config', 'yaml')).toBe('config.yaml');
  });
  it(`addExtension 10`, () => {
    expect(addExtension('script', '.sh')).toBe('script.sh');
  });
  it(`addExtension 11`, () => {
    expect(addExtension('index', '.html')).toBe('index.html');
  });
  it(`addExtension 12`, () => {
    expect(addExtension('style', '.css')).toBe('style.css');
  });
  it(`addExtension 13`, () => {
    expect(addExtension('bundle', '.js')).toBe('bundle.js');
  });
  it(`addExtension 14`, () => {
    expect(addExtension('app', '.ts')).toBe('app.ts');
  });
  it(`addExtension 15`, () => {
    expect(addExtension('report', '.xlsx')).toBe('report.xlsx');
  });
  it(`addExtension 16`, () => {
    expect(addExtension('video', '.mp4')).toBe('video.mp4');
  });
  it(`addExtension 17`, () => {
    expect(addExtension('audio', '.mp3')).toBe('audio.mp3');
  });
  it(`addExtension 18`, () => {
    expect(addExtension('photo', '.jpg')).toBe('photo.jpg');
  });
  it(`addExtension 19`, () => {
    expect(addExtension('slide', '.pptx')).toBe('slide.pptx');
  });
  it(`addExtension 20`, () => {
    expect(addExtension('word', '.docx')).toBe('word.docx');
  });
});

describe('changeExtension', () => {
  it(`changeExtension 1`, () => {
    expect(changeExtension('file.ts', '.js')).toBe('file.js');
  });
  it(`changeExtension 2`, () => {
    expect(changeExtension('file.ts', 'js')).toBe('file.js');
  });
  it(`changeExtension 3`, () => {
    expect(changeExtension('file.test.ts', '.js')).toBe('file.test.js');
  });
  it(`changeExtension 4`, () => {
    expect(changeExtension('archive.tar.gz', '.bz2')).toBe('archive.tar.bz2');
  });
  it(`changeExtension 5`, () => {
    expect(changeExtension('image.jpg', '.png')).toBe('image.png');
  });
  it(`changeExtension 6`, () => {
    expect(changeExtension('document.pdf', '.docx')).toBe('document.docx');
  });
  it(`changeExtension 7`, () => {
    expect(changeExtension('data.csv', '.json')).toBe('data.json');
  });
  it(`changeExtension 8`, () => {
    expect(changeExtension('style.css', '.scss')).toBe('style.scss');
  });
  it(`changeExtension 9`, () => {
    expect(changeExtension('index.html', '.htm')).toBe('index.htm');
  });
  it(`changeExtension 10`, () => {
    expect(changeExtension('config.yaml', '.json')).toBe('config.json');
  });
  it(`changeExtension 11`, () => {
    expect(changeExtension('script.sh', '.bash')).toBe('script.bash');
  });
  it(`changeExtension 12`, () => {
    expect(changeExtension('bundle.js', '.ts')).toBe('bundle.ts');
  });
  it(`changeExtension 13`, () => {
    expect(changeExtension('report.xlsx', '.csv')).toBe('report.csv');
  });
  it(`changeExtension 14`, () => {
    expect(changeExtension('audio.mp3', '.wav')).toBe('audio.wav');
  });
  it(`changeExtension 15`, () => {
    expect(changeExtension('video.mp4', '.webm')).toBe('video.webm');
  });
  it(`changeExtension 16`, () => {
    expect(changeExtension('photo.jpg', '.webp')).toBe('photo.webp');
  });
  it(`changeExtension 17`, () => {
    expect(changeExtension('noext', '.txt')).toBe('noext.txt');
  });
  it(`changeExtension 18`, () => {
    expect(changeExtension('readme.md', '.rst')).toBe('readme.rst');
  });
  it(`changeExtension 19`, () => {
    expect(changeExtension('package.json', '.yaml')).toBe('package.yaml');
  });
  it(`changeExtension 20`, () => {
    expect(changeExtension('app.ts', '.mjs')).toBe('app.mjs');
  });
  it(`changeExtension 21`, () => {
    expect(changeExtension('file01.ts', '.js')).toBe('file01.js');
  });
  it(`changeExtension 22`, () => {
    expect(changeExtension('file02.ts', '.js')).toBe('file02.js');
  });
  it(`changeExtension 23`, () => {
    expect(changeExtension('file03.ts', '.js')).toBe('file03.js');
  });
  it(`changeExtension 24`, () => {
    expect(changeExtension('file04.ts', '.js')).toBe('file04.js');
  });
  it(`changeExtension 25`, () => {
    expect(changeExtension('file05.ts', '.js')).toBe('file05.js');
  });
  it(`changeExtension 26`, () => {
    expect(changeExtension('file06.ts', '.js')).toBe('file06.js');
  });
  it(`changeExtension 27`, () => {
    expect(changeExtension('file07.ts', '.js')).toBe('file07.js');
  });
  it(`changeExtension 28`, () => {
    expect(changeExtension('file08.ts', '.js')).toBe('file08.js');
  });
  it(`changeExtension 29`, () => {
    expect(changeExtension('file09.ts', '.js')).toBe('file09.js');
  });
  it(`changeExtension 30`, () => {
    expect(changeExtension('file10.ts', '.js')).toBe('file10.js');
  });
  it(`changeExtension 31`, () => {
    expect(changeExtension('file11.ts', '.js')).toBe('file11.js');
  });
  it(`changeExtension 32`, () => {
    expect(changeExtension('file12.ts', '.js')).toBe('file12.js');
  });
  it(`changeExtension 33`, () => {
    expect(changeExtension('file13.ts', '.js')).toBe('file13.js');
  });
  it(`changeExtension 34`, () => {
    expect(changeExtension('file14.ts', '.js')).toBe('file14.js');
  });
  it(`changeExtension 35`, () => {
    expect(changeExtension('file15.ts', '.js')).toBe('file15.js');
  });
  it(`changeExtension 36`, () => {
    expect(changeExtension('file16.ts', '.js')).toBe('file16.js');
  });
  it(`changeExtension 37`, () => {
    expect(changeExtension('file17.ts', '.js')).toBe('file17.js');
  });
  it(`changeExtension 38`, () => {
    expect(changeExtension('file18.ts', '.js')).toBe('file18.js');
  });
  it(`changeExtension 39`, () => {
    expect(changeExtension('file19.ts', '.js')).toBe('file19.js');
  });
  it(`changeExtension 40`, () => {
    expect(changeExtension('file20.ts', '.js')).toBe('file20.js');
  });
  it(`changeExtension 41`, () => {
    expect(changeExtension('file21.ts', '.js')).toBe('file21.js');
  });
  it(`changeExtension 42`, () => {
    expect(changeExtension('file22.ts', '.js')).toBe('file22.js');
  });
  it(`changeExtension 43`, () => {
    expect(changeExtension('file23.ts', '.js')).toBe('file23.js');
  });
  it(`changeExtension 44`, () => {
    expect(changeExtension('file24.ts', '.js')).toBe('file24.js');
  });
  it(`changeExtension 45`, () => {
    expect(changeExtension('file25.ts', '.js')).toBe('file25.js');
  });
  it(`changeExtension 46`, () => {
    expect(changeExtension('file26.ts', '.js')).toBe('file26.js');
  });
  it(`changeExtension 47`, () => {
    expect(changeExtension('file27.ts', '.js')).toBe('file27.js');
  });
  it(`changeExtension 48`, () => {
    expect(changeExtension('file28.ts', '.js')).toBe('file28.js');
  });
  it(`changeExtension 49`, () => {
    expect(changeExtension('file29.ts', '.js')).toBe('file29.js');
  });
  it(`changeExtension 50`, () => {
    expect(changeExtension('file30.ts', '.js')).toBe('file30.js');
  });
});

describe('stripExtension', () => {
  it(`stripExtension 1: file.ts`, () => {
    expect(stripExtension('file.ts')).toBe('file');
  });
  it(`stripExtension 2: file.test.ts`, () => {
    expect(stripExtension('file.test.ts')).toBe('file.test');
  });
  it(`stripExtension 3: archive.tar.gz`, () => {
    expect(stripExtension('archive.tar.gz')).toBe('archive.tar');
  });
  it(`stripExtension 4: image.jpg`, () => {
    expect(stripExtension('image.jpg')).toBe('image');
  });
  it(`stripExtension 5: noext`, () => {
    expect(stripExtension('noext')).toBe('noext');
  });
  it(`stripExtension 6: .gitignore`, () => {
    expect(stripExtension('.gitignore')).toBe('.gitignore');
  });
  it(`stripExtension 7: readme.md`, () => {
    expect(stripExtension('readme.md')).toBe('readme');
  });
  it(`stripExtension 8: data.json`, () => {
    expect(stripExtension('data.json')).toBe('data');
  });
  it(`stripExtension 9: style.css`, () => {
    expect(stripExtension('style.css')).toBe('style');
  });
  it(`stripExtension 10: index.html`, () => {
    expect(stripExtension('index.html')).toBe('index');
  });
  it(`stripExtension 11: config.yaml`, () => {
    expect(stripExtension('config.yaml')).toBe('config');
  });
  it(`stripExtension 12: script.sh`, () => {
    expect(stripExtension('script.sh')).toBe('script');
  });
  it(`stripExtension 13: bundle.js`, () => {
    expect(stripExtension('bundle.js')).toBe('bundle');
  });
  it(`stripExtension 14: report.xlsx`, () => {
    expect(stripExtension('report.xlsx')).toBe('report');
  });
  it(`stripExtension 15: audio.mp3`, () => {
    expect(stripExtension('audio.mp3')).toBe('audio');
  });
  it(`stripExtension 16: video.mp4`, () => {
    expect(stripExtension('video.mp4')).toBe('video');
  });
  it(`stripExtension 17: photo.jpg`, () => {
    expect(stripExtension('photo.jpg')).toBe('photo');
  });
  it(`stripExtension 18: slide.pptx`, () => {
    expect(stripExtension('slide.pptx')).toBe('slide');
  });
  it(`stripExtension 19: word.docx`, () => {
    expect(stripExtension('word.docx')).toBe('word');
  });
  it(`stripExtension 20: package.json`, () => {
    expect(stripExtension('package.json')).toBe('package');
  });
  it(`stripExtension 21`, () => {
    expect(stripExtension('file01.ts')).toBe('file01');
  });
  it(`stripExtension 22`, () => {
    expect(stripExtension('file02.ts')).toBe('file02');
  });
  it(`stripExtension 23`, () => {
    expect(stripExtension('file03.ts')).toBe('file03');
  });
  it(`stripExtension 24`, () => {
    expect(stripExtension('file04.ts')).toBe('file04');
  });
  it(`stripExtension 25`, () => {
    expect(stripExtension('file05.ts')).toBe('file05');
  });
  it(`stripExtension 26`, () => {
    expect(stripExtension('file06.ts')).toBe('file06');
  });
  it(`stripExtension 27`, () => {
    expect(stripExtension('file07.ts')).toBe('file07');
  });
  it(`stripExtension 28`, () => {
    expect(stripExtension('file08.ts')).toBe('file08');
  });
  it(`stripExtension 29`, () => {
    expect(stripExtension('file09.ts')).toBe('file09');
  });
  it(`stripExtension 30`, () => {
    expect(stripExtension('file10.ts')).toBe('file10');
  });
});

describe('generateUniqueFilename', () => {
  it(`returns base when not in existing`, () => {
    expect(generateUniqueFilename('file.txt', [])).toBe('file.txt');
  });
  it(`returns base when existing is empty`, () => {
    expect(generateUniqueFilename('report.pdf', [])).toBe('report.pdf');
  });
  it(`appends (1) when base exists`, () => {
    expect(generateUniqueFilename('file.txt', ['file.txt'])).toBe('file (1).txt');
  });
  it(`appends (2) when (1) also exists`, () => {
    expect(generateUniqueFilename('file.txt', ['file.txt', 'file (1).txt'])).toBe('file (2).txt');
  });
  it(`appends (3) when (1) and (2) also exist`, () => {
    expect(generateUniqueFilename('file.txt', ['file.txt', 'file (1).txt', 'file (2).txt'])).toBe('file (3).txt');
  });
  it(`handles no extension`, () => {
    expect(generateUniqueFilename('myfile', ['myfile'])).toBe('myfile (1)');
  });
  it(`handles no extension collision 2`, () => {
    expect(generateUniqueFilename('myfile', ['myfile', 'myfile (1)'])).toBe('myfile (2)');
  });
  it(`handles pdf extension`, () => {
    expect(generateUniqueFilename('report.pdf', ['report.pdf'])).toBe('report (1).pdf');
  });
  it(`not in existing list returns as-is`, () => {
    expect(generateUniqueFilename('new.ts', ['old.ts', 'other.ts'])).toBe('new.ts');
  });
  it(`preserves compound extension`, () => {
    expect(generateUniqueFilename('file.test.ts', ['file.test.ts'])).toBe('file.test (1).ts');
  });
  it(`generateUniqueFilename extra 1`, () => {
    expect(generateUniqueFilename('doc01.pdf', ['doc01.pdf'])).toBe('doc01 (1).pdf');
  });
  it(`generateUniqueFilename extra 2`, () => {
    expect(generateUniqueFilename('doc02.pdf', ['doc02.pdf'])).toBe('doc02 (1).pdf');
  });
  it(`generateUniqueFilename extra 3`, () => {
    expect(generateUniqueFilename('doc03.pdf', ['doc03.pdf'])).toBe('doc03 (1).pdf');
  });
  it(`generateUniqueFilename extra 4`, () => {
    expect(generateUniqueFilename('doc04.pdf', ['doc04.pdf'])).toBe('doc04 (1).pdf');
  });
  it(`generateUniqueFilename extra 5`, () => {
    expect(generateUniqueFilename('doc05.pdf', ['doc05.pdf'])).toBe('doc05 (1).pdf');
  });
  it(`generateUniqueFilename extra 6`, () => {
    expect(generateUniqueFilename('doc06.pdf', ['doc06.pdf'])).toBe('doc06 (1).pdf');
  });
  it(`generateUniqueFilename extra 7`, () => {
    expect(generateUniqueFilename('doc07.pdf', ['doc07.pdf'])).toBe('doc07 (1).pdf');
  });
  it(`generateUniqueFilename extra 8`, () => {
    expect(generateUniqueFilename('doc08.pdf', ['doc08.pdf'])).toBe('doc08 (1).pdf');
  });
  it(`generateUniqueFilename extra 9`, () => {
    expect(generateUniqueFilename('doc09.pdf', ['doc09.pdf'])).toBe('doc09 (1).pdf');
  });
  it(`generateUniqueFilename extra 10`, () => {
    expect(generateUniqueFilename('doc10.pdf', ['doc10.pdf'])).toBe('doc10 (1).pdf');
  });
  it(`generateUniqueFilename extra 11`, () => {
    expect(generateUniqueFilename('doc11.pdf', ['doc11.pdf'])).toBe('doc11 (1).pdf');
  });
  it(`generateUniqueFilename extra 12`, () => {
    expect(generateUniqueFilename('doc12.pdf', ['doc12.pdf'])).toBe('doc12 (1).pdf');
  });
  it(`generateUniqueFilename extra 13`, () => {
    expect(generateUniqueFilename('doc13.pdf', ['doc13.pdf'])).toBe('doc13 (1).pdf');
  });
  it(`generateUniqueFilename extra 14`, () => {
    expect(generateUniqueFilename('doc14.pdf', ['doc14.pdf'])).toBe('doc14 (1).pdf');
  });
  it(`generateUniqueFilename extra 15`, () => {
    expect(generateUniqueFilename('doc15.pdf', ['doc15.pdf'])).toBe('doc15 (1).pdf');
  });
  it(`generateUniqueFilename extra 16`, () => {
    expect(generateUniqueFilename('doc16.pdf', ['doc16.pdf'])).toBe('doc16 (1).pdf');
  });
  it(`generateUniqueFilename extra 17`, () => {
    expect(generateUniqueFilename('doc17.pdf', ['doc17.pdf'])).toBe('doc17 (1).pdf');
  });
  it(`generateUniqueFilename extra 18`, () => {
    expect(generateUniqueFilename('doc18.pdf', ['doc18.pdf'])).toBe('doc18 (1).pdf');
  });
  it(`generateUniqueFilename extra 19`, () => {
    expect(generateUniqueFilename('doc19.pdf', ['doc19.pdf'])).toBe('doc19 (1).pdf');
  });
  it(`generateUniqueFilename extra 20`, () => {
    expect(generateUniqueFilename('doc20.pdf', ['doc20.pdf'])).toBe('doc20 (1).pdf');
  });
});

describe('resolve', () => {
  it(`resolve 1`, () => {
    expect(resolve('/foo', 'bar')).toBe('/foo/bar');
  });
  it(`resolve 2`, () => {
    expect(resolve('/foo', 'bar', 'baz')).toBe('/foo/bar/baz');
  });
  it(`resolve 3`, () => {
    expect(resolve('/foo', '/bar')).toBe('/bar');
  });
  it(`resolve 4`, () => {
    expect(resolve('foo', 'bar')).toBe('/cwd/foo/bar');
  });
  it(`resolve 5`, () => {
    expect(resolve('/a', 'b', 'c')).toBe('/a/b/c');
  });
  it(`resolve 6`, () => {
    expect(resolve('/a', '../b')).toBe('/b');
  });
  it(`resolve 7`, () => {
    expect(resolve('/a/b', '../c')).toBe('/a/c');
  });
  it(`resolve 8`, () => {
    expect(resolve('/a/b/c', '../../d')).toBe('/a/d');
  });
  it(`resolve 9`, () => {
    expect(resolve('/foo')).toBe('/foo');
  });
  it(`resolve 10`, () => {
    expect(resolve('/')).toBe('/');
  });
  it(`resolve 11`, () => {
    expect(resolve('/a', 'b', '../c')).toBe('/a/c');
  });
  it(`resolve 12`, () => {
    expect(resolve('/x/y/z', '..')).toBe('/x/y');
  });
  it(`resolve 13`, () => {
    expect(resolve('/x/y/z', '../..')).toBe('/x');
  });
  it(`resolve 14`, () => {
    expect(resolve('/x', 'y', 'z')).toBe('/x/y/z');
  });
  it(`resolve 15`, () => {
    expect(resolve('/usr', 'local', 'bin')).toBe('/usr/local/bin');
  });
  it(`resolve 16`, () => {
    expect(resolve('/etc', 'nginx', 'nginx.conf')).toBe('/etc/nginx/nginx.conf');
  });
  it(`resolve 17`, () => {
    expect(resolve('/home', 'user', 'docs', 'file.txt')).toBe('/home/user/docs/file.txt');
  });
  it(`resolve 18`, () => {
    expect(resolve('/a/b', 'c/d')).toBe('/a/b/c/d');
  });
  it(`resolve 19`, () => {
    expect(resolve('/root')).toBe('/root');
  });
  it(`resolve 20`, () => {
    expect(resolve('/a/b/../c', 'd')).toBe('/a/c/d');
  });
});

