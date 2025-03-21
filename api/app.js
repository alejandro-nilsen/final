const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'userpassword',
  database: process.env.MYSQL_DATABASE || 'testdb',
};

// Middleware para conectar a MySQL
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
    throw new Error('Error al conectar a MySQL');
  }
}

// Crear la tabla si no existe
async function initializeDatabase() {
  const connection = await getConnection();
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL
    )
  `);
  await connection.end();
}

// Inicializar la base de datos al arrancar
initializeDatabase().catch(err => console.error(err));

// Endpoint raíz
app.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.ping();
    res.status(200).send('Estoy agarrando señal desde MySQL :!');
    await connection.end();
  } catch (error) {
    res.status(500).send('Error al conectar a MySQL');
  }
});

// Crear un usuario
app.post('/create', async (req, res) => {
  const { name, value } = req.body;
  if (!name || !value) {
    return res.status(400).json({ message: 'Faltan campos: name y value son requeridos' });
  }
  try {
    const connection = await getConnection();
    const [result] = await connection.execute('INSERT INTO users (name, value) VALUES (?, ?)', [name, value]);
    res.status(201).json({ message: 'record created', id: result.insertId });
    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
});

// Leer todos los usuarios
app.get('/read', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM users');
    res.status(200).json(rows);
    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al leer los usuarios', error });
  }
});

// Actualizar un usuario
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value } = req.body;
  if (!name || !value) {
    return res.status(400).json({ message: 'Faltan campos: name y value son requeridos' });
  }
  try {
    const connection = await getConnection();
    const [result] = await connection.execute('UPDATE users SET name = ?, value = ? WHERE id = ?', [name, value, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'updated' });
    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
});

// Eliminar un usuario
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await getConnection();
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'deleted' });
    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});