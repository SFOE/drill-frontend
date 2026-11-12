<template>
  <button
    v-if="mapStore.hasCoordinates"
    type="button"
    class="share-btn"
    data-cy="share-button"
    :aria-label="copied ? t('share_copied') : t('share_aria_label')"
    :title="copied ? t('share_copied') : t('share')"
    @click="share"
  >
    <img
      :src="copied ? checkmarkIcon : shareIcon"
      alt=""
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '@/stores/mapStore'
import shareIcon from '@/assets/images/oblique/share.svg?url'
import checkmarkIcon from '@/assets/images/oblique/checkmark.svg?url'

const { t } = useI18n()
const mapStore = useMapStore()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Copy the current URL (kept in sync with the E/N query params by
 * useDeepLink) to the clipboard, with a graceful fallback for browsers or
 * insecure contexts where the async Clipboard API is unavailable.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to the legacy path below
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

async function share(): Promise<void> {
  const ok = await copyToClipboard(window.location.href)
  if (!ok) return

  copied.value = true
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.4rem;
  min-width: 40px;
  min-height: 40px;
  cursor: pointer;
}

.share-btn:hover {
  background-color: #e6e6e6;
}

.share-btn img {
  width: 18px;
  height: 18px;
}
</style>
