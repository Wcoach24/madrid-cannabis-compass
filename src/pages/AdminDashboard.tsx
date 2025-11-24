import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Mail, BarChart3, Users, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAdminRole();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [clubsRes, guidesRes, invitationsRes, pendingInvitationsRes] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('invitation_requests').select('id', { count: 'exact', head: true }),
        supabase.from('invitation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      return {
        totalClubs: clubsRes.count || 0,
        totalGuides: guidesRes.count || 0,
        totalInvitations: invitationsRes.count || 0,
        pendingInvitations: pendingInvitationsRes.count || 0,
      };
    },
    enabled: isAdmin,
  });

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const adminSections = [
    {
      title: 'Clubs',
      description: 'Manage cannabis clubs and their information',
      icon: Building2,
      count: stats?.totalClubs,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      path: '/admin/clubs',
    },
    {
      title: 'Guides',
      description: 'Manage articles and guide content',
      icon: BookOpen,
      count: stats?.totalGuides,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      path: '/admin/guides',
    },
    {
      title: 'Invitations',
      description: 'Review and manage invitation requests',
      icon: Mail,
      count: stats?.pendingInvitations,
      badge: 'pending',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      path: '/admin/invitations',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform content and user requests</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClubs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guides</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGuides}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingInvitations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvitations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card key={section.path} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {section.title}
                  {section.badge && section.count && section.count > 0 && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                      {section.count}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(section.path)} 
                  className="w-full"
                  variant="outline"
                >
                  Manage {section.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Overview
          </CardTitle>
          <CardDescription>Quick summary of platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Clubs listed</span>
              <span className="font-medium">{stats?.totalClubs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Published guides</span>
              <span className="font-medium">{stats?.totalGuides}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Invitation requests received</span>
              <span className="font-medium">{stats?.totalInvitations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Requests awaiting review</span>
              <span className="font-medium text-orange-500">{stats?.pendingInvitations}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
