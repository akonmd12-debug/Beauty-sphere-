import { Order, MockEmailNotification } from '../types';

const STORAGE_KEY = 'beauty_sphere_mock_email_notifications_v1';

export function getStoredMockEmails(): MockEmailNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse mock emails:', e);
    return [];
  }
}

export function saveStoredMockEmails(emails: MockEmailNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save mock emails:', e);
  }
}

export function generateTrackingNumber(orderNumber: string): string {
  const cleanNum = orderNumber.replace(/\D/g, '').slice(-6) || '829471';
  const prefix = Math.random() > 0.5 ? 'KR-EXP' : 'SF-EXP';
  return `${prefix}-${cleanNum}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getCarrierForOrder(): string {
  const carriers = [
    'Korea Post Express (EMS Special Cargo)',
    'SF Express International Global',
    'CJ Logistics Global Courier',
    'DHL Express Worldwide'
  ];
  return carriers[Math.floor(Math.random() * carriers.length)];
}

/**
 * Triggers a simulated customer email/notification when an order's status updates to Shipped or Delivered.
 */
export function triggerOrderNotification(
  order: Order,
  status: 'Shipped' | 'Dispatched' | 'Delivered'
): MockEmailNotification {
  const trackingNumber = order.trackingNumber || generateTrackingNumber(order.orderNumber);
  const carrier = order.carrier || getCarrierForOrder();
  const recipientEmail = order.customer.email || `${order.customer.fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  let subject = '';
  if (status === 'Shipped' || status === 'Dispatched') {
    subject = `📦 Your Luxury Beauty Sphere Order #${order.orderNumber} Has Shipped!`;
  } else {
    subject = `✨ Delivered: Your Beauty Sphere Boutique Order #${order.orderNumber} Has Arrived!`;
  }

  const notification: MockEmailNotification = {
    id: `mock_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    recipientEmail,
    recipientName: order.customer.fullName,
    recipientPhone: order.customer.phone || 'N/A',
    recipientAddress: `${order.customer.address}, ${order.customer.city} ${order.customer.postalCode || ''}, ${order.customer.country || ''}`,
    statusTrigger: status,
    subject,
    trackingNumber,
    carrier,
    sentAt: new Date().toISOString(),
    items: order.items || [],
    total: order.total
  };

  // Persist to local mock email storage
  const existing = getStoredMockEmails();
  const updated = [notification, ...existing.filter((e) => !(e.orderId === order.id && e.statusTrigger === status))];
  saveStoredMockEmails(updated);

  // Dispatch custom browser event for live listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('beauty-sphere-mock-email-dispatched', {
        detail: notification
      })
    );
  }

  return notification;
}
