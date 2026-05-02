import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconOrder from '@/assets/icon/reciept.svg'
import iconCheck from '@/assets/icon/check.svg'
import iconFavorite from '@/assets/icon/love.svg'
import iconLocation from '@/assets/icon/home.svg'
import iconPayment from '@/assets/icon/credit-card.svg'
import iconOpenRestaurant from '@/assets/icon/home.svg'
import iconShipper from '@/assets/icon/send.svg'
import iconSetting from '@/assets/icon/setting.svg'
import iconHelp from '@/assets/icon/info.svg'
import userService from '@/services/userService'
import orderService from '@/services/orderService'
import { useAuthStore } from '@/stores/auth'
import restaurantService from '@/services/restaurantService'
import ownerRequestService from '@/services/ownerRequestService'
import shipperRequestService from '@/services/shipperRequestService'
import { createProfileMenuItems } from '@/config/profileMenus'
import {
  startEditingProfileAction,
  cancelEditingProfileAction,
  logoutProfileAction,
  goBackToBrowseAction,
  openRestaurantModalAction,
  closeRestaurantModalAction,
  openRestaurantFormAction,
  openRestaurantDashboardAction,
  handleProfileMenuClickAction,
  submitOpenRestaurantAction,
  loadProfileAction,
  loadProfileStatsAction,
  updateProfileAction,
  openShipperModalAction,
  closeShipperModalAction,
  submitShipperRequestAction,
} from '@/utils/profileViewUtils'

