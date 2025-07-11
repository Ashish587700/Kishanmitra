require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);

app.use(cors());
// Mongo Connection

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'view/js')));

app.use('/view', express.static(path.join(__dirname, 'view/js/')));
app.use('../view/js/', express.static(path.join(__dirname, 'view/js/')));
app.use('../view/js/', express.static(path.join(__dirname, '/view/js/')));
app.use('/view/js/', express.static(path.join(__dirname, 'view/js/')));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'/view/index.html'));
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT)))
  .catch(err => console.error(err));
