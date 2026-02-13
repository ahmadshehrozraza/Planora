// components/status-badge.tsx
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, PauseCircle } from 'lucide-react';

export type StatusType = 'completed' | 'active' | 'overdue' | 'on-hold' | 'pending';

export enum ProjectStatus {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    OVER_DUE = "OVER_DUE"
};

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
};

// Helper to convert ProjectStatus to StatusType
export const projectStatusToType = (status: ProjectStatus): StatusType => {
    switch (status) {
        case ProjectStatus.COMPLETED:
            return 'completed';
        case ProjectStatus.ON_HOLD:
            return 'on-hold';
        case ProjectStatus.OVER_DUE:
            return 'overdue';
        case ProjectStatus.ACTIVE:
        default:
            return 'active';
    }
};

// Helper to convert TaskStatus to StatusType
export const taskStatusToType = (status: TaskStatus): StatusType => {
    switch (status) {
        case TaskStatus.DONE:
            return 'completed';
        case TaskStatus.BACKLOG:
        case TaskStatus.TODO:
            return 'pending';
        case TaskStatus.IN_PROGRESS:
        case TaskStatus.IN_REVIEW:
            return 'active';
        default:
            return 'active';
    }
};

interface StatusBadgeProps {
    status: StatusType | ProjectStatus | TaskStatus;
    showIcon?: boolean;
    className?: string;
    variant?: 'default' | 'secondary' | 'outline';
}

export const StatusBadge = ({ 
    status, 
    showIcon = true, 
    className,
    variant = 'outline'
}: StatusBadgeProps) => {
    // Normalize status to StatusType
    let normalizedStatus: StatusType;
    
    if (typeof status === 'string' && status in ProjectStatus) {
        normalizedStatus = projectStatusToType(status as ProjectStatus);
    } else if (typeof status === 'string' && status in TaskStatus) {
        normalizedStatus = taskStatusToType(status as TaskStatus);
    } else {
        normalizedStatus = status as StatusType;
    }

    const config = {
        completed: {
            label: 'Completed',
            icon: CheckCircle,
            className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
            iconClassName: 'text-green-600'
        },
        active: {
            label: 'Active',
            icon: Clock,
            className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
            iconClassName: 'text-blue-600'
        },
        overdue: {
            label: 'Overdue',
            icon: AlertCircle,
            className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
            iconClassName: 'text-red-600'
        },
        'on-hold': {
            label: 'On Hold',
            icon: PauseCircle,
            className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
            iconClassName: 'text-amber-600'
        },
        pending: {
            label: 'Pending',
            icon: Clock,
            className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
            iconClassName: 'text-gray-600'
        }
    };

    const { label, icon: Icon, ...style } = config[normalizedStatus];

    return (
        <Badge
            variant={variant}
            className={cn(
                "font-medium text-xs px-2 py-1 gap-1 whitespace-nowrap",
                style.className,
                className
            )}
        >
            {showIcon && <Icon className={cn("h-3 w-3", style.iconClassName)} />}
            {label}
        </Badge>
    );
};