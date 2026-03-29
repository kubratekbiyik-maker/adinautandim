import React from 'react';
import { motion } from 'motion/react';
import { Logo } from '../App';

export default function CommunityRulesPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-16 py-10"
    >
      <header className="border-l-8 border-bauhaus-yellow pl-8 py-4">
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Topluluk Kuralları</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-2">Son Güncelleme: 24 Mart 2026</p>
      </header>

      <div className="space-y-12 bg-white p-10 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-red" />
            1. Saygı ve Nezaket
          </h2>
          <p className="leading-relaxed text-gray-700">
            Adına Utandım, eğlence ve paylaşım odaklıdır. Nefret söylemi, ayrımcılık, taciz ve zorbalık içeren içerikler kesinlikle yasaktır. 
            Başkalarını kırmak veya aşağılamak için değil, absürt anları paylaşmak için buradayız.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-blue" />
            2. Kişisel Verilerin Korunması
          </h2>
          <p className="leading-relaxed text-gray-700">
            Paylaşımlarınızda isim, soyisim, telefon numarası, adres veya sosyal medya hesabı gibi kişisel verileri paylaşmak kesinlikle yasaktır. 
            İfşa (doxing) niteliğindeki tüm içerikler silinir ve kullanıcı engellenir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-yellow" />
            3. Kaliteli İçerik
          </h2>
          <p className="leading-relaxed text-gray-700">
            Sadece "ikinci el utanç" (cringe) hissettiren anları paylaşmaya özen gösterin. 
            Spam, reklam, siyasi propaganda veya konu dışı içerikler platformun amacına hizmet etmez.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-ink" />
            4. Moderasyon
          </h2>
          <p className="leading-relaxed text-gray-700">
            Adminler, topluluk kurallarını ihlal eden içerikleri kaldırma ve ihlalde bulunan kullanıcıların hesaplarını askıya alma yetkisine sahiptir. 
            Kurallara uymayan içerikleri raporlayarak topluluğumuza yardımcı olabilirsiniz.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-10">
        <Logo size="sm" />
      </div>
    </motion.div>
  );
}
