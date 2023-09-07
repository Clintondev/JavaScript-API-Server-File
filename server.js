const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const users = {};
users[process.env.ADMIN_NAME] = process.env.ADMIN_PASSWORD;

app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;
  const userCredentials = {
    username: process.env.USER_NAME,
    password: process.env.USER_PASSWORD,
  };
  const adminCredentials = {
    username: process.env.ADMIN_NAME,
    password: process.env.ADMIN_PASSWORD,
  };

  let userType = null; // Inicialmente, o tipo de usuário é nulo

  if (username === userCredentials.username && password === userCredentials.password) {
    userType = 'user';
  } else if (username === adminCredentials.username && password === adminCredentials.password) {
    userType = 'admin';
  }

  if (userType) {
    // Gere um token JWT com um prazo de validade (por exemplo, 1 hora)
    const token = jwt.sign({ userType }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Autenticação bem-sucedida', userType, token });
  } else {
    res.status(401).json({ error: 'Nome de usuário ou senha incorretos' });
  }
});


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});


// Configuração para o multer (para o upload de arquivos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // A pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // Limite de tamanho do arquivo (1MB)
});

// Define uma rota para servir os arquivos da interface web
app.use(express.static(path.join(__dirname, 'public')));

// Define uma rota para upload de arquivos
app.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    // Lógica do upload

    res.json({ message: 'Arquivo enviado com sucesso' });
  } catch (err) {
    next(err);
  }
});

// Define uma rota para listar os arquivos disponíveis para download
app.get('/list-files', (req, res, next) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('Erro ao listar os arquivos:', err);
        res.status(500).json({ error: 'Erro ao listar os arquivos' });
        return;
      }
      res.json(files);
    });
  } catch (err) {
    next(err);
  }
});

// Define uma rota para download de arquivos
app.get('/download/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send('Arquivo não encontrado');
    }
  } catch (err) {
    next(err);
  }
});

// Define uma rota para excluir arquivos
app.delete('/delete/:filename', (req, res, next) => {
  try {
    // Verifique se o usuário está autenticado
    if (!req.auth || !users[req.auth.user]) {
      return res.status(401).json({ error: 'Autenticação requerida' });
    }

    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.send('Arquivo excluído com sucesso');
    } else {
      res.status(404).send('Arquivo não encontrado');
    }
  } catch (err) {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
