import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  trendText?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  trendText,
  trendPositive = true,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECEEF2] shadow-card flex items-center justify-between transition-all hover:shadow-card-hover hover:border-[#DFE2E8]">
      <div className="flex items-center gap-4">
        {/* Rounded Icon Box */}
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>

        {/* Label and Big Value */}
        <div>
          <span className="text-xs font-semibold text-[#8C93A0] uppercase tracking-wider block">
            {label}
          </span>
          <span className="text-2xl font-extrabold text-[#1A1D1F] tracking-tight block mt-0.5">
            {value}
          </span>
        </div>
      </div>

      {/* Trend Pill Badge */}
      {trendText && (
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          trendPositive 
            ? 'bg-[#E8FAF0] text-[#12B76A]' 
            : 'bg-[#FEF7DC] text-[#B78103]'
        }`}>
          <span>{trendText}</span>
        </div>
      )}
    </div>
  );
};
