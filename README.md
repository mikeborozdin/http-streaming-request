# http-streaming-request

## Introduction

I've built this lubrary to help to work with streaming requests for the OpenAI APIs that returns JSON. That said, you can use it with any other API that returns JSON via a streamed HTTP response.

# HTTP Streaming & JSON

Slow API endpoints may put users away from your app. For example, an OpenAI API usually takes around 10 seconds to return a result. But if you stream a response you can show it straight away to users. That's how ChatGPT works.

It's all good if you return text, but what if you return JSON? Streaming JSON means that almost at every single moment your JSON is not well formed, for example, it may look like this:

```json
[{"name": "Joe
```

Your streaming API will still return text that looks like:

If you put it through `JSON.parse()` you'll get an error. And chances are you'll only get a well formed JSON only after a request completes. But if you wait for it to complete you won't be able to show anything to a user. And that will defeat the purpose of using streamign.

## A way out

This library solves this problem. Just call `makeStreamingJsonRequest()` and it'll give a stream of well formed JSON, even if the underlying request JSON is malformed. For example,

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

# Example

# Example with React

Just call `makeStreamingJsonRequest()` and get your JSON data.

```ts
const stream = makeStreamingJsonRequest({
  url: "/some-api",
  method: "POST",
});

for await (const data of stream) {
  console.log(data);
}
```

```ts
const PeopleList: React.FC = () => {
  const [people, setPeople] = useState<Person[] | null>(null);

  const onGetPeopleClick = async () => {
    const onOwnStreamingClick = async () => {
      for await (const d of makeStreamingJsonRequest<Partial<Person>[]>({
        url: "/api/chat",
        method: "POST",
      })) {
        setData(d);
      }
    };
  };
};
```
