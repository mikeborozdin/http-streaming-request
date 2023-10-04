# http-streaming-request

## Introduction

I've built this library to help to work with streaming requests for the OpenAI APIs that returns JSON. That said, you can use it with any other API that returns JSON via a streamed HTTP response.

// give me a markdown table

| Move from this                         | To this                          |
| -------------------------------------- | -------------------------------- |
| ![no streaming](docs/no-streaming.gif) | ![streaming](docs/streaming.gif) |

## HTTP Streaming & JSON

🐢 Slow API endpoints turn users away from your app. For example, a request to the OpenAI API usually takes around 10 seconds. But if you stream a response you can start showing results to users almost straight away. That's how ChatGPT works - when it prints out a response character by character (well, token by token actually).

📖 It's all good if you return text, but what if you return JSON? Streaming JSON means that almost at every single moment your JSON is not well formed, for example, it may look like this:

```json
[{"name": "Joe
```

💔 If you put it through `JSON.parse()` you'll get an error. And chances are you'll only get a well formed JSON only after a request completes.

🕒 But if you wait for it to complete you won't be able to show anything to a user. And that will defeat the purpose of using streaming.

## A way out

🚀 This library solves this problem. Just call `makeStreamingJsonRequest()` and it'll give a stream of well formed JSON, even if the underlying response JSON is still malformed. For example,

```ts
const stream = makeStreamingJsonRequest({
  url: "/some-api",
  method: "POST",
});

for await (const data of stream) {
  // if the API only returns [{"name": "Joe
  // the line below will print `[{ name: "Joe" }]`

  console.log(data);
}
```

## Installation

```bash
npm install --save-dev http-streaming-request
# or
yarn add --dev http-streaming-request
```

## Examples

### Example with React

#### [Run this example](https://http-streaming-request-demo.vercel.app/)

```ts
import { makeStreamingJsonRequest } from "http-streaming-request";

const PeopleListWithMakeStreamingJsonRequest: React.FC = () => {
  const [people, setPeople] = useState<Person[] | null>(null);

  const onGetPeopleClick = async () => {
    for await (const peopleSoFar of makeStreamingJsonRequest<Person[]>({
      url: "/api/people",
      method: "GET",
    })) {
      setPeople(peopleSoFar);
    }
  };

  return (
    <>
      <button onClick={onGetPeopleClick}>Run example</button>

      {people && people.length > 0 && (
        <div>
          {people.map((person, i) => (
            <div key={i}>
              <div>
                <strong>Name:</strong> {person.name}
              </div>
              <div>
                <strong>Age:</strong> {person.age}
              </div>
              <div>
                <strong>City:</strong> {person.city}
              </div>
              <div>
                <strong>Country:</strong> {person.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
```

### Example with React Hooks

#### [Run this example](https://http-streaming-request-demo.vercel.app/hooks)

```ts
import { useJsonStreaming } from "http-streaming-request";

const PeopleListWithHooks: React.FC = () => {
  const { data: people, run } = useJsonStreaming<Person[]>({
    url: "/api/people",
    method: "GET",
  });

  return (
    <>
      {people && people.length > 0 && (
        <div>
          {people.map((person, i) => (
            <div key={i}>
              <div>
                <strong>Name:</strong> {person.name}
              </div>
              <div>
                <strong>Age:</strong> {person.age}
              </div>
              <div>
                <strong>City:</strong> {person.city}
              </div>
              <div>
                <strong>Country:</strong> {person.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
```

## API

### `makeStreamingJsonRequest`

`makeStreamingJsonRequest<T>(params: MakeStreamingRequestParams): AsyncGenerator`

`makeStreamingJsonRequest()` makes a request to a steaming HTTP endpoint and returns an asynchrnous generator.

#### Usage

```ts
const stream = makeStreamingJsonRequest({
  url: "/some-api",
  method: "POST",
});

for await (const data of stream) {
  console.log(data);
}
```

#### `makeStreamingRequestParams`

- `url: string` - the API endpoint URL
- `method: "GET" | "POST" | "PUT" | "DELETE"` - HTTP method
- `payload?: any` - any payload

You can also provide a generic type parameter for type safety:

```ts
const stream = makeStreamingJsonRequest<Person[]>({
  url: "/some-api",
  method: "POST",
});

for await (const data of stream) {
  // data is now instance of Person[]
  console.log(data);
}
```

### `useJsonStreaming()`

`useJsonStreaming<T>(params: MakeStreamingRequestParams): { data T, run }`

`useJsonStreaming()` is a React hook that makes a request to a steaming HTTP endpoint.

#### Usage

```ts
const { data, run } = useJsonStreaming<Person[]>({
  url: "/api/people",
  method: "GET",
  payload: somePayload,
});

const onReRun = () => {
  // you can also easily re-run the request with a differnt payload

  run({ payload: someOtherPayload });
};
```
