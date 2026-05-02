import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import restaurantService from '@/services/restaurantService'
import { useCartStore } from '@/stores/cart'
import mapService from '@/services/mapService'
import { parseDescriptionAndSizePrices, stripSizePriceMeta } from '@/utils/menuSizePrices'

const fallbackCover =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
const fallbackThumb =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'

export function useRestaurantDetailViewModel() {
  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()
  const restaurant = ref(null)
  const menuItems = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const activeFilter = ref('all')
  const addedMessage = ref('')
  const restaurantMapMarkers = ref([])
  let addedMessageTimer = null

  const offerCards = computed(() => {
    if (!restaurant.value) return []
    return [
      { id: 'offer-1', title: 'Ưu đãi đầu tiên', subtitle: 'Giảm 20% cho đơn đầu', badge: '-20%' },
      { id: 'offer-2', title: 'Combo tiết kiệm', subtitle: 'Mua combo tiết kiệm hơn', badge: '-15%' },
      { id: 'offer-3', title: 'Giờ vàng', subtitle: 'Miễn phí giao hàng 11h-13h', badge: 'HOT' },
    ]
  })

  const menuWithUi = computed(() =>
    menuItems.value.map((item) => {
      const prices = parseDescriptionAndSizePrices(item.description, item.price).prices
      return {
        ...item,
        image: item.imageUrl || fallbackThumb,
        prices,
      }
    }),
  )

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
      menuWithUi.value.map((item) => String(item?.categoryName || '').trim()).filter(Boolean),
    )
    return ['all', ...set]
  })

  const formatPrice = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
  const goBack = () => router.push('/browse')

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
    if (addedMessageTimer) clearTimeout(addedMessageTimer)
    addedMessageTimer = setTimeout(() => {
      addedMessage.value = ''
    }, 2000)
  }

  async function resolveRestaurantMarker(r) {
    if (!r) return
    if (r.latitude && r.longitude) {
      restaurantMapMarkers.value = [
        {
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          label: r.name,
          color: 'orange',
        },
      ]
    } else if (r.address) {
      try {
        const results = await mapService.searchAddress(r.address)
        if (results.length) {
          restaurantMapMarkers.value = [
            {
              lat: Number(results[0].lat),
              lng: Number(results[0].lng || results[0].lon),
              label: r.name,
              color: 'orange',
            },
          ]
        }
      } catch (_) {
        /* ignore geocode errors */
      }
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

  onUnmounted(() => {
    if (addedMessageTimer) clearTimeout(addedMessageTimer)
  })

  return {
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
  }
}
