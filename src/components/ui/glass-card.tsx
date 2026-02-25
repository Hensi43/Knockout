import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'premium';
}

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
    return (
        <div className={cn(
            "rounded-xl overflow-hidden transition-all duration-300",
            variant === 'default' ? "glass" : "glass-card",
            className
        )}>
            {children}
        </div>
    );
}
