import express from 'express';
import dotenv from 'dotenv';
import { recoverMap } from './services/eventStore.services.js';
import eventsRoute from './routes/eventStore.routes.js'

dotenv.config();

const app = express();

//Middleware
app.use(express.json());

// Recover index from log file on startup
recoverMap()

//Routes
app.use('/events', eventsRoute)

const PORT = process.env.PORT ?? 3300;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});