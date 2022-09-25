"use strict";

// This script is written to be as browser-compatible as we can reasonably make
// it. That's why we're using var and not const/let, and that's why it's
// minified with UglifyJS instead of terser.

!(function () {
  // Factoring these out helps with minificiation.
  var win = window,
    hist = win.history,
    loc = win.location,
    doc = win.document,
    perf = win.performance,
    nav = navigator;

  // IE isn't supported.
  var script = doc.currentScript;
  if (!script || typeof URL === "undefined") return;

  var host = new URL(script.src).origin;
  var token = script.getAttribute("data-token");

  // Pick 64 bits of randomness for user IDs and session IDs.
  function generateID() {
    if (win.crypto && win.Uint8Array) {
      var buf = new Uint8Array(8);
      crypto.getRandomValues(buf);
      var ret = "";
      for (var i = 0; i < buf.length; i++) {
        var str = buf[i].toString(16);
        if (str.length < 2) ret += "0";
        ret += str;
      }
      return ret;
    } else {
      // Fallback from https://stackoverflow.com/a/8809472
      var time = new Date().getTime();
      var time2 = perf && perf.now ? perf.now() * 1000 : 0;
      var ret = "";
      for (var i = 0; i < 16; i++) {
        var rand = Math.random() * 16;
        if (time > 0) {
          rand = (time + rand) % 16 | 0;
          time = Math.floor(time / 16);
        } else {
          rand = (time2 + rand) % 16 | 0;
          time2 = Math.floor(time2 / 16);
        }
        ret += rand.toString(16);
      }
      return ret;
    }
  }

  // Allow Femtostats to operate in cookieless mode for easier compliance with
  // local laws. A session won't be as accurate, but what can you do? script.js.tsx
  // will change this to false if NO_COOKIES is set.
  var useCookies = true;

  // Create or retrieve a session ID
  var sessionId = null,
    userId = null,
    updateCookie = function () {};

  if (useCookies) {
    // v1 cookie format:
    // __fs=v1.<userId>.<sessionId>.<expirationTimestamp>
    var name = "__fs";
    var pairs = doc.cookie.split("; ");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      if (pair[0] === name) {
        var tuple = pair[1].split(".");
        if (tuple[0] === "v1") {
          userId = tuple[1];
          sessionId = tuple[2];
          var expiry = parseInt(tuple[3], 10);
          if (expiry && expiry < new Date().getTime() / 1000) sessionId = null;
        }
      }
    }
    if (!userId) userId = generateID();
    if (!sessionId) sessionId = generateID();

    updateCookie = function () {
      doc.cookie =
        name +
        "=" +
        [
          "v1",
          userId,
          sessionId,
          Math.floor(new Date().getTime() / 1000) + 1800,
        ].join(".") +
        ";samesite=lax";
    };
  }

  // Global event tracking function
  function trackEvent(name, data) {
    var body = {
      t: token,
      n: name || null, // null == pageview
      i: userId,
      s: sessionId,
      u: loc.href,
      r: loc.referrer,
      w: win.innerWidth,
      d: data,
    };

    var req = new XMLHttpRequest();
    req.open("POST", host + "/api/event");
    req.send(JSON.stringify(body));

    updateCookie();
  }

  // Handle page errors
  var oldOnError = win.onerror;
  if (typeof oldOnError !== "function") oldOnError = function () {};
  win.onerror = function (message, url, line, column, error) {
    trackEvent("error", { message, url, line, column, error: String(error) });
    oldOnError(message, url, line, column, error);
  };

  // Handle uncaught rejections from promises
  var oldOnUnRej = win.unhandledrejection;
  if (typeof oldOnUnRej !== "function") oldOnUnRej = function () {};
  win.onunhandledrejection = function (error) {
    trackEvent("error", { error: String(error) });
    oldOnUnRej(error);
  };

  // Track this page view
  setTimeout(function () {
    trackEvent();
  }, 1);

  // Track any hash changes as page views for SPAs
  win.addEventListener("popstate", function () {
    trackEvent();
  });
  if (hist && hist.pushState) {
    var oldPushState = hist.pushState;
    hist.pushState = function () {
      oldPushState.apply(this, arguments);
      trackEvent();
    };
  }

  // Track when sessions end
  doc.addEventListener("visibilitychange", function () {
    if (doc.visibilityState === "hidden") {
      if (nav.sendBeacon)
        nav.sendBeacon(host + "/api/end", JSON.stringify({ s: sessionId }));
    }
  });

  // Done
  win.femtostats = trackEvent;
})();
