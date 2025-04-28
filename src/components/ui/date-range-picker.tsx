
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  buttonClassName?: string;
  placeholder?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  buttonClassName,
  placeholder = "Select date range"
}: DateRangePickerProps) {
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const formattedStartDate = startDate ? format(startDate, 'MMM d, yyyy') : '';
  const formattedEndDate = endDate ? format(endDate, 'MMM d, yyyy') : '';
  
  let displayText = placeholder;
  if (startDate && endDate) {
    displayText = `${formattedStartDate} → ${formattedEndDate}`;
  } else if (startDate) {
    displayText = `${formattedStartDate} → Select end date`;
  }

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
      <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left md:w-[260px]",
              !startDate && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              onStartDateChange(date);
              setIsStartDatePickerOpen(false);
              if (!endDate) {
                setIsEndDatePickerOpen(true);
              }
            }}
            initialFocus
            disabled={(date) => endDate ? date > endDate : false}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {startDate && (
        <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left md:w-[180px] md:hidden",
                !endDate && "text-muted-foreground",
                buttonClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'MMM d, yyyy') : "Select end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                onEndDateChange(date);
                setIsEndDatePickerOpen(false);
              }}
              initialFocus
              disabled={(date) => date < (startDate || new Date())}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
