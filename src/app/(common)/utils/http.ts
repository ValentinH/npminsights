const makeWrapper =
  (method: RequestInit['method']) =>
  async <Data = any>(
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ): Promise<{
    data: Data;
    status: number;
  }> => {
    const res = await fetch(input, {
      ...init,
      method,
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return {
      data: await res.json(),
      status: res.status,
    };
  };

const http = {
  get: makeWrapper('GET'),
  post: makeWrapper('POST'),
  put: makeWrapper('PUT'),
  delete: makeWrapper('DELETE'),
};

export default http;
