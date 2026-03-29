import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { blogPosts } from '../data/blogData';
import { ArrowLeft } from 'lucide-react';

export default function BlogPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return <Navigate to="/blog" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-10 space-y-16"
    >
      <Link 
        to="/blog" 
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-bauhaus-red transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        BLOG
      </Link>

      <article className="space-y-16">
        <header className="space-y-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${post.color} border-4 border-bauhaus-ink`} />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-bauhaus-red">{post.category}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-black leading-none tracking-tighter uppercase">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 border-y-4 border-bauhaus-ink py-6">
            <div className="text-xs font-black uppercase tracking-widest">
              OKUMA SÜRESİ: <span className="text-bauhaus-blue">{post.readTime}</span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-bauhaus-red" />
              <div className="w-3 h-3 bg-bauhaus-yellow" />
              <div className="w-3 h-3 bg-bauhaus-blue" />
            </div>
          </div>
        </header>

        <div className="text-lg md:text-xl font-medium leading-relaxed text-gray-800 space-y-8">
          {post.content}
        </div>

        <footer className="pt-16 border-t-8 border-bauhaus-ink flex justify-between items-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
            ADINA UTANDIM &mdash; BLOG SERİSİ
          </div>
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-bauhaus-red rounded-full border-2 border-bauhaus-ink" />
            <div className="w-6 h-6 bg-bauhaus-yellow border-2 border-bauhaus-ink" />
            <div className="w-6 h-6 bg-bauhaus-blue border-2 border-bauhaus-ink" />
          </div>
        </footer>
      </article>
    </motion.div>
  );
}
