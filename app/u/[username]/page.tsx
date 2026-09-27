import { Metadata } from 'next';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  MessageSquare, 
  Award, 
  ExternalLink, 
  Smartphone, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const API_BASE = 'https://api.service.menuland.net';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getProfileData(username: string) {
  try {
    const res = await axios.get(`${API_BASE}/users/${encodeURIComponent(username)}/public-profile`, {
      timeout: 10000,
    });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    // Profil bulunamadı veya hata
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileData(username);

  if (!profile) {
    return {
      title: 'Kullanıcı Bulunamadı | Menuland',
      description: 'Menuland lezzet ve mekan keşif platformu.',
    };
  }

  const name = profile.name || username;
  const handle = profile.username ? `@${profile.username}` : '';
  const title = `${name} (${handle}) | Menuland Lezzet Profili`;
  const desc = profile.bio 
    ? `${profile.bio} — ${name}'in Menuland üzerindeki lezzet profili, favori mekanları ve gurme yorumları.`
    : `${name}'in Menuland üzerindeki lezzet profili, favori mekanları ve gurme değerlendirmeleri.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://menuland.net/u/${encodeURIComponent(username)}`,
      siteName: 'Menuland',
      images: profile.avatar ? [{ url: profile.avatar, width: 800, height: 800, alt: name }] : undefined,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: profile.avatar ? [profile.avatar] : undefined,
    },
  };
}

