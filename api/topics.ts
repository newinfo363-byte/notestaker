import clientPromise from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  const client = await clientPromise;
  if (!client) return res.status(500).json({ error: 'Database not connected' });

  const db = client.db("notesflow");
  const collection = db.collection("topics");

  try {
    if (req.method === 'GET') {
      const { unitId } = req.query;
      const query = unitId ? { unitId } : {};
      const topics = await collection.find(query).toArray();
      res.status(200).json(topics);
    } else if (req.method === 'POST') {
      const body = req.body;
      const newTopic = { ...body, id: body.id || crypto.randomUUID() };
      await collection.insertOne(newTopic);
      res.status(201).json(newTopic);
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