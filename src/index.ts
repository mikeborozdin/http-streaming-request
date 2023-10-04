import { useCallback, useEffect, useState } from "react";
import { parse } from "best-effort-json-parser";

interface MakeStreamingRequestParams {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  payload?: any;
}

interface JsonStreamingParams extends MakeStreamingRequestParams {
  manual?: boolean;
}

interface RunManuallyParams {
  payload: any;
}

async function* makeStreamingRequest({
  url,
  method,
  payload,
}: MakeStreamingRequestParams) {
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: payload && JSON.stringify(payload),
  });

  const data = res.body;

  if (data) {
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      buffer += chunkValue;

      yield buffer;
    }
  }
}

async function* makeStreamingJsonRequest<T>({
  url,
  method,
  payload,
}: MakeStreamingRequestParams) {
  const stream = makeStreamingRequest({ url, method, payload });

  for await (const chunk of stream) {
    yield parse(chunk);
  }
}

const useJsonStreaming = <T>({
  url,
  method,
  payload,
  manual,
}: JsonStreamingParams) => {
  const [data, setData] = useState<T | null>(null);

  const runAutomatically = useCallback(async () => {
    const stream = makeStreamingRequest({ url, method, payload });

    for await (const chunk of stream) {
      setData(parse(chunk));
    }
  }, [url, payload]);

  const run = async (params?: RunManuallyParams) => {
    const stream = makeStreamingJsonRequest<T>({
      url,
      method,
      payload: params?.payload || payload,
    });

    for await (const chunk of stream) {
      setData(chunk);
    }
  };

  useEffect(() => {
    if (!manual) {
      runAutomatically();
    }
  }, [url, payload, manual, runAutomatically]);

  return { data, run };
};

export { useJsonStreaming, makeStreamingJsonRequest };
