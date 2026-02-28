// Minimal Next.js server mock for Jest

class NextURL extends URL {
  clone(): NextURL {
    return new NextURL(this.toString());
  }
}

export class NextRequest {
  url: string;
  nextUrl: NextURL;
  cookies: { get: (name: string) => { value: string } | undefined };

  constructor(url: string, options: { cookies?: Record<string, string> } = {}) {
    this.url = url;
    this.nextUrl = new NextURL(url);
    const cookieMap = options.cookies ?? {};
    this.cookies = {
      get: (name: string) =>
        name in cookieMap ? { value: cookieMap[name] } : undefined,
    };
  }
}

export class NextResponse {
  static next() { return { type: 'next' }; }
  static redirect(url: URL) { return { type: 'redirect', url: url.toString() }; }
}
