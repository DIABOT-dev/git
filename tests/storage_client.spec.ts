import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAvatarObjectKey,
  buildMealObjectKey,
  buildReportObjectKey,
  deleteObject,
  getObject,
  putObject,
} from "../src/infrastructure/storage/viettel_client";

describe("viettel storage client", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const proxyUrl = "https://dia-brain.dev";
  const endpoint = "https://viettel-s3";

  beforeEach(() => {
    process.env.DIA_BRAIN_STORAGE_PROXY_URL = proxyUrl;
    process.env.VTS_ENDPOINT = endpoint;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("PUT thành công trả 200 và resolve", async () => {
    const okResponse = new Response(null, { status: 200, statusText: "OK" });
    const fetchSpy = vi.fn().mockResolvedValue(okResponse);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await expect(
      putObject("private-bucket", "meal/user/2025/10/09/foo.png", Buffer.from("ok"), "image/png"),
    ).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${proxyUrl}/storage/private-bucket/meal/user/2025/10/09/foo.png`);
    expect(options?.method).toBe("PUT");
    const headers = options?.headers as Headers;
    expect(headers.get("x-dia-storage-provider")).toBe("viettel");
    expect(headers.get("x-dia-storage-endpoint")).toBe(endpoint);
    expect(headers.get("x-dia-storage-proxy")).toBe("dia-brain");
    expect(headers.get("content-type")).toBe("image/png");
  });

  it("Proxy trả mã khác 200 thì ném lỗi chi tiết", async () => {
    const errorResponse = new Response("permission denied", {
      status: 403,
      statusText: "Forbidden",
    });
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await expect(putObject("private", "reports/u/r.pdf", Buffer.from("x"))).rejects.toThrow(
      /Failed to PUT object private\/reports\/u\/r\.pdf: 403 Forbidden - permission denied/,
    );
  });

  it("Body Buffer/Uint8Array/Blob đều convert sang BodyInit hợp lệ", async () => {
    const okResponse = new Response(null, { status: 200, statusText: "OK" });
    const fetchSpy = vi.fn().mockResolvedValue(okResponse);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const payloads: Array<{
      label: string;
      body: Buffer | Uint8Array | Blob;
      assert: (body: BodyInit | null | undefined) => void;
    }> = [
      {
        label: "Buffer",
        body: Buffer.from("abc"),
        assert: (body) => {
          expect(body).toBeInstanceOf(Uint8Array);
          expect(Buffer.from(body as Uint8Array).toString()).toBe("abc");
        },
      },
      {
        label: "Uint8Array",
        body: Uint8Array.from([1, 2, 3]),
        assert: (body) => {
          expect(body).toBeInstanceOf(Uint8Array);
          expect(Array.from(body as Uint8Array)).toEqual([1, 2, 3]);
        },
      },
      {
        label: "Blob",
        body: new Blob([Uint8Array.from([7, 8])], { type: "application/octet-stream" }),
        assert: (body) => {
          expect(body).toBeInstanceOf(Blob);
        },
      },
    ];

    for (const { body, assert } of payloads) {
      await putObject("private", "avatars/user.png", body, "application/octet-stream");
      const [, options] = fetchSpy.mock.calls.pop() as [string, RequestInit];
      assert(options?.body ?? undefined);
    }
  });

  it("builds storage keys với cấu trúc chuẩn", () => {
    const mealKey = buildMealObjectKey({
      userId: "user-123",
      capturedAt: new Date(Date.UTC(2025, 0, 5)),
      objectId: "file-789",
      extension: ".jpg",
    });
    expect(mealKey).toBe("meal/user-123/2025/01/05/file-789.jpg");

    const avatarKey = buildAvatarObjectKey("user-123", "png");
    expect(avatarKey).toBe("avatars/user-123.png");

    const reportKey = buildReportObjectKey({ userId: "user-123", reportType: "weekly", periodEnd: "2025-10-09" });
    expect(reportKey).toBe("reports/user-123/weekly_2025-10-09.pdf");
  });

  it("DELETE propagate lỗi khi proxy trả lỗi", async () => {
    const errorResponse = new Response("remove blocked", { status: 500, statusText: "Server Error" });
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    await expect(deleteObject("private", "avatars/user.png")).rejects.toThrow(
      /Failed to DELETE object private\/avatars\/user\.png: 500 Server Error - remove blocked/,
    );
  });

  it("GET trả về response gốc khi thành công", async () => {
    const okResponse = new Response("ok", { status: 200, statusText: "OK" });
    const fetchSpy = vi.fn().mockResolvedValue(okResponse);
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const response = await getObject("public-bucket", "avatars/user.png");
    expect(response).toBe(okResponse);
    expect(fetchSpy).toHaveBeenCalledWith(
      `${proxyUrl}/storage/public-bucket/avatars/user.png`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
