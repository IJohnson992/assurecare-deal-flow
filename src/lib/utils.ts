
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getDaysBetween(startDate: Date, endDate: Date = new Date()): number {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  
  return Math.round(Math.abs((end - start) / (24 * 60 * 60 * 1000)));
}

export function calculateAverageTimeInStage(
  deals: { stageHistory: { stage: string; timestamp: Date }[] }[]
): Record<string, number> {
  const stageData: Record<string, { totalDays: number; count: number }> = {};
  
  deals.forEach(deal => {
    for (let i = 0; i < deal.stageHistory.length; i++) {
      const currentStage = deal.stageHistory[i];
      const nextStage = deal.stageHistory[i + 1];
      
      if (nextStage) {
        const stage = currentStage.stage;
        const daysDiff = getDaysBetween(
          new Date(currentStage.timestamp),
          new Date(nextStage.timestamp)
        );
        
        if (!stageData[stage]) {
          stageData[stage] = { totalDays: 0, count: 0 };
        }
        
        stageData[stage].totalDays += daysDiff;
        stageData[stage].count += 1;
      }
    }
  });
  
  const result: Record<string, number> = {};
  
  for (const stage in stageData) {
    const { totalDays, count } = stageData[stage];
    result[stage] = Math.round(totalDays / count);
  }
  
  return result;
}
