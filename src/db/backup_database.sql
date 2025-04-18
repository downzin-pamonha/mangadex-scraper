-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 18/04/2025 às 02:11
-- Versão do servidor: 10.11.10-MariaDB
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u414370027_db_lunaryroll`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_artistas`
--

CREATE TABLE `tb_artistas` (
  `artista_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `biografia` text DEFAULT NULL,
  `foto_url` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_autores`
--

CREATE TABLE `tb_autores` (
  `autor_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `biografia` text DEFAULT NULL,
  `foto_url` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_capitulos`
--

CREATE TABLE `tb_capitulos` (
  `capitulo_id` int(11) NOT NULL,
  `manga_id` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `volume` varchar(20) DEFAULT NULL,
  `data_publicacao` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_editoras`
--

CREATE TABLE `tb_editoras` (
  `editora_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `logo_url` varchar(512) DEFAULT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_generos`
--

CREATE TABLE `tb_generos` (
  `genero_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_idiomas`
--

CREATE TABLE `tb_idiomas` (
  `idioma_id` int(11) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_mangas`
--

CREATE TABLE `tb_mangas` (
  `manga_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `titulo_original` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `capa_url` varchar(512) DEFAULT NULL,
  `status` enum('em_andamento','completo','hiatus','cancelado') NOT NULL,
  `data_publicacao` date DEFAULT NULL,
  `classificacao` enum('Livre','12+','16+','18+') NOT NULL,
  `autor_id` int(11) DEFAULT NULL,
  `artista_id` int(11) DEFAULT NULL,
  `editora_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_manga_generos`
--

CREATE TABLE `tb_manga_generos` (
  `manga_id` int(11) NOT NULL,
  `genero_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_manga_idiomas`
--

CREATE TABLE `tb_manga_idiomas` (
  `manga_id` int(11) NOT NULL,
  `idioma_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_paginas`
--

CREATE TABLE `tb_paginas` (
  `pagina_id` int(11) NOT NULL,
  `capitulo_id` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  `url` varchar(512) NOT NULL,
  `largura` int(11) DEFAULT NULL,
  `altura` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tb_artistas`
--
ALTER TABLE `tb_artistas`
  ADD PRIMARY KEY (`artista_id`);

--
-- Índices de tabela `tb_autores`
--
ALTER TABLE `tb_autores`
  ADD PRIMARY KEY (`autor_id`);

--
-- Índices de tabela `tb_capitulos`
--
ALTER TABLE `tb_capitulos`
  ADD PRIMARY KEY (`capitulo_id`),
  ADD UNIQUE KEY `manga_id` (`manga_id`,`numero`);

--
-- Índices de tabela `tb_editoras`
--
ALTER TABLE `tb_editoras`
  ADD PRIMARY KEY (`editora_id`);

--
-- Índices de tabela `tb_generos`
--
ALTER TABLE `tb_generos`
  ADD PRIMARY KEY (`genero_id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Índices de tabela `tb_idiomas`
--
ALTER TABLE `tb_idiomas`
  ADD PRIMARY KEY (`idioma_id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Índices de tabela `tb_mangas`
--
ALTER TABLE `tb_mangas`
  ADD PRIMARY KEY (`manga_id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `autor_id` (`autor_id`),
  ADD KEY `artista_id` (`artista_id`),
  ADD KEY `editora_id` (`editora_id`);

--
-- Índices de tabela `tb_manga_generos`
--
ALTER TABLE `tb_manga_generos`
  ADD PRIMARY KEY (`manga_id`,`genero_id`),
  ADD KEY `genero_id` (`genero_id`);

--
-- Índices de tabela `tb_manga_idiomas`
--
ALTER TABLE `tb_manga_idiomas`
  ADD PRIMARY KEY (`manga_id`,`idioma_id`),
  ADD KEY `idioma_id` (`idioma_id`);

--
-- Índices de tabela `tb_paginas`
--
ALTER TABLE `tb_paginas`
  ADD PRIMARY KEY (`pagina_id`),
  ADD UNIQUE KEY `capitulo_id` (`capitulo_id`,`ordem`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tb_artistas`
--
ALTER TABLE `tb_artistas`
  MODIFY `artista_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_autores`
--
ALTER TABLE `tb_autores`
  MODIFY `autor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_capitulos`
--
ALTER TABLE `tb_capitulos`
  MODIFY `capitulo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_editoras`
--
ALTER TABLE `tb_editoras`
  MODIFY `editora_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_generos`
--
ALTER TABLE `tb_generos`
  MODIFY `genero_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_idiomas`
--
ALTER TABLE `tb_idiomas`
  MODIFY `idioma_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_mangas`
--
ALTER TABLE `tb_mangas`
  MODIFY `manga_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_paginas`
--
ALTER TABLE `tb_paginas`
  MODIFY `pagina_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `tb_capitulos`
--
ALTER TABLE `tb_capitulos`
  ADD CONSTRAINT `tb_capitulos_ibfk_1` FOREIGN KEY (`manga_id`) REFERENCES `tb_mangas` (`manga_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tb_mangas`
--
ALTER TABLE `tb_mangas`
  ADD CONSTRAINT `tb_mangas_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `tb_autores` (`autor_id`),
  ADD CONSTRAINT `tb_mangas_ibfk_2` FOREIGN KEY (`artista_id`) REFERENCES `tb_artistas` (`artista_id`),
  ADD CONSTRAINT `tb_mangas_ibfk_3` FOREIGN KEY (`editora_id`) REFERENCES `tb_editoras` (`editora_id`);

--
-- Restrições para tabelas `tb_manga_generos`
--
ALTER TABLE `tb_manga_generos`
  ADD CONSTRAINT `tb_manga_generos_ibfk_1` FOREIGN KEY (`manga_id`) REFERENCES `tb_mangas` (`manga_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_manga_generos_ibfk_2` FOREIGN KEY (`genero_id`) REFERENCES `tb_generos` (`genero_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tb_manga_idiomas`
--
ALTER TABLE `tb_manga_idiomas`
  ADD CONSTRAINT `tb_manga_idiomas_ibfk_1` FOREIGN KEY (`manga_id`) REFERENCES `tb_mangas` (`manga_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_manga_idiomas_ibfk_2` FOREIGN KEY (`idioma_id`) REFERENCES `tb_idiomas` (`idioma_id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tb_paginas`
--
ALTER TABLE `tb_paginas`
  ADD CONSTRAINT `tb_paginas_ibfk_1` FOREIGN KEY (`capitulo_id`) REFERENCES `tb_capitulos` (`capitulo_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
