import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  openLoginModalAction,
  closeLoginModalAction,
  showRegisterPanelAction,
  showLoginPanelAction,
  onLoginSubmitAction,
  onRegisterSubmitAction,
  onKeydownEscapeAction,
} from '@/utils/homeViewUtils'
import { homeNavLinks, homePopularItems, homeHowItWorksSteps } from '@/config/homeLanding'

export function useHomeViewModel() {
  const loginOpen = ref(false)
  const authTab = ref('login')
  const loginEmail = ref('')
  const loginPassword = ref('')
  const loginRemember = ref(false)
  const regFullName = ref('')
  const regEmail = ref('')
  const regPassword = ref('')
  const regConfirm = ref('')
  const router = useRouter()
  const authStore = useAuthStore()
  const authError = ref('')

  const openLoginModal = () => openLoginModalAction(authTab, loginOpen)
  const closeLoginModal = () => closeLoginModalAction(loginOpen)
  const showRegisterPanel = () => showRegisterPanelAction(authError, authTab)
  const showLoginPanel = () => showLoginPanelAction(authError, authTab)
  const onLoginSubmit = () =>
    onLoginSubmitAction({
      authError,
      authStore,
      loginEmail,
      loginPassword,
      closeLoginModal,
      router,
    })
  const onRegisterSubmit = () =>
    onRegisterSubmitAction({
      authError,
      regFullName,
      regEmail,
      regPassword,
      regConfirm,
      authStore,
      closeLoginModal,
      router,
    })

  watch(loginOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) authTab.value = 'login'
    if (!open) authError.value = ''
  })

  const onKeydownEscape = (e) => onKeydownEscapeAction(e, loginOpen, closeLoginModal)

  onMounted(() => window.addEventListener('keydown', onKeydownEscape))
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydownEscape)
    document.body.style.overflow = ''
  })

  return {
    navLinks: homeNavLinks,
    popularItems: homePopularItems,
    steps: homeHowItWorksSteps,
    authStore,
    loginOpen,
    authTab,
    loginEmail,
    loginPassword,
    loginRemember,
    regFullName,
    regEmail,
    regPassword,
    regConfirm,
    authError,
    openLoginModal,
    closeLoginModal,
    showRegisterPanel,
    showLoginPanel,
    onLoginSubmit,
    onRegisterSubmit,
  }
}
