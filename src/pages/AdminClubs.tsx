import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, Star, Shield } from 'lucide-react';
import ClubFormDialog from '@/components/admin/ClubFormDialog';

type Club = {
  id: number;
  name: string;
  slug: string;
  district: string;
  status: string;
  is_verified: boolean | null;
  is_featured: boolean | null;
  rating_editorial: number | null;
  main_image_url: string | null;
};

export default function AdminClubs() {
  const { isAdmin, loading: authLoading } = useAdminRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteClubId, setDeleteClubId] = useState<number | null>(null);
  const [editClubId, setEditClubId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch clubs
  const { data: clubs, isLoading } = useQuery({
    queryKey: ['admin-clubs', statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Club[];
    },
    enabled: isAdmin && !authLoading,
  });

  // Delete club mutation
  const deleteMutation = useMutation({
    mutationFn: async (clubId: number) => {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      toast.success('Club deleted successfully');
      setDeleteClubId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete club: ${error.message}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ clubId, currentStatus }: { clubId: number; currentStatus: string }) => {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('clubs')
        .update({ status: newStatus })
        .eq('id', clubId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      toast.success('Club status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Club Management</h1>
        <Button onClick={() => { setEditClubId(null); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Club
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clubs</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : clubs && clubs.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {club.main_image_url && (
                        <img
                          src={club.main_image_url}
                          alt={club.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{club.name}</div>
                        <div className="text-sm text-muted-foreground">{club.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{club.district}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={club.status === 'active' ? 'default' : 'secondary'}>
                      {club.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {club.is_verified && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      {club.is_featured && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {club.rating_editorial ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span>{club.rating_editorial.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditClubId(club.id); setIsFormOpen(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate({ 
                          clubId: club.id, 
                          currentStatus: club.status 
                        })}
                      >
                        {club.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteClubId(club.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No clubs found</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteClubId !== null} onOpenChange={() => setDeleteClubId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClubId && deleteMutation.mutate(deleteClubId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Club Form Dialog */}
      <ClubFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        clubId={editClubId}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditClubId(null);
          queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
        }}
      />
    </div>
  );
}
