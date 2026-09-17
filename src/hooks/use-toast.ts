"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

type ActionType =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "DISMISS_TOAST"; toastId: string };

let listeners: Array<(state: ToastItem[]) => void> = [];
let memoryState: ToastItem[] = [];

function dispatch(action: ActionType) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = [...memoryState, action.toast];
      break;
    case "DISMISS_TOAST":
      memoryState = memoryState.filter((t) => t.id !== action.toastId);
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({
  title,
  description,
  variant = "default",
  duration = 4000,
}: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  dispatch({
    type: "ADD_TOAST",
    toast: { id, title, description, variant, duration },
  });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: "DISMISS_TOAST", toastId: id });
    }, duration);
  }

  return id;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = (toastId: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  };

  return {
    toasts,
    toast,
    dismiss,
  };
}
