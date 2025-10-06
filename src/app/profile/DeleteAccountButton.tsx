'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onDelete = async () => {
    try {
      setLoading(true);
      setError('');

      // Re-authenticate before deletion (Apple/Google Store requirement)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Cannot verify user');
      }

      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (reAuthError) {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // Proceed with deletion
      const res = await fetch('/api/profile/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      // Sign out and redirect
      await supabase.auth.signOut();
      router.replace('/auth/login');
    } catch (e: any) {
      setError(e?.message || 'Xóa tài khoản lỗi. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <button className="px-4 py-2 rounded-2xl bg-red-600 text-white" onClick={() => setStep(2)}>
        Xóa tài khoản
      </button>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-3">
        <p className="text-sm">Xác nhận lần 1: Hành động này không thể hoàn tác.</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-2xl bg-gray-200" onClick={() => setStep(1)}>Huỷ</button>
          <button className="px-4 py-2 rounded-2xl bg-orange-600 text-white" onClick={() => setStep(3)}>Tiếp tục</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Nhập mật khẩu để xác nhận xóa tài khoản:</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu của bạn"
          className="w-full px-3 py-2 border rounded-lg"
          disabled={loading}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-2xl bg-gray-200" onClick={() => { setStep(1); setPassword(''); setError(''); }}>Huỷ</button>
          <button
            disabled={loading || !password}
            className="px-4 py-2 rounded-2xl bg-red-700 text-white disabled:opacity-50"
            onClick={onDelete}
          >
            {loading ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
