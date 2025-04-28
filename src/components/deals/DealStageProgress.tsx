
import { Deal, DealStage } from '@/types';

interface DealStageProgressProps {
  deal: Deal;
}

const DealStageProgress = ({ deal }: DealStageProgressProps) => {
  const stages: DealStage[] = [
    'Lead Identified',
    'Discovery Call',
    'RFP/RFI Submitted',
    'Demo Presented',
    'Contract Negotiation',
    'Closed Won',
  ];
  
  // Find the current stage index (but don't include Closed Lost)
  const currentStageIndex = deal.stage === 'Closed Lost' 
    ? -1 
    : stages.indexOf(deal.stage);
  
  // Calculate progress percentage based on the current stage
  const progressPercentage = deal.stage === 'Closed Lost' 
    ? 0 
    : ((currentStageIndex + 1) / stages.length) * 100;
  
  // Get class for the progress bar
  const getProgressClass = () => {
    if (deal.stage === 'Closed Lost') return 'bg-stage-closedlost';
    if (deal.stage === 'Closed Won') return 'bg-stage-closedwon';
    return 'bg-primary';
  };

  return (
    <div className="my-4">
      <div className="stage-progress-bar">
        <div 
          className={`h-full ${getProgressClass()}`} 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs">
        {stages.map((stage, index) => {
          // Skip Closed Lost in the progress bar
          if (stage === 'Closed Lost') return null;
          
          // Determine if this stage is active
          const isActive = stages.indexOf(deal.stage) >= index;
          const isCurrentStage = deal.stage === stage;
          
          return (
            <div 
              key={stage} 
              className={`${isActive ? 'font-medium' : 'text-muted-foreground'} ${isCurrentStage ? 'text-primary' : ''}`}
              style={{ width: `${100 / stages.length}%`, textAlign: index === 0 ? 'left' : index === stages.length - 1 ? 'right' : 'center' }}
            >
              {index === 0 ? stage : index === stages.length - 1 ? stage : '•'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealStageProgress;
