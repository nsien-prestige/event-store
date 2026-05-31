import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

//Middleware
app.use(express.json());

const PORT = process.env.PORT ?? 3300;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});