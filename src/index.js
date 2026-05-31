import express from 'express';
import dotenv from 'dotenv';
import { recoverMap } from './services/eventStore.services';

dotenv.config();

const app = express();

//Middleware
app.use(express.json());

recoverMap()

const PORT = process.env.PORT ?? 3300;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});