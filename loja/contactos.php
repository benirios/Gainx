<?php
include 'cabecalho.php';

$erro = '';
$sucesso = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $assunto = trim($_POST['assunto'] ?? '');
    $mensagem = trim($_POST['mensagem'] ?? '');

    if ($nome === '' || $email === '' || $assunto === '' || $mensagem === '') {
        $erro = 'Preenche todos os campos.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Email invalido.';
    } else {
        $stmt = $conn->prepare('INSERT INTO contactos (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $nome, $email, $assunto, $mensagem);

        if ($stmt->execute()) {
            $sucesso = 'Mensagem enviada com sucesso!';
        } else {
            $erro = 'Erro ao enviar a mensagem. Tenta novamente.';
        }
    }
}
?>

<style>
.contacto-secao{display:flex;justify-content:center;padding:3rem 1rem}
.contacto-card{background:var(--bg-secondary);border-radius:14px;padding:2.5rem 2rem;width:100%;max-width:520px;border-top:4px solid var(--accent);box-shadow:0 6px 30px var(--shadow)}
.contacto-card h2{text-align:center;margin-bottom:6px;color:var(--text-primary)}
.contacto-card .sub{text-align:center;font-size:.9rem;color:var(--text-secondary);margin-bottom:1.6rem}
.contacto-card label{display:block;text-align:left;font-size:.78rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.35rem}
.contacto-card input,.contacto-card textarea{width:100%;background:var(--bg-primary);border:1.5px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:.9rem;padding:0 1rem;outline:none;margin-bottom:1.2rem;transition:border-color .2s}
.contacto-card input{height:44px}
.contacto-card textarea{padding-top:.8rem;resize:vertical}
.contacto-card input:focus,.contacto-card textarea:focus{border-color:var(--accent)}
.btn-contacto{width:100%;height:46px;background:var(--accent);color:var(--bg-primary);font-size:1rem;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:filter .2s}
.btn-contacto:hover{filter:brightness(1.05)}
.msg-erro{background:rgba(220,50,50,.12);color:#ef4444;border:1px solid rgba(220,50,50,.3);border-radius:8px;padding:.6rem .9rem;font-size:.85rem;margin-bottom:1.1rem;text-align:center}
.msg-sucesso{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:.7rem .9rem;font-size:.88rem;margin-bottom:1.1rem;text-align:center}
.contacto-dados{display:grid;gap:8px;margin-bottom:1.6rem;color:var(--text-secondary);font-size:.9rem}
</style>

<section class="contacto-secao">
    <div class="contacto-card">
        <h2>Contactos</h2>
        <p class="sub">Fala connosco para suporte ou informacoes.</p>

        <?php if ($erro): ?>
            <div class="msg-erro">⚠ <?= htmlspecialchars($erro) ?></div>
        <?php endif; ?>

        <?php if ($sucesso): ?>
            <div class="msg-sucesso">✓ <?= htmlspecialchars($sucesso) ?></div>
        <?php endif; ?>

        <div class="contacto-dados">
            <div>Rua da Informatica, 11 - Leiria</div>
            <div>info@infostore.pt</div>
            <div>+351 676 676 676</div>
        </div>

        <form method="POST">
            <label for="nome">Nome</label>
            <input type="text" id="nome" name="nome" placeholder="O teu nome" value="<?= htmlspecialchars($_POST['nome'] ?? '') ?>" required>

            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="o-teu@email.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>

            <label for="assunto">Assunto</label>
            <input type="text" id="assunto" name="assunto" placeholder="Como podemos ajudar?" value="<?= htmlspecialchars($_POST['assunto'] ?? '') ?>" required>

            <label for="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" rows="4" placeholder="Escreve aqui..." required><?= htmlspecialchars($_POST['mensagem'] ?? '') ?></textarea>

            <button type="submit" class="btn-contacto">Enviar Mensagem</button>
        </form>
    </div>
</section>

<?php include 'rodape.php'; ?>
