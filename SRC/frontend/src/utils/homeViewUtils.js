export function openLoginModalAction(authTab, loginOpen) {
  authTab.value = 'login'
  loginOpen.value = true
}

export function closeLoginModalAction(loginOpen) {
  loginOpen.value = false
}

export function showRegisterPanelAction(authError, authTab) {
  authError.value = ''
  authTab.value = 'register'
}

export function showLoginPanelAction(authError, authTab) {
  authError.value = ''
  authTab.value = 'login'
}

export async function onLoginSubmitAction({
  authError,
  authStore,
  loginEmail,
  loginPassword,
  closeLoginModal,
  router,
}) {
  authError.value = ''
  try {
    const loggedInUser = await authStore.login(loginEmail.value, loginPassword.value)
    closeLoginModal()
    const normalizedRole = String(loggedInUser?.role || '').toUpperCase().replace(/^ROLE_/, '')
    if (normalizedRole === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
    if (['OWNER', 'RESTAURANT_OWNER'].includes(normalizedRole)) {
      router.push('/restaurant/dashboard')
      return
    }
    if (normalizedRole === 'SHIPPER') {
      router.push('/shipper/dashboard')
      return
    }
    router.push('/browse')
  } catch (error) {
    authError.value = error.message || 'Đăng nhập thất bại'
  }
}

export async function onRegisterSubmitAction({
  authError,
  regFullName,
  regEmail,
  regPassword,
  regConfirm,
  authStore,
  closeLoginModal,
  router,
}) {
  authError.value = ''
  if (!regFullName.value || !regEmail.value || !regPassword.value) {
    authError.value = 'Vui long dien day du thong tin dang ky'
    return
  }
  if (regPassword.value.length < 8) {
    authError.value = 'Mat khau phai co it nhat 8 ky tu'
    return
  }
  if (regPassword.value !== regConfirm.value) {
    authError.value = 'Mat khau xac nhan khong khop'
    return
  }

  try {
    await authStore.register({
      fullName: regFullName.value,
      email: regEmail.value,
      password: regPassword.value,
    })
    closeLoginModal()
    router.push('/browse')
  } catch (error) {
    authError.value = error.message || 'Dang ky that bai'
  }
}

export function onKeydownEscapeAction(e, loginOpen, closeLoginModal) {
  if (e.key === 'Escape' && loginOpen.value) closeLoginModal()
}
