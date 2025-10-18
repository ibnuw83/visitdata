
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Destination, VisitData } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
// Removed local-data-service
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function TopDestinationsCarousel({ data, destinations }: { data: VisitData[], destinations: Destination[] }) {
    // imageMap will be fetched from firestore or passed as a prop
    const [imageMap, setImageMap] = useState<Record<string, string>>({});

    useEffect(() => {
        // This will be replaced with Firestore data
        const map: Record<string, string> = {};
        destinations.forEach(dest => {
            if(dest.imageUrl) {
                map[dest.id] = dest.imageUrl;
            }
        });
        setImageMap(map);
    }, [destinations]);
    
    const destinationTotals = useMemo(() => destinations.map(dest => {
        const totalVisitors = data
            .filter(d => d.destinationId === dest.id)
            .reduce((sum, item) => sum + item.totalVisitors, 0);
        return { ...dest, totalVisitors };
    }), [data, destinations]);

    const top5 = useMemo(() => destinationTotals.sort((a, b) => b.totalVisitors - a.totalVisitors).slice(0, 5), [destinationTotals]);
    
    const defaultImage = PlaceHolderImages[0];

    if (top5.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Peringkat Destinasi Unggulan</CardTitle>
                    <CardDescription>5 destinasi teratas berdasarkan total kunjungan tahunan.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">Data destinasi tidak tersedia.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Peringkat Destinasi Unggulan</CardTitle>
                <CardDescription>5 destinasi teratas berdasarkan total kunjungan tahunan.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Carousel 
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent>
                        {top5.map((dest, index) => {
                            const imageUrl = dest.imageUrl || defaultImage.imageUrl;
                            return (
                                <CarouselItem key={dest.id} className="md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1">
                                        <Card className="overflow-hidden">
                                            <CardContent className="flex flex-col items-center justify-center p-0">
                                                 <div className="relative w-full h-48">
                                                    <Image 
                                                        src={imageUrl}
                                                        alt={dest.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        className="transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                    <div className="absolute bottom-0 left-0 p-4">
                                                        <h3 className="text-lg font-bold text-white">{dest.name}</h3>
                                                        <p className="text-sm text-white/80">{dest.location}</p>
                                                    </div>
                                                     <div className="absolute top-2 right-2 flex items-center justify-center h-8 w-8 rounded-full bg-primary/80 text-white font-bold text-sm">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-card w-full text-center">
                                                    <p className="text-sm text-muted-foreground">Total Pengunjung</p>
                                                    <p className="text-2xl font-bold text-primary">{dest.totalVisitors.toLocaleString()}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </CardContent>
        </Card>
    );
}
