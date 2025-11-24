import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const guideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  subtitle: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  body_markdown: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.enum(['en', 'es']),
  author_name: z.string().min(1, 'Author name is required'),
  author_bio: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
  is_featured: z.boolean().default(false),
  cover_image_url: z.string()
    .refine((val) => {
      if (!val || val === '') return true;
      if (val.startsWith('/')) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: 'Must be a valid URL or relative path' })
    .optional()
    .nullable(),
  canonical_url: z.string().url().optional().or(z.literal('')).nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  tags: z.string().optional(),
  published_at: z.string().optional().nullable(),
});

type GuideFormData = z.infer<typeof guideSchema>;

interface GuideFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideId: number | null;
  onSuccess: () => void;
}

export function GuideFormDialog({ open, onOpenChange, guideId, onSuccess }: GuideFormDialogProps) {
  const { toast } = useToast();

  const form = useForm<GuideFormData>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      title: '',
      slug: '',
      subtitle: '',
      excerpt: '',
      body_markdown: '',
      category: '',
      language: 'en',
      author_name: '',
      author_bio: '',
      status: 'draft',
      is_featured: false,
      cover_image_url: '',
      canonical_url: '',
      seo_title: '',
      seo_description: '',
      tags: '',
      published_at: '',
    },
  });

  const { data: guideData } = useQuery({
    queryKey: ['guide', guideId],
    queryFn: async () => {
      if (!guideId) return null;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', guideId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!guideId && open,
  });

  useEffect(() => {
    if (guideData) {
      form.reset({
        ...guideData,
        language: guideData.language as 'en' | 'es',
        status: guideData.status as 'draft' | 'published',
        tags: guideData.tags?.join(', ') || '',
        published_at: guideData.published_at || '',
      });
    } else if (!guideId) {
      form.reset({
        title: '',
        slug: '',
        subtitle: '',
        excerpt: '',
        body_markdown: '',
        category: '',
        language: 'en',
        author_name: '',
        author_bio: '',
        status: 'draft',
        is_featured: false,
        cover_image_url: '',
        canonical_url: '',
        seo_title: '',
        seo_description: '',
        tags: '',
        published_at: '',
      });
    }
  }, [guideData, guideId, form]);

  const mutation = useMutation({
    mutationFn: async (data: GuideFormData) => {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      
      const cleanData = {
        ...data,
        tags: tagsArray,
        published_at: data.published_at || null,
      };

      delete (cleanData as any).tags;

      if (guideId) {
        const { error } = await supabase
          .from('articles')
          .update({ ...cleanData, tags: tagsArray } as any)
          .eq('id', guideId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert({ ...cleanData, tags: tagsArray } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Guide ${guideId ? 'updated' : 'created'} successfully` });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: `Error ${guideId ? 'updating' : 'creating'} guide`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: GuideFormData) => {
    mutation.mutate(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guideId ? 'Edit Guide' : 'Create New Guide'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            if (!form.getValues('slug')) {
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="news">News</SelectItem>
                            <SelectItem value="tips">Tips</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="/images/articles/guide.jpg or https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="body_markdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown) *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={15} className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="cannabis, madrid, guide" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
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
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canonical_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Guide</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Published Date (ISO format)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="2024-01-01T00:00:00Z" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : guideId ? 'Update Guide' : 'Create Guide'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
