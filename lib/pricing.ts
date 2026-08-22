import type { CmsPricingItem } from "./cms-types";

type PricingLabelInput = Pick<
  CmsPricingItem,
  "currency" | "priceLabel" | "pricingMode"
>;

const CURRENCY_SYMBOL = /^[€$£¥₹]/;
const ISO_CURRENCY = /^[A-Z]{3}(?:\s|$)/;

export function formatOfferPrice({
  currency,
  priceLabel,
  pricingMode,
}: PricingLabelInput): string {
  const label = priceLabel.trim();
  if (!label || pricingMode === "custom") return label;

  const amount = label.replace(/^from\s+/i, "").trim();
  const currencyValue = currency.trim();
  const currencyPrefix = currencyValue.toUpperCase();
  let analysisValue = amount.replace(ISO_CURRENCY, "").trim();
  if (currencyValue && amount.toUpperCase().startsWith(currencyPrefix)) {
    analysisValue = amount.slice(currencyValue.length).trim();
  }

  // Preserve deliberately editorial or legacy labels instead of adding a
  // second currency/mode prefix to them.
  if (/[A-Za-z]/.test(analysisValue)) return label;

  const hasCurrency = CURRENCY_SYMBOL.test(amount)
    || ISO_CURRENCY.test(amount)
    || Boolean(currencyValue && amount.toUpperCase().startsWith(currencyPrefix));
  const spacing = /^[A-Za-z]/.test(currencyValue) ? " " : "";
  const formattedAmount = currencyValue && !hasCurrency
    ? `${currencyValue}${spacing}${amount}`
    : amount;

  return pricingMode === "starting_from"
    ? `From ${formattedAmount}`
    : formattedAmount;
}
