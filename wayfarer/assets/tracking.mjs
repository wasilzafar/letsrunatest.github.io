import { DIRECT_CALL, TAGS_URL } from "./events.mjs";

export const STATE_KEY = "wayfarer:behavior:v1";
export const CONSENT_KEY = "wayfarer:consent:v1";
export const LOG_KEY = "wayfarer:log:v1";

export class Tracker {
  constructor({ storage, consentStorage, loadLibrary, getSatellite, onStatus, onLog }) {
    this.storage = storage;
    this.consentStorage = consentStorage;
    this.loadLibrary = loadLibrary;
    this.getSatellite = getSatellite;
    this.onStatus = onStatus;
    this.onLog = onLog;
    this.ready = false;
    this.loading = null;
    this.state = { queue: [], purchases: [] };
    this.log = [];
    this.consent = null;
    try {
      this.consent = consentStorage.getItem(CONSENT_KEY);
      const stored = JSON.parse(storage.getItem(STATE_KEY) || "null");
      if (stored) {
        if (!Array.isArray(stored.queue) || !Array.isArray(stored.purchases)) {
          throw new Error("Invalid locally stored tracking state");
        }
        this.state = stored;
      }
      this.log = JSON.parse(storage.getItem(LOG_KEY) || "[]");
      if (!Array.isArray(this.log)) throw new Error("Invalid local event log");
      if (this.consent !== "allowed") this.persist({ queue: [], purchases: this.state.purchases });
      this.onLog(this.log);
    } catch (error) {
      this.consent = null;
      this.fail(error);
    }
  }

  fail(error) {
    console.error("[Wayfarer analytics]", error);
    this.onStatus(`Analytics error: ${error.message}`);
  }

  persist(next) {
    this.storage.setItem(STATE_KEY, JSON.stringify(next));
    this.state = next;
  }

  record(status, xdm) {
    const entry = { at: new Date().toISOString(), status, xdm };
    const next = [...this.log, entry].slice(-50);
    try {
      this.storage.setItem(LOG_KEY, JSON.stringify(next));
      this.log = next;
      this.onLog(this.log);
    } catch (error) {
      this.fail(error);
    }
  }

  clearLog() {
    try {
      this.storage.removeItem(LOG_KEY);
      this.log = [];
      this.onLog(this.log);
    } catch (error) {
      this.fail(error);
    }
  }

  async allow() {
    try {
      this.consentStorage.setItem(CONSENT_KEY, "allowed");
      this.consent = "allowed";
    } catch (error) {
      this.fail(error);
      return false;
    }
    if (this.ready) return true;
    if (this.loading) return this.loading;
    this.onStatus("Loading development Tags library...");
    this.loading = Promise.resolve().then(() => this.loadLibrary()).then(() => {
      if (typeof this.getSatellite()?.track !== "function") {
        throw new Error("Tags loaded without a direct-call API");
      }
      if (this.consent !== "allowed") return false;
      this.ready = true;
      this.onStatus("Tags loaded; delivery unverified");
      this.flush();
      return true;
    }).catch(error => {
      this.fail(error);
      return false;
    });
    return this.loading;
  }

  decline() {
    try {
      this.consentStorage.setItem(CONSENT_KEY, "denied");
      this.consent = "denied";
      this.persist({ queue: [], purchases: this.state.purchases });
      this.clearLog();
      this.onStatus("Analytics declined");
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  enqueue(xdm, purchaseID = null) {
    if (this.consent !== "allowed") return false;
    if (purchaseID && this.state.purchases.includes(purchaseID)) return false;
    try {
      if (this.state.queue.length >= 100) throw new Error("Event queue full; verify or reload the Tags library");
      const next = {
        queue: [...this.state.queue, { xdm }],
        purchases: purchaseID ? [...this.state.purchases, purchaseID] : this.state.purchases
      };
      this.persist(next);
      this.record("Queued locally", xdm);
      this.flush();
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  flush() {
    if (!this.ready || this.consent !== "allowed") return;
    while (this.state.queue.length) {
      const entry = this.state.queue[0];
      try {
        this.getSatellite().track(DIRECT_CALL, { xdm: entry.xdm });
        this.persist({ ...this.state, queue: this.state.queue.slice(1) });
        this.record("Handed to Tags (delivery unverified)", entry.xdm);
      } catch (error) {
        this.ready = false;
        this.fail(error);
        return;
      }
    }
  }
}

export function loadTags(document, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TAGS_URL;
    script.async = true;
    script.id = "wayfarer-adobe-tags";
    const timer = setTimeout(() => reject(new Error("Tags load timed out; check network/consent, then reload")), timeout);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); reject(new Error("Tags library failed to load; check network or blockers")); };
    document.head.append(script);
  });
}
