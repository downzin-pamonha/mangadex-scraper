<img align="center" src="./images/readme_banner.gif" style="width: 100%; height: auto;" />
<h1 align="center">📚 MangaDex Scraper e Database Manager 💻</h1>

> Um sistema completo em **Node.js + TypeScript** para coletar dados da [API MangaDex](https://api.mangadex.org), aplicar filtros e armazenar tudo de forma estruturada em um banco de dados **MySQL**.

<span align="center">

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)

</span>

## 📖 Visão Geral

Este projeto inclui:

- [x] 🔍 Scraper completo da API MangaDex;
- [x] 🗃️ Gerenciamento de conexão com banco de dados MySQL;
- [x] 🧠 Sistema de logging para debug e status;
- [x] ⚙️ Configuração via `.env`;
- [x] 📊 Parâmetros customizáveis para filtros de mangás;
- [x] 📁 Organização modular e extensível;
  
## 🛠️ Pré-requisitos

- Node.js 18 ou superior
- MySQL 8.0 ou superior
- Conta na MangaDex (para testes com endpoints autenticados, se necessário)

## 🧪 Configuração Inicial

### 1. Clone o repositório
```bash
    # clonar o repositório do MangaDex Scraper
    git clone https://github.com/downzin-pamonha/mangadex-scraper.git
```
### 2. Entre na pasta do projeto
```bash
    # Entrar na pasta do projeto
    cd mangadex-scraper
```

### 3. Instale as dependências
```bash
    # Instale as dependências
    npm install
```

### 4. Configure as variáveis de ambiente
```bash
    # Alterar o nome .env.example para .env
    cp .env.example .env
```
Edite o `.env` com suas informações:
```bash
# 🔧 Configurações do Banco de Dados
DB_HOST=host_database           # Endereço do servidor MySQL (ex: "localhost", "127.0.0.1", ou um domínio remoto)
DB_USER=user_database           # Nome do usuário do banco de dados
DB_PASSWORD=password_database   # Senha do banco de dados
DB_NAME=name_database           # Nome do banco de dados que será utilizado
DB_PORT=3306                    # Porta de conexão do MySQL (geralmente 3306)

# 🕒 Delays entre requisições para evitar sobrecarga na API
API_DELAY=1000                  # Tempo (ms) entre requisições gerais à API
CHAPTER_DELAY=500               # Tempo (ms) entre requisições de capítulos
PAGE_DELAY=300                  # Tempo (ms) entre requisições de páginas
MANGA_DELAY=2000                # Tempo (ms) entre requisições de mangás
BATCH_DELAY=5000                # Tempo (ms) entre lotes de processamento (por exemplo, salvar várias entradas de uma vez)

# 📊 Parâmetros de controle do processamento de mangás
MANGA_LIMIT=100                 # Número máximo de mangás processados por execução
MAX_MANGAS=10000                # Quantidade total máxima de mangás que o sistema pode lidar
MIN_CHAPTERS=5                  # Número mínimo de capítulos que um mangá deve ter para ser considerado
```

### 🏗️ Estrutura do Projeto

```bash
mangadex-scraper/
├── src/
│   ├── config/          # Configurações do app
│   ├── db/              # Backup database Mysql
│   ├── interfaces/      # Tipos TypeScript
│   ├── services/        # Lógica principal
│   ├── utils/           # Utilitários
│   └── index.ts         # Ponto de entrada
├── .env                 # Variáveis de ambiente
├── .env.example         # Modelo de configuração
├── tsconfig.json        # Config TS
└── README.md            # Este arquivo
```

### 💻 Scripts Disponíveis

```bash
    # Desenvolvimento com recarregamento automático
    npm run dev
```
```bash
    # Build para produção
    npm run build
```
```bash
    # Executar o build em produção
    npm start
```
```bash
    # Formatador de código (Prettier)
    npm run prettier
```

### 🤝 Contribuindo
Quer colaborar? Siga os passos:

```bash
    # Faça um fork
    git checkout -b main

    # Faça suas mudanças
    git commit -m 'Adiciona nova feature'

    # Envie para seu repositório
    git push origin main

    # Crie um Pull Request
```

### 📄 Licença
> Distribuído sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.


<section id="contato">
    <div align="center">
        <h1>💻 Contato</h1>
        <p><blockquote>😀 Se você tiver alguma sugestão, feedback ou quiser colaborar em um projeto, ficarei feliz em ouvi-lo! 😁 Estou constantemente buscando aprimorar minhas habilidades e expandir meu conhecimento nas diversas tecnologias que mencionei. A jornada de aprendizado é contínua e estou animado para explorar novas oportunidades e desafios.😸</blockquote></p>
        <div>
            <a href="mailto:dantasmatheus.contato@gmail.com">
                <img src="https://skillicons.dev/icons?i=gmail" alt="Gmail" />
            </a>
            <a href="https://https://www.linkedin.com/in/downzin">
                <img src="https://skillicons.dev/icons?i=linkedin" alt="linkedin" />
            </a>
            <a href="https://www.instagram.com/downzin_" rel="nofollow">
                <img src="https://skillicons.dev/icons?i=instagram" alt="Instagram" />
            </a>
            <a href="https://x.com/DownloaderChan1" rel="nofollow">
                <img src="https://skillicons.dev/icons?i=twitter" alt="X" />
            </a>
            <a href="https://discord.com/users/576935681167982595">
                <img src="https://skillicons.dev/icons?i=discord" alt="Discord" />
            </a>
        </div>
    </div>
</section>