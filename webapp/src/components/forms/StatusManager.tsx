/**
 * Status Manager Component
 * Advanced status management with availability indicators and workload-based recommendations
 */

import { useState } from 'react';
import { 
  UserCheck, 
  UserX, 
  User, 
  Clock, 
  AlertCircle, 
  Activity, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import { TechnicianStatus } from '@/types';
import { TechnicianUtils } from '@/types/Technician';
import { useTechnicianWorkload } from '@/hooks/useTechnicians';

interface StatusManagerProps {
  currentStatus: TechnicianStatus;
  technicianId?: number;
  onChange: (status: TechnicianStatus) => void;
  disabled?: boolean;
  showRecommendations?: boolean;
  compact?: boolean;
}

interface StatusInfo {
  status: TechnicianStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  availability: 'available' | 'limited' | 'unavailable';
}

const STATUS_INFO: Record<TechnicianStatus, StatusInfo> = {
  [TechnicianStatus.ACTIVE]: {
    status: TechnicianStatus.ACTIVE,
    label: 'Active',
    description: 'Available for assignments',
    icon: UserCheck,
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:text-green-300',
    availability: 'available'
  },
  [TechnicianStatus.ON_VACATION]: {
    status: TechnicianStatus.ON_VACATION,
    label: 'On Vacation',
    description: 'Temporarily unavailable',
    icon: Clock,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    availability: 'unavailable'
  },
  [TechnicianStatus.SICK_LEAVE]: {
    status: TechnicianStatus.SICK_LEAVE,
    label: 'Sick Leave',
    description: 'On medical leave',
    icon: AlertCircle,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    availability: 'unavailable'
  },
  [TechnicianStatus.TERMINATED]: {
    status: TechnicianStatus.TERMINATED,
    label: 'Terminated',
    description: 'No longer with company',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:text-red-300',
    availability: 'unavailable'
  }
};

export function StatusManager({
  currentStatus,
  technicianId,
  onChange,
  disabled = false,
  showRecommendations = true,
  compact = false
}: StatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<TechnicianStatus>(currentStatus);
  
  // Fetch workload data if technician ID is provided
  const { data: workload, isLoading: workloadLoading } = useTechnicianWorkload(
    technicianId || 0, 
    !!technicianId && showRecommendations
  );

  const currentInfo = STATUS_INFO[selectedStatus];
  // Convert workload level to percentage for display
  const getWorkloadPercentage = (level: string) => {
    switch (level) {
      case 'HIGH': return 85;
      case 'MEDIUM': return 55;
      case 'LOW': return 25;
      default: return 0;
    }
  };
  
  const workloadPercentage = workload ? getWorkloadPercentage(workload.currentLoad) : 0;

  const getAvailabilityIcon = (availability: StatusInfo['availability']) => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'limited':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getWorkloadRecommendation = (workloadPercent: number, currentStatus: TechnicianStatus) => {
    if (currentStatus !== TechnicianStatus.ACTIVE) {
      return null;
    }

    if (workloadPercent >= 95) {
      return {
        type: 'warning' as const,
        message: 'Critical workload - consider temporary leave',
        suggestedStatus: TechnicianStatus.ON_VACATION
      };
    } else if (workloadPercent >= 85) {
      return {
        type: 'caution' as const,
        message: 'High workload - monitor closely or reduce assignments',
        suggestedStatus: null
      };
    } else if (workloadPercent <= 30 && currentStatus !== TechnicianStatus.ACTIVE) {
      return {
        type: 'suggestion' as const,
        message: 'Low workload detected - consider reactivating',
        suggestedStatus: TechnicianStatus.ACTIVE
      };
    }

    return null;
  };

  const recommendation = showRecommendations && !workloadLoading ? 
    getWorkloadRecommendation(workloadPercentage, selectedStatus) : null;

  const handleStatusChange = (newStatus: TechnicianStatus) => {
    setSelectedStatus(newStatus);
    onChange(newStatus);
  };

  const StatusIcon = currentInfo.icon;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={currentInfo.bgColor} title={currentInfo.description}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {currentInfo.label}
        </Badge>
        {getAvailabilityIcon(currentInfo.availability)}

        {!disabled && (
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(STATUS_INFO).map((info) => {
                const Icon = info.icon;
                return (
                  <SelectItem key={info.status} value={info.status}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-muted ${currentInfo.color}`}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentInfo.label}</CardTitle>
                <CardDescription>{currentInfo.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getAvailabilityIcon(currentInfo.availability)}
              <span className="text-sm text-muted-foreground capitalize">
                {currentInfo.availability}
              </span>
            </div>
          </div>
        </CardHeader>

        {showRecommendations && technicianId && (
          <CardContent className="pt-0">
            {/* Workload Display */}
            {!workloadLoading && workload && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Current Workload
                  </span>
                  <span className={`font-medium ${
                    workloadPercentage >= 90 ? 'text-red-600' : 
                    workloadPercentage >= 70 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {workloadPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${workloadPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendation && (
              <Alert className={`mt-3 ${
                recommendation.type === 'warning' ? 'border-red-200 bg-red-50' :
                recommendation.type === 'caution' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{recommendation.message}</span>
                  {recommendation.suggestedStatus && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(recommendation.suggestedStatus!)}
                      disabled={disabled}
                    >
                      Apply
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* Status Selection */}
      {!disabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Status</CardTitle>
            <CardDescription>
              Select a new status for this technician
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(STATUS_INFO).map((info) => {
                const Icon = info.icon;
                const isSelected = selectedStatus === info.status;
                const isCurrent = currentStatus === info.status;

                return (
                  <Button
                    key={info.status}
                    variant={isSelected ? "default" : "outline"}
                    className={`flex items-center justify-start p-3 h-auto ${
                      isSelected ? '' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleStatusChange(info.status)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          {info.label}
                          {isCurrent && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {info.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility function to get status info
export const getStatusInfo = (status: TechnicianStatus) => STATUS_INFO[status];

// Utility function to check if technician is available for assignments
export const isAvailableForAssignments = (status: TechnicianStatus) => {
  return STATUS_INFO[status].availability === 'available';
};

// Utility function to get all available statuses
export const getAvailableStatuses = () => Object.values(STATUS_INFO);