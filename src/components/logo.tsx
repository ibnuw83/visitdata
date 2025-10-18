'use client';

import React, { useEffect, useState } from 'react';

const DefaultLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="hsl(var(--primary))" />
      <path d="M2 17l10 5 10-5" stroke="hsl(var(--accent))" />
      <path d="M2 12l10 5 10-5" stroke="hsl(var(--accent))" strokeOpacity="0.6" />
    </svg>
);


export function Logo(props: React.SVGProps<SVGSVGElement>) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs on the client and reads from localStorage
    const savedLogoUrl = localStorage.getItem('logoUrl');
    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
    }

    const handleStorageChange = () => {
        const newLogoUrl = localStorage.getItem('logoUrl');
        setLogoUrl(newLogoUrl);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="App Logo" {...props} />;
  }

  return <DefaultLogo {...props} />;
}
