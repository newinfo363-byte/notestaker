import clientPromise from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  const client = await clientPromise;
  if (!client) return res.status(500).json({ error: 'Database not connected' });
  
  const db = client.db("notesflow");
  const collection = db.collection("sections");

  try {
    if (req.method === 'GET') {
      const { branchId } = req.query;
      const query = branchId ? { branchId } : {};
      const sections = await collection.find(query).toArray();
      res.status(200).json(sections);
    } else if (req.method === 'POST') {
      const body = req.body;
      const newSection = { ...body, id: body.id || crypto.randomUUID(), createdAt: Date.now() };
      await collection.insertOne(newSection);
      res.status(201).json(newSection);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await collection.deleteOne({ id });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}