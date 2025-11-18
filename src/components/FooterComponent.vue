<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <!-- Left section -->
      <div class="footer-left">
        <ul class="footer-links">
          <li>
            {{ t('headerTitle') }}
          </li>
        </ul>
      </div>

      <!-- Center section -->
      <div class="footer-center">
        <ul class="footer-links">
          <li>
            <a :href="t('legalUrl')" target="_blank" rel="noopener">{{ t('legalTitle') }}</a>
          </li>
          <li>
            <a href="mailto:contact@bfe.admin.ch">{{ t('contact') }}</a>
          </li>
        </ul>
      </div>

      <!-- Right section -->
      <div class="footer-right">
        <p>
          © {{ new Date().getFullYear() }}
          <span>copyright</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.site-footer {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background-color: #2f4356;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 24px 0;
}

.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 24px;
}

.footer-right p {
  margin: 0;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .footer-right {
    text-align: center;
  }
}
</style>
