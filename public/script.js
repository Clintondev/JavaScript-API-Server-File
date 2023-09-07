document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  const modal = document.getElementById('modal');
  const confirmButton = document.getElementById('confirm-button');
  const cancelButton = document.getElementById('cancel-button');
  const fileInput = document.getElementById('fileInput'); 
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  let deletingFile = '';

    let isAdmin = false;


    const checkToken = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Enviar o token no cabeçalho de autorização para autenticar automaticamente o usuário
        fetch('/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Envia o token no cabeçalho da autorização
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              // Se o token estiver expirado ou inválido, remova-o do armazenamento local
              localStorage.removeItem('authToken');
            }
          })
          .then((data) => {
            if (data && data.userType) {
              userType = data.userType;
              showMessage('Autenticação automática bem-sucedida');
              updateUI(userType);
            }
          })
          .catch((error) => {
            console.error('Erro ao verificar o token:', error);
          });
      }
    };
    

  const openLoginModal = () => {
    loginModal.style.display = 'block';
  };

  openLoginModal();

  cancelButton.addEventListener('click', () => {
    closeModal();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    let response;

    try {
      response = await fetch('/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        closeModal();
        userType = data.userType; // Define o tipo de usuário com base na resposta do servidor
        showMessage('Autenticação bem-sucedida');
        // Atualize a interface do usuário com base no tipo de usuário aqui
        updateUI(userType);
      } else {
        showMessage('Nome de usuário ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao autenticar:', error);
    }
  });

  const updateUI = (userType) => {
    if (userType === 'user') {
      // Ocultar elementos que só são permitidos para administradores
      const uploadForm = document.querySelector('.upload-form');
      uploadForm.style.display = 'none';
      const deleteButtons = document.querySelectorAll('.delete-button');
      deleteButtons.forEach((button) => {
        button.style.display = 'none';
      });
      const titleContainer = document.getElementById('title-container');
      titleContainer.style.display = 'none';
    }
    // Mostrar elementos permitidos para ambos os tipos de usuários
    const fileList = document.getElementById('fileList');
    fileList.style.display = 'block';
    
  };
  
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
    loginModal.style.display = 'none';
    deletingFile = '';
    usernameInput.value = ''; // Limpe o campo de nome de usuário
    passwordInput.value = '';
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

  // Intercepte o envio do formulário e envie o arquivo via AJAX
  const uploadForm = document.querySelector('.upload-form');

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita o envio tradicional do formulário

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Limpe o campo de seleção de arquivo após o envio bem-sucedido
        fileInput.value = '';
        
        // Atualize a lista de arquivos após o envio bem-sucedido
        listFiles();
        showMessage('Arquivo enviado com sucesso!');
      } else {
        console.error('Erro ao enviar o arquivo:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
    }
  });

  // Função para exibir uma mensagem na página
  const showMessage = (message) => {
    const successModal = document.getElementById('success-modal');
    const modalContent = document.querySelector('#success-modal .modal-content');
    const successMessage = document.createElement('p');
    successMessage.textContent = message;
    successMessage.classList.add('success-message');

    modalContent.innerHTML = ''; // Limpa o conteúdo anterior do modal
    modalContent.appendChild(successMessage);
    successModal.style.display = 'block';

    // Fecha o modal após alguns segundos (opcional)
    setTimeout(() => {
      successModal.style.display = 'none';
    }, 3000); // Fecha o modal após 3 segundos (ajuste conforme necessário)
  };

  // Atualize a lista de arquivos quando a página for carregada
  listFiles();
});
