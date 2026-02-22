<template>
  <UApp :locale="locales[locale]">
    <div class="flex flex-col min-h-screen">
      <Header/>
      <main class="flex-grow">
        <NuxtPage />
      </main>
      <Footer/>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'

import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()
</script>
