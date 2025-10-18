
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Destination } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/lib/firebase/client-provider';
import { useCollection } from '@/lib/firebase/firestore/use-collection';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { collection, doc, writeBatch } from 'firebase/firestore';


export default function DestinationImageSettings() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const destinationsQuery = useMemo(() => firestore ? collection(firestore, 'destinations') : null, [firestore]);
    const { data: destinations, loading } = useCollection<Destination>(destinationsQuery);
    const [imageMap, setImageMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if(destinations) {
            const map: Record<string, string> = {};
            destinations.forEach(dest => {
                if(dest.imageUrl) {
                    map[dest.id] = dest.imageUrl;
                }
            });
            setImageMap(map);
        }
    }, [destinations]);


    const handleImageUrlChange = (destinationId: string, url: string) => {
        setImageMap(prevMap => ({
            ...prevMap,
            [destinationId]: url,
        }));
    };

    const handleSaveChanges = async () => {
        if (!firestore || !destinations) return;
        const batch = writeBatch(firestore);
        const updates: Record<string, any> = {};

        destinations.forEach(dest => {
            if(imageMap[dest.id] !== (dest.imageUrl || '')) {
                const destRef = doc(firestore, 'destinations', dest.id);
                const updateData = { imageUrl: imageMap[dest.id] || '' };
                batch.update(destRef, updateData);
                updates[dest.id] = updateData;
            }
        });
        
        batch.commit()
            .then(() => {
                toast({
                    title: "Pengaturan Gambar Disimpan",
                    description: "URL gambar untuk destinasi unggulan telah diperbarui.",
                });
            })
            .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: 'destinations/{destId}',
                    operation: 'update',
                    requestResourceData: { batchUpdates: updates },
                });
                errorEmitter.emit('permission-error', permissionError);
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
                    {(destinations || []).filter(d => d.status === 'aktif').map(dest => (
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

    