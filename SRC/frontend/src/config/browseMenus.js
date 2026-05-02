export function createBrowseSidebarMenus({
  iconHome,
  iconTag,
  iconLove,
  iconFlash,
  iconReceipt,
}) {
  return [
    { key: 'overview', label: 'Trang tổng quan', icon: iconHome, scrollTo: null },
    { key: 'promo', label: 'Ưu đãi', icon: iconTag, scrollTo: null },
    { key: 'favorites', label: 'Yêu thích', icon: iconLove, scrollTo: 'recommend-section' },
    { key: 'flashsale', label: 'Flash sale', icon: iconFlash, scrollTo: 'popular-section' },
    { key: 'orders', label: 'Đơn hàng', icon: iconReceipt, scrollTo: null },
  ]
}
