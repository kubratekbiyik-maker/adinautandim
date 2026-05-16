import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Logo } from '../App';

const translateError = (code: string) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/missing-email':
      return 'Lütfen e-posta adresinizi girin.';
    case 'auth/user-not-found':
      return 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.';
    case 'auth/wrong-password':
      return 'Hatalı şifre. Lütfen tekrar deneyin.';
    case 'auth/user-disabled':
      return 'Kullanıcı hesabı devre dışı bırakılmış.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda. Giriş yapmayı denemek ister misin?';
    case 'auth/weak-password':
      return 'Şifre çok zayıf (en az 6 karakter olmalıdır).';
    case 'auth/popup-closed-by-user':
      return 'İşlem iptal edildi.';
    case 'auth/operation-not-allowed':
      return 'E-posta/Şifre girişi henüz etkinleştirilmemiş. Lütfen Firebase konsolundan bu yöntemi etkinleştirin veya sistem yöneticisiyle iletişime geçin.';
    case 'auth/network-request-failed':
      return 'Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
    case 'auth/internal-error':
      return 'Sistemsel bir hata oluştu. Lütfen tekrar deneyin.';
    default:
      return code ? `Hata: ${code}` : 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isConfirmReset, setIsConfirmReset] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode');
    const mode = params.get('mode');

    if (code && mode === 'resetPassword') {
      setOobCode(code);
      setIsConfirmReset(true);
      // Verify code validity
      verifyPasswordResetCode(auth, code).catch((err) => {
        setError('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
      });
    }

    if (location.state && typeof location.state.isLogin === 'boolean') {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (isConfirmReset && oobCode) {
      if (password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor.');
        return;
      }
      setLoading(true);
      try {
        await confirmPasswordReset(auth, oobCode, password);
        setMessage('Şifreniz başarıyla güncellendi! Şimdi yeni şifrenizle giriş yapabilirsiniz.');
        setIsConfirmReset(false);
        setIsLogin(true);
        // Clear code from URL
        navigate('/auth', { replace: true });
      } catch (err: any) {
        console.error("Confirm reset error:", err);
        setError(translateError(err.code));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isReset) {
      if (!email || !email.includes('@')) {
        setError('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage('Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Lütfen gelen kutunuza (ve spam klasörüne) göz atın.');
        setIsReset(false);
        setIsLogin(true);
      } catch (err: any) {
        console.error("Password reset error:", err);
        setError(translateError(err.code || err.message));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isLogin && (username.trim().length < 3 || username.trim().length > 30)) {
      setError('Kullanıcı adı 3-30 karakter arasında olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          // Update last login time without awaiting to speed up navigation
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // This could happen if signup was interrupted before setDoc
            const role = user.email === 'kubratekbiyik@gmail.com' ? 'admin' : 'user';
            await setDoc(userDocRef, {
              uid: user.uid,
              username: user.displayName || `kullanici_${user.uid.substring(0, 5)}`,
              email: user.email || '',
              role,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            });
          } else {
            updateDoc(userDocRef, {
              lastLoginAt: serverTimestamp()
            }).catch(err => console.error("Last login update failed:", err));
          }
        }
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Try to update profile but don't let it block everything
        try {
          await updateProfile(user, { displayName: username.trim() });
        } catch (profileErr) {
          console.error("Profile update failed", profileErr);
        }
        
        // Create user profile in Firestore
        const role = email === 'kubratekbiyik@gmail.com' ? 'admin' : 'user';
        const userDocRef = doc(db, 'users', user.uid);
        
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            username: username.trim(),
            email,
            role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
          
          const from = location.state?.from || '/';
          navigate(from, { replace: true });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error("Auth process error:", err);
      
      // Handle stringified Firestore error
      if (err.message && err.message.startsWith('{')) {
        try {
          const fsErr = JSON.parse(err.message);
          setError(`Hata: ${fsErr.error}`);
        } catch {
          setError(translateError(err.code || err.message));
        }
      } else {
        setError(translateError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] bg-white"
    >
      <div className="md:col-span-6 bg-bauhaus-yellow p-10 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
        <div className="space-y-12">
          <Logo size="lg" />
          <h1 className="text-4xl font-display font-black leading-none tracking-tighter">
            {isConfirmReset ? (
              <>YENİ BİR BAŞLANGIÇ... YENİ BİR ŞİFRE.</>
            ) : isReset ? (
              <>BAZEN HAFIZA OYUN OYNAR. SIFIRLAYALIM.</>
            ) : isLogin ? (
              <>KİM BİLİR ELF GÖZLERİN YİNE NELER GÖRDÜ.</>
            ) : 'GEL GEL, BİRLİKTE UTANALIM.'}
          </h1>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest leading-tight">
          {isConfirmReset 
            ? 'GÜÇLÜ VE UNUTMAYACAĞIN BİR ŞİFRE SEÇ.'
            : isReset 
              ? 'E-POSTA ADRESİNİ YAZ, ŞİFRE SIFIRLAMA BAĞLANTISINI GÖNDERELİM.'
              : isLogin 
                ? 'BAŞKASININ ADINA UTANDIĞIN ANLARI PAYLAŞMAYA DEVAM ET.' 
                : 'BAŞKALARI ADINA UTANDIĞIN ANLARI ANLATMAYA BAŞLA.'}
        </p>
      </div>

      <div className="md:col-span-6 p-10 space-y-8 bg-white relative">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center space-y-6"
            >
              <div className="w-16 h-16 border-8 border-bauhaus-ink border-t-bauhaus-red rounded-full animate-spin shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]" />
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl tracking-tighter uppercase">
                  {isConfirmReset ? 'GÜNCELLENİYOR...' : isReset ? 'SIFIRLANIYOR...' : 'BAĞLANILIYOR...'}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  {isConfirmReset 
                    ? 'YENİ ŞİFRENİZ SİSTEME İŞLENİYOR.'
                    : isReset 
                      ? 'HAFIZANI TAZELEMEK İÇİN GEREKLİ AYARLAR YAPILIYOR.' 
                      : 'LÜTFEN BEKLEYİN, UTANÇ DÜNYASINA GİRİŞ YAPILIYOR.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {(isReset || isConfirmReset) && (
            <button
              type="button"
              onClick={() => {
                setIsReset(false);
                setIsConfirmReset(false);
                setIsLogin(true);
                navigate('/auth', { replace: true });
              }}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-bauhaus-red transition-colors"
            >
              <ChevronLeft size={16} /> GERİ DÖN
            </button>
          )}

          {!isLogin && !isReset && !isConfirmReset && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">KULLANICI ADI</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
              />
            </div>
          )}

          {!isConfirmReset && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">E-POSTA</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
              />
            </div>
          )}

          {!isReset && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest">
                  {isConfirmReset ? 'YENİ ŞİFRE' : 'ŞİFRE'}
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReset(true);
                      setError('');
                      setMessage('');
                    }}
                    className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-bauhaus-red transition-colors underline decoration-2 underline-offset-4"
                  >
                    ŞİFREMİ UNUTTUM
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-bauhaus-ink hover:text-bauhaus-red transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {isConfirmReset && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">ŞİFRE TEKRAR</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
                placeholder="••••••••"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                key="success-msg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-6 bg-bauhaus-blue text-white border-4 border-bauhaus-ink font-bold text-sm uppercase tracking-widest leading-relaxed shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-white text-bauhaus-blue p-1">
                    <Mail size={16} />
                  </div>
                  <span>{message}</span>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error-msg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-6 bg-bauhaus-red text-white border-4 border-bauhaus-ink font-bold text-sm uppercase tracking-widest leading-relaxed shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="bauhaus-button w-full py-4 text-lg"
            >
              {loading ? 'İŞLENİYOR...' : isConfirmReset ? 'ŞİFREYİ GÜNCELLE' : isReset ? 'SIFIRLAMA BAĞLANTISI GÖNDER' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}
            </button>
          </div>
        </form>

        {!isReset && !isConfirmReset && (
          <div className="pt-6 border-t-4 border-bauhaus-bg text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black uppercase tracking-widest hover:text-bauhaus-red transition-colors"
            >
              {isLogin ? 'HESABIN YOK MU? KAYIT OL' : 'ZATEN HESABIN VAR MI? GİRİŞ YAP'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
