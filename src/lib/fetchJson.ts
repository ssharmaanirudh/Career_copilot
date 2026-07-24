/**
 * Parses a fetch Response as JSON, tolerating the case where the server
 * (or the hosting platform in front of it — e.g. a serverless function
 * timeout) returns a non-JSON error page instead of our own API's JSON
 * error shape. Never lets a raw parse error reach the user.
 */
export async function parseJsonResponse<T>(res: Response, fallbackErrorMessage: string): Promise<T> {
  const text = await res.text();

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      res.ok
        ? fallbackErrorMessage
        : `${fallbackErrorMessage} (the request may have taken too long — try again, or with a shorter job description).`,
    );
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : fallbackErrorMessage;
    throw new Error(message);
  }

  return data as T;
}
