export function getTokenFromCookies(cookieHeader: string): string | null {
  console.log(cookieHeader);
  const cookies = cookieHeader?.split(';').reduce(
    (acc, cookie) => {
      const [name, value] = cookie.split('=').map((part) => part.trim());
      acc[name] = value;
      return acc;
    },
    {} as { [key: string]: string },
  );

  return cookies['accessToken'] || null;
}
