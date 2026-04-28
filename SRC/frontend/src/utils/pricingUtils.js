import {
  DELIVERY_FEE_VND,
  DISCOUNT_AMOUNT_VND,
  DISCOUNT_THRESHOLD_VND,
} from '@/config/pricing'

export function getDeliveryFeeBySubtotal(subtotal = 0) {
  return Number(subtotal) > 0 ? DELIVERY_FEE_VND : 0
}

export function getDiscountBySubtotal(subtotal = 0) {
  return Number(subtotal) >= DISCOUNT_THRESHOLD_VND ? DISCOUNT_AMOUNT_VND : 0
}
