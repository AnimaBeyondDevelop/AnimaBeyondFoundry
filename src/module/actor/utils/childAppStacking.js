/**
 * Keep child Applications (dialogs / item sheets) above a parent sheet when the
 * parent is focused / brought to the top by Foundry's stacking.
 */

/**
 * @param {Application} parentApp
 * @param {Application} childApp
 * @returns {Application}
 */
export function trackChildApp(parentApp, childApp) {
  if (!parentApp || !childApp) return childApp;

  parentApp._abfChildApps ??= new Set();
  parentApp._abfChildApps.add(childApp);

  if (!childApp._abfTrackedByParent) {
    childApp._abfTrackedByParent = parentApp;
    const originalClose = childApp.close.bind(childApp);
    childApp.close = async function abfTrackedClose(...args) {
      parentApp._abfChildApps?.delete(childApp);
      return originalClose(...args);
    };
  }

  return childApp;
}

/**
 * Re-raise all tracked children that are still rendered.
 * @param {Application} parentApp
 */
export function bringChildAppsToTop(parentApp) {
  const children = parentApp?._abfChildApps;
  if (!children?.size) return;

  for (const child of children) {
    if (!child?.rendered) continue;
    try {
      child.bringToTop?.();
    } catch (err) {
      console.warn('[ABF] Failed to bring child app to top', child, err);
    }
  }
}

/**
 * Track a child app, render it, then bring it (and keep it) above the parent.
 * @param {Application} parentApp
 * @param {Application} childApp
 * @param {boolean} [force=true]
 * @returns {Promise<Application>}
 */
export async function renderChildAppAboveParent(parentApp, childApp, force = true) {
  trackChildApp(parentApp, childApp);
  await childApp.render(force);
  childApp.bringToTop?.();
  return childApp;
}

/**
 * Close and forget tracked children (e.g. when the parent sheet closes).
 * @param {Application} parentApp
 */
export async function closeTrackedChildApps(parentApp) {
  const children = [...(parentApp?._abfChildApps ?? [])];
  parentApp._abfChildApps?.clear();
  await Promise.allSettled(children.map(child => child.close?.()));
}
