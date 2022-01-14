type PubSubEvent = {
  [key: string]: string;
};

type Callback = (...args: any[]) => void;
type Callbacks = Callback[];

type PubSubEventsCallbacks<Events extends PubSubEvent> = {
  [key in keyof Events]: Callbacks;
};

export class PubSub<Events extends PubSubEvent> {
  events: PubSubEventsCallbacks<Events>;

  constructor(events: Events) {
    this.events = Object.fromEntries(
      Object.keys(events).map((key) => [key, []])
    ) as unknown as PubSubEventsCallbacks<Events>;
  }

  public subscribe(event: keyof Events, callback: Callback, max?: number) {
    if (!this.events[event]) {
      throw new Error(`Event ${event} does not exist.`);
    }

    if (max && max > 0 && this.events[event].length >= max) {
      return () => this.unsubscribe(event, callback);
    }

    this.events[event].push(callback);

    return () => this.unsubscribe(event, callback);
  }

  private unsubscribe(event: keyof Events, callback: Callback) {
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  publish(event: keyof Events, ...args: any[]) {
    if (!this.events[event]) {
      throw new Error(`Event ${event} does not exist.`);
    }

    this.events[event].forEach((callback) => callback(...args));
  }
}
