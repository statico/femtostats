"use strict";

// This script is written to be as browser-compatible as we can reasonably make
// it. That's why we're using var and not const/let, and that's why it's
// minified with UglifyJS instead of terser.

!(function () {
  // Factoring these out helps with minificiation.
  var w = window;
  var h = w.history;
  var l = w.location;
  var d = w.document;
  var n = navigator;

  // IE isn't supported.
  if (!d.currentScript || typeof URL === "undefined") return;

  // What host will we make a POST request to?
  var host = new URL(d.currentScript.src).origin;

  // We need a session ID somehow. UUIDs are recognizable as being opaque and
  // random. From https://stackoverflow.com/a/8809472
  function generateUUID() {
    var t = new Date().getTime();
    var t2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (char) {
        var r = Math.random() * 16;
        if (t > 0) {
          r = (t + r) % 16 | 0;
          t = Math.floor(t / 16);
        } else {
          r = (t2 + r) % 16 | 0;
          t2 = Math.floor(t2 / 16);
        }
        return (char === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
  }

  // Allow Femtostats to operate in cookieless mode for easier compliance with
  // local laws. A session won't be as accurate, but what can you do? fs.js.tsx
  // will change this to false if NO_COOKIES is set.
  var useCookies = true;

  // Create or retrieve a session ID
  var sessionId;
  if (useCookies) {
    var cookies = d.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split("=");
      if (parts[0] === "sid") {
        sessionId = parts[1];
      }
    }
    if (!sessionId) {
      sessionId = generateUUID();
      console.log("sid=" + sessionId + ";samesite=lax");
      d.cookie = "sid=" + sessionId + ";samesite=lax";
    }
  } else {
    sessionId = generateUUID();
  }

  // Global event tracking function
  function trackEvent(name, data) {
    var body = {
      n: name || null, // null == pageview
      s: sessionId,
      u: l.href,
      r: l.referrer,
      sw: w.innerWidth,
      d: data,
    };

    var req = new XMLHttpRequest();
    req.open("POST", host + "/api/event");
    req.send(JSON.stringify(body));
  }

  // Handle page errors
  var oldOnError = w.onerror;
  if (typeof oldOnError !== "function") oldOnError = function () {};
  w.onerror = function (message, url, line, column, error) {
    trackEvent("error", { message, url, line, column, error: String(error) });
    oldOnError(message, url, line, column, error);
  };

  // Handle uncaught rejections from promises
  var oldOnUnRej = w.unhandledrejection;
  if (typeof oldOnUnRej !== "function") oldOnUnRej = function () {};
  w.onunhandledrejection = function (error) {
    trackEvent("error", { error: String(error) });
    oldOnUnRej(error);
  };

  // Track this page view
  setTimeout(function () {
    trackEvent();
  }, 1);

  // Track any hash changes as page views for SPAs
  w.addEventListener("popstate", function () {
    trackEvent();
  });
  if (h && h.pushState) {
    var oldPushState = h.pushState;
    h.pushState = function () {
      oldPushState.apply(this, arguments);
      trackEvent();
    };
  }

  // Track when sessions end
  d.addEventListener("visibilitychange", function () {
    if (d.visibilityState === "hidden") {
      if (n.sendBeacon)
        n.sendBeacon(host + "/api/end", JSON.stringify({ s: sessionId }));
    }
  });

  // Done
  w.femtostats = trackEvent;
})();
