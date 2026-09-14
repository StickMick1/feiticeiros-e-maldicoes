# Guia Rápido: Código Pós-Rolagem (JB2A/Sequencer)

## Onde Adicionar
Campos **`macroCode`** (textarea) nos diálogos:
- **Ataques** → aba **Habilidades** → Ataques
- **Habilidades / Talentos** → aba **Habilidades**
- **Aptidões** → aba **Aptidões**
- **Feitiços** → aba **Perfil A.**
- **Itens de Inventário** → aba **Inventário**

## Quando Executa
Uma vez após rolagem/uso bem-sucedido (ataque, dano, feature, item). Não executa ao abrir/salvar/arrastar/renderizar. Macros de hotbar chamam os mesmos métodos — **não duplica**.

## Permissões e Consentimento
- Só **dono do ator** (`actor.isOwner`) dispara.
- Requer permissão nativa **`MACRO_SCRIPT`** (Foundry V14).
- Antes de executar, abre `DialogV2.confirm` com preview do código **integral escapado**.
- Aprovação **por sessão**: chave `user.id + actor.uuid + entry.id` em `Map` na memória da classe.
- Se o código **mudar**, pede novamente.
- Recusar/fechar **não desfaz a rolagem**.
- Não grava em flags/setting (editáveis por jogadores).

## Variáveis no Escopo da Macro
A macro é uma **instância nativa de `Macro` em memória** — sem criar documento no mundo. Escopo via `macro.execute(scope)`:

| Variável | Tipo | Nota |
|----------|------|------|
| `actor` | `Actor` | Ator dono da entry |
| `token` | `Token\|null` | Token do ator na cena (pode ser `null`) |
| `entry` | `Object` | Entry completa da tabela |
| `roll` | `Roll\|null` | Rolagem principal (ataque/feature/item) |
| `damageRoll` | `Roll\|null` | Rolagem de dano (se houver) |
| `targets` | `Token[]` | Tokens alvo selecionados (`game.user.targets`) |
| `speaker` | `Object` | Dados do speaker da mensagem de chat |

**Sempre verifique** `token` e `targets` antes de usar — podem ser `null`/`[]`.

## Exemplo (Sequencer + JB2A)
```javascript
if (!token) return;
if (typeof Sequence === 'undefined') return;

await new Sequence()
    .effect()
    .file('CAMINHO_DO_EFEITO_JB2A') // Substitua pelo caminho real no Data do Foundry
    .atLocation(token)
    .scale(1.5)
    .play();
```
- `Sequence` é global se **Sequencer** ativo.
- `file()` aceita um **caminho no `Data` do Foundry** (ex.: `modules/NOME_DO_PACOTE/.../*.webm`) ou uma **chave registrada no Sequencer** — não um caminho relativo ao `public/` do módulo. `CAMINHO_DO_EFEITO_JB2A` é apenas placeholder; troque por um asset real do JB2A.
- **Não** embrulhe em `async function() { ... }` — o corpo já roda em contexto async.
- Erros no seu código **não revertem** a rolagem; apenas notificam.

## Limitações
1. Sem token/alvos: `token=null`, `targets=[]` se ator sem token na cena e sem targets.
2. Sequencer/JB2A opcionais: sem módulos, `typeof Sequence === 'undefined'` evita erro.
3. Hotbar macros: usam mesmos métodos — não duplicam.
4. Armas do Resumo: copiam `macroCode` do item de inventário original.
5. **Sem sandbox**: código roda com suas permissões (GM = permissões de GM). Revise antes de aprovar.
6. **Campo `macroCode` vazio**: nada executa e nenhum módulo é exigido. Se o script usar um módulo ausente sem `typeof` guard, um erro é exibido (a rolagem permanece).

## Referência API Foundry V14
- `foundry.documents.Macro.implementation` — construtor macro em memória
- `macro.execute(scope)` — executa script async com escopo custom
- `macro.canExecute` — **getter booleano** (não função)
- `game.user.can('MACRO_SCRIPT')` — permissão global de script
- `foundry.applications.api.DialogV2.confirm` — diálogo confirmação nativo
- `foundry.utils.escapeHTML` — escape seguro para preview