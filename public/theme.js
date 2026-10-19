/* Shared by the site and standalone readers. Run in <head> before first paint. */
(function () {
  "use strict";

  var storageKey = "rin-theme";
  var root = document.documentElement;
  var system = window.matchMedia("(prefers-color-scheme: dark)");
  var controls = new Set();
  var preference = "system";

  function normalize(value) {
    return value === "light" || value === "dark" ? value : "system";
  }

  function getResolvedTheme() {
    return preference === "system" ? (system.matches ? "dark" : "light") : preference;
  }

  function apply() {
    var theme = getResolvedTheme();
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-preference", preference);
    controls.forEach(function (control) { control.value = preference; });
    document.dispatchEvent(new CustomEvent("rin-theme-change", {
      detail: { preference: preference, theme: theme },
    }));
  }

  function setPreference(value) {
    preference = normalize(value);
    try {
      localStorage.setItem(storageKey, preference);
    } catch {
      // The current page still works when storage is unavailable or full.
    }
    apply();
  }

  function mountControl(container) {
    if (!container || container.querySelector(".rin-theme-control")) return;
    var label = document.createElement("label");
    label.className = "rin-theme-control";
    var caption = document.createElement("span");
    caption.textContent = "外观";
    var select = document.createElement("select");
    select.setAttribute("aria-label", "外观");
    [["light", "浅色"], ["dark", "深色"], ["system", "跟随系统"]].forEach(function (entry) {
      var option = document.createElement("option");
      option.value = entry[0];
      option.textContent = entry[1];
      select.appendChild(option);
    });
    select.value = preference;
    select.addEventListener("change", function () { setPreference(select.value); });
    controls.add(select);
    label.appendChild(caption);
    label.appendChild(select);
    container.appendChild(label);
  }

  try {
    preference = normalize(localStorage.getItem(storageKey));
  } catch {
    // Private browsing may deny localStorage; follow the system in that case.
  }
  window.RinTheme = {
    setPreference: setPreference,
    getPreference: function () { return preference; },
    getResolvedTheme: getResolvedTheme,
    mountControl: mountControl,
  };
  apply();

  function onSystemChange() {
    if (preference === "system") apply();
  }
  if (system.addEventListener) system.addEventListener("change", onSystemChange);
  else system.addListener(onSystemChange);
  window.addEventListener("storage", function (event) {
    if (event.key === storageKey || event.key === null) {
      preference = normalize(event.newValue);
      apply();
    }
  });

  function mountStandaloneControls() {
    document.querySelectorAll("[data-theme-control]:not([data-theme-react])").forEach(mountControl);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountStandaloneControls, { once: true });
  } else {
    mountStandaloneControls();
  }
})();
