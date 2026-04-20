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

<style scoped>
.cart-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f4f5f7;
  min-height: 100vh;
}

.cart-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.2rem;
}

.cart-header h1 {
  margin: 0;
  font-size: 1.4rem;
  color: #151824;
}

.item-count {
  color: #7b818d;
  font-size: 0.9rem;
}

.cart-body {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.2rem;
  align-items: start;
}

/* Items list */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.restaurant-group {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eceef3;
  overflow: hidden;
}

.restaurant-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.1rem;
  background: #fafbfd;
  border-bottom: 1px solid #eceef3;
}

.restaurant-dot {
  font-size: 1.1rem;
}

.restaurant-label h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #202432;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid #f4f5f7;
}

.cart-item:last-child {
  border-bottom: 0;
}

.item-image {
  font-size: 2rem;
  line-height: 1;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfd;
  border-radius: 12px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #202432;
}

.item-note {
  margin: 0.2rem 0 0;
  color: #858b97;
  font-size: 0.8rem;
  font-style: italic;
}

.item-price {
  color: #656b78;
  font-size: 0.85rem;
  margin-top: 0.2rem;
  display: inline-block;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #d7dbe3;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  border: 0;
  background: #fafbfd;
  width: 30px;
  height: 30px;
  font-size: 1rem;
  cursor: pointer;
  color: #434a59;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.qty-btn:hover {
  background: #f0f1f5;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  width: 30px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #202432;
}

.item-subtotal {
  font-weight: 700;
  color: #151824;
  font-size: 0.92rem;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  border: 0;
  background: transparent;
  color: #b0b5c0;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.15s;
}

.remove-btn:hover {
  color: #ef4444;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #fff;
  border-radius: 14px;
  border: 1px dashed #d7dbe3;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-state h2 {
  margin: 0 0 0.3rem;
  color: #202432;
  font-size: 1.15rem;
}

.empty-state p {
  margin: 0 0 1rem;
  color: #858b97;
}

.browse-btn {
  border: 0;
  background: #ff7f23;
  color: #fff;
  border-radius: 10px;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  cursor: pointer;
}

.browse-btn:hover {
  background: #e86e14;
}

/* Summary */
.summary-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eceef3;
  padding: 1.2rem;
  position: sticky;
  top: 1.5rem;
}

.summary-card h3 {
  margin: 0 0 0.9rem;
  font-size: 1.05rem;
  color: #151824;
}

.voucher-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.voucher-row input {
  flex: 1;
  border: 1px solid #d7dbe3;
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  font-family: inherit;
  font-size: 0.85rem;
}

.voucher-row input:focus {
  outline: none;
  border-color: #ff7f23;
}

.voucher-row button {
  border: 0;
  background: #fff1e3;
  color: #ff7f23;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.bill-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.bill-line {
  display: flex;
  justify-content: space-between;
  color: #656b78;
  font-size: 0.9rem;
}

.bill-line strong {
  color: #303544;
}

.bill-line.discount strong {
  color: #10b981;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 0.8rem;
  border-top: 1px solid #eceef3;
  margin-bottom: 1rem;
}

.total-line span {
  color: #202432;
  font-weight: 600;
}

.total-line strong {
  font-size: 1.3rem;
  color: #151824;
}

.checkout-btn {
  width: 100%;
  border: 0;
  background: #ff7f23;
  color: #fff;
  border-radius: 10px;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #e86e14;
}

@media (max-width: 900px) {
  .cart-body {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-item {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
    padding-left: 0;
  }
}
</style>
