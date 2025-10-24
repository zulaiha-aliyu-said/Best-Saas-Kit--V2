"use client"

import { useState, useCallback, useEffect } from "react"

interface UseAsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T
  enabled?: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, initialData, enabled = true } = options

  const [state, setState] = useState<UseAsyncState<T>>({
    data: initialData || null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  })

  const execute = useCallback(async () => {
    setState({
      data: state.data,
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    })

    try {
      const result = await asyncFunction()
      setState({
        data: result,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      })
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({
        data: state.data,
        error: err,
        isLoading: false,
        isError: true,
        isSuccess: false,
      })
      onError?.(err)
      throw err
    }
  }, [asyncFunction, state.data, onSuccess, onError])

  useEffect(() => {
    if (enabled) {
      setTimeout(execute, 0)
    }
  }, [execute, enabled])

  const refetch = useCallback(() => execute(), [execute])

  return {
    ...state,
    execute,
    refetch,
  }
}

// Mutation hook (doesn't execute automatically)
export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError } = options

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  })

  const mutate = useCallback(async (params: P) => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isError: false,
      isSuccess: false,
    })

    try {
      const result = await mutationFn(params)
      setState({
        data: result,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
      })
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({
        data: null,
        error: err,
        isLoading: false,
        isError: true,
        isSuccess: false,
      })
      onError?.(err)
      throw err
    }
  }, [mutationFn, onSuccess, onError])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}




