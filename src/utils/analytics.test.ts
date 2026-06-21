/**
 * 🧪 Analytics Test Script
 * 
 * Bu dosya analytics sistemini test etmek için kullanılabilir.
 * Gerçek uygulamada kullanılmaz, sadece development amaçlıdır.
 */

import { getDeviceId } from './deviceId';
import { trackBusinessView, scheduleBusinessViewTracking, clearViewSession } from './analytics';

/**
 * Test 1: Device ID alma
 */
export async function testDeviceId() {
  console.log('\n🧪 Test 1: Device ID alma');
  console.log('─'.repeat(50));
  
  const deviceId = await getDeviceId();
  console.log('✅ Device ID:', deviceId);
  console.log('✅ Uzunluk:', deviceId.length);
  console.log('✅ Format:', /^[a-zA-Z0-9-]+$/.test(deviceId) ? 'Geçerli' : 'Geçersiz');
  
  // İkinci çağrı - cache'ten gelmeli
  const deviceId2 = await getDeviceId();
  console.log('✅ Cache test:', deviceId === deviceId2 ? 'BAŞARILI (aynı ID)' : 'BAŞARISIZ');
}

/**
 * Test 2: Direkt tracking (3 saniye beklemeden)
 */
export async function testDirectTracking() {
  console.log('\n🧪 Test 2: Direkt tracking');
  console.log('─'.repeat(50));
  
  await trackBusinessView({
    businessId: '999',
    userId: 123,
  });
  
  console.log('✅ İlk tracking tamamlandı');
  
  // Aynı işletme için tekrar dene - session cache'den dönmeli
  await trackBusinessView({
    businessId: '999',
    userId: 123,
  });
  
  console.log('✅ İkinci tracking (session cache test) tamamlandı');
}

/**
 * Test 3: 3 saniye kuralı (timer test)
 */
export async function test3SecondRule() {
  console.log('\n🧪 Test 3: 3 saniye kuralı');
  console.log('─'.repeat(50));
  
  console.log('⏱️  3 saniye timer başlatılıyor...');
  
  const cleanup = scheduleBusinessViewTracking({
    businessId: '888',
    userId: 456,
  }, 3000);
  
  // 2 saniye sonra iptal et (erken çıkış simülasyonu)
  setTimeout(() => {
    console.log('🚫 Timer iptal ediliyor (erken çıkış)');
    cleanup();
  }, 2000);
  
  console.log('✅ Test tamamlandı (2 saniye sonra iptal edilecek)');
}

/**
 * Test 4: Session temizleme
 */
export async function testSessionClear() {
  console.log('\n🧪 Test 4: Session temizleme');
  console.log('─'.repeat(50));
  
  // İlk tracking
  await trackBusinessView({
    businessId: '777',
    userId: null,
  });
  console.log('✅ İlk tracking yapıldı');
  
  // Session temizle
  clearViewSession();
  console.log('🗑️  Session cache temizlendi');
  
  // Tekrar tracking - bu sefer gitmeli
  await trackBusinessView({
    businessId: '777',
    userId: null,
  });
  console.log('✅ Session temizlendikten sonra tekrar tracking yapıldı');
}

/**
 * Tüm testleri çalıştır
 */
export async function runAllTests() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 ANALYTICS TEST SUITE');
  console.log('='.repeat(50));
  
  try {
    await testDeviceId();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDirectTracking();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await test3SecondRule();
    await new Promise(resolve => setTimeout(resolve, 4000)); // 3 saniye + buffer
    
    await testSessionClear();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ TÜM TESTLER TAMAMLANDI');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ TEST HATASI:', error);
  }
}

// Kullanım:
// import { runAllTests } from '@/src/utils/analytics.test';
// await runAllTests();
