// components/progress-indicator.tsx
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'blue' | 'green' | 'red' | 'amber' | 'purple';
    className?: string;
}

export const ProgressIndicator = ({
    value,
    max = 100,
    label,
    showValue = true,
    size = 'md',
    color = 'default',
    className
}: ProgressIndicatorProps) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
        sm: 'h-1.5 text-xs',
        md: 'h-2 text-sm',
        lg: 'h-3 text-base'
    };

    const colorClasses = {
        default: {
            bg: 'bg-gray-100',
            indicator: 'bg-gray-600',
            text: 'text-gray-700',
            value: 'text-gray-800'
        },
        blue: {
            bg: 'bg-blue-100',
            indicator: 'bg-blue-500',
            text: 'text-blue-700',
            value: 'text-blue-800'
        },
        green: {
            bg: 'bg-green-100',
            indicator: 'bg-green-500',
            text: 'text-green-700',
            value: 'text-green-800'
        },
        red: {
            bg: 'bg-red-100',
            indicator: 'bg-red-500',
            text: 'text-red-700',
            value: 'text-red-800'
        },
        amber: {
            bg: 'bg-amber-100',
            indicator: 'bg-amber-500',
            text: 'text-amber-700',
            value: 'text-amber-800'
        },
        purple: {
            bg: 'bg-purple-100',
            indicator: 'bg-purple-500',
            text: 'text-purple-700',
            value: 'text-purple-800'
        }
    };

    const colors = colorClasses[color];

    return (
        <div className={cn("space-y-1", className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className={cn("text-xs font-medium", colors.text)}>
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className={cn("text-xs font-bold", colors.value)}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <Progress
                value={percentage}
                className={cn(sizeClasses[size], colors.bg)}
            >
                {/* Custom indicator styling using div */}
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        colors.indicator
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </Progress>
        </div>
    );
};