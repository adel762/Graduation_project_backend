import express from 'express';
import dotenv from 'dotenv';

import sequelize from './src/config/db.js';
import userRoutes from './src/Routes/user.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

// routes
app.use('/api/users', userRoutes);

// DB connection
sequelize.sync()
  .then(() => {
    console.log('DB Connected ✅');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`);
    });
  })
  .catch(err => console.log(err));