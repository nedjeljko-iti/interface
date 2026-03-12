'use client';

import { useState, useEffect } from 'react';
import ImportForm from '@/components/ImportForm';
import LoginPage  from '@/components/LoginPage';
import { isLoggedIn } from '@/lib/auth-client';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return <ImportForm onLogout={() => setLoggedIn(false)} />;
}
