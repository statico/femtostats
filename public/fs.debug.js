"use strict";

// This script is written to be as browser-compatible as we can reasonably make
// it. That's why we're using var and not const/let, and that's why it's
// minified with UglifyJS instead of terser.

!(function () {
  // Factoring these out helps with minificiation.
  var w = window;
  var h = w.history;
  var l = w.location;

  // What host will we make a POST request to?
  var host = new URL(w.document.currentScript.src).origin;

  // Global event tracking function
  function trackEvent(name, data) {
    var body = {
      n: name,
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
    trackEvent("pageview");
  }, 1);

  // Track any hash changes as page views for SPAs
  w.addEventListener("popstate", function () {
    trackEvent("pageview");
  });
  if (h && h.pushState) {
    var oldPushState = h.pushState;
    h.pushState = function () {
      oldPushState.apply(this, arguments);
      trackEvent("pageview");
    };
  }

  // Done
  w.femtostats = trackEvent;
})();
