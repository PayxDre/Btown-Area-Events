import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Disable ISR/revalidation worker self-reference for initial deploy
  // Can be removed after first successful deploy
});
