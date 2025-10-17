'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Loader2 } from "lucide-react";
import { generateMonthlySummary } from '@/ai/flows/generate-monthly-summary';
import { Destination, VisitData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AiSummary({ data, destinations, year }: { data: VisitData[], destinations: Destination[], year: number }) {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');
    const [selectedDest, setSelectedDest] = useState<string | undefined>();
    const [selectedMonth, setSelectedMonth] = useState<string | undefined>();

    const handleGenerate = async () => {
        if (!selectedDest || !selectedMonth) {
            setError('Please select a destination and month.');
            return;
        }

        const dest = destinations.find(d => d.id === selectedDest);
        const monthNum = parseInt(selectedMonth, 10);
        const monthName = monthNames[monthNum - 1];

        const visitRecord = data.find(d => d.destinationId === selectedDest && d.month === monthNum);

        if (!dest || !visitRecord) {
            setError('No data found for the selected period.');
            return;
        }

        setLoading(true);
        setError('');
        setSummary('');

        try {
            const result = await generateMonthlySummary({
                monthName: monthName,
                year: year,
                destinationName: dest.name,
                totalVisitors: visitRecord.totalVisitors,
                wisnus: visitRecord.wisnus,
                wisman: visitRecord.wisman,
                eventVisitors: visitRecord.eventVisitors,
                historicalVisitors: visitRecord.historicalVisitors,
                wismanDetails: visitRecord.wismanDetails,
            });
            setSummary(result.summary);
        } catch (e) {
            setError('Failed to generate summary. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="text-accent" />
                    AI-Powered Insights
                </CardTitle>
                <CardDescription>Generate a summary for a specific month and destination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={setSelectedDest} value={selectedDest}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Destination" />
                        </SelectTrigger>
                        <SelectContent>
                            {destinations.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((m, i) => (
                                <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={loading || !selectedDest || !selectedMonth} className="w-full">
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate Summary'}
                </Button>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {summary && (
                     <Alert>
                        <AlertTitle>Monthly Summary</AlertTitle>
                        <AlertDescription className="text-sm">{summary}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
