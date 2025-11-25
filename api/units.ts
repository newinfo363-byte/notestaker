import clientPromise from '../lib/mongodb';

export default async function handler(req: any, res: any) {
  const client = await clientPromise;
  if (!client) return res.status(500).json({ error: 'Database not connected' });

  const db = client.db("notesflow");
  const collection = db.collection("units");

  try {
    if (req.method === 'GET') {
      const { subjectId } = req.query;
      const query = subjectId ? { subjectId } : {};
      const units = await collection.find(query).toArray();
      res.status(200).json(units);
    } else if (req.method === 'POST') {
      const body = req.body;
      const newUnit = { ...body, id: body.id || crypto.randomUUID() };
      await collection.insertOne(newUnit);
      res.status(201).json(newUnit);
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