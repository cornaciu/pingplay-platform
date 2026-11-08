'use client'

import { useEffect } from 'react'

import { refreshSession } from '@/lib/auth'

const SessionRefresh = () => {
  useEffect(() => {
    // Renew the session cookie on every visit so the account stays signed in.
    refreshSession().catch(() => undefined)
  }, [])

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
