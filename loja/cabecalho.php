<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$host = "localhost";
$user = "root";
$password = "";
$database = "loja_informatica";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die('Erro de ligação: ' . $conn->connect_error);
}

$pagina_atual = basename($_SERVER['PHP_SELF']);
$area_admin = strpos($_SERVER['PHP_SELF'], '/administrador/') !== false;
$prefixo_raiz = $area_admin ? '../' : '';

$sessao_ativa = isset($_SESSION['id']);
$nome_utilizador = $_SESSION['nome'] ?? '';
$utilizador_admin = (int)($_SESSION['admin'] ?? 0) === 1;

$itens_no_carrinho = 0;
if (isset($_SESSION['carrinho']) && is_array($_SESSION['carrinho'])) {
    $itens_no_carrinho = array_sum(array_map('intval', $_SESSION['carrinho']));
}

function obterIconeProduto($categoria_id) {
    $svgs = [
        1 => [
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="15" y="15" width="70" height="50" rx="2"/><rect x="20" y="22" width="60" height="36" fill="var(--bg-secondary)"/><rect x="15" y="68" width="70" height="4" rx="1" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="12" y="18" width="76" height="48" rx="3"/><rect x="18" y="25" width="64" height="36" fill="var(--bg-secondary)"/><circle cx="25" cy="68" r="2"/><circle cx="50" cy="68" r="2"/><circle cx="75" cy="68" r="2"/><rect x="12" y="70" width="76" height="3" rx="1" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="18" y="16" width="64" height="46" rx="2"/><rect x="25" y="24" width="50" height="32" fill="var(--bg-secondary)"/><rect x="18" y="65" width="64" height="5" rx="1" fill="var(--accent)"/><line x1="30" y1="70" x2="70" y2="70"/></svg>',
        ],
        2 => [
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="20" y="12" width="60" height="70" rx="2"/><rect x="25" y="18" width="50" height="50" fill="var(--bg-secondary)"/><circle cx="35" cy="75" r="3" fill="var(--accent)"/><circle cx="50" cy="75" r="3" fill="var(--accent)"/><circle cx="65" cy="75" r="3" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="10" y="20" width="80" height="50" rx="3"/><rect x="18" y="28" width="64" height="34" fill="var(--bg-secondary)"/><circle cx="22" cy="68" r="2" fill="var(--accent)"/><circle cx="50" cy="68" r="2" fill="var(--accent)"/><circle cx="78" cy="68" r="2" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><path d="M40 30 L50 15 L60 30 L60 70 L40 70 Z" fill="var(--bg-secondary)"/><circle cx="45" cy="50" r="4" fill="var(--accent)"/><circle cx="55" cy="50" r="4" fill="var(--accent)"/><line x1="35" y1="40" x2="65" y2="40"/></svg>',
        ],
        3 => [
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="25" y="10" width="50" height="80" rx="4"/><rect x="30" y="16" width="40" height="62" fill="var(--bg-secondary)" rx="2"/><circle cx="50" cy="82" r="2" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="22" y="12" width="56" height="76" rx="3"/><rect x="28" y="18" width="44" height="60" fill="var(--bg-secondary)"/><rect x="26" y="81" width="48" height="3" rx="1" fill="var(--accent)"/></svg>',
        ],
        4 => [
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="20" y="25" width="60" height="35" fill="var(--accent)"/><circle cx="30" cy="35" r="2"/><circle cx="40" cy="35" r="2"/><circle cx="50" cy="35" r="2"/><circle cx="60" cy="35" r="2"/><circle cx="70" cy="35" r="2"/><circle cx="30" cy="50" r="2"/><circle cx="40" cy="50" r="2"/><circle cx="50" cy="50" r="2"/><circle cx="60" cy="50" r="2"/><circle cx="70" cy="50" r="2"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="35" y="30" width="30" height="40" fill="var(--bg-secondary)"/><rect x="38" y="33" width="24" height="12" fill="var(--accent)"/><circle cx="40" cy="50" r="1.5"/><circle cx="45" cy="50" r="1.5"/><circle cx="50" cy="50" r="1.5"/><circle cx="55" cy="50" r="1.5"/><circle cx="60" cy="50" r="1.5"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><circle cx="50" cy="50" r="25"/><line x1="35" y1="35" x2="65" y2="35"/><line x1="30" y1="50" x2="70" y2="50"/><line x1="35" y1="65" x2="65" y2="65"/><circle cx="50" cy="50" r="4" fill="var(--accent)"/></svg>',
        ],
        5 => [
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><ellipse cx="50" cy="45" rx="20" ry="18"/><circle cx="40" cy="35" r="3" fill="var(--accent)"/><circle cx="60" cy="35" r="3" fill="var(--accent)"/><circle cx="35" cy="50" r="2.5"/><circle cx="50" cy="52" r="2.5"/><circle cx="65" cy="50" r="2.5"/><path d="M50 65 L48 75 L52 75 Z"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><rect x="15" y="25" width="70" height="40" rx="2"/><line x1="25" y1="32" x2="25" y2="58"/><line x1="35" y1="32" x2="35" y2="58"/><line x1="45" y1="32" x2="45" y2="58"/><line x1="55" y1="32" x2="55" y2="58"/><line x1="65" y1="32" x2="65" y2="58"/><line x1="75" y1="32" x2="75" y2="58"/><rect x="15" y="65" width="70" height="12" rx="1" fill="var(--accent)"/></svg>',
            '<svg viewBox="0 0 100 100" fill="none" stroke="var(--text-primary)" stroke-width="1.5"><path d="M35 35 Q35 25 45 22 Q55 25 55 35"/><rect x="38" y="35" width="24" height="35" rx="2" fill="var(--bg-secondary)"/><rect x="36" y="38" width="28" height="3" fill="var(--accent)"/><path d="M30 72 L25 82 L30 85 L35 80 Z"/></svg>',
        ],
    ];
    $icones_categoria = $svgs[$categoria_id] ?? $svgs[1];
    $indice_aleatorio = array_rand($icones_categoria);
    return $icones_categoria[$indice_aleatorio];
}
?>


