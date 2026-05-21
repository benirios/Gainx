<?php
include 'cabecalho.php';

$erro = '';
$sucesso = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $palavra_passe = $_POST['palavra_passe'] ?? '';
    $confirmar = $_POST['confirmar'] ?? '';

    if ($nome === '' || $email === '' || $palavra_passe === '' || $confirmar === '') {
        $erro = 'Preenche todos os campos.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Email invalido.';
    } elseif (strlen($palavra_passe) < 6) {
        $erro = 'A palavra-passe deve ter pelo menos 6 caracteres.';
    } elseif ($palavra_passe !== $confirmar) {
        $erro = 'As palavras-passe nao coincidem.';
    } else {
        $stmt = $conn->prepare('SELECT id FROM utilizadores WHERE email = ? LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $erro = 'Este email ja esta registado.';
        } else {
            $hash = password_hash($palavra_passe, PASSWORD_DEFAULT);
            $stmt2 = $conn->prepare('INSERT INTO utilizadores (nome, email, palavra_passe, criado_em) VALUES (?, ?, ?, NOW())');
            $stmt2->bind_param('sss', $nome, $email, $hash);

            if ($stmt2->execute()) {
                $sucesso = 'Conta criada com sucesso! Podes fazer login.';
            } else {
                $erro = 'Erro ao criar a conta. Tenta novamente.';
            }
        }
    }
}
?>

<style>
.reg-secao{display:flex;justify-content:center;padding:3rem 1rem}
.reg-card{background:var(--bg-secondary);border-radius:14px;padding:2.5rem 2rem;width:100%;max-width:460px;border-top:4px solid var(--accent);box-shadow:0 6px 30px var(--shadow);text-align:center}
.reg-card h2{font-size:1.4rem;color:var(--text-primary);margin-bottom:.3rem}
.reg-card .sub{font-size:.85rem;color:var(--text-secondary);margin-bottom:1.8rem}
.reg-card label{display:block;text-align:left;font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.35rem}
.reg-card input{width:100%;height:44px;background:var(--bg-primary);border:1.5px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.9rem;padding:0 1rem;outline:none;margin-bottom:1.2rem;transition:border-color .2s}
.reg-card input:focus{border-color:var(--accent)}
.reg-card input::placeholder{color:var(--text-secondary)}
.btn-registar{width:100%;height:46px;background:var(--accent);color:var(--bg-primary);font-size:1rem;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:filter .2s}
.btn-registar:hover{filter:brightness(1.05)}
.msg-erro{background:rgba(220,50,50,.12);color:#ef4444;border:1px solid rgba(220,50,50,.3);border-radius:8px;padding:.6rem .9rem;font-size:.85rem;margin-bottom:1.1rem}
.msg-sucesso{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:.7rem .9rem;font-size:.88rem;margin-bottom:1.1rem}
.rodape-reg{margin-top:1.3rem;font-size:.83rem;color:var(--text-secondary)}
.rodape-reg a{color:var(--accent);text-decoration:none;font-weight:600}
.rodape-reg a:hover{text-decoration:underline}
</style>

<section class="reg-secao">
    <div class="reg-card">
        <h2>Criar Conta</h2>
        <p class="sub">Junta-te a InfoStore</p>

        <?php if ($erro): ?>
            <div class="msg-erro">⚠ <?= htmlspecialchars($erro) ?></div>
        <?php endif; ?>

        <?php if ($sucesso): ?>
            <div class="msg-sucesso">✓ <?= htmlspecialchars($sucesso) ?></div>
        <?php endif; ?>

        <?php if (!$sucesso): ?>
        <form method="POST">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome"
                placeholder="O teu nome"
                value="<?= htmlspecialchars($_POST['nome'] ?? '') ?>" required>

            <label for="email">Email</label>
            <input type="email" id="email" name="email"
                placeholder="o-teu@email.com"
                value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>

            <label for="palavra_passe">Palavra-passe</label>
            <input type="password" id="palavra_passe" name="palavra_passe"
                placeholder="Minimo 6 caracteres" required>

            <label for="confirmar">Confirmar Palavra-passe</label>
            <input type="password" id="confirmar" name="confirmar"
                placeholder="Repete a palavra-passe" required>

            <button type="submit" class="btn-registar">Criar Conta</button>
        </form>
        <?php endif; ?>

        <div class="rodape-reg">
            Ja tens conta? <a href="login.php">Inicia sessao aqui</a>
        </div>
    </div>
</section>

<?php include 'rodape.php'; ?>
