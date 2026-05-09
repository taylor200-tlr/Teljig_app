require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
console.log("A beolvasott URI: ", process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Csatlakozás a MongoDB-hez
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ SIKER: Csatlakoztunk a MongoDB felhőhöz!"))
    .catch(err => console.error("❌ HIBA a csatlakozásnál:", err));

// Alap útvonal teszteléshez
app.get('/', (req, res) => {
    res.send("A szerver fut és várja az adatokat!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Szerver elindult a http://localhost:${PORT} címen`);
});
