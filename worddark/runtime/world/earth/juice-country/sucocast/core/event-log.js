/* WordDark — SucoCast Event Log */
class SucoCastEventLog {
  constructor() {
    this.events = [];
  }

  add(type, data) {
    const event = {
      eventId: "SC-EVT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      type: type,
      data: data || {},
      timestamp: new Date().toISOString()
    };
    this.events.push(event);
    return event;
  }

  list() {
    return this.events.slice();
  }
}

if (typeof window !== "undefined") window.SucoCastEventLog = SucoCastEventLog;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastEventLog;
