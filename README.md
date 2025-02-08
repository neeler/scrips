# scrips

`scrips` is a tiny zero-dependency JavaScript utility for managing arbitrary event subscriptions.

Compatible with Node.js and browser environments.

![example workflow](https://github.com/neeler/scrips/actions/workflows/tests.yml/badge.svg)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/scrips)

## Installation

Install the `scrips` npm module using your favorite package manager:

```bash
npm install scrips
# or
# pnpm install scrips
# or
# yarn add scrips
```

## Quick Start

With `scrips` you can:

- Enable any object to emit events.
- Subscribe to events with callbacks.
- Define the event payload.
- Unsubscribe from events.

Import the `SubscriptionManager` class from `scrips` using CommonJS or ES modules:

```typescript
// CommonJS
const { SubscriptionManager } = require('scrips');

// ES modules
import { SubscriptionManager } from 'scrips';
```

Create a subscription manager instance:

```typescript
const scrips = new SubscriptionManager<{ foo: string; bar: number }>();
```

Subscribe to an event from wherever you want:

```typescript
function callback1(payload: { foo: string; bar: number }) {
    console.log('Callback 1:', payload);
}

function callback2(payload: { foo: string; bar: number }) {
    console.log('Callback 2:', payload);
}

const someObject = {
    callback3: (payload: { foo: string; bar: number }) => {
        console.log('Callback 3:', payload);
    },
};

scrips.subscribe(callback1);
scrips.subscribe(callback2);
scrips.subscribe(someObject.callback3);
```

Receive the event payload when the event is emitted:

```typescript
scrips.publish({ foo: 'Hello', bar: 42 });

// Output:
// Callback 1: { foo: 'Hello', bar: 42 }
// Callback 2: { foo: 'Hello', bar: 42 }
// Callback 3: { foo: 'Hello', bar: 42 }
```

Unsubscribe from an event:

```typescript
scrips.unsubscribe(callback1);
```

Now, `callback1` will not be called when the event is emitted.

```typescript
scrips.publish({ foo: 'Hello', bar: 42 });

// Output:
// Callback 2: { foo: 'Hello', bar: 42 }
// Callback 3: { foo: 'Hello', bar: 42 }
```

## Usage with React

You can use `scrips` in a React app by making a simple custom hook:

```typescript
import { useEffect, useState } from 'react';
import { SubscriptionManager } from 'scrips';

export function useSubscriptionStatus<P>(
    subscriptionManager: SubscriptionManager<P>,
    defaultValue: P,
) {
    const [status, setStatus] = useState<P>(defaultValue);
    useEffect(() => {
        const callback = (payload: P) => {
            setStatus(payload);
        };
        subscriptionManager?.subscribe(callback);
        return () => {
            subscriptionManager?.unsubscribe(callback);
        };
    }, [subscriptionManager]);
    return status;
}
```

Suppose you want to activate several things in different places when a user takes some action.
For example, if the user allows their browser to access the microphone,
you want to start running an FFT analysis on the audio stream and start a canvas animation.

Create a subscription manager instance outside the React component lifecycle:

```typescript
const microphoneScrips = new SubscriptionManager<MediaStream | null>();
```

Then, use the custom hook in your React components:

```tsx
function MyCoolCanvasAnimation() {
    const microphoneStream = useSubscriptionStatus(microphoneScrips, null);

    useEffect(() => {
        if (microphoneStream?.active) {
            // Start drawing in the canvas
        } else {
            // Stop drawing
        }
    }, [microphoneStream]);

    return <div>Render the canvas</div>;
}
```

```tsx
function MyFFTDisplay() {
    const microphoneStream = useSubscriptionStatus(microphoneScrips, null);

    useEffect(() => {
        if (microphoneStream?.active) {
            // Start the FFT analysis
        } else {
            // Stop the FFT analysis
        }
    }, [microphoneStream]);

    return <div>Render the FFT analysis</div>;
}
```

Finally, publish the event from wherever you want.
For example, in some user flow where you ask for microphone access:

```typescript
const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
});

if (audioStream) {
    microphoneScrips.publish(audioStream);
}
```

Now, both `MyCoolCanvasAnimation` and `MyFFTDisplay` will start running if the user allows access to the microphone.
