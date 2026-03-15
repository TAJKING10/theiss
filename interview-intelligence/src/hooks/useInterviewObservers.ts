"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Observer {
  id: string;
  name: string;
  email?: string;
  role: "hr" | "hiring_manager" | "team_member";
  isOnline: boolean;
  joinedAt?: Date;
  avatar?: string;
}

interface UseInterviewObserversOptions {
  interviewId: string;
  enabled?: boolean;
}

interface PresenceState {
  [key: string]: Observer[];
}

export function useInterviewObservers({
  interviewId,
  enabled = true,
}: UseInterviewObserversOptions) {
  const [observers, setObservers] = useState<Observer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  // Join as observer
  const joinAsObserver = useCallback(
    async (name: string, role: Observer["role"], email?: string) => {
      if (!channel) return;

      const { data: { user } } = await supabase.auth.getUser();

      const observerData: Observer = {
        id: user?.id || crypto.randomUUID(),
        name,
        email,
        role,
        isOnline: true,
        joinedAt: new Date(),
        avatar: undefined,
      };

      await channel.track(observerData);
      return observerData;
    },
    [channel, supabase]
  );

  // Leave as observer
  const leaveAsObserver = useCallback(async () => {
    if (channel) {
      await channel.untrack();
    }
  }, [channel]);

  useEffect(() => {
    if (!enabled || !interviewId) return;

    const channelName = `interview-observers:${interviewId}`;

    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: "observers",
        },
      },
    });

    // Handle presence sync
    newChannel
      .on("presence", { event: "sync" }, () => {
        const presenceState = newChannel.presenceState() as PresenceState;
        const allObservers: Observer[] = [];

        Object.values(presenceState).forEach((observers) => {
          observers.forEach((observer) => {
            allObservers.push({
              ...observer,
              isOnline: true,
            });
          });
        });

        // Deduplicate by id
        const uniqueObservers = allObservers.reduce((acc, observer) => {
          if (!acc.find((o) => o.id === observer.id)) {
            acc.push(observer);
          }
          return acc;
        }, [] as Observer[]);

        setObservers(uniqueObservers);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const newObservers = newPresences as Observer[];
        setObservers((prev) => {
          const updated = [...prev];
          newObservers.forEach((observer) => {
            const index = updated.findIndex((o) => o.id === observer.id);
            if (index === -1) {
              updated.push({ ...observer, isOnline: true });
            } else {
              updated[index] = { ...observer, isOnline: true };
            }
          });
          return updated;
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftIds = (leftPresences as Observer[]).map((o) => o.id);
        setObservers((prev) =>
          prev.map((o) =>
            leftIds.includes(o.id) ? { ...o, isOnline: false } : o
          )
        );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    };
  }, [interviewId, enabled, supabase]);

  return {
    observers,
    isConnected,
    joinAsObserver,
    leaveAsObserver,
    onlineCount: observers.filter((o) => o.isOnline).length,
  };
}

export default useInterviewObservers;