export function useProfileViewModel() {
  const isEditing = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const authStore = useAuthStore()

  const profile = ref({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    role: '',
    created_at: '',
  })

  const form = ref({
    full_name: profile.value.full_name,
    email: profile.value.email,
    phone: profile.value.phone,
  })

  const startEditing = () => startEditingProfileAction(form, profile, isEditing)
  const cancelEditing = () => cancelEditingProfileAction(isEditing)
  const saveProfile = () => updateProfile()

  const stats = ref([
    { label: 'Đơn hàng', value: '0', icon: iconOrder },
    { label: 'Đã giao', value: '0', icon: iconCheck },
    { label: 'Yêu thích', value: '0', icon: iconFavorite },
    { label: 'Địa chỉ', value: '0', icon: iconLocation },
  ])

  const menuItems = createProfileMenuItems({
    iconLocation,
    iconPayment,
    iconOpenRestaurant,
    iconShipper,
    iconSetting,
    iconHelp,
  })

  const restaurantModalOpen = ref(false)
  const restaurantLoading = ref(false)
  const restaurants = ref([])
  const restaurantMessage = ref('')
  const showOpenRestaurantForm = ref(false)
  const openingForm = ref({
    name: '',
    phone: '',
    address: '',
    description: '',
    noteToAdmin: '',
  })
  const settingsModalOpen = ref(false)
  const deletingAccount = ref(false)

  const shipperModalOpen = ref(false)
  const shipperLoading = ref(false)
  const shipperMessage = ref('')
  const shipperRequests = ref([])
  const showShipperForm = ref(false)
  const shipperForm = ref({
    phoneNumber: '',
    licensePlate: '',
  })

  const settingsForm = ref({
    pushNotifications: true,
    emailNotifications: true,
    promoNotifications: false,
    language: 'vi',
    theme: 'light',
    orderPrivacy: 'friends',
  })
  const getSettingsStorageKey = () =>
    `profile_settings_${String(authStore.user?.id || authStore.user?.email || profile.value.email || 'guest')}`
  const loadSettingsFromStorage = () => {
    try {
      const scopedKey = getSettingsStorageKey()
      const scoped = JSON.parse(localStorage.getItem(scopedKey) || '{}')
      if (scoped && typeof scoped === 'object' && Object.keys(scoped).length) {
        settingsForm.value = { ...settingsForm.value, ...scoped }
        return
      }
      const legacy = JSON.parse(localStorage.getItem('profile_settings') || '{}')
      if (legacy && typeof legacy === 'object' && Object.keys(legacy).length) {
        settingsForm.value = { ...settingsForm.value, ...legacy }
        localStorage.setItem(scopedKey, JSON.stringify(legacy))
        localStorage.removeItem('profile_settings')
      }
    } catch {
      // keep defaults
    }
  }

  const router = useRouter()
  const route = useRoute()

  const logout = () => logoutProfileAction(authStore, router)
  const goBackToBrowse = () => goBackToBrowseAction(router)
  const closeRestaurantModal = () => closeRestaurantModalAction(restaurantModalOpen, showOpenRestaurantForm)
  const openRestaurantForm = () => openRestaurantFormAction(showOpenRestaurantForm)
  const openRestaurantDashboard = (restaurant) =>
    openRestaurantDashboardAction(restaurant, restaurantMessage, closeRestaurantModal, router)
  const openRestaurantModal = () =>
    openRestaurantModalAction({
      restaurantModalOpen,
      showOpenRestaurantForm,
      restaurantMessage,
      restaurantLoading,
      authStore,
      profile,
      restaurants,
      restaurantService,
      ownerRequestService,
      userService,
    })
  const openSettingsModal = () => {
    settingsModalOpen.value = true
  }
  const closeSettingsModal = () => {
    settingsModalOpen.value = false
  }

  const openShipperModal = () =>
    openShipperModalAction({
      shipperModalOpen,
      shipperLoading,
      shipperMessage,
      shipperRequests,
      showShipperForm,
      shipperForm,
      authStore,
      profile,
      shipperRequestService,
    })
  const closeShipperModal = () => closeShipperModalAction(shipperModalOpen, showShipperForm)
  const submitShipperRequest = () =>
    submitShipperRequestAction({
      shipperMessage,
      shipperLoading,
      shipperForm,
      showShipperForm,
      shipperRequests,
      shipperRequestService,
    })
  const saveSettings = () => {
    localStorage.setItem(getSettingsStorageKey(), JSON.stringify(settingsForm.value))
    restaurantMessage.value = 'Đã lưu cài đặt cá nhân.'
  }
  const deleteMyAccount = async () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác.')
    if (!confirmed) return
    deletingAccount.value = true
    restaurantMessage.value = ''
    try {
      await userService.deleteMyProfile()
      await authStore.logout()
      router.push('/')
    } catch (error) {
      restaurantMessage.value = error.message || 'Không thể xoá tài khoản lúc này.'
    } finally {
      deletingAccount.value = false
    }
  }
  const handleMenuClick = (item) => {
    if (item.action === 'settings') {
      openSettingsModal()
      return
    }
    handleProfileMenuClickAction(
      item,
      openRestaurantModal,
      router,
      restaurantMessage,
      restaurantModalOpen,
      showOpenRestaurantForm,
      openShipperModal,
    )
  }
  const submitOpenRestaurant = () =>
    submitOpenRestaurantAction({
      restaurantMessage,
      restaurantLoading,
      authStore,
      profile,
      restaurantService,
      ownerRequestService,
      openingForm,
      showOpenRestaurantForm,
      restaurants,
    })
  const loadProfile = () => loadProfileAction(isLoading, errorMessage, userService, profile, form)
  const loadStats = () =>
    loadProfileStatsAction(orderService, userService, stats, iconOrder, iconCheck, iconFavorite, iconLocation)
  const updateProfile = () =>
    updateProfileAction(isLoading, errorMessage, userService, form, profile, isEditing)

  onMounted(() => {
    if (authStore.user) {
      profile.value.full_name = authStore.user.fullName || profile.value.full_name
      profile.value.email = authStore.user.email || profile.value.email
      profile.value.role = authStore.user.role || profile.value.role
    }
    loadProfile()
    loadStats()
    loadSettingsFromStorage()
    if (String(route.query.openSettings || '') === '1') {
      settingsModalOpen.value = true
    }
  })

  watch([restaurantModalOpen, settingsModalOpen, shipperModalOpen], ([restaurantOpen, settingsOpen, shipperOpen]) => {
    document.body.style.overflow = restaurantOpen || settingsOpen || shipperOpen ? 'hidden' : ''
  })

  onUnmounted(() => {
    document.body.style.overflow = ''
  })

  return {
    isEditing,
    isLoading,
    errorMessage,
    profile,
    form,
    stats,
    menuItems,
    restaurantModalOpen,
    restaurantLoading,
    restaurants,
    restaurantMessage,
    showOpenRestaurantForm,
    openingForm,
    settingsModalOpen,
    deletingAccount,
    shipperModalOpen,
    shipperLoading,
    shipperMessage,
    shipperRequests,
    showShipperForm,
    shipperForm,
    settingsForm,
    startEditing,
    cancelEditing,
    saveProfile,
    logout,
    goBackToBrowse,
    closeRestaurantModal,
    openRestaurantForm,
    openRestaurantDashboard,
    openRestaurantModal,
    openSettingsModal,
    closeSettingsModal,
    openShipperModal,
    closeShipperModal,
    submitShipperRequest,
    saveSettings,
    deleteMyAccount,
    handleMenuClick,
    submitOpenRestaurant,
  }
}
