const express = require('express');
const bodyParser = require('body-parser');
const { init } = require('./db');

const authRoutes = require('./routes/auth');
const dropsRoutes = require('./routes/drops');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(bodyParser.json());

init();

app.use('/auth', authRoutes);
app.use('/drops', dropsRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.json({ ok: true, service: 'DropSpot backend' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`DropSpot backend listening on ${PORT}`));
