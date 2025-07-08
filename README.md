# Next.js Portfolio with Advanced SEO

This is a [Next.js](https://nextjs.org) portfolio project with comprehensive SEO optimizations, featuring a modern blog, guestbook, and dashboard functionality.

## 🚀 Features

### Core Features
- **Personal Portfolio**: Showcase your projects, experience, and skills
- **Blog System**: Full-featured blog with markdown support
- **Guestbook**: Interactive visitor messages with likes
- **Dashboard**: Admin panel for content management
- **Authentication**: GitHub OAuth integration with NextAuth.js

### SEO & Performance
- **Structured Data**: JSON-LD schema markup for better search visibility
- **OpenGraph & Twitter Cards**: Rich social media previews
- **RSS Feed**: Content syndication at `/rss.xml`
- **Sitemap**: Dynamic sitemap generation
- **Breadcrumbs**: Enhanced navigation with structured data
- **Performance Optimization**: Core Web Vitals improvements
- **Meta Tags**: Comprehensive SEO meta tags on all pages

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with GitHub provider
- **Styling**: Tailwind CSS with Radix UI components
- **Content**: Markdown support with syntax highlighting
- **Performance**: Image optimization and lazy loading
- **SEO**: Structured data, meta tags, and performance optimization

## 📊 SEO Features

### Structured Data (JSON-LD)
- Person schema for author information
- Article schema for blog posts
- Website schema with search functionality
- Breadcrumb schema for navigation

### Meta Tags & Social
- Canonical URLs on all pages
- Rich OpenGraph tags for social sharing
- Twitter Card optimization
- RSS feed integration
- Author attribution and keywords

### Performance & UX
- Core Web Vitals optimization
- Resource preloading and DNS prefetching
- Lazy loading for images and content
- Breadcrumb navigation for better UX
- Enhanced robots.txt with AI bot blocking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- GitHub OAuth App (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   GITHUB_ID="your-github-oauth-app-id"
   GITHUB_SECRET="your-github-oauth-app-secret"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── blog/              # Blog pages and components
│   ├── dashboard/         # Admin dashboard
│   ├── guestbook/         # Guestbook functionality
│   ├── layout.tsx         # Root layout with SEO
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── robots.ts          # Robots.txt configuration
│   └── rss.xml/           # RSS feed generation
├── components/            # Reusable components
│   ├── seo/              # SEO-specific components
│   │   ├── structured-data.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── performance-optimizer.tsx
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── prisma/              # Database schema
└── docs/                # Documentation
```

## 🔧 SEO Configuration

### Structured Data
The application automatically generates JSON-LD structured data for:
- Website and organization information
- Blog articles with complete metadata
- Breadcrumb navigation
- Author/person information

### Meta Tags
All pages include:
- Title and description optimization
- Canonical URLs
- OpenGraph tags for social sharing
- Twitter Card metadata
- Author and keyword information

### Performance
- Resource preloading for critical assets
- DNS prefetching for external domains
- Lazy loading for images and content
- Core Web Vitals optimization

## 📈 Monitoring SEO Performance

### Tools to Use
- **Google Search Console**: Monitor search performance
- **Google PageSpeed Insights**: Check Core Web Vitals
- **Google Analytics**: Track user behavior
- **Social Media Analytics**: Monitor social sharing

### Key Metrics
- Search rankings for target keywords
- Core Web Vitals scores (LCP, FID, CLS)
- Click-through rates from search results
- Social media engagement
- RSS feed subscribers

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production
```env
DATABASE_URL="your-production-mongodb-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"
```

## 🎯 SEO Best Practices Implemented

- **Technical SEO**: Proper HTML structure, meta tags, and schema markup
- **Content SEO**: Optimized titles, descriptions, and keyword usage
- **Performance SEO**: Fast loading times and Core Web Vitals optimization
- **Social SEO**: Rich snippets for social media sharing
- **Local SEO**: Structured data for better local search visibility

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [SEO Implementation Guide](./docs/SEO_IMPLEMENTATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## MongoDB Replica Set Setup (Development)

For local development with MongoDB replica set:

```bash
# Create directories
mkdir -p C:\data\rs0\node1 C:\data\rs0\node2 C:\data\rs0\node3

# Start MongoDB instances
mongod.exe --port 27017 --dbpath C:\data\rs0\node1 --replSet rs0 --bind_ip 127.0.0.1
mongod.exe --port 27018 --dbpath C:\data\rs0\node2 --replSet rs0 --bind_ip 127.0.0.1  
mongod.exe --port 27019 --dbpath C:\data\rs0\node3 --replSet rs0 --bind_ip 127.0.0.1

# Initialize replica set
mongosh --port 27017
rs.initiate()
rs.add("localhost:27018")
rs.add("localhost:27019")
rs.status()
```

Connection string:
```
DATABASE_URL="mongodb://localhost:27017,localhost:27018,localhost:27019/mydb?replicaSet=rs0"
```
