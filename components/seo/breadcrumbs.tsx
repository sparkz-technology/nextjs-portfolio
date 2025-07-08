"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbStructuredData } from "./structured-data";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/60" />
              )}
              {index === 0 && (
                <Home className="h-4 w-4 mr-2" />
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' }
  ];

  let currentPath = '';
  for (const path of paths) {
    currentPath += `/${path}`;
    
    // Convert path segments to readable names
    let name = path.charAt(0).toUpperCase() + path.slice(1);
    
    // Handle special cases
    if (path === 'blog') {
      name = 'Blog';
    } else if (path === 'guestbook') {
      name = 'Guestbook';
    } else if (path === 'dashboard') {
      name = 'Dashboard';
    } else if (currentPath.startsWith('/blog/') && paths.length > 1) {
      // For blog posts, we'll use the path as-is since it's likely a slug
      name = decodeURIComponent(path).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    breadcrumbs.push({
      name,
      url: currentPath
    });
  }

  return breadcrumbs;
}