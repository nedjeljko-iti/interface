import { useState, useEffect } from 'react';
import { isLoggedIn, removeToken } from './auth';
import LoginPage   from './components/LoginPage';
import Dashboard   from './components/Dashboard';
import { MODULI_REGISTRY } from './modules/registry';

export default function App() {
  const [loggedIn,      setLoggedIn]      = useState(false);
  const [activeModule,  setActiveModule]  = useState(null); // null = dashboard

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogin() {
    setLoggedIn(true);
    setActiveModule(null);
  }

  function handleLogout() {
    removeToken();
    setLoggedIn(false);
    setActiveModule(null);
  }

  function handleBack() {
    setActiveModule(null);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (activeModule !== null) {
    const mod = MODULI_REGISTRY[activeModule];
    if (!mod) {
      // Nepoznat modul — vrati na dashboard
      setActiveModule(null);
      return null;
    }
    const Component = mod.component;
    return (
      <Component
        naziv={mod.naziv}
        onLogout={handleLogout}
        onBack={handleBack}
      />
    );
  }

  return (
    <Dashboard
      onSelectModule={setActiveModule}
      onLogout={handleLogout}
    />
  );
}
