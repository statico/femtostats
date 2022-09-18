"use strict";

!(function () {
  // What host will we make a POST request to?
  var host = new URL(window.document.currentScript.src).origin;

  // Global event tracking function
  function trackEvent(name, data) {
    var body = {
      n: name,
      u: window.location.href,
      r: window.location.referrer,
      sw: window.innerWidth,
      d: data,
    };

    var req = new XMLHttpRequest();
    req.open("POST", host + "/api/event");
    req.send(JSON.stringify(body));
  }

  // Handle page errors
  var oldOnError = window.onerror;
  if (typeof oldOnError !== "function") oldOnError = function () {};
  window.onerror = function (message, url, line, column, error) {
    trackEvent("error", { message, url, line, column, error: String(error) });
    oldOnError(message, url, line, column, error);
  };

  // Handle uncaught rejections from promises
  var oldOnUnRej = window.unhandledrejection;
  if (typeof oldOnUnRej !== "function") oldOnUnRej = function () {};
  window.onunhandledrejection = function (error) {
    trackEvent("error", { error: String(error) });
    oldOnUnRej(error);
  };

  // Track this page view
  setTimeout(function () {
    trackEvent("pageview");
  }, 1);

  // Track any hash changes as page views for SPAs
  window.addEventListener("popstate", function () {
    trackEvent("pageview");
  });
  if (window.history && window.history.pushState) {
    var oldPushState = window.history.pushState;
    window.history.pushState = function () {
      oldPushState.apply(this, arguments);
      trackEvent("pageview");
    };
  }

  // Done
  window.femtostats = trackEvent;
})();
