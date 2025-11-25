import { MongoClient } from "mongodb";
import { Server } from "socket.io";

const uri = process.env.MONGO_URI;

// If MONGO_URI is not defined, we expose a null clientPromise so API routes can
// respond with a friendly error instead of crashing the build/runtime.
if (!uri) {
  console.warn("MONGO_URI is not defined. MongoDB-backed API routes will return 500.");
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (uri) {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
}

let io: Server | null = null;

export function initializeWebSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("disconnect", () => {
      console.log("A user disconnected: " + socket.id);
    });
  });
}

export function emitUpdate(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

export default clientPromise;
