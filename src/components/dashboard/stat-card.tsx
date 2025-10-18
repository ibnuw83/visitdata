import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    className?: string;
}

export default function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className={cn("text-card-foreground", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-inherit">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
