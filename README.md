# Feiticeiros e Maldições (Foundry VTT) — `sorcerers-and-curses`

Sistema/ficha customizada para campanha de **Feiticeiros e Maldições** no Foundry VTT.
Sistema independente (fork do `custom-system-builder`), id **`sorcerers-and-curses`**,
compatível com Foundry V14.

> **Migrando um mundo existente?** Veja [docs/migration.md](docs/migration.md) —
> troca do ID de sistema é manual e feita uma vez; a migração de runtime retém
> settings e flags existentes.

## O que já está implementado

- Ficha V2 com abas:
  - `Resumo`
  - `Perícias`
  - `Habilidades`
  - `Invocações`
  - `Aptidões`
  - `Treinamentos`
  - `Perfil Amaldiçoado`
  - `Expansão`
  - `Inventário`
  - `Registro`

- Recursos principais da ficha:
  - Atributos, perícias, testes de resistência e bônus de ataque.
  - Recursos de `Vida`, `Energia` e `Integridade`.
  - Cálculos automáticos de:
    - atenção (incluindo percepção),
    - iniciativa (modificador de Destreza),
    - defesa total,
    - meio nível e bônus de treino.
  - Suporte a origens, características, resistências, RDs e treinamentos customizáveis.

- Inventário:
  - Itens comuns, armas e equipamentos.
  - Equipamentos aplicam bônus automático em Defesa.
  - Armas equipadas aparecem como ataques derivados no resumo/habilidades.

- Rolagens no chat:
  - Rolagem de ataques, perícias, atributos, iniciativa e recursos de tabela.
  - Identificação de crítico/falha crítica em rolagens de acerto `1d20`.
  - Destaque visual no resultado do chat:
    - sucesso crítico (verde),
    - erro crítico (vermelho).

- Ações no chat:
  - `Apply Damage`: aplica dano da mensagem em token(s) selecionado(s).
  - `Verify Success`: verifica acerto contra a Defesa do token selecionado e informa:
    - `Acertou com sucesso` (verde), ou
    - `Falhou` (vermelho).

- Integração com Token:
  - Barras de recurso para HP/PE via:
    - `props.tokenResources.hp`
    - `props.tokenResources.pe`
  - Sincronização com os campos da ficha (`Vida` e `Energia`).

## Fluxo rápido de uso

1. Crie/abra um ator de personagem.
2. Preencha atributos, recursos e tabelas (ataques, habilidades, talentos, inventário).
3. No Token Config, selecione as barras:
   - `Bar 1` -> `props.tokenResources.hp`
   - `Bar 2` -> `props.tokenResources.pe`
4. Faça rolagens na ficha e use os botões do chat conforme necessário.

## Observações

- As automações de chat dependem de token selecionado no canvas para aplicar dano/verificar acerto.
- Em caso de atualização de código local, faça `Ctrl+F5` no navegador para limpar cache de frontend.
