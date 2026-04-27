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

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.nf-content {
  text-align: center;
  padding: 2rem;
}

.nf-code {
  display: block;
  font-size: 7rem;
  font-weight: 900;
  background: linear-gradient(120deg, #f8143f, #ff7f23);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.nf-content h1 {
  margin: 0 0 0.5rem;
  color: #1f2938;
  font-size: 1.5rem;
}

.nf-content p {
  margin: 0 0 1.5rem;
  color: #6b7685;
}

.nf-btn {
  border: 0;
  border-radius: 12px;
  background: linear-gradient(120deg, #f8143f 0%, #ff4f72 100%);
  color: #fff;
  padding: 0.7rem 1.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.nf-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(248, 20, 63, 0.22);
}
</style>
