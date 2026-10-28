// Hard-coded mock incident data
// All opened_at timestamps are ISO 8601 UTC

const incidents = [
  {
    id: "INC-001",
    title: "Payment gateway timeout in production",
    severity: "sev0",
    service: "payments-api",
    opened_at: "2026-10-27T03:14:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-27T03:14:00Z", status: "open", note: "Alert fired: P99 latency > 5s on payments-api" },
      { time: "2026-10-27T03:18:00Z", status: "open", note: "On-call paged; confirmed gateway timeouts in us-west-2" },
      { time: "2026-10-27T03:25:00Z", status: "open", note: "Upstream provider notified; awaiting their response" }
    ]
  },
  {
    id: "INC-002",
    title: "Database replication lag exceeding threshold",
    severity: "sev1",
    service: "user-db",
    opened_at: "2026-10-27T06:45:00Z",
    status: "mitigating",
    timeline: [
      { time: "2026-10-27T06:45:00Z", status: "open", note: "Replication lag alert triggered: lag > 30s" },
      { time: "2026-10-27T06:52:00Z", status: "open", note: "Confirmed replica falling behind; investigating disk IO" },
      { time: "2026-10-27T07:10:00Z", status: "mitigating", note: "Killed long-running analytical query causing IO contention" },
      { time: "2026-10-27T07:20:00Z", status: "mitigating", note: "Lag decreasing; monitoring closely" }
    ]
  },
  {
    id: "INC-003",
    title: "Elevated error rate on search service",
    severity: "sev2",
    service: "search-api",
    opened_at: "2026-10-26T14:30:00Z",
    status: "resolved",
    timeline: [
      { time: "2026-10-26T14:30:00Z", status: "open", note: "Search error rate spiked to 12%" },
      { time: "2026-10-26T14:45:00Z", status: "mitigating", note: "Bad index configuration deployed; rolling back" },
      { time: "2026-10-26T15:00:00Z", status: "mitigating", note: "Rollback complete; error rate declining" },
      { time: "2026-10-26T15:30:00Z", status: "resolved", note: "Error rate back to baseline; postmortem scheduled" }
    ]
  },
  {
    id: "INC-004",
    title: "SSL certificate expiry warning for cdn.example.com",
    severity: "sev3",
    service: "cdn",
    opened_at: "2026-10-25T09:00:00Z",
    status: "resolved",
    timeline: [
      { time: "2026-10-25T09:00:00Z", status: "open", note: "Certificate expires in 7 days for cdn.example.com" },
      { time: "2026-10-25T10:30:00Z", status: "mitigating", note: "Renewal request submitted to CA" },
      { time: "2026-10-25T14:00:00Z", status: "resolved", note: "New certificate deployed and verified" }
    ]
  },
  {
    id: "INC-005",
    title: "Authentication service memory leak",
    severity: "sev0",
    service: "auth-service",
    opened_at: "2026-10-27T08:20:00Z",
    status: "mitigating",
    timeline: [
      { time: "2026-10-27T08:20:00Z", status: "open", note: "Memory usage on auth pods > 90%; OOMKill imminent" },
      { time: "2026-10-27T08:25:00Z", status: "open", note: "On-call engaged; rolling restart initiated" },
      { time: "2026-10-27T08:32:00Z", status: "mitigating", note: "Restarted 3/5 pods; memory stable on restarted pods" },
      { time: "2026-10-27T08:40:00Z", status: "mitigating", note: "All pods restarted; investigating root cause in latest deploy" },
      { time: "2026-10-27T08:55:00Z", status: "mitigating", note: "Suspected leak in session cache; patch in progress" }
    ]
  },
  {
    id: "INC-006",
    title: "Notification delivery delays",
    severity: "sev2",
    service: "notification-svc",
    opened_at: "2026-10-26T18:10:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-26T18:10:00Z", status: "open", note: "Email notifications delayed by 15+ minutes" },
      { time: "2026-10-26T18:30:00Z", status: "open", note: "Queue depth growing; consumer throughput degraded" },
      { time: "2026-10-26T19:00:00Z", status: "open", note: "Scaling consumers; awaiting queue drain" }
    ]
  },
  {
    id: "INC-007",
    title: "API rate limiter false positives",
    severity: "sev1",
    service: "api-gateway",
    opened_at: "2026-10-27T01:05:00Z",
    status: "open",
    timeline: [
      { time: "2026-10-27T01:05:00Z", status: "open", note: "Multiple customers reporting 429 errors on valid requests" },
      { time: "2026-10-27T01:15:00Z", status: "open", note: "Rate limiter config drift detected after last deploy" },
      { time: "2026-10-27T01:25:00Z", status: "open", note: "Investigating; preparing config rollback" },
      { time: "2026-10-27T01:40:00Z", status: "open", note: "Rollback staged; awaiting approval" }
    ]
  },
  {
    id: "INC-008",
    title: "Slow dashboard load times",
    severity: "sev3",
    service: "analytics-ui",
    opened_at: "2026-10-26T11:00:00Z",
    status: "mitigating",
    timeline: [
      { time: "2026-10-26T11:00:00Z", status: "open", note: "Dashboard P95 load time > 8s" },
      { time: "2026-10-26T12:00:00Z", status: "mitigating", note: "Added query caching layer; load times improving" },
      { time: "2026-10-26T13:30:00Z", status: "mitigating", note: "P95 down to 4s; continuing optimization" }
    ]
  }
];

// Sort: open first, then mitigating, then resolved; within same status, by severity ascending
const statusOrder = { open: 0, mitigating: 1, resolved: 2 };
const sevOrder = { sev0: 0, sev1: 1, sev2: 2, sev3: 3 };

function getSortedIncidents(filterStatus) {
  let list = incidents;
  if (filterStatus && statusOrder[filterStatus] !== undefined) {
    list = incidents.filter(i => i.status === filterStatus);
  }
  return [...list].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}

function getIncidentById(id) {
  return incidents.find(i => i.id === id) || null;
}

function getSummary() {
  const bySeverity = { sev0: 0, sev1: 0, sev2: 0, sev3: 0 };
  const byStatus = { open: 0, mitigating: 0, resolved: 0 };
  for (const inc of incidents) {
    bySeverity[inc.severity]++;
    byStatus[inc.status]++;
  }
  return { by_severity: bySeverity, by_status: byStatus, total: incidents.length };
}

function getCriticalCounts() {
  let sev0 = 0;
  let sev1 = 0;
  for (const inc of incidents) {
    if (inc.severity === "sev0") sev0++;
    if (inc.severity === "sev1") sev1++;
  }
  return { sev0, sev1 };
}

module.exports = { getSortedIncidents, getIncidentById, getSummary, getCriticalCounts };
