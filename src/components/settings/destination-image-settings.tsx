
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDestinations, getDestinationImageMap, saveDestinationImageMap } from '@/lib/local-data-service';
import type { Destination } from '@/lib/types';
import Image from 'next/image';

export default function DestinationImageSettings() {
    const { toast } = useToast();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [imageMap, setImageMap] = useState<Record<string, string>>({});

    const fetchData = useCallback(() => {
        const allDestinations = getDestinations();
        setDestinations(allDestinations);
        setImageMap(getDestinationImageMap(allDestinations));
    }, []);

    useEffect(() => {
        fetchData();
        window.addEventListener('storage', fetchData);
        return () => {
            window.removeEventListener('storage', fetchData);
        };
    }, [fetchData]);


    const handleImageUrlChange = (destinationId: string, url: string) => {
        setImageMap(prevMap => ({
            ...prevMap,
            [destinationId]: url,
        }));
    };

    const handleSaveChanges = () => {
        saveDestinationImageMap(imageMap);
        toast({
            title: "Pengaturan Gambar Disimpan",
            description: "URL gambar untuk destinasi unggulan telah diperbarui.",
        });
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
