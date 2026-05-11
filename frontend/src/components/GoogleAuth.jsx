import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuth() {
  const { googleLogin, loading } = useAuthStore();
  const divRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await googleLogin(response.credential);
              navigate('/dashboard');
            } catch (err) {
              console.error('Google Auth Error:', err);
            }
          },
        });

        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: '100%',
        });
      }
    };

    return () => {
      // Avoid removing script if other components might use it
      // But for a single page app, usually fine
    };
  }, [googleLogin, navigate]);

  return (
    <div style={{ marginTop: 'var(--space-4)', width: '100%', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
      <div ref={divRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
    </div>
  );
}
