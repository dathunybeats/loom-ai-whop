// Performance monitoring utilities

export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    // Performance measured but not logged
  } else {
    fn()
  }
}

// Enhanced route preloading with caching
const preloadCache = new Set<string>()

export function preloadRoute(href: string, priority: 'high' | 'low' = 'low') {
  if (typeof window !== 'undefined' && !preloadCache.has(href)) {
    preloadCache.add(href)
    
    const link = document.createElement('link')
    link.rel = priority === 'high' ? 'preload' : 'prefetch'
    link.href = href
    link.as = 'document'
    
    // Add high priority hint for critical routes
    if (priority === 'high') {
      link.setAttribute('importance', 'high')
    }
    
    document.head.appendChild(link)
    
    // Route preloaded
  }
}

// Smart cache management
export function clearPreloadCache() {
  preloadCache.clear()
  
  // Remove old prefetch links to prevent memory bloat
  if (typeof window !== 'undefined') {
    const oldLinks = document.querySelectorAll('link[rel="prefetch"], link[rel="preload"][as="document"]')
    oldLinks.forEach(link => {
      if (link.getAttribute('href')?.startsWith('/')) {
        link.remove()
      }
    })
  }
}

export function reportWebVitals(metric: any) {
  // Web vitals collected but not logged in development
  
  // Track critical performance metrics
  const { name, value, id } = metric
  
  // Send to analytics service in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    // gtag('event', name, {
    //   custom_parameter_1: value,
    //   custom_parameter_2: id,
    // })
    
    // Or send to your analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value, id }),
    }).catch(console.error)
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}