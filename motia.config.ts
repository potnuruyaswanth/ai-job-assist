import { defineConfig } from '@motiadev/core'
import endpointPlugin from '@motiadev/plugin-endpoint/plugin'
import logsPlugin from '@motiadev/plugin-logs/plugin'
import observabilityPlugin from '@motiadev/plugin-observability/plugin'

export default defineConfig({
  plugins: [observabilityPlugin, endpointPlugin, logsPlugin],
  // Use external Redis (Memurai on Windows) - required for Motia event bus
  redis: {
    url: 'redis://127.0.0.1:6379'
  }
})
