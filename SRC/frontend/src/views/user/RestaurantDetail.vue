<script setup>
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import { useRestaurantDetailViewModel } from '@/composables/useRestaurantDetailViewModel'

const {
  restaurant,
  isLoading,
  errorMessage,
  activeFilter,
  addedMessage,
  restaurantMapMarkers,
  offerCards,
  visibleMenuItems,
  categoryFilters,
  formatPrice,
  goBack,
  addToCart,
  stripSizePriceMeta,
  fallbackCover,
  fallbackThumb,
} = useRestaurantDetailViewModel()
</script>

<template>
  <section class="restaurant-detail-page">
    <button type="button" class="back-btn" @click="goBack">
      <img :src="iconBackArrow" alt="" width="16" height="16" />
      Quay lại
    </button>

    <p v-if="isLoading" class="status-text">Đang tải thông tin nhà hàng...</p>
    <p v-else-if="errorMessage" class="status-text error">{{ errorMessage }}</p>

    <template v-else-if="restaurant">
      <section class="hero-card">
        <img class="hero-cover" :src="restaurant.imageUrl || fallbackCover" :alt="restaurant.name" />
        <div class="hero-overlay">
          <p class="hero-kicker">Bạn đang ở đây</p>
          <h1>{{ restaurant.name }}</h1>
          <div class="hero-meta">
            <span>Đánh giá: {{ Number(restaurant.rating || 4.6).toFixed(1) }}</span>
            <span>Địa chỉ: {{ restaurant.address || 'Chưa có địa chỉ' }}</span>
            <span>Giờ mở cửa: {{ restaurant.openingTime || '08:00' }} - {{ restaurant.closingTime || '22:00' }}</span>
          </div>
        </div>
      </section>

      <section v-if="restaurantMapMarkers.length" class="section-block">
        <h2>Vị trí nhà hàng</h2>
        <MapView :markers="restaurantMapMarkers" height="260px" />
      </section>

      <section class="section-block">
        <h2>Ưu đãi từ {{ restaurant.name }}</h2>
        <div class="offers-grid">
          <article v-for="offer in offerCards" :key="offer.id" class="offer-card">
            <span class="offer-badge">{{ offer.badge }}</span>
            <h3>{{ offer.title }}</h3>
            <p>{{ offer.subtitle }}</p>
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="menu-filter">
          <button
            v-for="filter in categoryFilters"
            :key="filter"
            type="button"
            :class="{ active: activeFilter === filter }"
            @click="activeFilter = filter"
          >
            {{ filter === 'all' ? 'Tất cả' : filter }}
          </button>
        </div>
        <p v-if="addedMessage" class="added-msg">{{ addedMessage }}</p>
        <p v-if="!visibleMenuItems.length" class="empty-menu">Nhà hàng chưa có món ăn nào.</p>
        <div v-else class="menu-list">
          <article v-for="item in visibleMenuItems" :key="item.id" class="menu-row">
            <div class="menu-row-content">
              <h4>{{ item.name }}</h4>
              <p class="menu-row-desc">
                {{ stripSizePriceMeta(item.description) || 'Món ăn nổi bật của nhà hàng' }}
              </p>
              <div class="menu-row-prices">
                <button type="button" class="size-btn" @click="addToCart(item, 'small')">Nhỏ: {{ formatPrice(item.prices.small) }}</button>
                <button type="button" class="size-btn" @click="addToCart(item, 'medium')">Vừa: {{ formatPrice(item.prices.medium) }}</button>
                <button type="button" class="size-btn" @click="addToCart(item, 'large')">Lớn: {{ formatPrice(item.prices.large) }}</button>
              </div>
            </div>
            <img class="menu-thumb" :src="item.image" :alt="item.name" />
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped src="@/assets/styles/restaurant-detail.css"></style>
