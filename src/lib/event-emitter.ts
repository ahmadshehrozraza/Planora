import { EventEmitter } from 'events';

const globalForEventEmitter = globalThis as unknown as {
  eventEmitter: EventEmitter | undefined;
};

export const eventEmitter = globalForEventEmitter.eventEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEventEmitter.eventEmitter = eventEmitter;
}