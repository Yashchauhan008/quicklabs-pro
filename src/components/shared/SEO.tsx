import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  canonical?: string;
}

const SEO = ({
  title,
  description = 'QuickLabs Pro - The ultimate learning management platform for modern developers and students.',
  keywords = 'learning, labs, technology, education, quicklabs, pro',
  author = 'QuickLabs Pro Team',
  ogTitle,
  ogDescription,
  ogType = 'website',
  canonical,
}: SEOProps) => {
  const baseTitle = 'QuickLabs Pro';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={ogDescription || description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:site_name" content={baseTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />

      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Theme Color */}
      <meta name="theme-color" content="#4f46e5" />
    </Helmet>
  );
};

export default SEO;
