import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'

export function useShipperSettingsViewModel() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const isSaving = ref(false)
  const deletingAccount = ref(false)
  const savedMsg = ref('')
  const errorMsg = ref('')
  const profileForm = ref({ fullName: '', phone: '' })
  const vehicleForm = ref({ licensePlate: '', vehicleType: 'motorbike' })
  const notifForm = ref({ orderAssigned: true, systemAnnouncements: true })

  const storageKey = computed(
    () => `shipper_settings_${String(authStore.user?.id || authStore.user?.email || 'shipper')}`,
  )

  const loadLocalSettings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey.value) || '{}')
      if (saved.vehicle) vehicleForm.value = { ...vehicleForm.value, ...saved.vehicle }
      if (saved.notifications) notifForm.value = { ...notifForm.value, ...saved.notifications }
    } catch {
      // keep defaults
    }
  }

  const saveLocalSettings = () => {
    try {
      localStorage.setItem(
        storageKey.value,
        JSON.stringify({
          vehicle: vehicleForm.value,
          notifications: notifForm.value,
        }),
      )
    } catch {
      // ignore
    }
  }

  const loadProfile = async () => {
    isLoading.value = true
    try {
      const data = await userService.getProfile()
      profileForm.value = {
        fullName: data.fullName || '',
        phone: data.phone || '',
      }
    } catch {
      // ignore
    } finally {
      isLoading.value = false
    }
  }

  const saveProfile = async () => {
    isSaving.value = true
    savedMsg.value = ''
    errorMsg.value = ''
    try {
      await userService.updateProfile({
        fullName: profileForm.value.fullName,
        phone: profileForm.value.phone,
      })
      if (authStore.user) {
        authStore.user.fullName = profileForm.value.fullName
      }
      savedMsg.value = 'Đã lưu thông tin cá nhân thành công.'
    } catch (err) {
      errorMsg.value = err.message || 'Không thể cập nhật thông tin.'
    } finally {
      isSaving.value = false
    }
  }

  const saveVehicle = () => {
    saveLocalSettings()
    savedMsg.value = 'Đã lưu thông tin phương tiện.'
  }
  const saveNotifications = () => {
    saveLocalSettings()
    savedMsg.value = 'Đã lưu tuỳ chọn thông báo.'
  }

  const logout = async () => {
    await authStore.logout()
    router.push('/')
  }

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa tài khoản shipper? Hành động này không thể hoàn tác.',
    )
    if (!confirmed) return
    deletingAccount.value = true
    savedMsg.value = ''
    errorMsg.value = ''
    try {
      await userService.deleteMyProfile()
      await authStore.logout()
      router.push('/')
    } catch (err) {
      errorMsg.value = err.message || 'Không thể xóa tài khoản lúc này.'
    } finally {
      deletingAccount.value = false
    }
  }

  onMounted(() => {
    loadProfile()
    loadLocalSettings()
  })

  return {
    isLoading,
    isSaving,
    deletingAccount,
    savedMsg,
    errorMsg,
    profileForm,
    vehicleForm,
    notifForm,
    saveProfile,
    saveVehicle,
    saveNotifications,
    logout,
    deleteAccount,
  }
}
