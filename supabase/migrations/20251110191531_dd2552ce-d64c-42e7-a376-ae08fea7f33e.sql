-- Create clubs table
CREATE TABLE public.clubs (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_name text,
  description text NOT NULL,
  summary text,
  address text NOT NULL,
  district text NOT NULL,
  city text DEFAULT 'Madrid' NOT NULL,
  postal_code text,
  country text DEFAULT 'ES' NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  website_url text,
  instagram_url text,
  whatsapp_number text,
  email text,
  languages text[] DEFAULT ARRAY['es','en']::text[],
  is_tourist_friendly boolean DEFAULT false,
  rating_editorial numeric(2,1),
  rating_safety numeric(2,1),
  rating_ambience numeric(2,1),
  rating_location numeric(2,1),
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'active' NOT NULL,
  main_image_url text,
  gallery_image_urls text[],
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create articles table
CREATE TABLE public.articles (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  excerpt text,
  body_markdown text NOT NULL,
  language text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  author_name text NOT NULL,
  author_bio text,
  cover_image_url text,
  seo_title text,
  seo_description text,
  canonical_url text,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  status text DEFAULT 'draft' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create faq table
CREATE TABLE public.faq (
  id bigserial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  question text NOT NULL,
  answer_markdown text NOT NULL,
  language text NOT NULL,
  category text,
  priority integer DEFAULT 100,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create submissions table
CREATE TABLE public.submissions (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  club_id bigint REFERENCES public.clubs(id),
  club_name text,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_clubs_slug ON public.clubs(slug);
CREATE INDEX idx_clubs_district ON public.clubs(district);
CREATE INDEX idx_clubs_status ON public.clubs(status);
CREATE INDEX idx_clubs_is_featured ON public.clubs(is_featured);
CREATE INDEX idx_clubs_location ON public.clubs(latitude, longitude);

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_language ON public.articles(language);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published_at ON public.articles(published_at);

CREATE INDEX idx_faq_language ON public.faq(language);
CREATE INDEX idx_faq_category ON public.faq(category);
CREATE INDEX idx_faq_priority ON public.faq(priority);

CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_type ON public.submissions(type);

-- Enable Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public can view active clubs"
  ON public.clubs FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Public can view all FAQ"
  ON public.faq FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policy for submissions (insert only)
CREATE POLICY "Public can submit contact forms"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);