// index.js
import express from 'express';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT || 3000;

// Conecta a la base de datos usando el URL de Railway
console.log('DATABASE_URL actual:', process.env.DATABASE_URL);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json());

// Middleware para permitir que tu página web se conecte (CORS)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Permite cualquier origen
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Ruta para obtener todos los mensajes
app.get('/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// Ruta para agregar un nuevo mensaje
app.post('/messages', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }
    try {
        const result = await pool.query('INSERT INTO messages(text) VALUES($1) RETURNING *', [text]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
});

// Ruta para eliminar un mensaje por su ID
app.delete('/messages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM messages WHERE id = $1', [id]);
        res.status(204).send(); // 204: No Content (eliminado con éxito)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el mensaje' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
