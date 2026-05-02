<script setup>
import MapView from '@/components/MapView.vue'
import ShipperSidebar from '@/components/ShipperSidebar.vue'
import { useShipperDashboardViewModel } from '@/composables/useShipperDashboardViewModel'

const {
  isOnline,
  isLoading,
  errorMessage,
  successMessage,
  availableDeliveries,
  myDeliveries,
  orderDetails,
  acceptingOrderId,
  activeDeliveryMapMarkers,
  activeDeliveryMapRoute,
  formatPrice,
  formatTime,
  statusLabel,
  loadData,
  acceptDelivery,
  pickupOrder,
  deliverOrder,
  logout,
} = useShipperDashboardViewModel()
</script>

<template>
  <div class="shipper-layout">
    <ShipperSidebar active-key="dashboard" @logout="logout" />

    <main class="shipper-main">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Tổng quan</h1>
          <p class="page-subtitle">Cập nhật mỗi 30 giây · {{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }) }}</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            :class="['status-toggle', isOnline ? 'online' : 'offline']"
            @click="isOnline = !isOnline"
          >
            {{ isOnline ? 'Đang hoạt động' : 'Ngoại tuyến' }}
          </button>
          <button type="button" class="btn btn-ghost" :disabled="isLoading" @click="loadData">
            {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <!-- Active deliveries -->
      <div v-if="myDeliveries.length" class="section-block">
        <div class="section-head">
          <h2>Đơn đang xử lý</h2>
          <span class="count-badge">{{ myDeliveries.length }}</span>
        </div>
        <div class="deliveries-grid">
          <article v-for="delivery in myDeliveries" :key="delivery.id" class="delivery-card card-active">
            <div class="dc-top">
              <span class="dc-id">Đơn #{{ delivery.orderId }}</span>
              <span
                :class="['dc-badge', delivery.status === 'ASSIGNED' ? 'badge-assigned' : 'badge-picked-up']"
              >
                {{ statusLabel(delivery.status) }}
              </span>
            </div>
            <template v-if="orderDetails[delivery.orderId]">
              <div class="dc-rows">
                <div class="dc-row">
                  <span class="dc-label">Nhà hàng</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].restaurantName || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giao đến</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giá trị</span>
                  <span class="dc-value dc-amount">{{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</span>
                </div>
              </div>
            </template>
            <p v-if="delivery.createdAt" class="dc-time">Nhận lúc: {{ formatTime(delivery.createdAt) }}</p>
            <div class="dc-footer">
              <button
                v-if="delivery.status === 'ASSIGNED'"
                type="button"
                class="btn btn-blue"
                style="flex:1"
                @click="pickupOrder(delivery)"
              >
                Đã lấy hàng
              </button>
              <button
                v-if="delivery.status === 'PICKED_UP'"
                type="button"
                class="btn btn-danger"
                style="flex:1"
                @click="deliverOrder(delivery)"
              >
                Đã giao xong
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- Route map -->
      <div v-if="activeDeliveryMapMarkers.length" class="map-section section-block">
        <div class="map-head">
          <h2>Tuyến đường giao hàng</h2>
        </div>
        <MapView :markers="activeDeliveryMapMarkers" :route="activeDeliveryMapRoute" height="260px" />
      </div>

      <!-- Available orders -->
      <div class="section-block">
        <div class="section-head">
          <h2>Đơn chờ nhận</h2>
          <span class="count-badge">{{ availableDeliveries.length }}</span>
        </div>
        <div v-if="!availableDeliveries.length && !isLoading" class="empty-state">
          <p>Hiện không có đơn hàng nào sẵn sàng.<br />Đơn mới sẽ xuất hiện khi nhà hàng chuẩn bị xong.</p>
        </div>
        <div v-else class="deliveries-grid">
          <article v-for="delivery in availableDeliveries" :key="delivery.id" class="delivery-card">
            <div class="dc-top">
              <span class="dc-id">Đơn #{{ delivery.orderId }}</span>
              <span class="dc-badge badge-available">Chờ nhận</span>
            </div>
            <template v-if="orderDetails[delivery.orderId]">
              <div class="dc-rows">
                <div class="dc-row">
                  <span class="dc-label">Nhà hàng</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].restaurantName || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giao đến</span>
                  <span class="dc-value">{{ orderDetails[delivery.orderId].deliveryAddress || '—' }}</span>
                </div>
                <div class="dc-row">
                  <span class="dc-label">Giá trị</span>
                  <span class="dc-value dc-amount">{{ formatPrice(orderDetails[delivery.orderId].totalAmount) }}</span>
                </div>
              </div>
            </template>
            <div class="dc-footer">
              <button
                type="button"
                class="btn btn-primary"
                style="flex:1"
                :disabled="!isOnline || acceptingOrderId === delivery.orderId"
                @click="acceptDelivery(delivery)"
              >
                {{
                  acceptingOrderId === delivery.orderId
                    ? 'Đang nhận...'
                    : !isOnline
                      ? 'Tắt nhận đơn khi ngoại tuyến'
                      : 'Nhận đơn này'
                }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped src="@/assets/styles/shipper-views.css"></style>
