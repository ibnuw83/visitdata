
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function SubmitButton() {
  const { isLoading } = useAuth();

  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? 'Memeriksa...' : 'Masuk'}
    </Button>
  );
}

function LoginSkeleton() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
                <Logo className="h-10 w-10 animate-pulse" />
                <h1 className="font-headline text-3xl font-bold">VisitData Hub</h1>
            </div>
        </div>
     );
}

export default function LoginPage() {
  const { login, error, user, isLoading } = useAuth();
  const router = useRouter();
  const [appTitle, setAppTitle] = useState('VisitData Hub');

  useEffect(() => {
    // Redirect if user is already logged in and loading is complete
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await login(formData);
  };
  
  if (isLoading || user) {
     return <LoginSkeleton />;
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
             {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
            <SubmitButton />
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
