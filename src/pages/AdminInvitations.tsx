import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, TrendingUp, Mail } from "lucide-react";

type InvitationRequest = {
  id: number;
  club_slug: string;
  email: string;
  phone: string;
  visitor_names: string[];
  visitor_count: number;
  visit_date: string;
  status: string;
  created_at: string;
  notes?: string;
  invitation_code?: string;
  email_sent_at?: string;
  attended?: boolean;
  actual_attendee_count?: number;
  attendance_marked_at?: string;
};

type Metrics = {
  totalInvitations: number;
  totalSent: number;
  totalFailed: number;
  totalAttended: number;
  totalNoShows: number;
  pendingConfirmation: number;
  attendanceRate: number;
  avgAttendeesPerInvitation: number;
};

const AdminInvitations = () => {
  const { t, language } = useLanguage();
  const { isAdmin, loading: authLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<InvitationRequest[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InvitationRequest | null>(null);
  const [actualCount, setActualCount] = useState<number>(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
      fetchMetrics();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // @ts-ignore - Table types not yet regenerated
      const { data, error } = await (supabase as any)
        .from("invitation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data as InvitationRequest[] || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load invitation requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const { data, error } = await supabase.functions.invoke("get-invitation-metrics");

      if (error) throw error;
      setMetrics(data.metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleMarkAttendance = async (attended: boolean) => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest.id);
      const { error } = await supabase.functions.invoke("mark-attendance", {
        body: { 
          requestId: selectedRequest.id, 
          attended,
          actualAttendeeCount: attended ? actualCount : 0
        },
      });

      if (error) throw error;

      toast({
        title: attended ? "Marked as attended" : "Marked as no-show",
        description: attended 
          ? `${actualCount} attendee(s) recorded`
          : "Customer did not show up",
      });

      setAttendanceDialogOpen(false);
      setSelectedRequest(null);
      setActualCount(1);
      fetchRequests();
      fetchMetrics();
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openAttendanceDialog = (request: InvitationRequest) => {
    setSelectedRequest(request);
    setActualCount(request.visitor_count);
    setAttendanceDialogOpen(true);
  };

  const handleSendReminder = async (request: InvitationRequest) => {
    try {
      setSendingReminderId(request.id);
      const { error } = await supabase.functions.invoke("send-reminder", {
        body: { requestId: request.id },
      });

      if (error) throw error;

      toast({
        title: "Reminder sent",
        description: `Reminder email sent to ${request.email}`,
      });
      
      // Refresh requests to show attendance buttons again
      fetchRequests();
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive",
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    if (filter === "sent") return req.status === "sent" || req.status === "approved";
    if (filter === "failed") return req.status === "failed";
    if (filter === "attended") return req.attended === true;
    if (filter === "no-show") return req.attended === false && req.attendance_marked_at !== null;
    return req.status === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title={t("admin.invitations.unauthorized")}
          description={t("admin.invitations.unauthorizedMessage")}
          canonical={`/${language}/admin/invitations`}
        />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t("admin.invitations.unauthorized")}</h1>
            <p className="text-muted-foreground">{t("admin.invitations.unauthorizedMessage")}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-500";
    if (rate >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("admin.invitations.title")}
        description="Manage invitation requests and track attendance"
        canonical={`/${language}/admin/invitations`}
      />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">{t("admin.invitations.title")}</h1>

        {/* Metrics Dashboard */}
        {metricsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Invitations</p>
                  <p className="text-3xl font-bold">{metrics.totalInvitations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className={`text-3xl font-bold ${getAttendanceRateColor(metrics.attendanceRate)}`}>
                    {metrics.attendanceRate}%
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.totalAttended} attended / {metrics.totalNoShows} no-shows
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Confirmation</p>
                  <p className="text-3xl font-bold">{metrics.pendingConfirmation}</p>
                </div>
                <X className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Awaiting attendance marking
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Group Size</p>
                  <p className="text-3xl font-bold">{metrics.avgAttendeesPerInvitation}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Attendees per invitation
              </p>
            </div>
          </div>
        )}

        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="attended">Attended</TabsTrigger>
            <TabsTrigger value="no-show">No-Shows</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No requests found
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Visitors</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead>Actual Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>{request.club_slug}</TableCell>
                    <TableCell className="text-sm">{request.email}</TableCell>
                    <TableCell>{request.phone}</TableCell>
                    <TableCell>{request.visitor_count}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(request.visit_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === "sent" || request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status === "approved" ? "sent" : request.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.invitation_code || "-"}
                    </TableCell>
                    <TableCell>
                      {request.attendance_marked_at ? (
                        request.attended ? (
                          <span className="inline-flex items-center text-green-600">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <X className="h-4 w-4" />
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.actual_attendee_count !== null && request.actual_attendee_count !== undefined
                        ? request.actual_attendee_count
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {(request.status === "sent" || request.status === "approved") && 
                       !request.attendance_marked_at && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openAttendanceDialog(request)}
                            disabled={processingId === request.id}
                          >
                            Mark Attended
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              handleMarkAttendance(false);
                            }}
                            disabled={processingId === request.id}
                          >
                            No-Show
                          </Button>
                        </div>
                      )}
                      {request.attendance_marked_at && !request.attended && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(request)}
                            disabled={sendingReminderId === request.id}
                          >
                            {sendingReminderId === request.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Reminder
                              </>
                            )}
                          </Button>
                          <span className="text-xs text-muted-foreground self-center">
                            No-show on {new Date(request.attendance_marked_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {request.attendance_marked_at && request.attended && (
                        <span className="text-xs text-muted-foreground">
                          Attended {new Date(request.attendance_marked_at).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              How many people actually showed up?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="1"
              max={selectedRequest?.visitor_count ? selectedRequest.visitor_count * 2 : 10}
              value={actualCount}
              onChange={(e) => setActualCount(parseInt(e.target.value) || 1)}
              className="text-center text-2xl font-bold"
            />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Expected: {selectedRequest?.visitor_count} visitor(s)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleMarkAttendance(true)}
              disabled={processingId !== null}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Attendance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvitations;
