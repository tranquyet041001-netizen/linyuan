import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { CreateBirthday } from './pages/CreateBirthday';
import { BirthdayPage } from './pages/BirthdayPage';
import { MyBirthdaysPage } from './pages/MyBirthdaysPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    // Check if user navigated with standard path (e.g. /birthday/mai-2026 or /my-birthdays or /create)
    const pathname = window.location.pathname;
    if (pathname.startsWith('/birthday/') && !window.location.hash) {
      const slug = pathname.replace('/birthday/', '');
      window.location.hash = `#/birthday/${slug}`;
    } else if (pathname === '/my-birthdays' && !window.location.hash) {
      window.location.hash = '#/my-birthdays';
    } else if (pathname === '/create' && !window.location.hash) {
      window.location.hash = '#/create';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route matching
  if (currentRoute.startsWith('#/my-birthdays')) {
    return <MyBirthdaysPage />;
  }

  if (currentRoute.startsWith('#/edit/')) {
    const id = currentRoute.replace('#/edit/', '');
    return <CreateBirthday editBirthdayId={id} />;
  }

  if (currentRoute.startsWith('#/create')) {
    return <CreateBirthday />;
  }

  if (currentRoute.startsWith('#/birthday/')) {
    const id = currentRoute.replace('#/birthday/', '');
    return <BirthdayPage birthdayId={id || 'mai-2026'} />;
  }

  return <HomePage />;
}
