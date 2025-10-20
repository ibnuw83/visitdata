
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Destination, VisitData } from "@/lib/types";
import { Badge, List, ListItem } from "@tremor/react";

export default function TopDestinationsCard({ data, destinations }: { data: VisitData[], destinations: Destination[] }) {
    const destinationTotals = destinations.map(dest => {
        const totalVisitors = data
            .filter(d => d.destinationId === dest.id)
            .reduce((sum, item) => sum + item.totalVisitors, 0);
        return { ...dest, totalVisitors };
    });

    const top5 = destinationTotals.sort((a, b) => b.totalVisitors - a.totalVisitors).slice(0, 5);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Peringkat 5 Destinasi</CardTitle>
                <CardDescription>Berdasarkan total kunjungan tertinggi pada tahun yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent>
                {top5.length > 0 ? (
                    <List>
                        {top5.map((dest, index) => (
                            <ListItem key={dest.id}>
                                <div className="flex items-center gap-4 w-full">
                                    <Badge className="bg-primary text-primary-foreground">{index + 1}</Badge>
                                    <div>
                                        <p className="text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{dest.name}</p>
                                        <p className="text-sm text-tremor-content dark:text-dark-tremor-content">{dest.location}</p>
                                    </div>
                                    <p className="ml-auto font-medium">{dest.totalVisitors.toLocaleString()}</p>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <div className="flex items-center justify-center h-48">
                         <p className="text-muted-foreground">Tidak ada data kunjungan.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
