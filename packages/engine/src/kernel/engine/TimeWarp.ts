/**
 * TimeWarpBuffer — Ring buffer for time-manipulation effects (slow-motion, hyperlapse).
 *
 * For live streams you can't change playbackRate.
 * Instead we store N recent video frames as textures and read them back
 * at a different rate from the write rate.
 *
 * Slow-motion  (speed 0.5) → read advances by 0.5 per write → gradually drifts behind live
 * Hyperlapse   (speed 2.0) → read advances by 2.0 per write → skips frames
 *
 * When read falls too far behind (offset >= capacity), it snaps forward.
 */
export class TimeWarpBuffer {
    private gl: WebGL2RenderingContext;
    private textures: WebGLTexture[] = [];
    private capacity: number;
    private width = 0;
    private height = 0;

    /** Absolute write counter (always increments) */
    private writeHead = 0;
    /** Fractional read cursor (increments by speed each frame) */
    private readCursor = 0;
    /** Whether the buffer has been primed (at least 1 frame written) */
    private primed = false;

    constructor(gl: WebGL2RenderingContext, capacity = 90) {
        this.gl = gl;
        this.capacity = capacity;
        this.allocateTextures();
    }

    /* ------------------------------------------------------------------ */
    /*  Lifecycle                                                          */
    /* ------------------------------------------------------------------ */

    private allocateTextures() {
        const { gl } = this;
        for (let i = 0; i < this.capacity; i++) {
            const tex = gl.createTexture();
            if (!tex) continue;
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            this.textures.push(tex);
        }
    }

    /** Call when canvas size changes so textures get the right dimensions. */
    ensureSize(w: number, h: number) {
        if (this.width === w && this.height === h) return;
        this.width = w;
        this.height = h;
        const { gl } = this;
        for (const tex of this.textures) {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
    }

    destroy() {
        for (const t of this.textures) this.gl.deleteTexture(t);
        this.textures = [];
    }

    /* ------------------------------------------------------------------ */
    /*  Write / Read                                                       */
    /* ------------------------------------------------------------------ */

    /** Store the current video frame into the ring buffer. */
    push(source: TexImageSource) {
        if (this.textures.length === 0) return;
        const slot = this.writeHead % this.capacity;
        const { gl } = this;
        gl.bindTexture(gl.TEXTURE_2D, this.textures[slot]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        this.writeHead++;
        if (!this.primed) {
            this.primed = true;
            this.readCursor = this.writeHead - 1; // start at latest
        }
    }

    /**
     * Advance the read cursor by `speed` and return the texture to render.
     *
     * speed < 1  → slow-motion  (e.g. 0.5 plays half-speed)
     * speed = 1  → real-time
     * speed > 1  → fast-forward / hyperlapse
     *
     * Returns null if no frames have been pushed yet.
     */
    read(speed: number): WebGLTexture | null {
        if (!this.primed || this.textures.length === 0) return null;

        // Advance read cursor
        this.readCursor += speed;

        // Clamp: don't read ahead of write
        if (this.readCursor >= this.writeHead) {
            this.readCursor = this.writeHead - 1;
        }

        // Clamp: if read fell too far behind (buffer wrapped around), snap forward
        const maxLag = this.capacity - 2; // keep a small margin
        if (this.writeHead - this.readCursor > maxLag) {
            this.readCursor = this.writeHead - maxLag;
        }

        const slot = Math.floor(this.readCursor) % this.capacity;
        // Handle negative modulo (shouldn't happen but safety)
        const safeSlot = ((slot % this.capacity) + this.capacity) % this.capacity;
        return this.textures[safeSlot];
    }

    /** Reset read cursor to live (no delay). */
    reset() {
        this.readCursor = Math.max(0, this.writeHead - 1);
    }

    get isActive(): boolean {
        return this.primed;
    }
}
