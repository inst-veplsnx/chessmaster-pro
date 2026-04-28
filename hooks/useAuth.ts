'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      return data as Profile | null
    },
    [supabase]
  )

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(async ({ data: { user } }) => {
        const profile = user ? await fetchProfile(user.id) : null
        setState({ user, profile, loading: false })
      })
      .catch(() => {
        setState({ user: null, profile: null, loading: false })
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const user = session?.user ?? null
        const profile = user ? await fetchProfile(user.id) : null
        setState({ user, profile, loading: false })
      } catch {
        setState({ user: null, profile: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    },
    [supabase]
  )

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    return { error }
  }, [supabase])

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
        },
      })
      if (!error && data.user?.identities?.length === 0) {
        return { error: new Error('Этот email уже зарегистрирован') }
      }
      return { error }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) return { error: new Error('Not authenticated') }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single()
      if (!error && data) {
        setState((prev) => ({ ...prev, profile: data as Profile }))
      }
      return { error }
    },
    [supabase, state.user]
  )

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
      })
      return { error }
    },
    [supabase]
  )

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  }
}
