/**
 * Pathao Courier Bangladesh Integration Adapter
 * 
 * To connect your live Pathao Courier Merchant Account:
 * 1. Generate your API credentials from Pathao Merchant Portal (https://merchant.pathao.com).
 * 2. Set PATHAO_COURIER_ACCESS_TOKEN or provide it dynamically to trackConsignment().
 * 3. Base endpoint: https://api-hermes.pathao.com/aladdin/api/v1/orders/
 */

export interface PathaoCourierConfig {
  baseUrl: string;
  accessToken?: string;
  isSandbox?: boolean;
}

export type PathaoDeliveryStatus = 
  | 'Pending'
  | 'Picked'
  | 'In_Transit'
  | 'Out_for_Delivery'
  | 'Delivered'
  | 'Returned';

export interface PathaoTrackingEvent {
  time: string;
  status: string;
  location: string;
  note: string;
}

export interface PathaoTrackingData {
  consignmentId: string;
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  hubLocation: string;
  courierPartner: 'Pathao Courier';
  riderName?: string;
  riderPhone?: string;
  paymentType: 'Cash on Delivery (COD)' | 'Prepaid via MFS (bKash/Nagad)';
  amountToCollectBDT: number;
  currentStatus: PathaoDeliveryStatus;
  estimatedDelivery: string;
  timeline: PathaoTrackingEvent[];
}

// Default Configuration (Ready for live access token)
export const pathaoConfig: PathaoCourierConfig = {
  baseUrl: 'https://api-hermes.pathao.com/aladdin/api/v1',
  accessToken: import.meta.env?.VITE_PATHAO_ACCESS_TOKEN || '',
  isSandbox: false,
};

const CUSTOMER_ORDERS_STORAGE_KEY = 'fabrician_customer_orders_v1';

