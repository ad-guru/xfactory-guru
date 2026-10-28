// Hard-coded incident mock data — all timestamps in ISO 8601 UTC
const incidents = [
  {
    id: "INC-001",
    title: "Database connection pool exhaustion",
    severity: "sev1",
    service: "user-api",
    openedAt: "2026-10-27T03:14:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-27T03:14:00Z", status: "open", note: "Alert triggered: connection pool at 100%" },
      { time: "2026-10-27T03:20:00Z", status: "open", note: "On-call engineer paged" },
      { time: "2026-10-27T03:25:00Z", status: "open", note: "Investigating replica lag as root cause" }
    ]
  },
  {
    id: "INC-002",
    title: "Payment gateway timeout errors",
    severity: "sev1",
    service: "checkout",
    openedAt: "2026-10-26T18:45:00Z",
    status: "mitigating",
    timeline: [
      { time: "2026-10-26T18:45:00Z", status: "open", note: "Spike in 504 errors from payment provider" },
      { time: "2026-10-26T18:55:00Z", status: "open", note: "Confirmed third-party outage" },
      { time: "2026-10-26T19:10:00Z", status: "mitigating", note: "Switched to fallback payment processor" },
      { time: "2026-10-26T19:30:00Z", status: "mitigating", note: "Error rate dropping, monitoring" }
    ]
  },
  {
    id: "INC-003",
    title: "CDN cache invalidation failure",
    severity: "sev2",
    service: "static-assets",
    openedAt: "2026-10-26T14:30:00Z",
    status: "resolved",
    timeline: [
      { time: "2026-10-26T14:30:00Z", status: "open", note: "Stale assets being served after deploy" },
      { time: "2026-10-26T14:45:00Z", status: "mitigating", note: "Manual cache purge initiated" },
      { time: "2026-10-26T15:00:00Z", status: "resolved", note: "Cache purge completed, assets up to date" }
    ]
  },
  {
    id: "INC-004",
    title: "Kubernetes node NotReady",
    severity: "sev2",
    service: "infra",
    openedAt: "2026-10-27T01:00:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-27T01:00:00Z", status: "open", note: "Node ip-10-0-3-42 entered NotReady state" },
      { time: "2026-10-27T01:05:00Z", status: "open", note: "Pods rescheduling to healthy nodes" },
      { time: "2026-10-27T01:10:00Z", status: "open", note: "Investigating disk pressure on affected node" }
    ]
  },
  {
    id: "INC-005",
    title: "Email delivery delays",
    severity: "sev3",
    service: "notifications",
    openedAt: "2026-10-25T22:00:00Z",
    status: "resolved",
    timeline: [
      { time: "2026-10-25T22:00:00Z", status: "open", note: "Transactional emails delayed 10+ minutes" },
      { time: "2026-10-25T22:20:00Z", status: "mitigating", note: "Increased SES send rate limits" },
      { time: "2026-10-25T22:40:00Z", status: "mitigating", note: "Queue draining, delays reducing" },
      { time: "2026-10-25T23:00:00Z", status: "resolved", note: "All queued emails delivered, latency normal" }
    ]
  },
  {
    id: "INC-006",
    title: "Search index out of sync",
    severity: "sev2",
    service: "search",
    openedAt: "2026-10-27T05:30:00Z",
    status: "mitigating",
    timeline: [
      { time: "2026-10-27T05:30:00Z", status: "open", note: "Search results missing recent items" },
      { time: "2026-10-27T05:40:00Z", status: "open", note: "Elasticsearch replication lag detected" },
      { time: "2026-10-27T05:50:00Z", status: "mitigating", note: "Triggered full reindex" }
    ]
  },
  {
    id: "INC-007",
    title: "Elevated 5xx on auth service",
    severity: "sev1",
    service: "auth",
    openedAt: "2026-10-26T10:15:00Z",
    status: "resolved",
    timeline: [
      { time: "2026-10-26T10:15:00Z", status: "open", note: "5xx rate exceeded 5% on /login" },
      { time: "2026-10-26T10:20:00Z", status: "open", note: "Root cause: expired TLS cert on upstream" },
      { time: "2026-10-26T10:30:00Z", status: "mitigating", note: "Certificate rotated, restarting pods" },
      { time: "2026-10-26T10:40:00Z", status: "resolved", note: "Error rate back to baseline" }
    ]
  },
  {
    id: "INC-008",
    title: "Slow dashboard load times",
    severity: "sev3",
    service: "dashboard",
    openedAt: "2026-10-27T07:00:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-27T07:00:00Z", status: "open", note: "P95 latency for /dashboard above 4s" },
      { time: "2026-10-27T07:10:00Z", status: "open", note: "Profiling reveals N+1 query in widget loader" },
      { time: "2026-10-27T07:20:00Z", status: "open", note: "Fix in progress, ETA 30 min" }
    ]
  }
];

module.exports = incidents;
