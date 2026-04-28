const SIZE_META_PREFIX = '[SIZE_PRICES]'
const SIZE_META_REGEX = /\n?\[SIZE_PRICES\]\{.*\}$/s

export function getAutoSizePrices(basePrice = 0) {
  const base = Number(basePrice || 0)
  return {
    small: Math.round(base * 0.9),
    medium: Math.round(base),
    large: Math.round(base * 1.2),
  }
}

export function stripSizePriceMeta(description = '') {
  return String(description || '').replace(SIZE_META_REGEX, '').trim()
}

export function encodeDescriptionWithSizePrices(description, prices) {
  const cleanDescription = stripSizePriceMeta(description)
  const payload = {
    small: Number(prices.small || 0),
    medium: Number(prices.medium || 0),
    large: Number(prices.large || 0),
  }
  return `${cleanDescription}\n${SIZE_META_PREFIX}${JSON.stringify(payload)}`
}

export function parseDescriptionAndSizePrices(description, fallbackPrice = 0) {
  const content = String(description || '')
  const matched = content.match(/\[SIZE_PRICES\](\{.*\})$/s)
  const base = getAutoSizePrices(fallbackPrice)
  if (!matched) {
    return {
      cleanDescription: stripSizePriceMeta(content),
      prices: base,
    }
  }
  try {
    const parsed = JSON.parse(matched[1])
    return {
      cleanDescription: stripSizePriceMeta(content),
      prices: {
        small: Number(parsed.small || base.small),
        medium: Number(parsed.medium || base.medium),
        large: Number(parsed.large || base.large),
      },
    }
  } catch {
    return {
      cleanDescription: stripSizePriceMeta(content),
      prices: base,
    }
  }
}