export function getSavedCustomerOrders(): Record<string, PathaoTrackingData> {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomerOrder(order: {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  division: string;
  paymentMethod: 'mfs' | 'cod';
  totalBDT: number;
  consignmentId?: string;
}): PathaoTrackingData {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const consignmentId =
    order.consignmentId || `PTH-DH-${Math.floor(100000 + Math.random() * 900000)}`;
  const isDhaka = order.division.toLowerCase().includes('dhaka');

  const record: PathaoTrackingData = {
    consignmentId,
    orderId: order.orderId,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    recipientAddress: `${order.recipientAddress}, ${order.division}`,
    hubLocation: isDhaka ? 'Tejgaon Central Hub, Dhaka' : `${order.division} Regional Hub`,
    courierPartner: 'Pathao Courier',
    paymentType:
      order.paymentMethod === 'cod'
        ? 'Cash on Delivery (COD)'
        : 'Prepaid via MFS (bKash/Nagad)',
    amountToCollectBDT: order.paymentMethod === 'cod' ? order.totalBDT : 0,
    currentStatus: 'Pending',
    estimatedDelivery: isDhaka ? 'Within 24–48 Hours' : 'Within 2–4 Business Days',
    timeline: [
      {
        time: `Today, ${timeStr}`,
        status: 'Order Confirmed & Registered',
        location: 'Fabrician Atelier, Dhaka',
        note: 'Garment quality inspection scheduled prior to Pathao Courier pickup.',
      },
    ],
  };

  try {
    const existing = getSavedCustomerOrders();
    existing[order.orderId.toUpperCase()] = record;
    localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore storage quota errors
  }

  return record;
}

// Realistic mock orders database for demonstration and testing
const MOCK_PATHAO_ORDERS: Record<string, PathaoTrackingData> = {
  'FAB-2026': {
    consignmentId: 'PTH-DH-849201',
    orderId: 'FAB-2026',
    recipientName: 'Sazzad Sharif',
    recipientPhone: '+880 1712-345678',
    recipientAddress: 'House 42, Road 11, Banani, Dhaka-1213',
    hubLocation: 'Banani Hub (Dhaka North)',
    courierPartner: 'Pathao Courier',
    riderName: 'Tanvir Ahmed',
    riderPhone: '+880 1823-991122',
    paymentType: 'Cash on Delivery (COD)',
    amountToCollectBDT: 6800,
    currentStatus: 'Out_for_Delivery',
    estimatedDelivery: 'Today by 5:00 PM',
    timeline: [
      {
        time: 'Today, 01:15 PM',
        status: 'Out for Delivery',
        location: 'Banani Hub, Dhaka',
        note: 'Assigned to Pathao Hero Tanvir Ahmed for priority doorstep delivery',
      },
      {
        time: 'Today, 09:40 AM',
        status: 'Arrived at Sorting Hub',
        location: 'Tejgaon Central Sorting Hub',
        note: 'Shipment sorted and dispatched to Banani Last-Mile Hub',
      },
      {
        time: 'Yesterday, 07:30 PM',
        status: 'Picked from Fabrician Atelier',
        location: 'Dhaka Studio Atelier',
        note: 'Package sealed in tamper-proof luxury garment protection bag',
      },
      {
        time: 'Yesterday, 04:00 PM',
        status: 'Order Placed & Registered with Pathao',
        location: 'Fabrician Online Flagship',
        note: 'Consignment created via Pathao Merchant API',
      },
    ],
  },
  'CAT-001': {
    consignmentId: 'PTH-CTG-10294',
    orderId: 'CAT-001',
    recipientName: 'Nusrat Jahan',
    recipientPhone: '+880 1911-882233',
    recipientAddress: 'GEC Circle, Nasirabad, Chittagong',
    hubLocation: 'Chittagong Central Hub',
    courierPartner: 'Pathao Courier',
    paymentType: 'Prepaid via MFS (bKash/Nagad)',
    amountToCollectBDT: 0,
    currentStatus: 'In_Transit',
    estimatedDelivery: 'Tomorrow, 2:00 PM',
    timeline: [
      {
        time: 'Today, 11:30 AM',
        status: 'In Transit Between Hubs',
        location: 'Dhaka-Chittagong Express Highway',
        note: 'Secured freight transport en route to Chittagong Hub',
      },
      {
        time: 'Yesterday, 06:15 PM',
        status: 'Picked from Atelier',
        location: 'Dhaka Atelier Hub',
        note: 'Garment verified and handed to Pathao Logistics',
      },
    ],
  },
  'FAB-8921': {
    consignmentId: 'PTH-DH-992381',
    orderId: 'FAB-8921',
    recipientName: 'Farhana Rahman',
    recipientPhone: '+880 1755-443322',
    recipientAddress: 'Dhanmondi 27, Dhaka-1209',
    hubLocation: 'Dhanmondi Hub, Dhaka',
    courierPartner: 'Pathao Courier',
    riderName: 'Kamrul Hasan',
    paymentType: 'Cash on Delivery (COD)',
    amountToCollectBDT: 4800,
    currentStatus: 'Delivered',
    estimatedDelivery: 'Delivered',
    timeline: [
      {
        time: 'Nov 10, 03:45 PM',
        status: 'Delivered Successfully',
        location: 'Dhanmondi, Dhaka',
        note: 'Delivered to recipient with digital signature and OTP verification',
      },
      {
        time: 'Nov 10, 11:00 AM',
        status: 'Out for Delivery',
        location: 'Dhanmondi Hub',
        note: 'Assigned to Pathao Rider Kamrul Hasan',
      },
      {
        time: 'Nov 09, 05:20 PM',
        status: 'Picked Up by Pathao',
        location: 'Dhaka Atelier',
        note: 'Item verified and dispatched',
      },
    ],
  },
};

/**
 * Fetch tracking details for a consignment or order ID.
 * When a live token is supplied, this points directly to the Pathao Courier API.
 * Otherwise, it falls back to authentic mock data with zero lag.
 */
export async function trackPathaoOrder(
  orderIdOrConsignment: string,
  userToken?: string
): Promise<PathaoTrackingData> {
  const token = userToken || pathaoConfig.accessToken;
  const cleanId = orderIdOrConsignment.trim().toUpperCase();

  // If a live token is set, attempt live Hermes Pathao API call
  if (token) {
    try {
      const response = await fetch(
        `${pathaoConfig.baseUrl}/orders/${encodeURIComponent(cleanId)}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      if (response.ok) {
        const liveJson = await response.json();
        // Transform live Pathao response to our typed model
        return {
          consignmentId: liveJson.data?.consignment_id || cleanId,
          orderId: liveJson.data?.merchant_order_id || cleanId,
          recipientName: liveJson.data?.recipient_name || 'Customer',
          recipientPhone: liveJson.data?.recipient_phone || '',
          recipientAddress: liveJson.data?.recipient_address || 'Dhaka, Bangladesh',
          hubLocation: liveJson.data?.current_hub || 'Pathao Central Hub',
          courierPartner: 'Pathao Courier',
          paymentType: liveJson.data?.amount_to_collect > 0 ? 'Cash on Delivery (COD)' : 'Prepaid via MFS (bKash/Nagad)',
          amountToCollectBDT: liveJson.data?.amount_to_collect || 0,
          currentStatus: liveJson.data?.order_status || 'In_Transit',
          estimatedDelivery: liveJson.data?.estimated_delivery_time || 'Within 24-48 Hours',
          timeline: (liveJson.data?.order_status_history || []).map((h: any) => ({
            time: h.created_at,
            status: h.status,
            location: h.location || 'Dhaka',
            note: h.message || '',
          })),
        };
      }
    } catch {
      // Graceful fallback to mock data if network or sandbox is offline
    }
  }

  // Check live Firestore orderTracking first (admin-updated status across devices)
  try {
    const { fetchLiveOrderTracking } = await import('./storeService');
    const liveTrack = await fetchLiveOrderTracking(cleanId);
    if (liveTrack) {
      const updatedTime = new Date(liveTrack.updatedAtMs).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return {
        consignmentId: liveTrack.consignmentId,
        orderId: liveTrack.orderId,
        recipientName: 'Verified Fabrician Client',
        recipientPhone: '',
        recipientAddress: liveTrack.division,
        hubLocation: liveTrack.hubLocation,
        courierPartner: 'Pathao Courier',
        riderName: liveTrack.riderName,
        paymentType:
          liveTrack.paymentMethod === 'cod'
            ? 'Cash on Delivery (COD)'
            : 'Prepaid via MFS (bKash/Nagad)',
        amountToCollectBDT: liveTrack.amountToCollectBDT,
        currentStatus: liveTrack.currentStatus,
        estimatedDelivery: liveTrack.estimatedDelivery,
        timeline: [
          {
            time: updatedTime,
            status: liveTrack.currentStatus.replace(/_/g, ' '),
            location: liveTrack.hubLocation,
            note: liveTrack.trackingNote,
          },
        ],
      };
    }
  } catch {
    // fallback gracefully
  }

  // Simulated latency for realistic response
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Check customer-placed orders saved in browser storage
  const savedOrders = getSavedCustomerOrders();
  if (savedOrders[cleanId]) {
    return savedOrders[cleanId];
  }

  // Check known sample records
  if (MOCK_PATHAO_ORDERS[cleanId]) {
    return MOCK_PATHAO_ORDERS[cleanId];
  }

  // Also check if input matches any saved consignment ID
  const byConsignment = Object.values(savedOrders).find(
    (entry) => entry.consignmentId.toUpperCase() === cleanId
  );
  if (byConsignment) {
    return byConsignment;
  }

  throw new Error('ORDER_NOT_FOUND');
}
