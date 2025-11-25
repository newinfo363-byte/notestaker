import clientPromise from '../lib/mongodb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase limit for file uploads
    },
  },
};

export default async function handler(req: any, res: any) {
  const client = await clientPromise;
  if (!client) return res.status(500).json({ error: 'Database not connected' });

  const db = client.db("notesflow");
  const collection = db.collection("notes");

  try {
    if (req.method === 'GET') {
      const { topicId } = req.query;
      const query = topicId ? { topicId } : {};
      const notes = await collection.find(query).toArray();
      res.status(200).json(notes);
    } else if (req.method === 'POST') {
      const body = req.body;
      const newNote = { ...body, id: body.id || crypto.randomUUID(), createdAt: Date.now() };
      await collection.insertOne(newNote);
      res.status(201).json(newNote);
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