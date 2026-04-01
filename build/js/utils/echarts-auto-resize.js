function getEcharts() {
  return globalThis.echarts;
}

function safeResizeChart(chart) {
  if (!chart) return;
  try {
    chart.resize({ animation: { duration: 0 } });
  } catch {
    try {
      chart.resize();
    } catch {
      // ignore
    }
  }
}

export function resizeAllEcharts() {
  const echarts = getEcharts();
  if (!echarts || !document) return;

  const nodes = document.querySelectorAll("[_echarts_instance_]");
  nodes.forEach((dom) => {
    try {
      const inst = echarts.getInstanceByDom(dom);
      safeResizeChart(inst);
    } catch {
      // ignore
    }
  });
}

function addDebouncedListener(target, eventName, handler, delayMs) {
  let timer = null;
  const wrapped = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      handler();
    }, delayMs);
  };
  target.addEventListener(eventName, wrapped, { passive: true });
  return () => target.removeEventListener(eventName, wrapped);
}

/**
 * Installs global resize handling for ALL ECharts instances on the page.
 *
 * This solves the common "chart overflows its container" issue when:
 * - sidebar toggles (nav-sm/nav-md)
 * - viewport resizes
 * - container width changes due to CSS transitions
 */
export function installGlobalEchartsAutoResize(options = {}) {
  const echarts = getEcharts();
  if (!echarts || !document || !window) return;

  const { debounceMs = 50 } = options;

  // idempotent
  if (window.__svasthyaEchartsAutoResizeInstalled) {
    return;
  }
  window.__svasthyaEchartsAutoResizeInstalled = true;

  const schedule = () => {
    // Run a few times to catch transition-driven size changes
    resizeAllEcharts();
    setTimeout(resizeAllEcharts, 60);
    setTimeout(resizeAllEcharts, 180);
    setTimeout(resizeAllEcharts, 320);
  };

  addDebouncedListener(window, "resize", schedule, debounceMs);
  addDebouncedListener(window, "sidebar:toggled", schedule, 0);

  // Catch width/margin transitions (sidebar collapse/expand)
  document.addEventListener(
    "transitionend",
    (e) => {
      const prop = e && e.propertyName;
      if (prop === "width" || prop === "margin-left" || prop === "padding" || prop === "transform") {
        schedule();
      }
    },
    true,
  );

  // Observe common containers for size changes.
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => schedule());

    [
      document.querySelector(".container.body"),
      document.querySelector(".main_container"),
      document.querySelector(".right_col"),
      document.querySelector("#LiveComponents"),
      document.querySelector("#HistoryComponents"),
      document.querySelector(".LiveSpecification"),
      document.querySelector(".Historyspecification"),
      document.querySelector("#graphs"),
    ]
      .filter(Boolean)
      .forEach((el) => ro.observe(el));
  }

  // Initial
  schedule();
}
