interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushInterval();
    }
  }

  track(event: string, properties?: Record<string, any>, userId?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      },
      userId
    };

    this.events.push(analyticsEvent);

    // Immediate flush for critical events
    if (['modpack_view', 'search_performed', 'favorite_added'].includes(event)) {
      this.flush();
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 10000); // Flush every 10 seconds
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Re-add events if sending failed
      this.events.unshift(...eventsToSend);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const analytics = new AnalyticsService();

// Convenience functions
export const trackModpackView = (modpackId: string, modpackName: string, platform: string) => {
  analytics.track('modpack_view', {
    modpack_id: modpackId,
    modpack_name: modpackName,
    platform
  });
};

export const trackSearch = (query: string, resultsCount: number, platform: string) => {
  analytics.track('search_performed', {
    query,
    results_count: resultsCount,
    platform
  });
};

export const trackFavoriteAction = (action: 'add' | 'remove', modpackId: string) => {
  analytics.track('favorite_action', {
    action,
    modpack_id: modpackId
  });
};
