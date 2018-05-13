class EventBus {
  private subscribers: { [topic: string]: Function[] } = {};
  subscribe(topic: string, subscriber: Function) {
    (this.subscribers[topic] = this.subscribers[topic] || []).push(subscriber);
    return () => {
      this.subscribers[topic].splice(
        this.subscribers[topic].indexOf(subscriber),
        1
      );
    };
  }
  publish(topic: string, data: any) {
    if (!!this.subscribers[topic]) {
      this.subscribers[topic].forEach(subscriber => {
        subscriber(data);
      });
    }
  }
}
export default EventBus;
