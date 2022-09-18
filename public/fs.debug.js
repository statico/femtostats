"use strict";

!(function () {
  var host = new URL(window.document.currentScript.src).origin;

  function trackEvent(name) {
    var body = {
      n: name,
      u: window.location.href,
      r: window.location.referrer,
      sw: window.innerWidth,
    };

    var req = new XMLHttpRequest();
    req.open("POST", host + "/api/event");
    req.send(JSON.stringify(body));
  }

  window.femtostats = trackEvent;

  setTimeout(function () {
    femtostats("pageview");
  }, 1);
})();
