import { useEffect, useRef } from "react";

import { useEcho } from "./useWebsocketConfig";

type EventConfig = Record<
    string,
    {
        channel: string;
        event: string;
        callback?: (payload: any) => void;
    }
>;

export function useSubscriptionService(events: EventConfig) {
    const { echo, connected } = useEcho();
    const subscriptionsRef = useRef<Map<string, boolean>>(new Map());

    useEffect(() => {
        if (!connected || !echo) return;

        const unsubscribeFns: (() => void)[] = [];

        Object.entries(events).forEach(([_key, { channel, event, callback }]) => {
            const subKey = `${channel}:${event}`;

            if (subscriptionsRef.current.get(subKey)) return;
            subscriptionsRef.current.set(subKey, true);

            const ch = echo.channel(channel);

            const wrappedCallback = (payload: any) => {
                if (callback) callback(payload);
            };

            // ✅ automatically prepend dot if missing
            const eventName = event.startsWith('.') ? event : `.${event}`;
            ch.listen(eventName, wrappedCallback);

            unsubscribeFns.push(() => ch.stopListening(eventName, wrappedCallback));
        });

        return () => {
            unsubscribeFns.forEach(fn => fn());
            // eslint-disable-next-line react-hooks/exhaustive-deps
            subscriptionsRef.current.clear();
        };
    }, [connected, echo, events]);
}
