declare module 'phoenixjs' {
  class Push {
    receive(status: string, callback: (response: unknown) => void): Push
  }

  class Channel {
    join(): Push
    leave(): Push
    push(event: string, payload: unknown): Push
    on(event: string, callback: (payload: unknown) => void): number
    off(event: string, ref?: number): void
  }

  class Socket {
    constructor(endPoint: string, opts?: { params?: Record<string, unknown> })
    connect(): void
    disconnect(callback?: () => void): void
    channel(topic: string, params?: Record<string, unknown>): Channel
  }
}
