<script setup>
import { RouterLink } from 'vue-router'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import { useCheckoutViewModel } from '@/composables/useCheckoutViewModel'

const {
  deliveryAddresses,
  selectedAddressId,
  orderTypes,
  selectedOrderType,
  desiredDeliveryTime,
  orderNote,
  isSubmitting,
  errorMessage,
  successMessage,
  addressDistanceMap,
  cartItems,
  subtotal,
  deliveryFee,
  discount,
  total,
  estimatedDeliveryTime,
  formatPrice,
  submitOrder,
  addressMapMarkers,
} = useCheckoutViewModel()
</script>

<template>
  <section class="checkout-page">
    <main class="checkout-main">
      <header class="checkout-header">
        <RouterLink to="/cart" class="back-link">
          <img :src="iconBackArrow" alt="" width="16" height="16" />
          Quay lại giỏ hàng
        </RouterLink>
        <h1>Thanh toán an toàn</h1>
      </header>

      <section class="checkout-section">
        <h2>Địa chỉ giao hàng</h2>
        <p v-if="!deliveryAddresses.length" class="empty-address">
          Bạn chưa có địa chỉ nào.
          <RouterLink to="/addresses" class="add-address-link">Thêm địa chỉ →</RouterLink>
        </p>
        <div v-else class="address-grid">
          <article
            v-for="item in deliveryAddresses"
            :key="item.id"
            class="address-card"
            :class="{ active: item.id === selectedAddressId }"
            role="button"
            tabindex="0"
            @click="selectedAddressId = item.id"
          >
            <p class="address-label">{{ item.label || 'Địa chỉ' }}</p>
            <p class="address-detail">{{ item.addressLine || item.detail }}</p>
            <p v-if="addressDistanceMap[item.id]" class="address-distance">
              Cách nhà hàng: {{ addressDistanceMap[item.id] }}
            </p>
          </article>
        </div>
        <MapView
          v-if="addressMapMarkers.length"
          :markers="addressMapMarkers"
          height="220px"
          class="address-map"
        />
      </section>

      <section class="checkout-section">
        <h2>Loại đơn hàng</h2>
        <div class="chips-row">
          <button
            v-for="item in orderTypes"
            :key="item"
            class="chip-btn"
              :class="{ active: selectedOrderType === item }"
              @click="selectedOrderType = item"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="checkout-section form-grid">
        <div>
          <label>Thời gian giao dự kiến</label>
          <div class="time-row">
            <span>{{ estimatedDeliveryTime }}</span>
            <small>Ước tính sau 30 phút từ thời điểm hiện tại</small>
          </div>
        </div>
        <div v-if="selectedOrderType === 'Giao hẹn giờ'">
          <label>Giờ mong muốn giao</label>
          <input
            v-model="desiredDeliveryTime"
            type="time"
            class="desired-time-input"
          />
        </div>
        <div v-else-if="selectedOrderType === 'Nhận tại quán'" class="pickup-note-box">
          <label>Hình thức nhận</label>
          <p>Bạn sẽ đến nhà hàng để nhận món sau khi quán báo sẵn sàng.</p>
        </div>
        <div>
          <label>Ghi chú cho quán</label>
          <textarea
            v-model="orderNote"
            placeholder="Ví dụ: ít đá, không hành, gọi trước khi giao..."
          ></textarea>
        </div>
      </section>
      <p v-if="errorMessage" class="checkout-message checkout-message--error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="checkout-message checkout-message--success">{{ successMessage }}</p>
    </main>

    <aside class="checkout-summary">
      <div class="summary-card">
        <div class="summary-head">
          <h3>Giỏ hàng</h3>
          <span>{{ cartItems.length }} món</span>
        </div>

        <div class="summary-items">
          <article v-for="item in cartItems" :key="item.id" class="summary-item">
            <p class="restaurant-name">Từ {{ item.restaurantName || 'Nhà hàng' }}</p>
            <div class="item-row">
              <span>{{ item.name }}</span>
              <strong>{{ formatPrice(item.price) }}</strong>
            </div>
            <small>Số lượng: {{ item.quantity }}</small>
          </article>
        </div>

        <div class="bill-detail">
          <div><span>Tạm tính</span><strong>{{ formatPrice(subtotal) }}</strong></div>
          <div><span>Phí giao hàng</span><strong>{{ formatPrice(deliveryFee) }}</strong></div>
          <div><span>Giảm giá</span><strong>{{ formatPrice(discount) }}</strong></div>
        </div>

        <div class="total-row">
          <span>Tổng thanh toán (COD)</span>
          <strong>{{ formatPrice(total) }}</strong>
        </div>

        <button class="pay-btn" :disabled="isSubmitting || !cartItems.length" @click="submitOrder">
          {{ isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt đơn' }}
        </button>
      </div>
    </aside>
  </section>
</template>

<style scoped src="@/assets/styles/user-checkout-view.css"></style>
