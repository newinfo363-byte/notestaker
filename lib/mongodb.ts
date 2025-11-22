import { MongoClient } from "mongodb";

// Fallback to the provided URI if env var is missing
const DEFAULT_URI = "mongodb+srv://admin:J389RVSQR0t6Tpym@cluster0.blnyfyn.mongodb.net/notesflow?appName=Cluster0";
const uri = (typeof process !== 'undefined' && process.env.MONGO_URI) || DEFAULT_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Use globalThis instead of global to prevent TS errors in client/mixed environments
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

if (!globalWithMongo._mongoClientPromise) {
  // In production mode, it's best to not use a global variable.
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}
clientPromise = globalWithMongo._mongoClientPromise!;

// Exporting as default only if we are in a node environment to avoid crashing the client demo
const isNode = typeof process !== 'undefined' && (process as any).versions != null && (process as any).versions.node != null;

export default isNode ? clientPromise : null;