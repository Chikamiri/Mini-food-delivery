<script setup>
const deliveryAddresses = [
  {
    id: 1,
    label: 'Nhà',
    detail: '227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM',
    active: true,
  },
  {
    id: 2,
    label: 'Cơ quan',
    detail: '1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM',
    active: false,
  },
]

const orderTypes = ['Giao tiêu chuẩn', 'Giao hẹn giờ', 'Nhận tại quán']
const subscriptionTypes = ['Tháng', 'Tuần', 'Tùy chọn']
const deliveryPlans = ['3 ngày/tuần', '5 ngày/tuần']

const cartItems = [
  { id: 1, restaurant: 'Quán Cơm Nhà', name: 'Cơm gà xối mỡ', quantity: 1, price: '59.000đ' },
  { id: 2, restaurant: 'Trà sữa Mộc', name: 'Trà sữa trân châu', quantity: 2, price: '35.000đ' },
]
</script>

<template>
  <section class="checkout-page">
    <main class="checkout-main">
      <header class="checkout-header">
        <h1>Thanh toán an toàn</h1>
      </header>

      <section class="checkout-section">
        <h2>Địa chỉ giao hàng</h2>
        <div class="address-grid">
          <article
            v-for="item in deliveryAddresses"
            :key="item.id"
            class="address-card"
            :class="{ active: item.active }"
          >
            <p class="address-label">{{ item.label }}</p>
            <p class="address-detail">{{ item.detail }}</p>
          </article>
        </div>
      </section>

      <section class="checkout-section">
        <h2>Loại đơn hàng</h2>
        <div class="chips-row">
          <button
            v-for="(item, index) in orderTypes"
            :key="item"
            class="chip-btn"
            :class="{ active: index === 0 }"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="checkout-section form-grid">
        <div>
          <label>Gói đăng ký?</label>
          <div class="tabs-row">
            <button
              v-for="(item, index) in subscriptionTypes"
              :key="item"
              class="tab-btn"
              :class="{ active: index === 0 }"
            >
              {{ item }}
            </button>
          </div>
        </div>
        <div>
          <label>Gói giao?</label>
          <div class="chips-row">
            <button
              v-for="(item, index) in deliveryPlans"
              :key="item"
              class="chip-btn secondary"
              :class="{ active: index === 0 }"
            >
              {{ item }}
            </button>
          </div>
        </div>
        <div>
          <label>Thời gian giao</label>
          <div class="time-row">
            <span>16:30</span>
            <button>24 giờ</button>
          </div>
        </div>
        <div>
          <label>Ghi chú cho quán</label>
          <textarea placeholder="Ví dụ: ít đá, không hành, gọi trước khi giao..."></textarea>
        </div>
      </section>
    </main>

    <aside class="checkout-summary">
      <div class="summary-card">
        <div class="summary-head">
          <h3>Giỏ hàng</h3>
          <span>{{ cartItems.length }} món</span>
        </div>

        <div class="summary-items">
          <article v-for="item in cartItems" :key="item.id" class="summary-item">
            <p class="restaurant-name">Từ {{ item.restaurant }}</p>
            <div class="item-row">
              <span>{{ item.name }}</span>
              <strong>{{ item.price }}</strong>
            </div>
            <small>Số lượng: {{ item.quantity }}</small>
          </article>
        </div>

        <div class="bill-detail">
          <div><span>Tạm tính</span><strong>129.000đ</strong></div>
          <div><span>Phí giao hàng</span><strong>18.000đ</strong></div>
          <div><span>Giảm giá</span><strong>-20.000đ</strong></div>
        </div>

        <div class="total-row">
          <span>Tổng thanh toán (COD)</span>
          <strong>127.000đ</strong>
        </div>

        <button class="pay-btn">Xác nhận đặt đơn</button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.checkout-page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 345px;
  gap: 1rem;
  min-height: 100vh;
  background: radial-gradient(circle at top, #fff7fa 0%, #f7f8fc 55%, #f3f5fa 100%);
}

