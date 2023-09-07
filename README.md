# Projeto servidor de arquivos em Node.js com Docker Compose

Este projeto é uma aplicação Node.js que utiliza o Docker Compose para facilitar a configuração do ambiente de desenvolvimento e produção. Ele inclui instruções detalhadas sobre como configurar e executar o projeto em diferentes ambientes.

## Passo 1: Configurar o Arquivo .env

Antes de começar, você precisa configurar as variáveis de ambiente em um arquivo `.env`. Você pode usar o arquivo `.env.example` como exemplo. Preencha as informações necessárias, como credenciais de autenticação.


# Copie o arquivo de exemplo
```shell
cp .env.example .env
```
# Edite o arquivo .env com suas informações de autenticação

# Criar pasta `uploads` para armazenar os arquivos
```shell
mkdir uploads
```

## Passo 2: Instalar Docker e Docker Compose

Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina. Você pode baixá-los nas seguintes URLs:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Passo 3: Escolher o Ambiente

Este projeto suporta dois ambientes: desenvolvimento (dev) e produção (prod). Escolha qual ambiente você deseja executar e siga as instruções correspondentes abaixo.

### Ambiente de Desenvolvimento (dev)

Para configurar e executar o ambiente de desenvolvimento, siga estas etapas:

1. Certifique-se de que suas chaves de autenticação SSH estejam disponíveis no diretório `.ssh` do seu projeto.

2. Execute o seguinte comando para construir e iniciar o contêiner:

```shell
docker-compose -f docker-compose.dev.yml up --build -d
```
3. Execute o seguinte comando para entrar no bash do container:

```shell
docker exec -it NOME_DO_CONTAINER bash
```

1. Acesse a aplicação em seu navegador em http://localhost:3001.

### Ambiente de Desenvolvimento (prod)

Para configurar e executar o ambiente de desenvolvimento, siga estas etapas:

1. Certifique-se de que suas chaves de autenticação SSH estejam disponíveis no diretório `.ssh` do seu projeto.

2. Execute o seguinte comando para construir e iniciar o contêiner:

```shell
docker-compose -f docker-compose.prod.yml up --build
```
1. Acesse a aplicação em seu navegador em http://localhost:3001.

Lembre-se de que a porta pode variar dependendo das configurações definidas no arquivo `docker-compose.yml` para a aplicação. Certifique-se de acessar a porta correta.

### Como Fazer Push em Desenvolvimento

Se você está executando o ambiente de desenvolvimento (dev), lembre-se de que suas chaves de autenticação SSH devem estar disponíveis no diretório `.ssh` do projeto para permitir que você faça push para repositórios Git remotos. Certifique-se de copiar suas chaves SSH para esse diretório e seguir as instruções adequadas para adicionar e configurar suas chaves SSH.

### Problemas ou Dúvidas

Se você encontrar problemas ou tiver dúvidas sobre este projeto ou sua configuração, sinta-se à vontade para entrar em contato com a equipe de suporte ou verificar a documentação adicional fornecida.

Aproveite o desenvolvimento da sua aplicação Node.js com Docker Compose!