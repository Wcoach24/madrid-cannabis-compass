import { useParams, Navigate } from "react-router-dom";
import ArticlePage from "@/components/ArticlePage";
import { ARTICLES } from "@/data/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * BlogPost — Renders a static article from the articles data.
 * Route: /blog/:slug and /:lang/blog/:slug
 * Zero Supabase dependency.
 */
const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !ARTICLES[slug]) {
    return <Navigate to="/404" replace />;
  }

  const article = ARTICLES[slug];

  return (
    <>
      <Header />
      <ArticlePage {...article} />
      <Footer />
    </>
  );
};

export default BlogPost;
