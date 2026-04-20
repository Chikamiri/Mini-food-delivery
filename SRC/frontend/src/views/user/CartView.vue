<script setup>
import { ref, computed } from 'vue'

const cartItems = ref([
  {
    id: 1,
    restaurant: 'Quán Cơm Nhà',
    name: 'Cơm gà xối mỡ',
    price: 59000,
    quantity: 1,
    image: '🍚',
    note: '',
  },
  {
    id: 2,
    restaurant: 'Trà sữa Mộc',
    name: 'Trà sữa trân châu đường đen',
    price: 35000,
    quantity: 2,
    image: '🧋',
    note: 'Ít đá',
  },
  {
    id: 3,
    restaurant: 'Burger King',
    name: 'Whopper Meal',
    price: 89000,
    quantity: 1,
    image: '🍔',
    note: '',
  },
])

const deliveryFee = 18000

function increment(item) {
  item.quantity++
}

function decrement(item) {
  if (item.quantity > 1) {
    item.quantity--
  }
}

function removeItem(id) {
  cartItems.value = cartItems.value.filter((i) => i.id !== id)
}

const subtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const discount = computed(() => (subtotal.value >= 100000 ? 20000 : 0))

const total = computed(() => subtotal.value + deliveryFee - discount.value)

function formatPrice(value) {
  return value.toLocaleString('vi-VN') + 'đ'
}

const groupedByRestaurant = computed(() => {
  const groups = {}
  cartItems.value.forEach((item) => {
    if (!groups[item.restaurant]) {
      groups[item.restaurant] = []
    }
    groups[item.restaurant].push(item)
  })
  return groups
})
</script>

<template>
  <section class="cart-view">
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
          <button class="browse-btn">Khám phá ngay</button>
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
            <div class="item-image">{{ item.image }}</div>
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

          <button class="checkout-btn">Tiến hành thanh toán</button>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/cart-view.css"></style>
