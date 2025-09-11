'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { reportWebVitals } from '@/lib/performance'

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useReportWebVitals(reportWebVitals)

  useEffect(() => {
    // Additional performance monitoring
    if (typeof window !== 'undefined') {
      // Monitor navigation timing
      window.addEventListener('load', () => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigationTiming) {
          const metrics = {
            domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
            loadComplete: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
            domInteractive: navigationTiming.domInteractive - navigationTiming.fetchStart,
            timeToFirstByte: navigationTiming.responseStart - navigationTiming.requestStart,
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Navigation Timing]', metrics)
          }
        }
      })

      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.duration > 1000) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[Slow Resource] ${entry.name}: ${entry.duration}ms`)
            }
          }
        }
      })
      
      observer.observe({ entryTypes: ['resource'] })

      return () => observer.disconnect()
    }
  }, [])

  return <>{children}</>
}