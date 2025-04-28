
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Deal, DealStage } from '@/types';
import { useDeal } from '@/context/DealContext';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';

interface DealDetailsFormProps {
  deal: Deal;
}

// Check if the deal is in a stage that requires additional fields
const requiresDetailedFinancials = (stage: DealStage): boolean => {
  return ['Contract Negotiation', 'Closed Won', 'Closed Lost'].includes(stage);
};

// Calculate duration in months between two dates
const calculateDurationMonths = (startDate: Date, endDate: Date): number => {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  
  return (endYear - startYear) * 12 + (endMonth - startMonth);
};

const DealDetailsForm = ({ deal }: DealDetailsFormProps) => {
  const { updateDeal } = useDeal();
  const { toast } = useToast();
  
  // Create a schema based on the deal stage
  const createFormSchema = (stage: DealStage) => {
    const baseSchema = z.object({
      annualRecurringRevenue: z.number().optional(),
      arrYear1: z.number().optional(),
      implementationRevenue: z.number().optional(),
    });
    
    if (requiresDetailedFinancials(stage)) {
      return z.object({
        annualRecurringRevenue: z.number({
          required_error: "Annual Recurring Revenue is required for this stage"
        }).min(0, "Value must be positive"),
        arrYear1: z.number({
          required_error: "Year 1 ARR is required for this stage"
        }).min(0, "Value must be positive"),
        implementationRevenue: z.number({
          required_error: "Implementation Revenue is required for this stage"
        }).min(0, "Value must be positive"),
      });
    }
    
    return baseSchema;
  };
  
  const [startDate, setStartDate] = useState<Date | undefined>(
    deal.implementationTimeline?.startDate
  );
  
  const [endDate, setEndDate] = useState<Date | undefined>(
    deal.implementationTimeline?.goLiveDate
  );
  
  // Create form with dynamic validation
  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema(deal.stage)),
    defaultValues: {
      annualRecurringRevenue: deal.annualRecurringRevenue || 0,
      arrYear1: deal.arrYear1 || 0,
      implementationRevenue: deal.implementationRevenue || 0,
    },
  });
  
  // Update form validation when deal stage changes
  useEffect(() => {
    form.reset({
      annualRecurringRevenue: deal.annualRecurringRevenue || 0,
      arrYear1: deal.arrYear1 || 0,
      implementationRevenue: deal.implementationRevenue || 0,
    });
    
    setStartDate(deal.implementationTimeline?.startDate);
    setEndDate(deal.implementationTimeline?.goLiveDate);
  }, [deal.id, deal.stage]);
  
  const onSubmit = (values: z.infer<ReturnType<typeof createFormSchema>>) => {
    // Create the update object
    const updates: Partial<Deal> = {
      ...values,
    };
    
    // Only include implementation timeline if both dates are set
    if (startDate && endDate) {
      const durationMonths = calculateDurationMonths(startDate, endDate);
      updates.implementationTimeline = {
        startDate,
        goLiveDate: endDate,
        durationMonths: Math.max(1, durationMonths) // Ensure minimum 1 month duration
      };
    }
    
    updateDeal(deal.id, updates);
    
    toast({
      title: "Deal updated",
      description: "Deal financial details have been updated"
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="annualRecurringRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Annual Recurring Revenue (ARR)
                  {requiresDetailedFinancials(deal.stage) && (
                    <span className="text-destructive"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="pl-6"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="arrYear1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  ARR Year 1
                  {requiresDetailedFinancials(deal.stage) && (
                    <span className="text-destructive"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="pl-6"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="implementationRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Implementation Revenue
                  {requiresDetailedFinancials(deal.stage) && (
                    <span className="text-destructive"> *</span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="pl-6"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2 md:col-span-2">
            <FormLabel>
              Implementation Timeline
              {requiresDetailedFinancials(deal.stage) && (
                <span className="text-destructive"> *</span>
              )}
            </FormLabel>
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              placeholder="Select implementation period"
            />
            {requiresDetailedFinancials(deal.stage) && (!startDate || !endDate) && (
              <p className="text-sm font-medium text-destructive">
                Implementation timeline is required for this stage
              </p>
            )}
          </div>
        </div>
        
        <Button type="submit" className="w-full md:w-auto">Save Financial Details</Button>
      </form>
    </Form>
  );
};

export default DealDetailsForm;
