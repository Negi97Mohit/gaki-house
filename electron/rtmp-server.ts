import NodeMediaServer from "node-media-server";

export class RtmpServer {
  private nms: any;

  constructor() {
    const config = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000,
        allow_origin: "*",
      },
    };

    // Initialize the server
    this.nms = new NodeMediaServer(config);
  }

  start() {
    if (this.nms) {
      this.nms.run();
      console.log("RTMP Server started");
    }
  }

  stop() {
    if (this.nms) {
      this.nms.stop();
      console.log("RTMP Server stopped");
    }
  }
}
