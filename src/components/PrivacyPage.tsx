import React from 'react';
import { motion } from 'motion/react';
import { Logo } from '../App';

export default function PrivacyPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-16 py-10"
    >
      <header className="border-l-8 border-bauhaus-blue pl-8 py-4">
        <h1 className="text-5xl font-display font-black tracking-tighter uppercase">Gizlilik Politikası</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mt-2">Son Güncelleme: 24 Mart 2026</p>
      </header>

      <div className="space-y-12 bg-white p-10 border-4 border-bauhaus-ink shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-red" />
            1. Veri Toplama
          </h2>
          <p className="leading-relaxed text-gray-700">
            Adına Utandım, anonimlik odaklı bir platformdur. Kayıt sırasında e-posta adresiniz ve kullanıcı adınız alınır. 
            Bu veriler sadece hesabınızı yönetmek ve topluluk güvenliğini sağlamak amacıyla kullanılır. 
            Utançlarınızda paylaştığınız her türlü bilgi, anonim olarak yayınlanır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-yellow" />
            2. Çerezler (Cookies)
          </h2>
          <p className="leading-relaxed text-gray-700">
            Platformun düzgün çalışması ve kullanıcı deneyimini iyileştirmek için temel çerezler kullanılır. 
            Bu çerezler oturum yönetimi ve tercihleriniz için gereklidir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-blue" />
            3. Veri Güvenliği
          </h2>
          <p className="leading-relaxed text-gray-700">
            Verileriniz Firebase (Google Cloud) altyapısında güvenli bir şekilde saklanır. 
            Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla asla paylaşılmaz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 bg-bauhaus-ink" />
            4. Haklarınız
          </h2>
          <p className="leading-relaxed text-gray-700">
            Kullanıcılar, diledikleri zaman hesaplarını ve paylaştıkları içerikleri silme hakkına sahiptir. 
            Verilerinizin silinmesi talebi için bizimle iletişime geçebilirsiniz.
          </p>
        </section>
      </div>

      <div className="flex justify-center pt-10">
        <Logo size="sm" />
      </div>
    </motion.div>
  );
}
