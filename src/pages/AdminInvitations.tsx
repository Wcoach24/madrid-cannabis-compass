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
import { Loader2 } from "lucide-react";

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
};

const AdminInvitations = () => {
  const { t, language } = useLanguage();
  const { isAdmin, loading: authLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<InvitationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
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

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      const { error } = await supabase.functions.invoke("approve-invitation", {
        body: { requestId },
      });

      if (error) throw error;

      toast({
        title: t("admin.invitations.toast.approveSuccess"),
      });

      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: t("admin.invitations.toast.approveError"),
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    try {
      setProcessingId(selectedRequest);
      const { error } = await supabase.functions.invoke("reject-invitation", {
        body: { requestId: selectedRequest, reason: rejectionReason },
      });

      if (error) throw error;

      toast({
        title: t("admin.invitations.toast.rejectSuccess"),
      });

      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: t("admin.invitations.toast.rejectError"),
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (requestId: number) => {
    setSelectedRequest(requestId);
    setRejectDialogOpen(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("admin.invitations.title")}
        description="Manage invitation requests for cannabis clubs"
        canonical={`/${language}/admin/invitations`}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t("admin.invitations.title")}
          </h1>
          <p className="text-muted-foreground">
            Review and manage club invitation requests
          </p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">{t("admin.invitations.filters.all")}</TabsTrigger>
            <TabsTrigger value="pending">{t("admin.invitations.filters.pending")}</TabsTrigger>
            <TabsTrigger value="approved">{t("admin.invitations.filters.approved")}</TabsTrigger>
            <TabsTrigger value="rejected">{t("admin.invitations.filters.rejected")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredRequests.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {t("admin.invitations.noRequests")}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.invitations.table.id")}</TableHead>
                  <TableHead>{t("admin.invitations.table.club")}</TableHead>
                  <TableHead>{t("admin.invitations.table.email")}</TableHead>
                  <TableHead>{t("admin.invitations.table.phone")}</TableHead>
                  <TableHead>{t("admin.invitations.table.visitors")}</TableHead>
                  <TableHead>{t("admin.invitations.table.visitDate")}</TableHead>
                  <TableHead>{t("admin.invitations.table.status")}</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>{t("admin.invitations.table.created")}</TableHead>
                  <TableHead>{t("admin.invitations.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>{request.club_slug}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.phone}</TableCell>
                    <TableCell>{request.visitor_count}</TableCell>
                    <TableCell>{new Date(request.visit_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.invitation_code || "-"}
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("admin.invitations.actions.approving")}
                              </>
                            ) : (
                              t("admin.invitations.actions.approve")
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(request.id)}
                            disabled={processingId === request.id}
                          >
                            {t("admin.invitations.actions.reject")}
                          </Button>
                        </div>
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.invitations.confirmReject.title")}</DialogTitle>
            <DialogDescription>{t("admin.invitations.confirmReject.message")}</DialogDescription>
          </DialogHeader>
          <Input
            placeholder={t("admin.invitations.confirmReject.reasonPlaceholder")}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t("admin.invitations.confirmReject.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingId !== null}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("admin.invitations.actions.rejecting")}
                </>
              ) : (
                t("admin.invitations.confirmReject.confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvitations;
