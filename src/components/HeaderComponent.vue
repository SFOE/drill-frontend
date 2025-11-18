<template>
  <header class="app-header">
    <div class="top-header-box">
      <div class="top-header-inner">
        <LanguageSwitcherComponent />
      </div>
    </div>
    <div class="bottom-header-box">
      <div class="bottom-header-inner">
        <div class="logo-title-group">
          <img class="logo" alt="Swiss Logo" src="@/assets/logo.png" />
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
/* =============================
   Header base
============================= */
.app-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* =============================
   Top header
============================= */
.top-header-box {
  width: 100%;
  background-color: #2f4356;
  height: 50px;
  display: flex;
  align-items: center;
}

.top-header-inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* =============================
   Bottom header
============================= */
.bottom-header-box {
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #ffffff;
}

/* =============================
   Bottom header
============================= */
.bottom-header-inner {
  width: 100%;
  max-width: 1280px;
  padding: 18px 20px 28px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.logo-title-group {
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 16px;
}

.logo {
  height: 68px;
  width: auto;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #2f4356;
  margin: 0;
  line-height: 1.2;
}

.header-line {
  width: 100%;
  height: 1px;
  background-color: #dcdcdc;
}

/* =============================
   Responsive adjustments
============================= */
@media (max-width: 768px) {
  .bottom-header-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 32px 16px 40px 16px;
  }

  .logo-title-group {
    flex-direction: row;
    align-items: flex-start;
  }

  .logo {
    height: 36px;
  }

  .divider {
    display: none;
  }

  .title {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 14px;
  }
}
</style>
