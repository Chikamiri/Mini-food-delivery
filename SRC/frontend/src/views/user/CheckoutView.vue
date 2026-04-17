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
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 1.2rem;
  background: #f4f5f7;
}

.checkout-main,
.summary-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eceef3;
}

.checkout-main {
  padding: 1.2rem;
}

.checkout-header {
  border-bottom: 1px solid #eceef3;
  padding-bottom: 0.7rem;
  margin-bottom: 0.9rem;
}

.checkout-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #151824;
}

.checkout-section {
  margin-top: 1rem;
}

.checkout-section h2 {
  margin: 0 0 0.7rem;
  font-size: 1rem;
  color: #202432;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.address-card {
  border: 1px dashed #d8dce6;
  border-radius: 12px;
  padding: 0.8rem;
}

.address-card.active {
  border-style: solid;
  border-color: #ff7f23;
  background: #fff5ed;
}

.address-label {
  margin: 0;
  font-weight: 700;
  color: #303544;
}

.address-detail {
  margin: 0.3rem 0 0;
  color: #656b78;
  font-size: 0.9rem;
  line-height: 1.45;
}

.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.chip-btn {
  border: 1px dashed #d7dbe3;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  background: #fff;
  color: #434a59;
}

.chip-btn.active {
  border-style: solid;
  border-color: #ff7f23;
  background: #ff7f23;
  color: #fff;
}

.chip-btn.secondary.active {
  background: #fff3e8;
  color: #ff7f23;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.45rem;
  color: #2b3140;
  font-weight: 600;
  font-size: 0.92rem;
}

.tabs-row {
  display: flex;
  border-bottom: 1px solid #eceef3;
}

.tab-btn {
  border: 0;
  background: transparent;
  padding: 0.5rem 0.85rem;
  color: #707784;
}

.tab-btn.active {
  color: #ff7f23;
  border-bottom: 2px solid #ff7f23;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding-top: 0.3rem;
}

.time-row span {
  color: #3a404f;
}

.time-row button {
  border: 0;
  background: #fff1e3;
  color: #ff7f23;
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
}

textarea {
  width: 100%;
  min-height: 86px;
  border: 1px solid #d7dbe3;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  resize: vertical;
  font-family: inherit;
}

.summary-card {
  padding: 1rem;
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
}

.summary-head span {
  color: #7b818d;
  font-size: 0.85rem;
}

.summary-items {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.summary-item {
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #f1f2f6;
}

.restaurant-name {
  margin: 0;
  font-size: 0.8rem;
  color: #ff7f23;
}

.item-row {
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
}

.item-row span {
  color: #2b3140;
}

.item-row strong {
  color: #303544;
}

.summary-item small {
  color: #858b97;
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
  color: #6b7280;
}

.total-row {
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid #eceef3;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.total-row span {
  color: #262b38;
}

.total-row strong {
  font-size: 1.28rem;
  color: #131722;
}

.pay-btn {
  margin-top: 1rem;
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: #ff7f23;
  color: #fff;
  padding: 0.75rem;
  font-weight: 700;
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
  .address-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
