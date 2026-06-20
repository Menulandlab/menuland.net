'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserReservationsAction, cancelReservationAction } from '../actions/auth';
import { Calendar, Users, FileText, AlertCircle, Clock, CheckCircle2, XCircle, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Reservation {
  id: number;
  business_id: number;
  business_name: string;
  customer_name: string;
  customer_phone: string;
  reservation_time: string;
  person_count: number;
  customer_note?: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed' | string;
  created_at: string;
}

export default function MyReservationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserReservationsAction();
      if (res.success) {
        // Sort reservations by reservation_time descending (newest first)
        const sorted = (res.data as Reservation[]).sort(
          (a, b) => new Date(b.reservation_time).getTime() - new Date(a.reservation_time).getTime()
        );
        setReservations(sorted);
      } else {
        setError(res.message || 'Rezervasyonlar yüklenemedi.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/rezervasyonlarim');
      } else {
        fetchReservations();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      const res = await cancelReservationAction(reservationId);
      if (res.success) {
        // Update local list
        setReservations((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
        );
      } else {
        alert(res.message || 'Rezervasyon iptal edilemedi.');
      }
    } catch (err) {
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="h-3 w-3" /> Onay Bekliyor
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle2 className="h-3 w-3" /> Onaylandı
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="h-3 w-3" /> İptal Edildi
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-50 text-zinc-700 border border-zinc-100">
            <CheckCircle2 className="h-3 w-3" /> Tamamlandı
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-50 text-zinc-700 border border-zinc-100">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (authLoading || (loading && reservations.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin" />
        <span className="text-zinc-500 font-semibold text-sm">Rezervasyonlarınız yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4D00] hover:underline mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Ana Sayfaya Dön
          </Link>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Rezervasyonlarım</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Yaptığınız masa rezervasyonlarının durumunu buradan takip edebilirsiniz.
          </p>
        </div>
        <div className="text-xs font-bold text-zinc-450 bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-100 shrink-0 self-start sm:self-center">
          Toplam: <span className="text-[#FF4D00]">{reservations.length}</span> Kayıt
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center gap-4 bg-zinc-50/30">
          <Calendar className="h-12 w-12 text-zinc-300" />
          <h3 className="text-base font-bold text-zinc-800">Henüz Rezervasyon Bulunmuyor</h3>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
            Henüz hiçbir işletmeye rezervasyon talebi göndermemişsiniz. Keşfet sayfasından mekanları inceleyip masa ayırtabilirsiniz.
          </p>
          <Link href="/kesfet" className="rounded-full bg-[#FF4D00] hover:bg-[#e04300] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF4D00]/15 transition-all">
            İşletmeleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservations.map((reservation) => {
            const isCancellable = reservation.status === 'pending' || reservation.status === 'approved';
            
            return (
              <div
                key={reservation.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md hover:border-gray-200/60 transition-all"
              >
                <div className="flex-1 space-y-4">
                  {/* Title & Status */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-black text-zinc-900">{reservation.business_name || 'Menuland Mekanı'}</h3>
                    {getStatusBadge(reservation.status)}
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span className="font-semibold">{formatDateTime(reservation.reservation_time)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span>Kişi Sayısı: <span className="font-bold text-zinc-800">{reservation.person_count} Kişi</span></span>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
                      <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[200px]" title={reservation.customer_note}>
                        Not: <span className="text-zinc-500 font-medium italic">{reservation.customer_note || 'Not bırakılmadı'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancel Action */}
                {isCancellable && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    disabled={cancellingId === reservation.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-100 text-xs font-bold text-rose-650 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 transition-all shrink-0 cursor-pointer self-end sm:self-center"
                  >
                    {cancellingId === reservation.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    İptal Et
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
