-- ─── Extensão pgvector ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "ecocoin_saldos" (
    "usuario_id" TEXT NOT NULL,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "total_ganho" INTEGER NOT NULL DEFAULT 0,
    "total_usado" INTEGER NOT NULL DEFAULT 0,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecocoin_saldos_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "ecocoin_transacoes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "saldo_apos" INTEGER NOT NULL,
    "descricao" TEXT,
    "referencia_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecocoin_transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecocoin_regras" (
    "tipo" TEXT NOT NULL,
    "valor_padrao" INTEGER NOT NULL,
    "limite_diario" INTEGER,
    "limite_total" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,

    CONSTRAINT "ecocoin_regras_pkey" PRIMARY KEY ("tipo")
);

-- CreateTable
CREATE TABLE "ecocoin_resgates" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "transacao_id" TEXT NOT NULL,
    "tipo_resgate" TEXT NOT NULL,
    "valor_ec" INTEGER NOT NULL,
    "valor_reais" DECIMAL(10,2),
    "parceiro_id" TEXT,
    "codigo_voucher" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "expira_em" TIMESTAMP(3),
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecocoin_resgates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "fonte" TEXT NOT NULL DEFAULT 'actahub-v1',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ecocoin_saldos" ADD CONSTRAINT "ecocoin_saldos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecocoin_transacoes" ADD CONSTRAINT "ecocoin_transacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecocoin_resgates" ADD CONSTRAINT "ecocoin_resgates_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecocoin_resgates" ADD CONSTRAINT "ecocoin_resgates_transacao_id_fkey" FOREIGN KEY ("transacao_id") REFERENCES "ecocoin_transacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Constraints CHECK adicionais ───────────────────────────
ALTER TABLE "ecocoin_saldos"     ADD CONSTRAINT "saldo_nao_negativo"  CHECK (saldo >= 0);
ALTER TABLE "ecocoin_transacoes" ADD CONSTRAINT "valor_nao_zero"       CHECK (valor != 0);
ALTER TABLE "ecocoin_transacoes" ADD CONSTRAINT "saldo_apos_nao_neg"   CHECK (saldo_apos >= 0);

-- ─── Índice HNSW para busca vetorial por similaridade cosine ─
CREATE INDEX "knowledge_hnsw_idx"
ON "knowledge_chunks"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ─── Regras iniciais de EcoCoin ──────────────────────────────
INSERT INTO "ecocoin_regras" (tipo, valor_padrao, limite_diario, limite_total, ativo, descricao) VALUES
  ('CADASTRO_BONUS',      50, NULL, 1,    TRUE, 'Bônus único de boas-vindas'),
  ('DESCARTE_REGISTRADO', 10, 3,    NULL, TRUE, 'Máx 3x por dia'),
  ('REPORTE_APROVADO',    20, 5,    NULL, TRUE, 'Máx 5 reportes por dia'),
  ('INDICACAO_AMIGO',     30, NULL, NULL, TRUE, 'Por amigo indicado que se cadastra'),
  ('CHAT_INTERACAO',       1, 1,    NULL, TRUE, '1 ponto por dia pelo chat'),
  ('COMPARTILHAMENTO',     5, 3,    NULL, TRUE, 'Máx 3 compartilhamentos por dia'),
  ('PERFIL_COMPLETO',     15, NULL, 1,    TRUE, 'Bônus único por completar perfil'),
  ('AVALIACAO_PONTO',      5, 5,    NULL, TRUE, 'Máx 5 avaliações por dia'),
  ('RESGATE_DESCONTO',   -1,  NULL, NULL, TRUE, 'Débito: resgate de desconto'),
  ('RESGATE_CERTIFICADO',-1,  NULL, NULL, TRUE, 'Débito: resgate de certificado'),
  ('RESGATE_DOACAO',     -1,  NULL, NULL, TRUE, 'Débito: doação via EcoCoin'),
  ('EXPIRACAO',          -1,  NULL, NULL, TRUE, 'Expiração automática de saldo'),
  ('AJUSTE_ADMIN',        0,  NULL, NULL, TRUE, 'Ajuste manual pelo administrador'),
  ('ESTORNO',             0,  NULL, NULL, TRUE, 'Estorno de transação');

-- ─── Função PL/pgSQL: crédito/débito atômico de EcoCoin ──────
CREATE OR REPLACE FUNCTION creditar_ecocoin(
  p_usuario_id    TEXT,
  p_tipo          TEXT,
  p_valor         INTEGER,
  p_descricao     TEXT DEFAULT NULL,
  p_referencia_id TEXT DEFAULT NULL,
  p_metadata      JSONB DEFAULT '{}'
) RETURNS TABLE (
  sucesso     BOOLEAN,
  saldo_atual INTEGER,
  mensagem    TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_saldo_atual    INTEGER;
  v_limite_diario  INTEGER;
  v_limite_total   INTEGER;
  v_usos_hoje      INTEGER;
  v_usos_total     INTEGER;
BEGIN

  -- 1. Verificar se regra existe e está ativa
  SELECT limite_diario, limite_total INTO v_limite_diario, v_limite_total
  FROM ecocoin_regras
  WHERE tipo = p_tipo AND ativo = TRUE;

  -- 2. Verificar limite diário (apenas para créditos)
  IF p_valor > 0 AND v_limite_diario IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usos_hoje
    FROM ecocoin_transacoes
    WHERE usuario_id = p_usuario_id
      AND tipo = p_tipo
      AND valor > 0
      AND criado_em >= CURRENT_DATE;

    IF v_usos_hoje >= v_limite_diario THEN
      RETURN QUERY SELECT FALSE, 0, 'Limite diário atingido para esta ação';
      RETURN;
    END IF;
  END IF;

  -- 3. Verificar limite total de vida (apenas para créditos)
  IF p_valor > 0 AND v_limite_total IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usos_total
    FROM ecocoin_transacoes
    WHERE usuario_id = p_usuario_id
      AND tipo = p_tipo
      AND valor > 0;

    IF v_usos_total >= v_limite_total THEN
      RETURN QUERY SELECT FALSE, 0, 'Limite total atingido para esta ação';
      RETURN;
    END IF;
  END IF;

  -- 4. Criar saldo se não existir (on first use)
  INSERT INTO ecocoin_saldos (usuario_id, saldo, total_ganho, total_usado, atualizado_em)
  VALUES (p_usuario_id, 0, 0, 0, NOW())
  ON CONFLICT (usuario_id) DO NOTHING;

  -- 5. Verificar saldo suficiente para débitos
  IF p_valor < 0 THEN
    SELECT saldo INTO v_saldo_atual FROM ecocoin_saldos WHERE usuario_id = p_usuario_id;
    IF v_saldo_atual + p_valor < 0 THEN
      RETURN QUERY SELECT FALSE, v_saldo_atual, 'Saldo insuficiente';
      RETURN;
    END IF;
  END IF;

  -- 6. Atualizar saldo atomicamente
  UPDATE ecocoin_saldos
  SET
    saldo         = saldo + p_valor,
    total_ganho   = CASE WHEN p_valor > 0 THEN total_ganho + p_valor ELSE total_ganho END,
    total_usado   = CASE WHEN p_valor < 0 THEN total_usado + ABS(p_valor) ELSE total_usado END,
    atualizado_em = NOW()
  WHERE usuario_id = p_usuario_id
  RETURNING saldo INTO v_saldo_atual;

  -- 7. Registrar no ledger imutável
  INSERT INTO ecocoin_transacoes
    (id, usuario_id, tipo, valor, saldo_apos, descricao, referencia_id, metadata)
  VALUES
    (gen_random_uuid(), p_usuario_id, p_tipo, p_valor, v_saldo_atual,
     p_descricao, p_referencia_id, COALESCE(p_metadata, '{}'));

  RETURN QUERY SELECT TRUE, v_saldo_atual, 'EcoCoins atualizados com sucesso';
END;
$$;
