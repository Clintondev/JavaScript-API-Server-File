document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileInput');
  
    // Função para listar os arquivos disponíveis para download
    const listFiles = async () => {
      fileList.innerHTML = '';
      const response = await fetch('/list-files');
      const files = await response.json();
  
      files.forEach((file) => {
        const listItem = document.createElement('li');
        const downloadLink = document.createElement('a');
        downloadLink.href = `/download/${file}`;
        downloadLink.textContent = file;
        listItem.appendChild(downloadLink);
        fileList.appendChild(listItem);
      });
    };
  
    // Atualize a lista de arquivos quando a página for carregada
    listFiles();
  
    // Atualize a lista de arquivos após um novo arquivo ter sido enviado
    document.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
  
      try {
        await fetch('/upload', {
          method: 'POST',
          body: formData,
        });
        fileInput.value = ''; // Limpar o campo de seleção de arquivo
        listFiles(); // Atualizar a lista de arquivos
      } catch (error) {
        console.error('Erro ao enviar o arquivo:', error);
      }
    });
  });
  