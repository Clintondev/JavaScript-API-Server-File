document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList');
    const modal = document.getElementById('modal');
    const confirmButton = document.getElementById('confirm-button');
    const cancelButton = document.getElementById('cancel-button');
    let deletingFile = ''; // Para armazenar o nome do arquivo a ser excluído
  
    // Função para listar os arquivos disponíveis para download
    const listFiles = async () => {
      fileList.innerHTML = '';
      try {
        const response = await fetch('/list-files');
        const files = await response.json();
  
        files.forEach((file) => {
          const listItem = document.createElement('li');
          const downloadLink = document.createElement('a');
          const deleteButton = document.createElement('button');
  
          downloadLink.href = `/download/${file}`;
          downloadLink.textContent = file;
          deleteButton.textContent = 'Excluir';
          deleteButton.classList.add('delete-button');
          deleteButton.setAttribute('data-filename', file); // Adicionar o nome do arquivo como atributo de dados
  
          listItem.appendChild(downloadLink);
          listItem.appendChild(deleteButton);
          fileList.appendChild(listItem);
  
          // Evento para abrir o modal quando o botão Excluir é clicado
          deleteButton.addEventListener('click', () => {
            const filename = deleteButton.getAttribute('data-filename');
            openModal(filename);
          });
        });
      } catch (error) {
        console.error('Erro ao listar os arquivos:', error);
      }
    };
  
    // Função para abrir o modal de confirmação
    const openModal = (filename) => {
      deletingFile = filename;
      modal.style.display = 'block';
    };
  
    // Função para fechar o modal de confirmação
    const closeModal = () => {
      modal.style.display = 'none';
      deletingFile = '';
    };
  
    // Função para excluir o arquivo
    const deleteFile = async (filename) => {
      try {
        const response = await fetch(`/delete/${filename}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          closeModal();
          listFiles(); // Atualize a lista de arquivos após a exclusão bem-sucedida
        } else {
          console.error('Erro ao excluir o arquivo:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao excluir o arquivo:', error);
      }
    };
  
    // Evento para fechar o modal quando o botão Cancelar é clicado
    cancelButton.addEventListener('click', () => {
      closeModal();
    });
  
    // Evento para excluir o arquivo quando o botão Confirmar é clicado
    confirmButton.addEventListener('click', async () => {
      if (deletingFile) {
        deleteFile(deletingFile);
      }
    });
  
    // Atualize a lista de arquivos quando a página for carregada
    listFiles();
  });
  