import React from 'react';
import { motion } from 'motion/react';
import { Logo } from '../App';

export default function TermsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-16 py-10"
    >
      <header className="border-l-8 border-bauhaus-red pl-8 py-4">
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Kullanım Koşulları</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-2">Son Güncelleme: 24 Mart 2026</p>
      </header>

      <div className="space-y-12 bg-white p-10 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-yellow" />
            1. Kabul Edilme
          </h2>
          <p className="leading-relaxed text-gray-700">
            Adına Utandım platformuna erişerek veya kullanarak, bu kullanım koşullarına bağlı kalmayı kabul etmiş sayılırsınız. 
            Eğer bu koşullardan herhangi birini kabul etmiyorsanız, lütfen platformu kullanmayınız.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-blue" />
            2. İçerik Paylaşımı
          </h2>
          <p className="leading-relaxed text-gray-700">
            Paylaştığınız tüm içeriklerden (utançlar, yorumlar vb.) tamamen siz sorumlusunuz. 
            İçerikleriniz yasalara, genel ahlaka ve topluluk kurallarımıza uygun olmalıdır. 
            Admin, uygun görmediği içerikleri herhangi bir bildirim yapmaksızın silme veya düzenleme hakkını saklı tutar.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-red" />
            3. Anonimlik ve Sorumluluk
          </h2>
          <p className="leading-relaxed text-gray-700">
            Platform anonimlik esasına dayanır. Ancak, başkalarının kişisel verilerini (isim, telefon, adres vb.) paylaşmak kesinlikle yasaktır. 
            Bu kuralın ihlali durumunda doğabilecek yasal sorumluluklar tamamen kullanıcıya aittir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-ink" />
            4. Hizmet Değişiklikleri
          </h2>
          <p className="leading-relaxed text-gray-700">
            Adına Utandım, platformun özelliklerini veya hizmetlerini önceden haber vermeksizin değiştirme, askıya alma veya durdurma hakkını saklı tutar.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-10">
        <Logo size="sm" />
      </div>
    </motion.div>
  );
}
