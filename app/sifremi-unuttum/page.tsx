import type { Metadata } from 'next';
import SifremiUnuttumFormu from './SifremiUnuttumFormu';

export const metadata: Metadata = {
  title: 'Şifremi unuttum',
  description: 'Menuland hesabınızın şifresini yenilemek için e-posta adresinizi yazın.',
  alternates: { canonical: '/sifremi-unuttum' },
  robots: { index: false, follow: true },
};

export default function SifremiUnuttumSayfasi() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <SifremiUnuttumFormu />
    </div>
  );
}
