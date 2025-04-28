
import { DealStage } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DealStageDropdownProps {
  currentStage: DealStage;
  onStageChange: (stage: DealStage) => void;
}

const DealStageDropdown = ({ currentStage, onStageChange }: DealStageDropdownProps) => {
  const stages: DealStage[] = [
    'Lead Identified',
    'Discovery Call',
    'RFP/RFI Submitted',
    'Demo Presented',
    'Contract Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  return (
    <Select
      value={currentStage}
      onValueChange={(value) => onStageChange(value as DealStage)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={currentStage} />
      </SelectTrigger>
      <SelectContent>
        {stages.map((stage) => (
          <SelectItem key={stage} value={stage}>
            {stage}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DealStageDropdown;
