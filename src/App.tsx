import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { CreateBirthday } from './pages/CreateBirthday';
import { BirthdayPage } from './pages/BirthdayPage';
import { MyBirthdaysPage } from './pages/MyBirthdaysPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    const pathname = window.location.pathname;
    if (pathname.startsWith('/birthday/') && !window.location.hash) {
      const slug = pathname.replace('/birthday/', '');
      window.location.hash = `#/birthday/${slug}`;
    } else if (pathname === '/my-birthdays' && !window.location.hash) {
      window.location.hash = '#/my-birthdays';
    } else if (pathname.startsWith('/edit/') && !window.location.hash) {
      const id = pathname.replace('/edit/', '');
      window.location.hash = `#/edit/${id}`;
    } else if (pathname === '/create' && !window.location.hash) {
      window.location.hash = '#/create';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    if (currentRoute.startsWith('#/my-birthdays')) {
      return <MyBirthdaysPage />;
    }

    if (currentRoute.startsWith('#/edit/')) {
      const id = currentRoute.replace('#/edit/', '').split('?')[0];
      return <CreateBirthday key={id} editBirthdayId={id} />;
    }

    if (currentRoute.startsWith('#/create')) {
      const hash = window.location.hash;
      const id = hash.includes('?id=') ? hash.split('?id=')[1]?.split('&')[0] : undefined;
      return <CreateBirthday key={id || 'create'} editBirthdayId={id} />;
    }

    if (currentRoute.startsWith('#/birthday/')) {
      const id = currentRoute.replace('#/birthday/', '');
      return <BirthdayPage birthdayId={id || 'mai-2026'} />;
    }

    return <HomePage />;
  };

  return (
    <ErrorBoundary fallbackTitle="Có sự cố xảy ra khi nạp trang">
      {renderContent()}
    </ErrorBoundary>
  );
}
