// components/date-badge.tsx
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { getCurrentDate } from '@/lib/date-utils';

interface DateBadgeProps {
    date: Date | string;
    type?: 'start' | 'due' | 'completed';
    className?: string;
}

export const DateBadge = ({ date, type = 'due', className }: DateBadgeProps) => {
    if (!date) return null;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = getCurrentDate(); // Use your date utils function
    
    // Set both dates to start of day for accurate comparison
    const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = targetDate.getTime() - todayDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const isPast = diffDays < 0;
    const isToday = diffDays === 0;
    const isSoon = diffDays <= 7 && diffDays > 0;

    const getConfig = () => {
        if (type === 'completed') {
            return {
                icon: CheckCircle,
                className: 'bg-green-50 text-green-700 border-green-200',
                iconClassName: 'text-green-600'
            };
        }

        if (isPast) {
            return {
                icon: Clock,
                className: 'bg-red-50 text-red-700 border-red-200',
                iconClassName: 'text-red-600'
            };
        }

        if (isToday) {
            return {
                icon: Clock,
                className: 'bg-amber-50 text-amber-700 border-amber-200',
                iconClassName: 'text-amber-600'
            };
        }

        if (isSoon) {
            return {
                icon: Clock,
                className: 'bg-blue-50 text-blue-700 border-blue-200',
                iconClassName: 'text-blue-600'
            };
        }

        return {
            icon: Calendar,
            className: 'bg-gray-50 text-gray-700 border-gray-200',
            iconClassName: 'text-gray-600'
        };
    };

    const { icon: Icon, ...style } = getConfig();

    const formatMessage = () => {
        if (type === 'completed') {
            if (isToday) return 'Today';
            if (isPast) return `${Math.abs(diffDays)}d ago`;
            return `${diffDays}d left`;
        }
        
        if (isToday) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (isPast) return `${Math.abs(diffDays)}d ago`;
        return `${diffDays}d left`;
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "text-xs px-1.5 py-0.5 gap-1 whitespace-nowrap",
                style.className,
                className
            )}
        >
            <Icon className={cn("h-3 w-3", style.iconClassName)} />
            {formatMessage()}
        </Badge>
    );
};