<!DOCTYPE html>
<html lang="pt" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InfoStore — Loja de Informática</title>
    <link rel="stylesheet" href="<?= $prefixo_raiz ?>assets/loja.css">

<body>

    <header class="site-header">
        <div class="header-inner">
            <a href="<?= $prefixo_raiz ?>index.php" class="logo">
                <span class="logo-mark">IS</span>
                InfoStore
            </a>
            <form class="search-bar" action="<?= $prefixo_raiz ?>pesquisa.php" method="GET">
                <input type="text" name="q" placeholder="Pesquisar produtos..." required>
                <button type="submit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
            </form>
            <div class="header-actions">
                <button class="theme-toggle" id="themeToggle" aria-label="Alternar tema">
                    <svg id="sunIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block;">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <svg id="moonIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </button>
                <a href="<?= $prefixo_raiz ?>carrinho.php" class="header-cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span class="header-cart-count"><?= $itens_no_carrinho ?></span>
                </a>
            </div>
        </div>
    </header>

    <nav class="site-nav">
        <div class="nav-inner">
            <ul>
                <li>
                    <a href="<?= $prefixo_raiz ?>index.php" class="<?= !$area_admin && $pagina_atual === 'index.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Inicio
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>portateis.php" class="<?= !$area_admin && $pagina_atual === 'portateis.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="2" y1="17" x2="22" y2="17"></line>
                        </svg>
                        Portateis
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>gaming.php" class="<?= !$area_admin && $pagina_atual === 'gaming.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="6" y1="9" x2="6" y2="20"></line>
                            <line x1="18" y1="9" x2="18" y2="20"></line>
                            <path d="M4 12h16"></path>
                            <path d="M5 8c0-1 .895-2 2-2h10c1.105 0 2 1 2 2"></path>
                        </svg>
                        Gaming
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>componentes.php" class="<?= !$area_admin && $pagina_atual === 'componentes.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        Componentes
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>perifericos.php" class="<?= !$area_admin && $pagina_atual === 'perifericos.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                        Periféricos
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>promocoes.php" class="<?= !$area_admin && $pagina_atual === 'promocoes.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        Promocoes
                    </a>
                </li>
                <li>
                    <a href="<?= $prefixo_raiz ?>contactos.php" class="<?= !$area_admin && $pagina_atual === 'contactos.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Contactos
                    </a>
                </li>
                <?php if ($utilizador_admin): ?>
                <li>
                    <a href="<?= $prefixo_raiz ?>administrador/index.php" class="<?= $pagina_atual === 'index.php' && $area_admin ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="7" r="4"></circle>
                            <path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>
                        </svg>
                        Admin
                    </a>
                </li>
                <?php endif; ?>
                <li>
                    <a href="<?= $prefixo_raiz ?>login.php" class="<?= !$area_admin && $pagina_atual === 'login.php' ? 'ativo' : '' ?>">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        <?= $sessao_ativa ? 'Conta' : 'Entrar' ?>
                    </a>
                </li>
                <?php if ($sessao_ativa): ?>
                <li>
                    <a href="<?= $prefixo_raiz ?>login.php?logout=1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sair
                    </a>
                </li>
                <?php endif; ?>
            </ul>
        </div>
    </nav>

    <div class="faixa-promo">
        Envio grátis em compras acima de <strong>€75</strong> · Garantia oficial em todos os produtos
    </div>

    <main>
        <div class="container">