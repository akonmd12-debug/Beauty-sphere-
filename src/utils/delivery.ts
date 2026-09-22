import { Order, OrderCustomer } from '../types';
import { formatCurrency } from './storage';

/**
 * Formats strictly the essential order information required for delivery:
 * Customer Name, Contact Number, Delivery Address, and Ordered Items with quantities.
 * Strictly excludes any system IDs, transaction keys, or internal data.
 */
export function formatEssentialOrderInfo(order: Order): string {
  const customer = order.customer;
  const addressParts = [
    customer.address,
    customer.city,
    customer.postalCode,
    customer.country
  ].filter(Boolean);

  const deliveryAddress = addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';

  const orderedItems = order.items && order.items.length > 0
    ? order.items.map((item) => `${item.quantity}x ${item.productName}`).join('\n')
    : 'None';

  return `Customer Name: ${customer.fullName || 'N/A'}
Contact Number: ${customer.phone || 'N/A'}
Delivery Address: ${deliveryAddress}
Ordered Items:
${orderedItems}`;
}

/**
 * Formats a single customer's delivery information into a clean, courier-ready text block.
 */
export function formatOrderDeliveryInfo(order: Order, options?: { compact?: boolean }): string {
  const customer = order.customer;
  const dateFormatted = new Date(order.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsList = order.items
    .map((item) => `  • ${item.quantity}x ${item.productName}${item.producer ? ` (${item.producer})` : ''} - ${formatCurrency(item.price * item.quantity)}`)
    .join('\n');

  const totalItemsCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

  if (options?.compact) {
    return [
      `RECIPIENT: ${customer.fullName || 'Customer'}`,
      `PHONE: ${customer.phone || 'N/A'}`,
      `ADDRESS: ${customer.address || ''}${customer.city ? `, ${customer.city}` : ''}${customer.postalCode ? ` ${customer.postalCode}` : ''}${customer.country ? `, ${customer.country}` : ''}`,
      `ORDER: #${order.orderNumber || order.id.slice(-8)} (${totalItemsCount} items)`,
      `PAYMENT: ${order.paymentMethod || 'Prepaid'} | TOTAL: ${formatCurrency(order.total)}`,
      order.notes ? `NOTES: ${order.notes}` : ''
    ].filter(Boolean).join('\n');
  }

  return `========================================
📦 DELIVERY & COURIER DISPATCH MANIFEST
========================================
Order Number: #${order.orderNumber || order.id.slice(-8)}
Order Date:   ${dateFormatted}
Status:       ${order.status}

----------------------------------------
👤 CUSTOMER & RECIPIENT INFORMATION
----------------------------------------
Full Name:    ${customer.fullName || 'Customer'}
Phone Number: ${customer.phone || 'N/A'}
Email:        ${customer.email || 'N/A'}

----------------------------------------
📍 SHIPPING & DELIVERY ADDRESS
----------------------------------------
Address:      ${customer.address || 'Boutique Store Pickup'}
City:         ${customer.city || 'N/A'}
Postal Code:  ${customer.postalCode || 'N/A'}
Country:      ${customer.country || 'N/A'}

----------------------------------------
🛍️ PARCEL CONTENTS (${totalItemsCount} Items)
----------------------------------------
${itemsList}

----------------------------------------
💰 BILLING & COLLECTION DETAILS
----------------------------------------
Payment Method: ${order.paymentMethod || 'Prepaid'}
Subtotal:       ${formatCurrency(order.subtotal || order.total)}
${order.discountAmount ? `Discount:       -${formatCurrency(order.discountAmount)}${order.appliedCode ? ` (${order.appliedCode})` : ''}\n` : ''}Shipping Fee:   ${order.shippingFee ? formatCurrency(order.shippingFee) : 'Free / Included'}
TOTAL AMOUNT:   ${formatCurrency(order.total)}
${order.notes ? `\n📝 SPECIAL DELIVERY INSTRUCTIONS:\n${order.notes}\n` : ''}========================================`;
}

/**
 * Formats only the recipient address and contact info (ideal for quick address stickers/courier app pasting).
 */
export function formatCustomerAddressOnly(customer: OrderCustomer, orderRef?: string): string {
  const lines = [
    `Name: ${customer.fullName || 'Customer'}`,
    `Phone: ${customer.phone || 'N/A'}`,
    `Address: ${customer.address || ''}`,
    `City: ${customer.city || ''}`,
    customer.postalCode ? `Postal Code: ${customer.postalCode}` : '',
    customer.country ? `Country: ${customer.country}` : '',
    customer.email ? `Email: ${customer.email}` : '',
    orderRef ? `Order Ref: #${orderRef}` : ''
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Formats multiple orders into a comprehensive bulk delivery manifest.
 */
export function formatBulkOrdersDeliveryInfo(orders: Order[]): string {
  if (!orders || orders.length === 0) {
    return 'No orders available to format.';
  }

  const header = `================================================
BEAUTY SPHERE - BULK DELIVERY MANIFEST (${orders.length} ORDERS)
Generated: ${new Date().toLocaleString()}
================================================\n\n`;

  const orderBlocks = orders.map((order, index) => {
    return `[DISPATCH #${index + 1} OF ${orders.length}]\n` + formatOrderDeliveryInfo(order);
  }).join('\n\n');

  return header + orderBlocks;
}

/**
 * Copies text to the system clipboard with modern and legacy fallbacks.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / iframe contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
