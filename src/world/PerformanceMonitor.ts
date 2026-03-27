// ============================================
// PERFORMANCE MONITOR — Sprint 5
// ============================================
// Lightweight frame-time profiler and draw-call tracker.
// Used by the game loop to expose a HUD overlay string.
// No THREE import needed—stats are fed in by callers.

export interface FrameStats {
    /** Wall-clock frame time in ms */
    frameMs: number;
    /** THREE.WebGLRenderer.info.render.calls snapshot */
    drawCalls: number;
    /** THREE.WebGLRenderer.info.render.triangles snapshot */
    triangles: number;
    /** Frames per second (rolling average over last 60 frames) */
    fps: number;
}

/** Ring-buffer size for rolling FPS average */
const RING = 60;

export class PerformanceMonitor {
    private frameTimes: Float32Array = new Float32Array(RING);
    private head = 0;
    private lastFrameMs = 0;
    private lastDrawCalls = 0;
    private lastTriangles = 0;

    /**
     * Call at the start of each render loop with the raw
     * performance.now() delta (in ms) and renderer info.
     */
    record(frameMs: number, drawCalls: number, triangles: number): void {
        this.frameTimes[this.head % RING] = frameMs;
        this.head++;
        this.lastFrameMs = frameMs;
        this.lastDrawCalls = drawCalls;
        this.lastTriangles = triangles;
    }

    getStats(): FrameStats {
        const count = Math.min(this.head, RING);
        let sum = 0;
        for (let i = 0; i < count; i++) sum += this.frameTimes[i];
        const avgMs = count > 0 ? sum / count : 0;
        const fps = avgMs > 0 ? 1000 / avgMs : 0;
        return {
            frameMs: this.lastFrameMs,
            drawCalls: this.lastDrawCalls,
            triangles: this.lastTriangles,
            fps,
        };
    }

    /** Single-line string for the debug HUD overlay. */
    getHudText(): string {
        const s = this.getStats();
        return (
            `FPS: ${s.fps.toFixed(1)}  ` +
            `Frame: ${s.frameMs.toFixed(2)}ms  ` +
            `Draw: ${s.drawCalls}  ` +
            `Tris: ${(s.triangles / 1000).toFixed(1)}k`
        );
    }
}
