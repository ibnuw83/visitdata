import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Destination, VisitData } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TopDestinationsCard({ data, destinations }: { data: VisitData[], destinations: Destination[] }) {
    const destinationTotals = destinations.map(dest => {
        const totalVisitors = data
            .filter(d => d.destinationId === dest.id)
            .reduce((sum, item) => sum + item.totalVisitors, 0);
        return { ...dest, totalVisitors };
    });

    const top5 = destinationTotals.sort((a, b) => b.totalVisitors - a.totalVisitors).slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Peringkat 5 Destinasi</CardTitle>
                <CardDescription>Berdasarkan total kunjungan tertinggi.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {top5.map((dest, index) => (
                        <div key={dest.id} className="flex items-center gap-4">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground">{index + 1}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{dest.name}</p>
                                <p className="text-sm text-muted-foreground">{dest.location}</p>
                            </div>
                            <div className="ml-auto font-medium">{dest.totalVisitors.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
