<script lang="ts">
/* eslint no-bitwise: 0 */
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
  props: {
  },
})
export default class RemoteDisplayPage extends Vue {
  width = 320;
  height = 240;

  connected: boolean = true;
  connecting: boolean = false;
  preventReconnection: boolean = true;

  url: string = 'ws://localhost:7376';
  debug: boolean = true;

  // initialize to undefined so they are not reactive
  context: CanvasRenderingContext2D | undefined = undefined;
  canvas: HTMLCanvasElement | undefined = undefined;
  ws: WebSocket | undefined = undefined;
  buf: ArrayBuffer | undefined = undefined;
  buf8: Uint8ClampedArray | undefined = undefined;
  data: Uint32Array | undefined = undefined;
  rerender: boolean = true;

  pressed: number = 0;

  get serviceId(): string {
    return this.$route.params.id;
  }

  log(logline) {
    if (this.debug === true) {
      console.log(logline); // eslint-disable-line
    }
  }

  beforeMount() {
    this.preventReconnection = false;
  }

  renderCanvas() {
    if (this.context !== undefined && this.buf8 !== undefined) {
      const imagedata = this.context.createImageData(this.width, this.height);
      imagedata.data.set(this.buf8);
      this.context.putImageData(imagedata, 0, 0);
      this.rerender = false;
    }
  }

  mounted() {
    this.canvas = this.$refs['screen-canvas'] as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d') || undefined;

    this.canvas.addEventListener<'mousedown'>('mousedown', this.onMouseDown);
    this.canvas.addEventListener<'mouseup'>('mouseup', this.onMouseUp);
    this.canvas.addEventListener<'mousemove'>('mousemove', this.onMouseMove);

    const ctx = this.context;
    if (ctx !== undefined) {
      this.buf = new ArrayBuffer(this.width * this.height * 4);
      this.buf8 = new Uint8ClampedArray(this.buf);
      this.data = new Uint32Array(this.buf);

      for (let i = 0; i < this.width * this.height; i += 1) {
        this.data[i] = 255 << 24; // initalize alpha to 255, leave black
      }
      this.renderCanvas();
    }

    this.setupSocket();

    window.setInterval(this.renderCanvas, 100); // 10 frames per second max
  }

  beforeDestroy() {
    this.preventReconnection = true;
    this.closeSocket();
    this.context = undefined;
    this.canvas = undefined;
  }

  closeSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
      this.connecting = false;
      this.connected = false;
    }
  }

  getMousePos(evt) {
    if (this.canvas !== undefined) {
      return {
        x: evt.clientX - this.canvas.offsetLeft,
        y: evt.clientY - this.canvas.offsetTop,
      };
    }
    return {
      x: 0,
      y: 0,
    };
  }

  onMouseDown(evt) {
    this.log(`mousedown ${evt} ${evt.button}`);
    if (evt.button === 0) {
      this.pressed += 1;
      this.touchscreen(evt);
    }
  }

  onMouseUp(evt) {
    this.log(`mouseup ${evt} ${evt.button}`);
    if (evt.button === 0) {
      this.pressed -= 1;
      this.touchscreen(evt);
    }
  }

  onMouseMove(evt) {
    if (this.pressed > 0) {
      this.touchscreen(evt);
    }
  }

  touchscreen(evt) {
    const { x, y } = this.getMousePos(evt);
    if (this.connected && this.ws !== undefined) {
      this.log(`sending touch ${x},${y},${this.pressed}`);
      const buf = new ArrayBuffer(5);
      const view = new DataView(buf);
      view.setInt8(0, this.pressed ? 1 : 2); // command
      view.setUint16(1, x, true);
      view.setUint16(3, y, true);
      this.ws.send(buf);
    } else {
      this.log('no touch event sent - not connected');
    }
  }

  setupSocket() {
    try {
      this.createSocket();
    } catch (e) {
      this.log(e);
      this.rescheduleSetup();
    }
  }

  createSocket() {
    const ws = new WebSocket(this.url);
    this.log('connecting');
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.connecting = true;

    ws.onopen = () => {
      this.connecting = false;
      this.connected = true;
      this.log('Websocket connected');
    };

    ws.onmessage = (msg: MessageEvent) => {
      this.handleScreenUpdate(new DataView(msg.data), msg.data.byteLength);
    };

    ws.onclose = () => {
      this.log('Websocket disconnected');
      this.closeSocket();
      this.rescheduleSetup();
    };
  }

  rescheduleSetup() {
    if (!this.preventReconnection) {
      this.log('rescheduling socket connect in 1000 ms');

      setTimeout(() => {
        this.closeSocket();
        this.log('Websocket reconnecting');
        this.setupSocket();
      }, 1000);
    }
  }

  handleScreenUpdate(buffer: DataView, length: number) {
    let index = 0;
    while (index < length && this.data !== undefined) {
      const addr = buffer.getUint32(index, true);
      const color = buffer.getUint32(index + 4, true);

      const rr = ((color >>> 11) % 32);
      const gg = ((color >>> 5) % 64);
      const bb = ((color >>> 0) % 32);

      const r = (rr << 3) | ((rr >>> 2) & 7);
      const g = (gg << 2) | ((gg >>> 3) & 3);
      const b = (bb << 3) | ((bb >>> 2) & 7);

      this.data[addr] = (255 << 24) | // alpha
        (b << 16) | // blue
        (g << 8) | // green
        r; // red

      index += 8;
    }
    this.rerender = true;
  }
}
</script>

<template>
  <div class="page">
    <div class="header">Remote display for {{ serviceId }}</div>
    <div class="container">
      <div class="background">
        <div class="display">
          <canvas
            ref="screen-canvas"
            :hidden="!connected"
            :width="width"
            :height="height"
            class="view"
          />
          <div :hidden="connected" :width="width" :height="height" class="glass"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: block;
  margin: 0 auto;
  width: 600px;
  text-align: center;
  padding: 20px;
}

.container {
  display: block;
  margin: 0 auto;
  width: 640px;
  height: 480px;
}

.display {
  margin: 0 auto;
}

.glass,
.view {
  display: block;
  margin: 0 auto;
  width: 320px;
  height: 240px;
}

.glass {
  background-color: rgba(255, 255, 255, 0.75);
  filter: blur(5px);
  display: none;
}
</style>
