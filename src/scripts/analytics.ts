export type AnalyticsEventName = 'phone_click' | 'estimate_cta_click' | 'contact_form_submit';
export type AnalyticsParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __hammerGaInitialized?: boolean;
    capturedEvents?: unknown[][];
  }
}

export function sendAnalyticsEvent(name: AnalyticsEventName, parameters: AnalyticsParameters = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, parameters);
    }
  } catch {
    // Analytics must never interrupt a user action.
  }
}

export function bindAnalyticsEvents(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-ga-event]').forEach((element) => {
    if (element.dataset.gaBound === 'true') return;
    element.dataset.gaBound = 'true';
    element.addEventListener('click', () => {
      const eventName = element.dataset.gaEvent;
      if (eventName !== 'phone_click' && eventName !== 'estimate_cta_click') return;
      sendAnalyticsEvent(eventName, { placement: element.dataset.gaPlacement ?? 'unknown' });
    });
  });
}