export default async function UserPublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getProfileData(username);

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-[#FF4D00]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
          Kullanıcı Profili Bulunamadı
        </h1>
        <p className="text-zinc-600 max-w-md mx-auto mb-8 text-sm sm:text-base">
          Aradığınız <strong>@{username}</strong> profili mevcut değil veya silinmiş olabilir. Şehrin en popüler mekanlarını keşfetmek için ana sayfaya dönebilirsiniz.
        </p>
        <Link
          href="/kesfet"
          className="inline-flex items-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-[#FF4D00]/20 transition-all hover:scale-105"
        >
          Mekanları Keşfet <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const stats = profile.stats || {
    total_comments: 0,
    total_favorites: 0,
    total_visits: 0,
    puan_balance: 0,
    level_title: 'Gurme Kaşif',
  };
  const comments = Array.isArray(profile.comments) ? profile.comments : [];
  const favorites = Array.isArray(profile.favorites) ? profile.favorites : [];
  const badges = Array.isArray(profile.badges) ? profile.badges : [];
  const appDeepLink = `menuland://user/${profile.id}`;

  return (
    <div className="min-h-screen bg-zinc-50/60 pb-20">
      {/* ÜST AKILLI UYGULAMA ÇUBUĞU */}
      <div className="bg-gradient-to-r from-orange-600 to-[#FF4D00] text-white py-3 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-tight">Menuland Mobil Uygulaması</p>
              <p className="text-[11px] text-white/80">Bu profili ve mekanları uygulamada daha hızlı keşfedin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={appDeepLink}
              className="bg-white text-[#FF4D00] hover:bg-orange-50 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Uygulamada Aç
            </a>
            <Link
              href="/#download"
              className="bg-black/20 hover:bg-black/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              İndir
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* PROFİL KARTI */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* AVATAR */}
            <div className="relative">
              {profile.avatar ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-orange-50 shadow-md">
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-400 to-[#FF4D00] flex items-center justify-center text-white text-3xl font-black shadow-md border-4 border-orange-50">
                  {profile.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#FF4D00] flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* BİLGİLER */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                  {profile.name}
                </h1>
                {profile.username && (
                  <span className="text-zinc-500 font-semibold text-sm">
                    @{profile.username}
                  </span>
                )}
              </div>

              {/* ROZET & SEVİYE */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-[#FFF4EE] text-[#FF4D00] text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  <Award className="w-3.5 h-3.5" /> {stats.level_title || 'Gurme Kaşif'}
                </span>
                {profile.city && (
                  <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <MapPin className="w-3 h-3 text-zinc-500" /> {profile.city}
                  </span>
                )}
                {profile.member_since && (
                  <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Calendar className="w-3 h-3 text-zinc-500" /> Üye: {profile.member_since}
                  </span>
                )}
              </div>

              {/* BİYOGRAFİ */}
              {profile.bio ? (
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-zinc-400 text-sm italic mb-4">
                  Lezzetleri keşfetmeyi ve deneyimlerini paylaşmayı seven Menuland kullanıcısı.
                </p>
              )}

              {/* İSTATİSTİKLER */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md pt-3 border-t border-zinc-100">
                <div className="bg-zinc-50 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-900 font-black text-lg sm:text-xl">
                    <MessageSquare className="w-4 h-4 text-[#FF4D00]" />
                    {stats.total_comments || 0}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Yorum</span>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-900 font-black text-lg sm:text-xl">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {stats.total_favorites || 0}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Favori</span>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-zinc-900 font-black text-lg sm:text-xl">
                    <Award className="w-4 h-4 text-amber-500" />
                    {badges.length || 0}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Rozet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROZETLER BÖLÜMÜ */}
        {badges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Kazanılan Gurme Rozetleri
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b: any, idx: number) => (
                <div key={b.id || idx} className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
                  <span className="text-2xl">{b.icon || '🏅'}</span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-zinc-900 truncate">{b.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YORUMLAR & DEĞERLENDİRMELER */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FF4D00]" />
              Yorumlar & Değerlendirmeler ({comments.length})
            </h2>
          </div>

          {comments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200/80 text-zinc-500 text-sm">
              Bu kullanıcı henüz bir mekan için yorum yapmamış.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs hover:border-orange-200 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {comment.business_image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <img
                            src={comment.business_image}
                            alt={comment.business_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-[#FF4D00] font-bold">
                          🍽️
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/business/${comment.business_id}`}
                          className="font-bold text-base text-zinc-900 hover:text-[#FF4D00] transition-colors inline-flex items-center gap-1"
                        >
                          {comment.business_name}
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= comment.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                              />
                            ))}
                          </div>
                          {comment.is_verified_visit === 1 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Doğrulanmış Ziyaret
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-zinc-400 shrink-0">
                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>

                  <p className="text-zinc-700 text-sm leading-relaxed pl-1 sm:pl-15">
                    {comment.comment_text}
                  </p>

                  {comment.review_image && (
                    <div className="mt-3 pl-1 sm:pl-15">
                      <img
                        src={comment.review_image}
                        alt="Yorum görseli"
                        className="max-h-48 rounded-xl object-cover border border-zinc-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAVORİ MEKANLAR */}
        {favorites.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Favori Mekanları ({favorites.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((fav: any) => (
                <Link
                  key={fav.business_id}
                  href={`/business/${fav.business_id}`}
                  className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-4 group"
                >
                  {fav.business_image || fav.image_url_thumb ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                      <img
                        src={fav.business_image || fav.image_url_thumb}
                        alt={fav.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-2xl">
                      🍴
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors truncate">
                      {fav.business_name}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {fav.category_text || 'Restoran & Kafe'}
                    </p>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{fav.rating ? Number(fav.rating).toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#FF4D00] group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ALT ÇAĞRI (DOWNLOAD CTA) */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 sm:p-12 text-center my-12 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 bg-[#FF4D00]/20 text-[#FF4D00] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-4 w-4" /> Sen de Katıl
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            Şehrin En İyi Mekanlarını Keşfet ve Puan Kazan!
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
            Menuland ile menüleri incele, fotoğraflı yorumlar yap, her sipariş ve ziyaretinde PuanLand kazan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={appDeepLink}
              className="inline-flex items-center justify-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-[#FF4D00]/30 transition-all hover:scale-105 active:scale-95"
            >
              Uygulamada Aç <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/kesfet"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-base px-8 py-3.5 rounded-2xl transition-all"
            >
              Mekanları İncele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
