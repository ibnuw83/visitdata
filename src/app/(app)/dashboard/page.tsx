import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Landmark, BarChart, Globe, Plane } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import MonthlyVisitorsChart from "@/components/dashboard/monthly-visitors-chart";
import VisitorBreakdownChart from "@/components/dashboard/visitor-breakdown-chart";
import TopDestinationsCard from "@/components/dashboard/top-destinations-card";
import AiSummary from "@/components/dashboard/ai-summary";
import { destinations, visitData } from "@/lib/mock-data";

export default async function DashboardPage() {
    const year = 2023;
    const yearlyData = visitData.filter(d => d.year === year);
    
    const totalVisitors = yearlyData.reduce((sum, item) => sum + item.totalVisitors, 0);
    const totalWisnus = yearlyData.reduce((sum, item) => sum + item.wisnus, 0);
    const totalWisman = yearlyData.reduce((sum, item) => sum + item.wisman, 0);
    const totalDestinations = destinations.length;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Ringkasan data pariwisata untuk tahun {year}.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Pengunjung" value={totalVisitors.toLocaleString()} icon={<Users />} />
                <StatCard title="Wisatawan Nusantara" value={totalWisnus.toLocaleString()} icon={<Globe />} />
                <StatCard title="Wisatawan Mancanegara" value={totalWisman.toLocaleString()} icon={<Plane />} />
                <StatCard title="Total Destinasi" value={totalDestinations.toString()} icon={<Landmark />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tren Pengunjung Bulanan</CardTitle>
                        <CardDescription>Total pengunjung di semua destinasi selama tahun {year}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MonthlyVisitorsChart data={yearlyData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Komposisi Pengunjung</CardTitle>
                         <CardDescription>Perbandingan antara wisatawan nusantara dan mancanegara.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VisitorBreakdownChart wisnus={totalWisnus} wisman={totalWisman} />
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <TopDestinationsCard data={yearlyData} destinations={destinations} />
                <AiSummary data={yearlyData} destinations={destinations} year={year} />
            </div>
        </div>
    )
}
