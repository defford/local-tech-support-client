/**
 * Appointment diagnostic tools for troubleshooting failures
 * Based on the CLI diagnostic functionality
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Wifi, Database, Clock, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCheckTechnicianAvailability } from '@/hooks/useAppointments';
import { useTickets } from '@/hooks/useTickets';
import { useTechnicians } from '@/hooks/useTechnicians';
import { AppointmentCreateRequest, TechnicianStatus, TicketStatus } from '@/types';
import { TechnicianUtils } from '@/types/Technician';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  message: string;
  details?: string;
  suggestion?: string;
}

interface AppointmentDiagnosticsProps {
  failedAppointment?: AppointmentCreateRequest;
  onClose?: () => void;
}

export function AppointmentDiagnostics({ failedAppointment, onClose }: AppointmentDiagnosticsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  
  // Mutations and queries
  const checkAvailabilityMutation = useCheckTechnicianAvailability();
  const { data: ticketsData, refetch: refetchTickets } = useTickets();
  const { data: techniciansData, refetch: refetchTechnicians } = useTechnicians();

  const runDiagnostics = async () => {
    if (!failedAppointment) return;
    
    setIsRunning(true);
    setDiagnosticResults([]);
    
    const results: DiagnosticResult[] = [];
    
    // 1. Check Server Connection
    results.push({
      name: 'Server Connection',
      status: 'checking',
      message: 'Testing server connectivity...'
    });
    setDiagnosticResults([...results]);
    
    try {
      await refetchTickets();
      await refetchTechnicians();
      results[0] = {
        name: 'Server Connection',
        status: 'pass',
        message: 'Server is responding to API requests',
        details: 'Successfully fetched tickets and technicians data'
      };
    } catch (error) {
      results[0] = {
        name: 'Server Connection',
        status: 'fail',
        message: 'Server connection failed',
        details: `Error: ${(error as any)?.message || 'Unknown error'}`,
        suggestion: 'Check server availability and network connection'
      };
    }
    setDiagnosticResults([...results]);
    
    // 2. Verify Ticket Status
    results.push({
      name: 'Ticket Validation',
      status: 'checking',
      message: 'Verifying ticket status...'
    });
    setDiagnosticResults([...results]);
    
    const ticket = ticketsData?.content?.find(t => t.id === failedAppointment.ticketId);
    if (!ticket) {
      results[1] = {
        name: 'Ticket Validation',
        status: 'fail',
        message: `Ticket #${failedAppointment.ticketId} not found`,
        details: 'The ticket may have been deleted or never existed',
        suggestion: 'Verify the ticket ID and ensure the ticket exists'
      };
    } else if (ticket.status !== TicketStatus.OPEN) {
      results[1] = {
        name: 'Ticket Validation',
        status: 'fail',
        message: `Ticket #${ticket.id} is ${ticket.status}`,
        details: 'Only OPEN tickets can have appointments scheduled',
        suggestion: 'Choose a ticket with OPEN status'
      };
    } else {
      results[1] = {
        name: 'Ticket Validation',
        status: 'pass',
        message: `Ticket #${ticket.id} is valid`,
        details: `Status: ${ticket.status}, Priority: ${ticket.priority}`
      };
    }
    setDiagnosticResults([...results]);
    
    // 3. Verify Technician Status
    results.push({
      name: 'Technician Validation',
      status: 'checking',
      message: 'Verifying technician status...'
    });
    setDiagnosticResults([...results]);
    
    const technician = techniciansData?.content?.find(t => t.id === failedAppointment.technicianId);
    if (!technician) {
      results[2] = {
        name: 'Technician Validation',
        status: 'fail',
        message: `Technician #${failedAppointment.technicianId} not found`,
        details: 'The technician may have been deleted',
        suggestion: 'Choose a different technician from the available list'
      };
    } else if (technician.status !== TechnicianStatus.ACTIVE) {
      results[2] = {
        name: 'Technician Validation',
        status: 'fail',
        message: `Technician ${TechnicianUtils.getFullName(technician)} is ${technician.status}`,
        details: 'Only ACTIVE technicians can be assigned to appointments',
        suggestion: 'Choose an ACTIVE technician'
      };
    } else {
      results[2] = {
        name: 'Technician Validation',
        status: 'pass',
        message: `Technician ${TechnicianUtils.getFullName(technician)} is valid`,
        details: `Status: ${technician.status}, Skills: ${technician.skills?.join(', ') || 'None'}`
      };
    }
    setDiagnosticResults([...results]);
    
    // 4. Check Date/Time Constraints
    results.push({
      name: 'Date/Time Validation',
      status: 'checking',
      message: 'Validating appointment timing...'
    });
    setDiagnosticResults([...results]);
    
    const startTime = new Date(failedAppointment.startTime);
    const endTime = new Date(failedAppointment.endTime);
    const now = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes
    
    const isFuture = startTime > new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    const isDurationValid = duration >= 30 && duration <= 480; // 30 min to 8 hours
    
    let validationStatus = 'pass';
    let validationMessage = 'Appointment timing is valid';
    let validationDetails = `Duration: ${duration} minutes`;
    let validationSuggestion: string | undefined = undefined;
    
    if (!isFuture && !isDurationValid) {
      validationStatus = 'fail';
      validationMessage = 'Invalid appointment timing';
      validationDetails = `Start time is ${isFuture ? 'valid' : 'in the past'}, Duration: ${duration} minutes (${isDurationValid ? 'valid' : 'invalid'})`;
      validationSuggestion = 'Ensure appointment is at least 5 minutes in the future and duration is 30min-8hr';
    } else if (!isFuture) {
      validationStatus = 'fail';
      validationMessage = 'Start time must be in the future';
      validationDetails = `Start time is ${Math.round((now.getTime() - startTime.getTime()) / (1000 * 60))} minutes in the past`;
      validationSuggestion = 'Choose a start time at least 5 minutes in the future';
    } else if (!isDurationValid) {
      validationStatus = 'fail';
      validationMessage = 'Invalid appointment duration';
      validationDetails = `Duration: ${duration} minutes (must be 30-480 minutes)`;
      validationSuggestion = 'Set appointment duration between 30 minutes and 8 hours';
    } else {
      validationDetails = `Duration: ${duration} minutes, ${Math.round((startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days from now`;
    }
    
    results[3] = {
      name: 'Date/Time Validation',
      status: validationStatus as 'pass' | 'fail',
      message: validationMessage,
      details: validationDetails,
      suggestion: validationSuggestion
    };
    setDiagnosticResults([...results]);
    
    // 5. Check Technician Availability (if technician is valid)
    if (technician && technician.status === TechnicianStatus.ACTIVE) {
      results.push({
        name: 'Availability Check',
        status: 'checking',
        message: 'Checking technician availability...'
      });
      setDiagnosticResults([...results]);
      
      try {
        const isAvailable = await checkAvailabilityMutation.mutateAsync({
          technicianId: failedAppointment.technicianId,
          startTime: failedAppointment.startTime,
          endTime: failedAppointment.endTime
        });
        
        results[4] = {
          name: 'Availability Check',
          status: isAvailable ? 'pass' : 'fail',
          message: isAvailable ? 'Technician is available' : 'Scheduling conflict detected',
          details: isAvailable ? 'No conflicts found for this time slot' : 'Technician has conflicting appointments',
          suggestion: isAvailable ? undefined : 'Try a different time slot or technician'
        };
      } catch (error) {
        results[4] = {
          name: 'Availability Check',
          status: 'warning',
          message: 'Could not verify availability',
          details: `API Error: ${(error as any)?.message || 'Unknown error'}`,
          suggestion: 'Availability checking service may be unavailable'
        };
      }
      setDiagnosticResults([...results]);
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">WARNING</Badge>;
      case 'checking':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">CHECKING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Appointment Diagnostic Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive troubleshooting for appointment creation failures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {failedAppointment && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Failed Appointment Details:</p>
                <div className="text-sm space-y-1">
                  <div>• Ticket ID: #{failedAppointment.ticketId}</div>
                  <div>• Technician ID: #{failedAppointment.technicianId}</div>
                  <div>• Start Time: {new Date(failedAppointment.startTime).toLocaleString()}</div>
                  <div>• End Time: {new Date(failedAppointment.endTime).toLocaleString()}</div>
                  <div>• Duration: {Math.round((new Date(failedAppointment.endTime).getTime() - new Date(failedAppointment.startTime).getTime()) / (1000 * 60))} minutes</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-3">
          <Button 
            onClick={runDiagnostics} 
            disabled={!failedAppointment || isRunning}
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostic Tests'}
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
        
        {diagnosticResults.length > 0 && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              
              {diagnosticResults.map((result, index) => (
                <Card key={index} className={`border-l-4 ${
                  result.status === 'pass' ? 'border-l-green-500' :
                  result.status === 'fail' ? 'border-l-red-500' :
                  result.status === 'warning' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-semibold">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    {result.details && (
                      <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                        <strong>Details:</strong> {result.details}
                      </div>
                    )}
                    
                    {result.suggestion && (
                      <div className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded text-sm">
                        <strong>Suggestion:</strong> {result.suggestion}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!isRunning && (
              <>
                <Separator />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Summary & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {diagnosticResults.filter(r => r.status === 'pass').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Passed</div>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="text-2xl font-bold text-red-600">
                            {diagnosticResults.filter(r => r.status === 'fail').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                          <div className="text-2xl font-bold text-yellow-600">
                            {diagnosticResults.filter(r => r.status === 'warning').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Warnings</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <h5 className="font-semibold">Next Steps:</h5>
                        {diagnosticResults.some(r => r.status === 'fail') ? (
                          <div className="space-y-1">
                            <p>• Address all FAILED checks above before retrying</p>
                            <p>• Review the suggestions provided for each failed test</p>
                            <p>• If all checks pass but creation still fails, contact system administrator</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p>• All diagnostic checks passed successfully</p>
                            <p>• The issue may be a temporary server-side error</p>
                            <p>• Try creating the appointment again, or wait 1-2 minutes and retry</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
        
        {!failedAppointment && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No appointment data provided for diagnostics. This tool should be used when an appointment creation fails.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default AppointmentDiagnostics;