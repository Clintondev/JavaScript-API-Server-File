const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth'); // Middleware para autenticação básica

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de autenticação básica
const users = {
  admin: 'senhaadmin', // Adicione os pares nome de usuário e senha aqui
};

app.use(basicAuth({
  users,
  challenge: true, // Desafiar os clientes a fornecer credenciais
}));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'O arquivo é muito grande' });
  }
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
