import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';

export default function BlogPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-24 py-10"
    >
      <header className="space-y-8 border-b-8 border-bauhaus-ink pb-12">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-bauhaus-red" />
          <h4 className="text-xs font-black uppercase tracking-[0.5em] text-bauhaus-ink">BLOG.</h4>
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.85] tracking-tighter">
          UTANÇ <br />
          <span className="text-bauhaus-blue">LİTERATÜRÜ.</span>
        </h1>
        <p className="text-xl font-medium max-w-2xl text-gray-600">
          Başkasının adına utanmanın psikolojisi, sosyolojisi ve felsefesi üstüne burada atıp tutuyoruz.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-16">
        {blogPosts.map((post, index) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/blog/${post.id}`} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 space-y-6">
                <div className={`w-full aspect-square ${post.color} border-4 border-bauhaus-ink flex items-center justify-center p-12 group-hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all`}>
                  <div className="w-full h-full border-4 border-bauhaus-ink flex items-center justify-center">
                     <span className="text-8xl font-display font-black opacity-20">{post.id}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-bauhaus-red">{post.category}</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span>OKUMA SÜRESİ: {post.readTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-4xl md:text-5xl font-display font-black leading-none tracking-tighter uppercase group-hover:text-bauhaus-red transition-colors">
                  {post.title}
                </h2>
                <p className="text-xl font-medium leading-relaxed text-gray-700">
                  {post.teaser}
                </p>
                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-bauhaus-ink group-hover:translate-x-2 transition-transform">
                  DEVAMINI OKU <span>→</span>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="w-8 h-1 bg-bauhaus-red" />
                  <div className="w-8 h-1 bg-bauhaus-yellow" />
                  <div className="w-8 h-1 bg-bauhaus-blue" />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
