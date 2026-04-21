<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import restaurantService from '@/services/restaurantService'

const route = useRoute()
const restaurant = ref(null)
const menuItems = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

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
  } catch (error) {
    errorMessage.value = error.message || 'Khong the tai chi tiet nha hang'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="restaurant-detail">
    <h1>Chi tiết nhà hàng</h1>
    <p v-if="isLoading">Đang tải...</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <div v-if="restaurant">
      <h2>{{ restaurant.name }}</h2>
      <p>{{ restaurant.address }}</p>
      <ul>
        <li v-for="item in menuItems" :key="item.id">{{ item.name }} - {{ item.price }}</li>
      </ul>
    </div>
  </div>
</template>
