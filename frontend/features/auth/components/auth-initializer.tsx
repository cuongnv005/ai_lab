"use client";

import { useEffect, useSyncExternalStore } from "react";
import { authService } from "@/features/auth/services/auth.service";

// Simple store to track hydration state without triggering re-renders in effect
const hydrationStore = {
  subscribed: false,
  callbacks: new Set<() => void>(),
  
  subscribe(callback: () => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  },
  
  notify() {
    this.callbacks.forEach(cb => cb());
  }
};

/**
 * AuthInitializer - Handles auth state hydration on client side.
 * 
 * This component should be mounted early in the app (e.g., in root layout)
 * to ensure auth state is fetched immediately after hydration.
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  useEffect(() => {
    // Fetch current user from session after hydration
    authService.fetchMe();
    
    hydrationStore.notify();
  }, []);

  return <>{children}</>;
};

/**
 * Hook to check if we're on client side (after hydration)
 */
export const useIsClient = () => {
  return useSyncExternalStore(
    (callback) => hydrationStore.subscribe(callback),
    () => true,
    () => false
  );
};
