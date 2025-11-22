import clientPromise from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  const client = await clientPromise;
  if (!client) return res.status(500).json({ error: 'Database not connected' });
  
  const db = client.db("notesflow");
  const collection = db.collection("branches");

  try {
    if (req.method === 'GET') {
      const branches = await collection.find({}).toArray();
      res.status(200).json(branches);
    } else if (req.method === 'POST') {
      const body = req.body;
      const newBranch = { ...body, id: body.id || crypto.randomUUID(), createdAt: Date.now() };
      await collection.insertOne(newBranch);
      res.status(201).json(newBranch);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await collection.deleteOne({ id });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}