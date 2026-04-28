<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <section class="not-found">
    <div class="nf-content">
      <span class="nf-code">404</span>
      <h1>Trang không tồn tại</h1>
      <p>Đường dẫn bạn truy cập không có trên hệ thống.</p>
      <button type="button" class="nf-btn" @click="router.push('/')">Về trang chủ</button>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/not-found-view.css"></style>
