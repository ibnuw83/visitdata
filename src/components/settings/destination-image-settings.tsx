
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// Removed local-data-service
import type { Destination } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function DestinationImageSettings() {
    const { toast } = useToast();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [imageMap, setImageMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        // This will be replaced with a Firestore query
        setDestinations([]);
        setImageMap({});
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleImageUrlChange = (destinationId: string, url: string) => {
        setImageMap(prevMap => ({
            ...prevMap,
            [destinationId]: url,
        }));
    };

    const handleSaveChanges = () => {
        // This will be replaced with batched Firestore updates
        toast({
            title: "Pengaturan Gambar Disimpan",
            description: "URL gambar untuk destinasi unggulan telah diperbarui.",
        });
    }

    if(loading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-5 w-80" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {Array.from({length: 3}).map((_, i) => (
                             <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-md" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                     <Skeleton className="h-10 w-48" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Gambar Destinasi</CardTitle>
                <CardDescription>
                    Kelola gambar yang ditampilkan untuk destinasi di carousel halaman utama.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {destinations.filter(d => d.status === 'aktif').map(dest => (
                        <div key={dest.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 bg-muted">
                                {imageMap[dest.id] && (
                                     <Image 
                                        src={imageMap[dest.id]} 
                                        alt={dest.name} 
                                        fill 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                )}
                            </div>
                            <div className="flex-grow space-y-1">
                                <Label htmlFor={`img-url-${dest.id}`} className="font-medium">{dest.name}</Label>
                                <Input
                                    id={`img-url-${dest.id}`}
                                    value={imageMap[dest.id] || ''}
                                    onChange={(e) => handleImageUrlChange(dest.id, e.target.value)}
                                    placeholder="Tempel URL gambar di sini"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Button onClick={handleSaveChanges}>Simpan Perubahan Gambar</Button>
            </CardContent>
        </Card>
    );
}
