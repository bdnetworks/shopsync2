"use client"

import * as React from "react"
import { create } from "zustand"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type ToastState = {
  toasts: ToasterToast[]
}

type ToastActions = {
  addToast: (toast: Omit<ToasterToast, "id">) => {
    id: string
    dismiss: () => void
    update: (props: Partial<ToasterToast>) => void
  }
  updateToast: (id: string, props: Partial<ToasterToast>) => void
  dismissToast: (id?: string) => void
  removeToast: (id?: string) => void
}

const useToastStore = create<ToastState & ToastActions>((set, get) => ({
  toasts: [],
  addToast: (props) => {
    const id = Math.random().toString(36).slice(2, 9)
    const update = (newProps: Partial<ToasterToast>) =>
      get().updateToast(id, newProps)
    const dismiss = () => get().dismissToast(id)

    set((state) => ({
      toasts: [
        { ...props, id, open: true, onOpenChange: (open) => !open && dismiss() },
        ...state.toasts,
      ].slice(0, TOAST_LIMIT),
    }))

    return { id, dismiss, update }
  },
  updateToast: (id, props) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...props } : t
      ),
    }))
  },
  dismissToast: (id) => {
    const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
    const addToRemoveQueue = (toastId: string) => {
      if (toastTimeouts.has(toastId)) return
      const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        get().removeToast(toastId)
      }, TOAST_REMOVE_DELAY)
      toastTimeouts.set(toastId, timeout)
    }

    if (id) {
      addToRemoveQueue(id)
    } else {
      get().toasts.forEach((t) => addToRemoveQueue(t.id))
    }

    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id || id === undefined ? { ...t, open: false } : t
      ),
    }))
  },
  removeToast: (id) => {
    set((state) =>
      id
        ? { toasts: state.toasts.filter((t) => t.id !== id) }
        : { toasts: [] }
    )
  },
}))

export const useToast = () => {
  const state = useToastStore()

  return {
    ...state,
    toast: state.addToast,
    dismiss: state.dismissToast,
  }
}

export const toast = useToastStore.getState().addToast
