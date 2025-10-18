'use client';

import { login } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.success) {
      router.push('/dashboard');
      // Tidak perlu set isPending ke false karena akan navigasi
    } else if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else {
       setError("Terjadi kesalahan yang tidak terduga.");
       setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-4 text-2xl font-bold text-foreground">
        <Logo className="h-10 w-10" />
        <h1 className="font-headline text-3xl font-bold">VisitData Hub</h1>
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
                disabled={isPending}
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
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