.checkout-main,
.summary-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e8ecf4;
  box-shadow: 0 10px 24px rgba(22, 33, 52, 0.07);
}

.checkout-main {
  padding: 1.1rem;
}

.checkout-header {
  border-bottom: 1px solid #edf1f7;
  padding-bottom: 0.9rem;
  margin-bottom: 0.8rem;
}

.checkout-header h1 {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw, 1.65rem);
  color: #171f2f;
}

.checkout-section {
  margin-top: 1rem;
}

.checkout-section h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #1f293b;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.address-card {
  border: 1px dashed #d5dce9;
  border-radius: 14px;
  padding: 0.85rem;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.address-card.active {
  border-style: solid;
  border-color: #f8143f;
  background: #fff3f6;
}

.address-label {
  margin: 0;
  font-weight: 700;
  color: #2c364a;
}

.address-detail {
  margin: 0.3rem 0 0;
  color: #677185;
  font-size: 0.9rem;
  line-height: 1.45;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.chip-btn {
  border: 1px solid #d9deea;
  border-radius: 999px;
  padding: 0.5rem 0.82rem;
  background: #fff;
  color: #465066;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.chip-btn.active {
  border-color: #f8143f;
  background: #f8143f;
  color: #fff;
}

.chip-btn.secondary.active {
  background: #ffedf1;
  border-color: #f6b6c5;
  color: #d81642;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.45rem;
  color: #2c364a;
  font-weight: 600;
  font-size: 0.92rem;
}

.tabs-row {
  display: flex;
  border-bottom: 1px solid #edf0f6;
}

.tab-btn {
  border: 0;
  background: transparent;
  padding: 0.5rem 0.85rem;
  color: #727b8d;
  cursor: pointer;
}

.tab-btn.active {
  color: #f8143f;
  border-bottom: 2px solid #f8143f;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 0.3rem;
}

.time-row span {
  color: #3a4356;
  font-weight: 600;
}

.time-row button {
  border: 0;
  background: #fff0f4;
  color: #d81642;
  border-radius: 999px;
  padding: 0.34rem 0.64rem;
  font-weight: 600;
  cursor: pointer;
}

textarea {
  width: 100%;
  min-height: 94px;
  border: 1px solid #d9deea;
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
}

textarea:focus {
  outline: none;
  border-color: #f8a1b1;
  box-shadow: 0 0 0 3px rgba(248, 20, 63, 0.1);
}

.summary-card {
  padding: 1rem 1rem 1.1rem;
  position: sticky;
  top: 1rem;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-head h3 {
  margin: 0;
  color: #1d273a;
}

.summary-head span {
  color: #7c8595;
  font-size: 0.85rem;
}

.summary-items {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.summary-item {
  padding-bottom: 0.7rem;
  border-bottom: 1px dashed #edf1f7;
}

.restaurant-name {
  margin: 0;
  font-size: 0.8rem;
  color: #f8143f;
  font-weight: 600;
}

.item-row {
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
}

.item-row span {
  color: #2a3346;
}

.item-row strong {
  color: #202a3c;
}

.summary-item small {
  color: #8a92a0;
}

.bill-detail {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.bill-detail div {
  display: flex;
  justify-content: space-between;
  color: #6f7788;
  font-size: 0.9rem;
}

.total-row {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid #edf1f7;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.total-row span {
  color: #273144;
  font-weight: 700;
}

.total-row strong {
  font-size: 1.28rem;
  color: #121b2c;
}

.pay-btn {
  margin-top: 1rem;
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(120deg, #f8143f 0%, #ff4f72 100%);
  color: #fff;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.pay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(248, 20, 63, 0.24);
}

@media (max-width: 1024px) {
  .checkout-page {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 0.95rem 0.8rem 1.4rem;
  }

  .address-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
