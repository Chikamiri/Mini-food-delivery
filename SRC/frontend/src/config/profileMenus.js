export function createProfileMenuItems({
  iconLocation,
  iconPayment,
  iconOpenRestaurant,
  iconShipper,
  iconSetting,
  iconHelp,
}) {
  return [
    { icon: iconLocation, label: 'Quản lý địa chỉ', route: '/addresses' },
    { icon: iconPayment, label: 'Phương thức thanh toán', action: 'coming-soon' },
    { icon: iconOpenRestaurant, label: 'Mở nhà hàng', action: 'open-restaurant' },
    { icon: iconShipper, label: 'Làm shipper', action: 'become-shipper' },
    { icon: iconSetting, label: 'Cài đặt', action: 'settings' },
    { icon: iconHelp, label: 'Trợ giúp', action: 'coming-soon' },
  ]
}
