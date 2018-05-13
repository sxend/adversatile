import EventBus from "../../src/lib/EventBus";

test("EventBus", done => {
  const eb = new EventBus();
  eb.subscribe("topic", (data: string) => {
    expect(data).toBe("data");
    done();
  });
  eb.publish("topic", "data");
});
