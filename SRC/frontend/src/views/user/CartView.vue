<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const cartItems = computed(() => cartStore.items)

const deliveryFee = 18000

function increment(item) {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

function decrement(item) {
  cartStore.updateQuantity(item.id, item.quantity - 1)
}

function removeItem(id) {
  cartStore.removeItem(id)
}

const subtotal = computed(() => cartStore.subtotal)

const discount = computed(() => (subtotal.value >= 100000 ? 20000 : 0))

const total = computed(() => subtotal.value + deliveryFee - discount.value)

function formatPrice(value) {
  return value.toLocaleString('vi-VN') + 'đ'
}

const groupedByRestaurant = computed(() => {
  const groups = {}
  cartItems.value.forEach((item) => {
    const key = item.restaurantName || 'Nhà hàng'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })
  return groups
})

function goBrowse() {
  router.push('/browse')
}
</script>

<template>
  <section class="cart-view">
    <RouterLink to="/browse" class="back-btn" aria-label="Quay lại danh sách món">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại
    </RouterLink>

    <header class="cart-header">
      <h1>Giỏ hàng</h1>
      <span class="item-count">{{ cartItems.length }} món</span>
    </header>

    <div class="cart-body">
      <div class="cart-items">
        <div v-if="cartItems.length === 0" class="empty-state">
          <span class="empty-icon">🛒</span>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm món ăn từ nhà hàng yêu thích!</p>
          <button class="browse-btn" @click="goBrowse">Khám phá ngay</button>
        </div>

        <div
          v-for="(items, restaurant) in groupedByRestaurant"
          :key="restaurant"
          class="restaurant-group"
        >
          <div class="restaurant-label">
            <span class="restaurant-dot">🏪</span>
            <h3>{{ restaurant }}</h3>
          </div>

          <article v-for="item in items" :key="item.id" class="cart-item">
            <div class="item-image">{{ item.imageUrl ? '🍽️' : '🍱' }}</div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p v-if="item.note" class="item-note">Ghi chú: {{ item.note }}</p>
              <span class="item-price">{{ formatPrice(item.price) }}</span>
            </div>
            <div class="item-actions">
              <div class="qty-controls">
                <button class="qty-btn" @click="decrement(item)" :disabled="item.quantity <= 1">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="increment(item)">+</button>
              </div>
              <span class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</span>
              <button class="remove-btn" @click="removeItem(item.id)" aria-label="Xoá">✕</button>
            </div>
          </article>
        </div>
      </div>

      <aside v-if="cartItems.length > 0" class="cart-summary">
        <div class="summary-card">
          <h3>Tóm tắt đơn hàng</h3>

          <div class="voucher-row">
            <input type="text" placeholder="Nhập mã giảm giá" />
            <button>Áp dụng</button>
          </div>

          <div class="bill-lines">
            <div class="bill-line">
              <span>Tạm tính</span>
              <strong>{{ formatPrice(subtotal) }}</strong>
            </div>
            <div class="bill-line">
              <span>Phí giao hàng</span>
              <strong>{{ formatPrice(deliveryFee) }}</strong>
            </div>
            <div v-if="discount > 0" class="bill-line discount">
              <span>Giảm giá</span>
              <strong>-{{ formatPrice(discount) }}</strong>
            </div>
          </div>

          <div class="total-line">
            <span>Tổng thanh toán</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <RouterLink to="/checkout" class="checkout-btn">Tiến hành thanh toán</RouterLink>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/cart-view.css"></style>
