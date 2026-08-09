/**
 * Rezervasyon Type Definitions
 * Backend API ile uyumlu type'lar
 */

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Reservation {
  id: number;
  business_id: number;
  customer_name: string;
  customer_phone: string;
  reservation_time: string; // Format: "YYYY-MM-DD HH:MM:SS"
  person_count: number;
  customer_note: string | null;
  status: ReservationStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string | null;
  business_name: string;
  business_image: string | null;
}

export interface CreateReservationRequest {
  business_id: number;
  customer_name: string;
  customer_phone: string;
  reservation_time: string; // Format: "YYYY-MM-DD HH:MM:SS"
  person_count?: number;
  customer_note?: string;
  user_id?: number | null;
}

export interface CreateReservationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    status: ReservationStatus;
    business_name: string;
  };
  error_code?: string;
}

export interface GetReservationsResponse {
  success: boolean;
  data: Reservation[];
  total: number;
}

export interface CancelReservationRequest {
  user_id: number;
}

export interface CancelReservationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    status: ReservationStatus;
  };
}

/**
 * Rezervasyon status için renk ve metin helper'ları
 */
export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  { color: string; text: string; bgColor: string }
> = {
  pending: {
    color: '#F59E0B',
    text: 'Onay Bekliyor',
    bgColor: '#FEF3C7',
  },
  approved: {
    color: '#10B981',
    text: 'Onaylandı',
    bgColor: '#D1FAE5',
  },
  rejected: {
    color: '#EF4444',
    text: 'Reddedildi',
    bgColor: '#FEE2E2',
  },
  cancelled: {
    color: '#6B7280',
    text: 'İptal Edildi',
    bgColor: '#F3F4F6',
  },
};
