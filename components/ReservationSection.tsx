'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { createReservationAction } from '../app/actions/auth';
import { Calendar, User, Phone, Users, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface ReservationSectionProps {
  businessId: number;
  businessName: string;
  businessSlug: string;
}

export default function ReservationSection({ businessId, businessName, businessSlug }: ReservationSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [personCount, setPersonCount] = useState('2');
  const [customerNote, setCustomerNote] = useState('');

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Sync user name when user loads
  React.useEffect(() => {
    if (user?.name) {
      setCustomerName(user.name);
    }
  }, [user]);

  const todayStr = React.useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const handleLoginRedirect = () => {
    const currentPath = `/business/${businessSlug}-${businessId}`;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!customerName.trim()) {
      setError('Lütfen adınızı giriniz.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Lütfen telefon numaranızı giriniz.');
      return;
    }
    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Geçerli bir telefon numarası giriniz.');
      return;
    }
    if (!selectedDate) {
      setError('Lütfen tarih seçiniz.');
      return;
    }
    if (!selectedTime) {
      setError('Lütfen saat seçiniz.');
      return;
    }

    const combined = new Date(`${selectedDate}T${selectedTime}`);
    if (combined <= new Date()) {
      setError('Geçmiş bir tarih/saat seçemezsiniz.');
      return;
    }

    const count = parseInt(personCount);
    if (isNaN(count) || count < 1 || count > 50) {
      setError('Kişi sayısı 1-50 arasında olmalıdır.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format time as expected: YYYY-MM-DD HH:MM:00
      const formattedDateTime = `${selectedDate} ${selectedTime}:00`;

      const response = await createReservationAction({
        business_id: businessId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        reservation_time: formattedDateTime,
        person_count: count,
        customer_note: customerNote.trim() || undefined,
        user_id: user?.id || undefined,
      });

      if (response.success) {
        setSuccess(true);
        // Reset form
        setSelectedDate('');
        setSelectedTime('');
        setCustomerNote('');
      } else {
        setError(response.message || 'Rezervasyon oluşturulamadı.');
      }
    } catch (err) {
      setError('Rezervasyon gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#FF4D00] to-[#e04300] p-6 text-white flex flex-col gap-4 shadow-xl shadow-[#FF4D00]/10">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h3 className="text-lg font-bold">Masa Rezervasyonu</h3>
        </div>
        <p className="text-xs text-white/90 leading-relaxed font-medium">
          Masa rezervasyonu yapmak için Menuland hesabınıza giriş yapmanız gerekmektedir. Güvenliğiniz ve rezervasyon takibiniz için bu işlem zorunludur.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="w-full rounded-2xl bg-white py-3.5 text-center text-xs font-black text-[#FF4D00] hover:bg-orange-50 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md block cursor-pointer"
        >
          Giriş Yap / Kayıt Ol
        </button>
      </section>
    );
  }

  if (success) {
    return (
      <section className="rounded-3xl border border-green-150 bg-green-50/70 p-6 text-zinc-900 flex flex-col gap-4 shadow-lg">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-bold">Rezervasyon Alındı!</h3>
        </div>
        <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
          Rezervasyon talebiniz başarıyla iletildi. İşletme talebinizi onayladığında PuanLand puanı kazanacaksınız. Rezervasyon durumunuzu mobil uygulamamız üzerinden takip edebilirsiniz.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setShowForm(false);
          }}
          className="w-full rounded-2xl bg-green-600 py-3 text-center text-xs font-black text-white hover:bg-green-700 transition-colors shadow-md block cursor-pointer"
        >
          Tamam
        </button>
      </section>
    );
  }

  if (!showForm) {
    return (
      <section className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#FF4D00] to-[#e04300] p-6 text-white flex flex-col gap-4 shadow-xl shadow-[#FF4D00]/10">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h3 className="text-lg font-bold">Masa Rezervasyonu</h3>
        </div>
        <p className="text-xs text-white/90 leading-relaxed font-medium">
          Bu işletme aktif olarak masa rezervasyonu kabul etmektedir. Hızlıca yerinizi ayırtın.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-2xl bg-white py-3.5 text-center text-xs font-black text-[#FF4D00] hover:bg-orange-50 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md block cursor-pointer"
        >
          Hemen Rezervasyon Yap
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 flex flex-col gap-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF4D00]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#FF4D00]" />
          <h3 className="text-sm font-black text-zinc-900">Rezervasyon Bilgileri</h3>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          İptal
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReservationSubmit} className="space-y-4">
        {/* Ad Soyad */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Ad Soyad <span className="text-[#FF4D00]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <input
              type="text"
              required
              placeholder="Adınız Soyadınız"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Telefon */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Telefon Numarası <span className="text-[#FF4D00]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <input
              type="tel"
              required
              placeholder="5XX XXX XX XX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Tarih & Saat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Tarih <span className="text-[#FF4D00]">*</span>
            </label>
            <input
              type="date"
              required
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Saat <span className="text-[#FF4D00]">*</span>
            </label>
            <input
              type="time"
              required
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Kişi Sayısı */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Kişi Sayısı <span className="text-[#FF4D00]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <input
              type="number"
              required
              min="1"
              max="50"
              placeholder="1-50 arası kişi sayısı"
              value={personCount}
              onChange={(e) => setPersonCount(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Not */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Özel İstek / Not (Opsiyonel)
          </label>
          <div className="relative">
            <span className="absolute top-2.5 left-3 pointer-events-none">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
            </span>
            <textarea
              placeholder="Varsa alerji, pencere kenarı isteği vb. notlarınızı yazın."
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FF4D00] hover:bg-[#e04300] disabled:bg-zinc-350 text-white font-black text-xs py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-1.5 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Rezervasyon Talebini Gönder'
          )}
        </button>
      </form>
    </section>
  );
}
