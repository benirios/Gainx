-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 20-Maio-2026 às 12:09
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `loja_informatica`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `avaliacoes`
--

CREATE TABLE `avaliacoes` (
  `id` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `classificacao` int(11) DEFAULT NULL CHECK (`classificacao` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `categoria_pai` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `categoria_pai`) VALUES
(1, 'Portáteis', NULL),
(2, 'Gaming', NULL),
(3, 'Smartphones', NULL),
(4, 'Componentes', NULL),
(5, 'Periféricos', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `contactos`
--

CREATE TABLE `contactos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `assunto` varchar(150) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `encomendas`
--

CREATE TABLE `encomendas` (
  `id` int(11) NOT NULL,
  `utilizador_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(50) DEFAULT 'pendente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `itens_encomenda`
--

CREATE TABLE `itens_encomenda` (
  `id` int(11) NOT NULL,
  `encomenda_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pagamentos`
--

CREATE TABLE `pagamentos` (
  `id` int(11) NOT NULL,
  `encomenda_id` int(11) NOT NULL,
  `metodo_pagamento` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `pago_em` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `categoria_id` int(11) DEFAULT NULL,
  `especificacoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`especificacoes`)),
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `promocao` tinyint(1) DEFAULT 0,
  `imagens` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `stock`, `categoria_id`, `especificacoes`, `criado_em`, `promocao`, `imagens`) VALUES
(1, 'MacBook Pro 16 M3', 'MacBook Pro com chip M3, 16GB RAM, 512GB SSD. Ideal para profissionais.', 2499.99, 5, 1, NULL, '2026-05-20 09:51:35', 1, NULL),
(2, 'Dell XPS 13', 'Ultrabook com Intel Core i7, 8GB RAM, 512GB SSD. Portátil leve e poderoso.', 1299.99, 8, 1, NULL, '2026-05-20 09:51:35', 0, NULL),
(3, 'ASUS VivoBook 15', 'Portátil com Intel Core i5, 8GB RAM, 256GB SSD. Bom para uso quotidiano.', 599.99, 15, 1, NULL, '2026-05-20 09:51:35', 0, NULL),
(4, 'Lenovo ThinkPad X1', 'ThinkPad X1 com Intel Core i7, 16GB RAM, 512GB SSD. Fiável para negócios.', 1399.99, 6, 1, NULL, '2026-05-20 09:51:35', 0, NULL),
(5, 'HP Pavilion 15', 'HP Pavilion com Intel Core i5, 8GB RAM, 512GB SSD. Portátil versátil.', 699.99, 12, 1, NULL, '2026-05-20 09:51:35', 1, NULL),
(6, 'MSI RTX 4070 Gaming', 'PC Gaming com RTX 4070, i7 13º gen, 32GB RAM. Top performance.', 2199.99, 4, 2, NULL, '2026-05-20 09:51:35', 1, NULL),
(7, 'ASUS TUF Gaming A15', 'Laptop Gaming com RTX 3060, R7 5800H, 16GB RAM. Gaming portátil.', 1099.99, 7, 2, NULL, '2026-05-20 09:51:35', 0, NULL),
(8, 'Razer Blade 15', 'Razer Blade com RTX 4080, i9 13º gen, 16GB RAM, 4K display. Premium gaming.', 3299.99, 2, 2, NULL, '2026-05-20 09:51:35', 1, NULL),
(9, 'Alienware m17', 'Alienware m17 com RTX 4090, i9 13º gen, 32GB RAM. Máximo desempenho.', 3899.99, 3, 2, NULL, '2026-05-20 09:51:35', 0, NULL),
(10, 'ASUS ROG Strix', 'ROG Strix com RTX 4080, i7 13º gen, 32GB RAM. Gaming profissional.', 2799.99, 5, 2, NULL, '2026-05-20 09:51:35', 0, NULL),
(11, 'iPhone 15 Pro Max', 'iPhone 15 Pro Max com chip A17 Pro, 256GB. Topo de gama Apple.', 1299.99, 10, 3, NULL, '2026-05-20 09:51:35', 1, NULL),
(12, 'Samsung Galaxy S24', 'Galaxy S24 com Snapdragon 8 Gen 3, 256GB. Flagship Samsung.', 999.99, 12, 3, NULL, '2026-05-20 09:51:35', 0, NULL),
(13, 'Google Pixel 8 Pro', 'Pixel 8 Pro com Tensor G3, 256GB. Fotografia e IA.', 899.99, 8, 3, NULL, '2026-05-20 09:51:35', 0, NULL),
(14, 'OnePlus 12', 'OnePlus 12 com Snapdragon 8 Gen 3, 256GB. Performance e custo.', 749.99, 15, 3, NULL, '2026-05-20 09:51:35', 1, NULL),
(15, 'Xiaomi 14 Ultra', 'Xiaomi 14 Ultra com Snapdragon 8 Gen 3, 512GB. Valor e qualidade.', 699.99, 20, 3, NULL, '2026-05-20 09:51:35', 0, NULL),
(16, 'RTX 4070 Ti', 'Placa gráfica NVIDIA RTX 4070 Ti. Excelente para gaming e workstation.', 799.99, 6, 4, NULL, '2026-05-20 09:51:35', 1, NULL),
(17, 'Intel Core i9-13900K', 'Processador Intel Core i9 13º gen. 24 cores de puro desempenho.', 599.99, 4, 4, NULL, '2026-05-20 09:51:35', 0, NULL),
(18, 'DDR5 64GB (2x32GB) 6000MHz', 'Kit de RAM DDR5 64GB, 6000MHz CAS 30. Rápida e fiável.', 349.99, 10, 4, NULL, '2026-05-20 09:51:35', 1, NULL),
(19, 'Samsung 990 Pro NVMe 2TB', 'SSD Samsung 990 Pro 2TB NVMe. Velocidades até 7100MB/s.', 249.99, 8, 4, NULL, '2026-05-20 09:51:35', 0, NULL),
(20, 'ASUS ProArt X870E', 'Motherboard ASUS ProArt X870E. Suporte DDR5 e PCIe 5.0.', 399.99, 5, 4, NULL, '2026-05-20 09:51:35', 0, NULL),
(21, 'Logitech MX Master 3S', 'Rato profissional Logitech MX Master 3S. Precisão e conforto.', 99.99, 20, 5, NULL, '2026-05-20 09:51:35', 1, NULL),
(22, 'Corsair K95 Platinum XT', 'Teclado mecânico Corsair K95. RGB e switches mecânicos.', 229.99, 10, 5, NULL, '2026-05-20 09:51:35', 0, NULL),
(23, 'SteelSeries Arctis Nova 7', 'Headset wireless SteelSeries Arctis Nova. Áudio premium.', 179.99, 15, 5, NULL, '2026-05-20 09:51:35', 1, NULL),
(24, 'BenQ PD2700U', 'Monitor BenQ 27\" 4K IPS. Ideal para design e fotografia.', 599.99, 4, 5, NULL, '2026-05-20 09:51:35', 0, NULL),
(25, 'ASUS ROG Swift 27\"', 'Monitor gaming 27\" 360Hz. Ultra rápido para FPS.', 449.99, 7, 5, NULL, '2026-05-20 09:51:35', 1, NULL),
(26, 'Elgato Stream Deck', 'Painel de controlo Elgato Stream Deck 15 teclas. Para streaming.', 149.99, 12, 5, NULL, '2026-05-20 09:51:35', 0, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `utilizadores`
--

CREATE TABLE `utilizadores` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `palavra_passe` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `admin` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `utilizadores`
--

INSERT INTO `utilizadores` (`id`, `nome`, `email`, `palavra_passe`, `criado_em`, `admin`) VALUES
(1, 'Admin InfoStore', 'admin@admin.com', '$2y$10$TW4M77ksrKPbN/bBgAr7peEABKVLmxM6fWzWIj.TpT2YzfQEiSU7G', '2026-05-20 09:51:35', 1),
(2, 'Utilizador Test', 'user@user.com', '$2y$10$Ag7fEyqNwlBXxLsAiM8s.e6bPLXNKDaXc8rGFvCJK0u6Kq7VV4dqS', '2026-05-20 09:51:35', 0),
(3, 'João Silva', 'joao@email.com', '$2y$10$NoxN8s1E6Fg4nwqMVyCQxubMRgFqAFBnl3m8LWq7o.mM0QvX6h4I2', '2026-05-20 09:51:35', 0),
(4, 'Maria Costa', 'maria@email.com', '$2y$10$Ag7fEyqNwlBXxLsAiM8s.e6bPLXNKDaXc8rGFvCJK0u6Kq7VV4dqS', '2026-05-20 09:51:35', 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilizador_id` (`utilizador_id`),
  ADD KEY `idx_avaliacoes_produto` (`produto_id`);

--
-- Índices para tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_pai` (`categoria_pai`);

--
-- Índices para tabela `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contactos_email` (`email`);

--
-- Índices para tabela `encomendas`
--
ALTER TABLE `encomendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_encomendas_utilizador` (`utilizador_id`);

--
-- Índices para tabela `itens_encomenda`
--
ALTER TABLE `itens_encomenda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `idx_itens_encomenda` (`encomenda_id`);

--
-- Índices para tabela `pagamentos`
--
ALTER TABLE `pagamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `encomenda_id` (`encomenda_id`);

--
-- Índices para tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_produtos_categoria` (`categoria_id`),
  ADD KEY `idx_produtos_promocao` (`promocao`);

--
-- Índices para tabela `utilizadores`
--
ALTER TABLE `utilizadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `encomendas`
--
ALTER TABLE `encomendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `itens_encomenda`
--
ALTER TABLE `itens_encomenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pagamentos`
--
ALTER TABLE `pagamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `utilizadores`
--
ALTER TABLE `utilizadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizadores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `categorias`
--
ALTER TABLE `categorias`
  ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`categoria_pai`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `encomendas`
--
ALTER TABLE `encomendas`
  ADD CONSTRAINT `encomendas_ibfk_1` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizadores` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `itens_encomenda`
--
ALTER TABLE `itens_encomenda`
  ADD CONSTRAINT `itens_encomenda_ibfk_1` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `itens_encomenda_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `pagamentos`
--
ALTER TABLE `pagamentos`
  ADD CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
