const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração para o multer (para o upload de arquivos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // A pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Define uma rota para servir os arquivos da interface web
app.use(express.static(path.join(__dirname, 'public')));

// Define uma rota para upload de arquivos
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'Arquivo enviado com sucesso' });
});


// Define uma rota para listar os arquivos disponíveis para download
app.get('/list-files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Erro ao listar os arquivos:', err);
      res.status(500).json({ error: 'Erro ao listar os arquivos' });
      return;
    }
    res.json(files);
  });
});

// Define uma rota para download de arquivos
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Arquivo não encontrado');
  }
});

// Define uma rota para excluir arquivos
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send('Arquivo excluído com sucesso');
  } else {
    res.status(404).send('Arquivo não encontrado');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
