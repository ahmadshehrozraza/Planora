import { eventEmitter } from '@/lib/event-emitter';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error("Error sending SSE:", error);
        }
      };

      eventEmitter.on('invalidate', sendEvent);

      req.signal.addEventListener('abort', () => {
        eventEmitter.off('invalidate', sendEvent);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}