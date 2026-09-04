'use client'

import { useEffect } from 'react'

const SessionRefresh = () => {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload()
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return null
}

export default SessionRefresh
