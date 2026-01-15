<template>
  <header class="app-header">
    <div class="top-header-box">
      <div class="app-container top-header-inner">
        <LanguageSwitcherComponent />
      </div>
    </div>

    <div class="bottom-header-box">
      <div class="app-container bottom-header-inner">
        <div class="logo-title-group">
          <img class="logo responsive-logo" alt="Swiss Logo" src="@/assets/logo.png" />
          <div class="divider"></div>
          <h1 class="title">{{ $t('headerTitle') }}</h1>
        </div>
      </div>
    </div>

    <div class="header-line"></div>
  </header>
</template>

<script setup lang="ts">
import LanguageSwitcherComponent from './LanguageSwitcherComponent.vue'
</script>

<style scoped>
.app-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.top-header-box {
  width: 100%;
  height: 50px;
  background-color: #2f4356;
  display: flex;
  align-items: center;
}

.top-header-inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0;
}

.bottom-header-box {
  width: 100%;
  background-color: #fff;
}

.bottom-header-inner {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0 1.75rem 0;
}

.logo-title-group {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.logo {
  display: block;
  height: 68px;
  width: auto;
  flex-shrink: 0;
}

.responsive-logo {
  content: url('@/assets/logo.png');
}

.title {
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
}

.divider {
  width: 1px;
  background-color: #dcdcdc;
}

.header-line {
  width: 100%;
  height: 1px;
  background-color: #dcdcdc;
}

@media (max-width: 768px) {
  .responsive-logo {
    content: url('@/assets/swiss_mobile.svg');
    height: 20px;
    padding-left: 10px;
  }

  .bottom-header-inner {
    max-height: 50px;
    vertical-align: center;
  }

  .logo-title-group {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .divider {
    display: none;
  }

  .title {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 12px;
  }
}
</style>
