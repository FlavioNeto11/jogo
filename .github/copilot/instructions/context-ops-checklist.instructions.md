# ContextOps Checklist - VS Code Insiders

## Objetivo

Padronizar a evolucao continua da estrutura de documentacao, agentes e instrucoes do Copilot para manter execucoes solidas, rastreaveis e consistentes.

## Quando Executar

1. Antes de iniciar uma nova sprint
2. Ao criar ou editar agentes/instrucoes/prompts
3. Ao detectar respostas inconsistentes entre agentes
4. Ao surgir qualquer aviso de "Unknown tool" ou "Tool renamed"

## Checklist Operacional

1. Validar referencias de arquivos em agentes
- Confirmar que cada referencia em `.github/agents/*.agent.md` existe fisicamente
- Corrigir nomes de sprint que mudaram no tempo

2. Validar compatibilidade de ferramentas (VS Code Insiders)
- Remover toolsets externos nao reconhecidos no workspace atual
- Trocar aliases legados pelos nomes recomendados pelo diagnostico
- Manter IDs legados apenas quando o proprio ambiente exigir (ex.: browser/testes/sonar)

3. Validar limites e responsabilidades dos agentes
- Cada agente deve ter escopo claro (sem sobreposicao excessiva)
- Cada agente deve ter no maximo 2-4 handoffs principais
- Handoffs devem apontar para agentes realmente existentes

4. Validar contexto base de projeto
- `docs/ARCHITECTURE.md`, `docs/ROADMAP.md` e `docs/GDD.md` devem estar coerentes
- `docs/sprints/` deve refletir nomenclatura atual dos arquivos
- `CHANGELOG.md` deve registrar mudancas estruturais relevantes

5. Validar qualidade de instrucao
- Linguagem objetiva e sem ambiguidade
- Regras de execucao em formato acionavel
- Evitar redundancia entre arquivos de instrucoes

## Regra de Compatibilidade de Tools

Para evitar warnings em VS Code Insiders:

1. Priorize os nomes sugeridos pelo diagnostics provider
2. Evite registrar MCPs/toolsets externos se nao estiverem disponiveis
3. Ao migrar nomes de tools, rode nova validacao de problemas imediatamente

## Criterio de Pronto

Considere o ciclo concluido quando:

1. Nao houver erros de "Unknown tool" nos arquivos de agentes
2. Nao houver warnings de rename pendentes para os principais aliases
3. Todas as referencias de arquivos citados pelos agentes existirem
4. O ContextOpsArchitect estiver apontando para este checklist
