# Feiticeiros e Maldições (Foundry VTT) — `sorcerers-and-curses`

Sistema/ficha customizada para campanha de **Feiticeiros e Maldições** no Foundry VTT.
Sistema independente, id **`sorcerers-and-curses`**, com compatibilidade declarada para Foundry V14.

> **Migrando um mundo existente?** Veja [docs/migration.md](docs/migration.md) —
> o fluxo foi corrigido no código e precisa de confirmação em uma cópia do
> mundo antes de uso.

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

## Distribuição e licenças

A preparação do lançamento está registrada em [docs/release-audit.md](docs/release-audit.md).
A instalação pública por manifesto depende da publicação de uma release própria.
Consulte [LICENSE](LICENSE) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) para
os termos do código herdado e as pendências de licenciamento dos demais recursos.
