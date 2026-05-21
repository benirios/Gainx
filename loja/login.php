<?php
if (session_status() === PHP_SESSION_NONE) {
	session_start();
}

if (isset($_GET['logout'])) {
	session_destroy();
	header('Location: login.php');
	exit;
}

include 'cabecalho.php';

$erro = '';
$sucesso = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$email = trim($_POST['email'] ?? '');
	$palavra_passe = $_POST['palavra_passe'] ?? '';

	if ($email === '' || $palavra_passe === '') {
		$erro = 'Preenche todos os campos.';
	} else {
		$stmt = $conn->prepare('SELECT id, nome, palavra_passe, admin FROM utilizadores WHERE email = ? LIMIT 1');
		$stmt->bind_param('s', $email);
		$stmt->execute();
		$result = $stmt->get_result();
		$utilizador = $result->fetch_assoc();

		if ($utilizador && password_verify($palavra_passe, $utilizador['palavra_passe'])) {
			$_SESSION['id'] = $utilizador['id'];
			$_SESSION['nome'] = $utilizador['nome'];
			$_SESSION['admin'] = (int)($utilizador['admin'] ?? 0);
			$sucesso = 'Sessao iniciada com sucesso.';
		} else {
			$erro = 'Email ou palavra-passe incorretos.';
		}
	}
}

$logado = isset($_SESSION['id']);
?>

<style>
.login-secao{display:flex;justify-content:center;padding:3rem 1rem}
.login-card{background:var(--bg-secondary);border-radius:14px;padding:2.5rem 2rem;width:100%;max-width:440px;border-top:4px solid var(--accent);box-shadow:0 6px 30px var(--shadow);text-align:center}
.login-card h2{font-size:1.4rem;color:var(--text-primary);margin-bottom:.3rem}
.login-card .sub{font-size:.85rem;color:var(--text-secondary);margin-bottom:1.8rem}
.login-card label{display:block;text-align:left;font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.35rem}
.login-card input[type="email"],
.login-card input[type="password"]{width:100%;height:44px;background:var(--bg-primary);border:1.5px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.9rem;padding:0 1rem;outline:none;margin-bottom:1.2rem;transition:border-color .2s}
.login-card input:focus{border-color:var(--accent)}
.login-card input::placeholder{color:var(--text-secondary)}
.login-card .btn-entrar{width:100%;height:46px;background:var(--accent);color:var(--bg-primary);font-size:1rem;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:filter .2s}
.login-card .btn-entrar:hover{filter:brightness(1.05)}
.msg-erro{background:rgba(220,50,50,.12);color:#ef4444;border:1px solid rgba(220,50,50,.3);border-radius:8px;padding:.6rem .9rem;font-size:.85rem;margin-bottom:1.1rem}
.msg-sucesso{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:.6rem .9rem;font-size:.85rem;margin-bottom:1.1rem}
.rodape-login{margin-top:1.3rem;font-size:.83rem;color:var(--text-secondary)}
.rodape-login a{color:var(--accent);text-decoration:none;font-weight:600}
.rodape-login a:hover{text-decoration:underline}
.logado-box .avatar{font-size:3rem;margin-bottom:.8rem}
.logado-box h3{color:var(--text-primary);font-size:1.2rem;margin-bottom:.4rem}
.logado-box p{color:var(--text-secondary);font-size:.88rem;margin-bottom:1.5rem}
.btn-logout{background:transparent;border:2px solid #ef4444;color:#ef4444;border-radius:8px;padding:.5rem 1.5rem;font-size:.9rem;font-weight:700;cursor:pointer;transition:background .2s,color .2s}
.btn-logout:hover{background:#ef4444;color:#fff}
</style>

<section class="login-secao">
	<div class="login-card">

		<?php if ($logado): ?>
			<div class="logado-box">
				<div class="avatar">👋</div>
				<h3>Ola, <?= htmlspecialchars($_SESSION['nome']) ?>!</h3>
				<p>Ja tens sessao iniciada.</p>
				<a href="login.php?logout=1">
					<button class="btn-logout">Terminar Sessao</button>
				</a>
			</div>

		<?php else: ?>
			<h2>Iniciar Sessao</h2>
			<p class="sub">Entra na tua conta da InfoStore</p>

			<?php if ($erro): ?>
				<div class="msg-erro">⚠ <?= htmlspecialchars($erro) ?></div>
			<?php endif; ?>
			<?php if ($sucesso): ?>
				<div class="msg-sucesso">✓ <?= htmlspecialchars($sucesso) ?></div>
			<?php endif; ?>

			<form method="POST">
				<label for="email">Email</label>
				<input type="email" id="email" name="email"
					placeholder="o-teu@email.com"
					value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>

				<label for="palavra_passe">Palavra-passe</label>
				<input type="password" id="palavra_passe" name="palavra_passe"
					placeholder="••••••••" required>

				<button type="submit" class="btn-entrar">Entrar</button>
			</form>

			<div class="rodape-login">
				Nao tens conta? <a href="registar.php">Regista-te aqui</a>
			</div>
		<?php endif; ?>

	</div>
</section>

<?php include 'rodape.php'; ?>