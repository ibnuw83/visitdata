
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { BarChart, Database, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: <Database className="h-8 w-8 text-primary" />,
    title: 'Manajemen Data Terpusat',
    description: 'Input, kelola, dan kunci data kunjungan bulanan dari berbagai destinasi dalam satu platform terpadu.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Dasbor Analitis',
    description: 'Visualisasikan tren pengunjung, komposisi wisatawan, dan performa destinasi melalui grafik interaktif.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Laporan & Ekspor',
    description: 'Hasilkan dan unduh laporan data pariwisata dalam format Excel untuk analisis lebih mendalam.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [appTitle, setAppTitle] = useState('VisitData Hub');
  const [appFooter, setAppFooter] = useState(`© ${new Date().getFullYear()} VisitData Hub`);

  useEffect(() => {
    const savedTitle = localStorage.getItem('appTitle');
    const savedFooter = localStorage.getItem('appFooter');
    if (savedTitle) setAppTitle(savedTitle);
    if (savedFooter) setAppFooter(savedFooter);

    const handleStorageChange = () => {
      const newTitle = localStorage.getItem('appTitle');
      const newFooter = localStorage.getItem('appFooter');
      if (newTitle) setAppTitle(newTitle);
      if (newFooter) setAppFooter(newFooter);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Logo className="h-8 w-8" />
            <span className="font-headline text-lg font-bold">{appTitle}</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Masuk ke Dasbor <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Masuk</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <h1 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Pusat Data Pariwisata Modern Anda
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Kelola, analisis, dan laporkan data kunjungan wisata dengan mudah dan efisien. Berdayakan pengambilan keputusan berbasis data untuk pariwisata daerah Anda.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href={user ? "/dashboard" : "/login"}>
                  Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-6 bg-secondary/50 py-12 dark:bg-secondary/20">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Fitur Unggulan</h2>
            <p className="max-w-2xl text-muted-foreground">
              Platform kami menyediakan semua yang Anda butuhkan untuk mengelola data pariwisata secara efektif.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  {feature.icon}
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {appFooter}
          </p>
        </div>
      </footer>
    </div>
  );
}
