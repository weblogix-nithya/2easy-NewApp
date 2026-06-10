import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";

interface EchoDiagnostics {
    pusherInitialized: boolean;
    echoInitialized: boolean;
    connectionState: string;
    socketId: string | null;
    config: { key?: string; host?: string };
}

export function useEcho() {
    const [connected, setConnected] = useState(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const echoRef = useRef<Echo<"pusher"> | null>(null);
    const pusherRef = useRef<Pusher | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
        const host = process.env.NEXT_PUBLIC_PUSHER_HOST!;

        try {
            const pusher = new Pusher(key, {
                cluster: "",          // ✅ required by TypeScript
                wsHost: host,
                wsPort: 6001,
                wssPort: 443,
                forceTLS: false,
                enabledTransports: ["ws", "wss"],
                disableStats: true,
            });


            pusher.connection.bind("connected", () => {
                setConnected(true);
                setSocketId(pusher.connection.socket_id);
            });

            pusher.connection.bind("disconnected", () => {
                setConnected(false);
            });

            const echo = new Echo({
                broadcaster: "pusher",
                key,
                wsHost: host,
                wsPort: 6001,
                wssPort: 443,
                forceTLS: false,
                client: pusher,
                disableStats: true,
                enabledTransports: ["ws", "wss"],
            });

            echoRef.current = echo;
            pusherRef.current = pusher;

            // optional global access
            (window as any).Echo = echo;
            (window as any).PusherClient = pusher;
        } catch (error) {
            console.error("❌ Error initializing Echo or Pusher:", error);
        }

        return () => {
            echoRef.current?.disconnect();
            pusherRef.current?.disconnect();
        };
    }, []);

    const reconnect = () => {
        if (pusherRef.current && pusherRef.current.connection.state !== "connected") {
            pusherRef.current.connect();
        }
    };

    const getDiagnostics = (): EchoDiagnostics => ({
        pusherInitialized: !!pusherRef.current,
        echoInitialized: !!echoRef.current,
        connectionState: pusherRef.current?.connection.state || "not_initialized",
        socketId: pusherRef.current?.connection.socket_id || null,
        config: {
            key: process.env.NEXT_PUBLIC_PUSHER_KEY?.substring(0, 10) + "...",
            host: process.env.NEXT_PUBLIC_PUSHER_HOST,
        },
    });

    return {
        connected,
        socketId,
        echo: echoRef.current,
        pusher: pusherRef.current,
        reconnect,
        getDiagnostics,
    };
}
