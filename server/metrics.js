// Lightweight in-memory metrics for OpenRouter outages and model usage

const metrics = {
  totalCalls: 0,
  successes: 0,
  failures: 0,
  lastOutageAt: null,
  perModel: {}
}

function _ensureModelEntry(model) {
  if (!metrics.perModel[model]) {
    metrics.perModel[model] = { total: 0, ok: 0, err: 0, lastError: '' }
  }
  return metrics.perModel[model]
}

export function recordModelAttempt(model, ok, durationMs, statusCode, errorMsg) {
  metrics.totalCalls += 1
  const m = _ensureModelEntry(model)
  m.total += 1
  if (ok) {
    metrics.successes += 1
    m.ok += 1
  } else {
    metrics.failures += 1
    m.err += 1
    m.lastError = errorMsg || ''
    // Mark outage timestamp for quick KPIs
    if (statusCode === undefined || statusCode === null || statusCode >= 500) {
      metrics.lastOutageAt = new Date().toISOString()
    }
  }
}

export function getSummary() {
  const perModel = {};
  for (const [name, v] of Object.entries(metrics.perModel)) {
    perModel[name] = { total: v.total, ok: v.ok, err: v.err, lastError: v.lastError }
  }
  return {
    totalCalls: metrics.totalCalls,
    successes: metrics.successes,
    failures: metrics.failures,
    lastOutageAt: metrics.lastOutageAt,
    perModel
  }
}

export function resetMetrics() {
  metrics.totalCalls = 0
  metrics.successes = 0
  metrics.failures = 0
  metrics.lastOutageAt = null
  metrics.perModel = {}
}
