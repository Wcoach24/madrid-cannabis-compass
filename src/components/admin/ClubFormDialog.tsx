import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const clubSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  short_name: z.string().max(50).optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  summary: z.string().max(500).optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().default('Madrid'),
  postal_code: z.string().optional().nullable(),
  country: z.string().default('ES'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  whatsapp_number: z.string().optional().nullable(),
  website_url: z.string().url().optional().or(z.literal('')).nullable(),
  instagram_url: z.string().url().optional().or(z.literal('')).nullable(),
  main_image_url: z.string()
    .refine((val) => {
      if (!val || val === '') return true;
      if (val.startsWith('/')) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: 'Must be a valid URL or relative path (e.g., /images/clubs/club.jpg)' })
    .optional()
    .nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  is_verified: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_tourist_friendly: z.boolean().default(false),
  rating_editorial: z.number().min(0).max(5).optional().nullable(),
  rating_location: z.number().min(0).max(5).optional().nullable(),
  rating_ambience: z.number().min(0).max(5).optional().nullable(),
  rating_safety: z.number().min(0).max(5).optional().nullable(),
  seo_title: z.string().max(60).optional().nullable(),
  seo_description: z.string().max(160).optional().nullable(),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: number | null;
  onSuccess: () => void;
}

export default function ClubFormDialog({ open, onOpenChange, clubId, onSuccess }: ClubFormDialogProps) {
  const form = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      address: '',
      district: '',
      city: 'Madrid',
      country: 'ES',
      status: 'active',
      is_verified: false,
      is_featured: false,
      is_tourist_friendly: false,
    },
  });

  // Fetch club data if editing
  const { data: clubData } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      if (!clubId) return null;
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clubId && open,
  });

  // Populate form when editing
  useEffect(() => {
    if (clubData) {
      form.reset({
        name: clubData.name,
        slug: clubData.slug,
        short_name: clubData.short_name,
        description: clubData.description,
        summary: clubData.summary,
        address: clubData.address,
        district: clubData.district,
        city: clubData.city,
        postal_code: clubData.postal_code,
        country: clubData.country,
        latitude: clubData.latitude,
        longitude: clubData.longitude,
        email: clubData.email || '',
        whatsapp_number: clubData.whatsapp_number,
        website_url: clubData.website_url || '',
        instagram_url: clubData.instagram_url || '',
        main_image_url: clubData.main_image_url || '',
        status: clubData.status as 'active' | 'inactive',
        is_verified: clubData.is_verified || false,
        is_featured: clubData.is_featured || false,
        is_tourist_friendly: clubData.is_tourist_friendly || false,
        rating_editorial: clubData.rating_editorial,
        rating_location: clubData.rating_location,
        rating_ambience: clubData.rating_ambience,
        rating_safety: clubData.rating_safety,
        seo_title: clubData.seo_title,
        seo_description: clubData.seo_description,
      });
    } else {
      form.reset();
    }
  }, [clubData, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ClubFormData) => {
      // Convert empty strings to null for nullable fields
      const cleanData: any = {
        ...data,
        email: data.email || null,
        website_url: data.website_url || null,
        instagram_url: data.instagram_url || null,
        main_image_url: data.main_image_url || null,
      };

      if (clubId) {
        const { error } = await supabase
          .from('clubs')
          .update(cleanData)
          .eq('id', clubId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert([cleanData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(clubId ? 'Club updated successfully' : 'Club created successfully');
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to save club: ${error.message}`);
    },
  });

  const onSubmit = (data: ClubFormData) => {
    saveMutation.mutate(data);
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clubId ? 'Edit Club' : 'Create New Club'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Cannabis Club Madrid Centro"
                          onBlur={(e) => {
                            field.onBlur();
                            if (!clubId && !form.getValues('slug')) {
                              form.setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="cannabis-club-madrid-centro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="CCMC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="Brief summary (max 500 chars)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Full club description"
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="main_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="/images/clubs/club-name.jpg or https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="location" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Calle Gran Vía 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Centro" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="28013" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Madrid" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ES" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="40.4168"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="-3.7038"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} type="email" placeholder="info@club.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="+34600000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} type="url" placeholder="https://club.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} type="url" placeholder="https://instagram.com/club" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_verified"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Verified</FormLabel>
                          <p className="text-sm text-muted-foreground">Mark this club as verified</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Featured</FormLabel>
                          <p className="text-sm text-muted-foreground">Show as featured club</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_tourist_friendly"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Tourist Friendly</FormLabel>
                          <p className="text-sm text-muted-foreground">Accepts tourists</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rating_editorial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Editorial Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="4.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="4.0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating_ambience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambience Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="4.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating_safety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Safety Rating</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="5"
                            value={field.value || ''}
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="5.0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="seo_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title (max 60 chars)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Best Cannabis Club in Madrid Centro" maxLength={60} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seo_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description (max 160 chars)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="Discover the best cannabis club experience in Madrid Centro..."
                          maxLength={160}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {clubId ? 'Update Club' : 'Create Club'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
