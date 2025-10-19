
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useAuthUser } from '@/app/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { user, isLoading: isInitializing } = useAuthUser();
  const auth = useAuth();
  const router = useRouter();
  const [appTitle, setAppTitle] = useState('VisitData Hub');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isInitializing && user) {
      router.push('/dashboard');
    }
  }, [user, isInitializing, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: any) {
      console.error("Login Error:", e);
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Email atau kata sandi salah."
      });
    } finally {
       setIsSubmitting(false);
    }
  };

  if (isInitializing || user) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
                <Logo className="h-10 w-10 animate-pulse" />
            </div>
        </div>
     );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
        <Logo className="h-10 w-10" />
        <h1 className="font-headline text-3xl font-bold">{appTitle}</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Masuk</CardTitle>
          <CardDescription>Masukkan kredensial Anda untuk mengakses dasbor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                defaultValue="admin@dinas.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                name="password" 
                required 
                defaultValue="password123"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm">
        <Link href="/" className="underline text-muted-foreground hover:text-primary">
          Kembali ke halaman utama
        </Link>
      </div>
    </div>
  );
}
