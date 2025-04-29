
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal, DealStage, stageProbability } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SortKey = 'clientName' | 'clientType' | 'dealValue' | 'annualRecurringRevenue' | 'stage' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface PipelineTableProps {
  deals: Deal[];
}

const stageBadgeVariant = (stage: DealStage): "default" | "outline" | "secondary" | "destructive" | "success" => {
  switch (stage) {
    case 'Lead Identified':
      return 'outline';
    case 'Discovery Call':
      return 'secondary';
    case 'RFP/RFI Submitted':
      return 'secondary';
    case 'Demo Presented':
      return 'secondary';
    case 'Contract Negotiation':
      return 'secondary';
    case 'Closed Won':
      return 'success';
    case 'Closed Lost':
      return 'destructive';
    default:
      return 'outline';
  }
};

const PipelineTable = ({ deals }: PipelineTableProps) => {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const sortedDeals = [...deals].sort((a, b) => {
    let valueA: any;
    let valueB: any;
    
    switch (sortKey) {
      case 'clientName':
        valueA = a.clientName.toLowerCase();
        valueB = b.clientName.toLowerCase();
        break;
      case 'clientType':
        valueA = a.clientType;
        valueB = b.clientType;
        break;
      case 'dealValue':
        valueA = a.dealValue || 0;
        valueB = b.dealValue || 0;
        break;
      case 'annualRecurringRevenue':
        valueA = a.annualRecurringRevenue || 0;
        valueB = b.annualRecurringRevenue || 0;
        break;
      case 'stage':
        valueA = stageProbability[a.stage] || 0;
        valueB = stageProbability[b.stage] || 0;
        break;
      case 'updatedAt':
        valueA = new Date(a.updatedAt).getTime();
        valueB = new Date(b.updatedAt).getTime();
        break;
      default:
        valueA = a[sortKey];
        valueB = b[sortKey];
    }
    
    const sortOrder = sortDirection === 'asc' ? 1 : -1;
    
    if (valueA < valueB) return -1 * sortOrder;
    if (valueA > valueB) return 1 * sortOrder;
    return 0;
  });
  
  // Calculate weighted values
  const getWeightedValue = (deal: Deal) => {
    const probability = stageProbability[deal.stage] / 100;
    return deal.dealValue * probability;
  };
  
  const getWeightedARR = (deal: Deal) => {
    const probability = stageProbability[deal.stage] / 100;
    return (deal.annualRecurringRevenue || 0) * probability;
  };
  
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="ml-2 h-4 w-4" /> 
      : <ArrowDownIcon className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('clientName')} className="cursor-pointer">
              Client Name {renderSortIcon('clientName')}
            </TableHead>
            <TableHead onClick={() => handleSort('clientType')} className="cursor-pointer">
              Client Type {renderSortIcon('clientType')}
            </TableHead>
            <TableHead onClick={() => handleSort('dealValue')} className="cursor-pointer">
              SaaS Value {renderSortIcon('dealValue')}
            </TableHead>
            <TableHead onClick={() => handleSort('annualRecurringRevenue')} className="cursor-pointer">
              ARR {renderSortIcon('annualRecurringRevenue')}
            </TableHead>
            <TableHead onClick={() => handleSort('stage')} className="cursor-pointer">
              Stage {renderSortIcon('stage')}
            </TableHead>
            <TableHead>Weighted Value</TableHead>
            <TableHead onClick={() => handleSort('updatedAt')} className="cursor-pointer">
              Last Updated {renderSortIcon('updatedAt')}
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDeals.map((deal) => (
            <TableRow 
              key={deal.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/deal/${deal.id}`)}
            >
              <TableCell className="font-medium">{deal.clientName}</TableCell>
              <TableCell>{deal.clientType}</TableCell>
              <TableCell>{formatCurrency(deal.dealValue)}</TableCell>
              <TableCell>{formatCurrency(deal.annualRecurringRevenue || 0)}</TableCell>
              <TableCell>
                <Badge variant={stageBadgeVariant(deal.stage)}>
                  {deal.stage}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{formatCurrency(getWeightedValue(deal))}</span>
                  <span className="text-xs text-muted-foreground">
                    {stageProbability[deal.stage]}% probability
                  </span>
                </div>
              </TableCell>
              <TableCell>{format(new Date(deal.updatedAt), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/deal/${deal.id}`);
                    }}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Add functionality to mark as won/lost
                    }}>
                      Mark as Won
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Add functionality to mark as won/lost
                    }}>
                      Mark as Lost
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PipelineTable;
