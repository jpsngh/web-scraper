import { MongoClient }  from"mongodb"
import fs from 'fs';

const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB connection URL
const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    seedData();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    
    console.log('Disconnected from MongoDB');
  }
}

export async function seedData() {
  try {
    const db = client.db('NewsApp'); // Replace with your MongoDB database name
    const collection = db.collection('gtanews'); // Replace with your MongoDB collection name

    // Read the JSON file
    const jsonData = fs.readFileSync('news_data.json', 'utf8');

    // Parse the JSON data
    const data = JSON.parse(jsonData);

    // Insert the data into the collection
    await collection.insertMany(data);

    console.log('Data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
  client.close();
}

connectToMongoDB();
