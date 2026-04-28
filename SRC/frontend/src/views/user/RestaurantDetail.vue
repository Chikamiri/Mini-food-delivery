<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'
import { useCartStore } from '@/stores/cart'
import iconBackArrow from '@/assets/icon/back-arrow.svg'
import MapView from '@/components/MapView.vue'
import mapService from '@/services/mapService'
import { parseDescriptionAndSizePrices, stripSizePriceMeta } from '@/utils/menuSizePrices'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const restaurant = ref(null)
const menuItems = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const activeFilter = ref('all')

const fallbackCover =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
const fallbackThumb =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
const offerCards = computed(() => {
  if (!restaurant.value) return []
  return [
    { id: 'offer-1', title: 'Ưu đãi đầu tiên', subtitle: 'Giảm 20% cho đơn đầu', badge: '-20%' },
    { id: 'offer-2', title: 'Combo tiết kiệm', subtitle: 'Mua combo tiết kiệm hơn', badge: '-15%' },
    { id: 'offer-3', title: 'Giờ vàng', subtitle: 'Miễn phí giao hàng 11h-13h', badge: 'HOT' },
  ]
})

const menuWithUi = computed(() => {
  return menuItems.value.map((item) => {
    const prices = parseDescriptionAndSizePrices(item.description, item.price).prices
    return {
      ...item,
      image: item.imageUrl || fallbackThumb,
      prices,
    }
  })
})

const visibleMenuItems = computed(() => {
  if (activeFilter.value === 'all') return menuWithUi.value
  return menuWithUi.value.filter((item) =>
    String(item?.categoryName || '')
      .toLowerCase()
      .includes(activeFilter.value.toLowerCase()),
  )
})

const categoryFilters = computed(() => {
  const set = new Set(
    menuWithUi.value
      .map((item) => String(item?.categoryName || '').trim())
      .filter(Boolean),
  )
  return ['all', ...set]
})

const formatPrice = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const goBack = () => router.push('/browse')
const addedMessage = ref('')

const addToCart = (item, sizeKey = 'medium') => {
  const sizeLabels = { small: 'Nhỏ', medium: 'Vừa', large: 'Lớn' }
  cartStore.addItem({
    id: item.id,
    name: item.name,
    price: item.prices[sizeKey],
    imageUrl: item.image,
    restaurantId: restaurant.value?.id,
    restaurantName: restaurant.value?.name,
    size: sizeLabels[sizeKey],
  })
  addedMessage.value = `Đã thêm ${item.name} (${sizeLabels[sizeKey]}) vào giỏ hàng!`
  setTimeout(() => { addedMessage.value = '' }, 2000)
}

const restaurantMapMarkers = ref([])

async function resolveRestaurantMarker(r) {
  if (!r) return
  if (r.latitude && r.longitude) {
    restaurantMapMarkers.value = [{
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      label: r.name,
      color: 'orange',
    }]
  } else if (r.address) {
    try {
      const results = await mapService.searchAddress(r.address)
      if (results.length) {
        restaurantMapMarkers.value = [{
          lat: Number(results[0].lat),
          lng: Number(results[0].lng || results[0].lon),
          label: r.name,
          color: 'orange',
        }]
      }
    } catch (_) {}
  }
}

onMounted(async () => {
  if (!route.params.id) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [restaurantData, menuData] = await Promise.all([
      restaurantService.getById(route.params.id),
      restaurantService.getMenuByRestaurant(route.params.id),
    ])
    restaurant.value = restaurantData
    menuItems.value = Array.isArray(menuData) ? menuData : []
    resolveRestaurantMarker(restaurantData)
  } catch (error) {
    errorMessage.value = error.message || 'Không thể tải chi tiết nhà hàng'
  } finally {
    isLoading.value = false
  }
})
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
