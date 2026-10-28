// Timezone formatting utility
// Uses Intl.DateTimeFormat to convert UTC ISO timestamps to the chosen timezone.

function formatTime(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

module.exports = { formatTime };
