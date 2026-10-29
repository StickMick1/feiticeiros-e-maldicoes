# Sistema Sorcerers and Curses — "Feiticeiros e Maldições"

Documento de referência de estado atual para agentes que manterão este repositório.
Escopo: arquitetura do módulo, UI/design da ficha Jujutsu, assets, localização,
dependências e riscos conhecidos.

---

## 1. Propósito

Sistema independente de Foundry VTT, id
`sorcerers-and-curses`, customizado para a campanha brasileira
**"Feiticeiros e Maldições"** (inspirada em Jujutsu Kaisen). A customização é
majoritariamente a ficha em português "Jujutsu", implementada em
`module/jujutsu/` + `module/sheets/actors/v2/CharacterSheetV2.js` +
`css/sheet/jujutsu-sheet.css` + `templates/actor/v2/`.

**Compatibilidade:** Foundry V14 (em `system.json`: `minimum: "14"`,
`verified: "14.367"`, `maximum: "14"`).

> **Migração de mundos existentes:** ver `docs/migration.md`; o fluxo corrigido
> no código precisa ser confirmado em uma cópia do mundo.

---

## 2. Inventário top-level e ordem de carregamento

```
AGENTS.md            Regras do fluxo de agentes OpenCode
opencode.json        Config OpenCode (model, agente default, agents desabilitados)
system.json          Manifesto do sistema (id, compatibility, version)
module/              Código do sistema
templates/           Handlebars (actor, item, chat, settings, _template)
css/                 Folhas de estilo (top-level genéricas + sheet/)
img/                 Imagens (bg-jujutsu-1.jpg, logos SVG)
import-items/        Fontes locais (fonts/)
lang/                Localização (de/en/fr/ru — SEM pt-BR)
lib/                 deep-diff.min.js(.map), math.js(.map)
README.md            Visão geral da ficha em português
```

**Ordem de carregamento:** `lib/math.js` e `lib/deep-diff.min.js` são scripts
clássicos globais declarados em `system.json` (`scripts`) e carregados antes
do entry point ES-module `module/sorcerers-and-curses.js` (declarado em
`esmodules`); eles não são importados pelo entry module. Dentro do módulo:
`ComputablePhrase` → `ComponentFactory` → `migrationHandler` → `exports`
(import/export) → classes de documento (documents/) → sheets (v1 e v2) →
Fórmulas → componentes genéricos → código da campanha Jujutsu → hooks do
Foundry (o hook principal de init registra sheets, settings e apps).

Não existe `template.json`: os modelos de dados são definidos em
`module/documents/model/*.js` e registrados durante a inicialização.

---

## 3. Tipos de documento e registros

### 3.1 Documentos (`module/documents/`)

| Classe | `type` usados | Notas |
|---|---|---|
| `CustomActor` | `character`, `_template` | `isCharacterActor`/`isTemplateActor`; `DEFAULT_IMG` |
| `CustomItem` | `equippableItem`, `_equippableItemTemplate`, `subTemplate`, `userInputTemplate`, `activeEffectContainer` | |
| `CustomToken`, `CustomCombat`, `CustomCombatant`, `CustomActiveEffect` | — | extensions |
| `TemplateSystem` | — | ~1184 linhas; sistema de template agnóstico p/ actor e item; `Panel.fromJSON` para header/body; `_componentMap`; `getKeys`; `setDefaultValues`; invalidação por `templateSystemUniqueVersion` |

Data models V13 em `module/documents/model/`: `actorModel.js`, `baseModels.js`,
`itemModel.js`. Implementações simples em `simpleImplementations/`:
`SimpleAttributeBarElement.js`, `SimpleComputableElement.js`.

**Predicados de tipo** (`module/definitions.js`):
`isAppliedTemplateEntity` (`character`, `equippableItem`),
`isBuilderTemplateEntity` (`_template`, `_equippableItemTemplate`,
`subTemplate`, `userInputTemplate`), além de `isFullBuilderTemplateEntity`,
`isFullTemplateEntity`, `isBaseSheetTemplateEntity`, `isBaseTemplateEntity`
(+ `activeEffectContainer`).

### 3.2 Inicialização, settings e apps

- Registro de sheets e apps no hook de init em `module/sorcerers-and-curses.js`.
- Apps de configuração (`module/applications/`): `AttributeBarsDialog`,
  `ComponentSettingsApplication`, `CustomDialogV2`,
  `CustomStatusEffectsApplication`, `DisplaySettingsDialog`,
  `HiddenAttributesDialog`, `ReloadTemplateDialog`, `TabEditorDialog`.
- Settings relevantes da campanha: `manualEntitySaving` (usado em
  `configureJujutsuResistances`), settings de interface (fix_size, barras,
  efeitos, atributos ocultos, dialogs).
- Chat e token (`module/chat.js`, `module/utils.js`): `postCustomSheetRoll`,
  `postAugmentedChatMessage` (templates `templates/chat/chat-roll.hbs` e
  `chat-roll-dice-pools.hbs`); ações **Apply Damage** e **Verify Success**;
- Barras de token via `props.tokenResources.hp` / `props.tokenResources.pe`.

### 3.3 Fórmulas, migrações e import/export

- `module/formulas/`: `ComputablePhrase.js`, `Formula.js`,
  `FormulaFunctionImporter.js` (rolagem com pool de dados e tooltip).
- `module/interfaces/`: `AttributeBarElement`, `ChatSenderElement`,
  `ComputableElement`, `Modifier` (com `applyModifiers`).
- `module/errors/`: `UncomputableError`, `ComponentValidationError`.
- `module/migrations/`: `migration_4_5_0.js`, `migration_4_5_1.js`,
  `migration_4_6_4.js`, `migration_5_0_0.js` + `migrationHandler.js` +
  `migrationUtils.js`.
- `module/exports.js`: `exportTemplates` / `importTemplates`.
- Logger centralizado em `module/Logger.js`.

---

## 4. Arquitetura de componentes

### 4.1 O que é um componente

Classe base `Component` (em `module/sheets/components/Component.js`), com os
atributos: `static valueType`, `publicComponent`, `_key`, `_templateAddress`,
`_colSpan`, `_rowSpan`, `_cssClass`, `_role`, `_editRole`, `_permission`.
Componentes renderizam um **panel** (via `Panel.fromJSON`) montado a partir do
JSON de template do documento (`customHeader`/`customBody`).

Fábrica: `ComponentFactory`.

### 4.2 Inventário de componentes (`module/sheets/components/`, 24 arquivos)

`ActiveEffectContainer`, `Checkbox`, `Component`, `ConditionalModifierList`,
`Container`, `Dropdown`, `DynamicTable`, `ExtensibleTable`, `InputComponent`,
`ItemContainer`, `Label`, `Meter`, `MirrorComponent`, `NumberField`, `Panel`,
`Picture`, `RadioButton`, `RichTextArea`, `SizedComponent`, `Tab`,
`TabbedPanel`, `Table`, `TextField`.

Onde mora o HTML dos componentes: `templates/_template/components/`
(+ `templates/_template/dialogs/` e `partials/`).

---

## 5. Customização da campanha "Feiticeiros e Maldições"

### 5.1 Dados e cálculos (`module/jujutsu/`)

- `sheetData.js`:
  - Atributos: `ATTRIBUTE_OPTIONS`/`ATTRIBUTES` — `for` (Força), `des`
    (Destreza), `con` (Constituição), `int` (Inteligência), `sab` (Sabedoria),
    `pre` (Presença).
  - Dados: `ROLL_DICE` (d4 a d20); slots de invocação:
    `INVOCATION_SLOTS` (invocacao1..4), `INVOCATION_ATTRIBUTES`.
  - Bônus de ataque: `ATTACK_BONUSES` — `melee`→`for`, `ranged`→`des`,
    `cursed`→`for` com `alwaysTrained: true`.
  - Resistências/saves: `SAVING_THROWS` (astucia, fortitude, integridade, ...).
  - Funções: `calculateJujutsuAttackTotal`, `calculateJujutsuAttributeMod`,
    `calculateJujutsuSkillTotal`, `calculateJujutsuSavingThrowTotal`,
    `calculateJujutsuTrainingBonus`, `createJujutsuTableRow`,
    `prepareJujutsuSheetData`, `createJujutsuDefaultProps`.
- `characteristicsCatalog.js`: `RAW_JUJUTSU_CHARACTERISTICS_CATALOG`
  exportado como `JUJUTSU_CHARACTERISTICS_CATALOG`. Cada característica tem
  `{nome, tipo, categoria, efeito_resumido, modifica, formula_sugerida,
  observacoes}`; origens: Inato, Herdado, Derivado, Restringido (+ custom).

### 5.2 `CharacterSheetV2` (`module/sheets/actors/v2/CharacterSheetV2.js`, ~3622 linhas)

- **Base:** estende `CustomActorSheetV2`, que estende
  `HandlebarsApplicationMixin(ActorSheetV2)` (`module/sheets/actors/v2/CustomActorSheetV2.js`).
  Classes CSS: `custom-system sheet actor actor-v2`; `submitOnChange`;
  action `editImage`; `PARTS.form`; não redimensionável quando
  `system.display.fix_size`.
- **Contrato de abas:** `activeJujutsuTab = 'resumo'`; janela 1160×900.
  Abas: `Resumo`, `Perícias`, `Habilidades`, `Invocações`, `Aptidões`,
  `Treinamentos`, `Perfil Amaldiçoado`, `Expansão`, `Inventário`, `Registro`.
- **Controles de janela:** `SeeHiddenAttributes` (fa-eye-slash, OWNER),
  `SeeAttributeBars` (fa-bars-progress).
- **Drag and drop:** `DragDrop` de `foundry.applications.ux`; payload de
  inventário com `type: 'JujutsuInventoryItem'` (`actorUuid`, `rowId`,
  `rowIndex`, `name`, `img`).
- **Diálogos** (templates em `templates/actor/v2/dialogs/`, 8 arquivos):
  `jujutsu-attack-entry-config.hbs`, `jujutsu-characteristics-config.hbs`,
  `jujutsu-feature-entry-config.hbs`, `jujutsu-inventory-entry-config.hbs`,
  `jujutsu-invocation-skill-entry-config.hbs`, `jujutsu-rds-config.hbs`,
  `jujutsu-resistances-config.hbs`, `jujutsu-trainings-config.hbs`.
- **Resistências:** `configureJujutsuResistances` usa o setting
  `manualEntitySaving` e `props.resistanceConfig {selected, custom}`;
  definições filtradas por `origem !== 'custom'`.
- **Estado visual:** death-track (`data-death-track` successes/failures,
  `data-death-count`), sincronização de `jj-checkbox`/`is-checked`,
  `_applyJujutsuCharacteristicFilters`.

### 5.3 Recursos e derivados

- Recursos da ficha: **Vida**, **Energia**, **Integridade**.
- Cálculos: atenção (percepção), iniciativa (Destreza), defesa total, meio
  nível, bônus de treino; crítico/falha crítica em 1d20 destacados no chat
  (verde/vermelho).
- Domínios por aba (títulos em português, hard-coded).

---

## 6. Templates, CSS e guardrails visuais

### 6.1 Templates Handlebars

- `templates/actor/`: `actor-_template-sheet.hbs`, `actor-character-sheet.hbs`
  (v1) + `v2/` (actor-base, character, template) + `v2/dialogs/` (8 diálogos
  Jujutsu).
- `templates/item/`: 6 sheets v1 + `v2/` (5 templates:
  `_equippableItemTemplate-sheet.hbs`, `equippableItem-sheet.hbs`,
  `activeEffectContainer-sheet.hbs`, `subTemplate-sheet.hbs`,
  `userInputTemplate-sheet.hbs`).
- `templates/chat/`: `chat-roll.hbs`, `chat-roll-dice-pools.hbs`,
  `chat-roll-tooltip.hbs`.
- `templates/settings/`: `attributeBars`, `configureStatusEffects`,
  `displaySettings`, `hiddenAttributes`.
- `templates/_template/`: componentes genéricos, dialogs, partials.

### 6.2 CSS

- **Top-level (10):** `active-effect-config.css`, `attributes-editor.css`,
  `chat-message.css`, `component-editor.css`, `custom-dialog.css`,
  `custom-status-effects.css`, `display-settings.css`, `export-display.css`,
  `modifiers-editor.css`, `user-input-editor.css`.
- **`css/sheet/`:** `jujutsu-sheet.css` (**3462 linhas — folha da campanha**),
  `sheet-v1.css`, `sheet-v2.css`, `sheet.css`, `template.css`.

### 6.3 Tokens de design da ficha Jujutsu (`.jj-sheet`)

Definidos em `.jj-sheet` (classes `jj-`):

| Token | Valor | Uso |
|---|---|---|
| `--jj-panel` | `rgba(18,20,26,.86)` | fundo de painel |
| `--jj-panel-2` | `rgba(27,30,37,.9)` | painel secundário |
| `--jj-card` | `rgba(39,43,52,.9)` | cartão |
| `--jj-card-soft` | `rgba(30,33,41,.84)` | cartão suave |
| `--jj-text` | `#ddd8cd` | texto principal |
| `--jj-muted` | `#af9f84` | texto/label de apoio |
| `--jj-edge` | `#4d4b53` | borda padrão |
| `--jj-edge-strong` | `#9b8a69` | borda forte |
| `--jj-gold` | `#b7a37b` | dourado (focus, header) |
| `--jj-gold-soft` | `#d5c6a3` | dourado claro |
| `--jj-accent` | `#d9c49a` | títulos |
| `--jj-accent-dark` | `#7e6847` | dourado escuro |

**Podem estar indefinidos (ver Risco R5):** `--jj-label-font`,
`--jj-heading-font`, `--jj-ink-light`, `--jj-heading` — usados na seção de
inventário, sem declaração.

**Fontes (`@font-face`, assets em `import-items/fonts/`):**
`JJRobotoSlab` (serif; 400/700 — títulos `h2` de painel, valores grandes,
nome do herói, nível) e `JJRobotoCondensed` (sans; 400/700 — labels,
texto de formulário, chips). Fallbacks: `serif` / `Arial, sans-serif`.
Fonte de formulário padrão 0.85rem; labels 0.6–0.78rem com
`letter-spacing` e `text-transform: uppercase`.

**Ornamentos em código:** os emblemas de nível, indicadores e molduras de
atributo são desenhados por CSS em `jujutsu-sheet.css`, com pseudo-elementos e
formas geométricas originais. Os oito recursos gráficos de `import-items/ui/`
foram retirados. As texturas e os cantos removidos não tinham consumidores em
tempo de execução; as fontes de `import-items/fonts/` permanecem.

**Layout base do sheet:** `.jj-sheet` é grid `320px minmax(0,1fr)`; classes:
`.jj-span-2` (linha inteira), `.jj-layout` (wrapper por aba, mesmo grid),
`.jj-sidebar` + `.jj-main` (`.jj-main-columns` `minmax(0,1fr) 360px`),
`.jj-main-primary`, `.jj-main-secondary`, `.jj-main-shell--single`,
`.jj-profile-layout` (300px + 1fr), `.jj-hero` (minmax(0,1fr) 520px).

### 6.4 Contrato de abas (data-hooks)

O CSS controla visibilidade por classes de estado no `.jj-layout`:

```css
.jj-layout.is-resumo       [data-tab-block~='resumo']    { display: grid; }
.jj-layout.is-pericias     [data-tab-block~='pericias']  { display: grid; }
/* idem: habilidades, invocacoes, aptidoes, treinamentos,
   perfil-a, expansao, inventario, registro */
```

- O valor de `data-tab-block` deve casar com a classe `is-<aba>` aplicada no
  JS (em `CharacterSheetV2`, `activeJujutsuTab`).
- Abas que não são `resumo` viram coluna única:
  `.jj-layout.is-<aba> { grid-template-columns: 1fr; }` e escondem
  `.jj-sidebar`, `.jj-main-secondary` e (nas abas de gerenciamento)
  `.jj-main-columns`/`.jj-main-primary`, exibindo apenas o painel específico.
- **Regra:** para adicionar uma aba nova, atualize o seletor CSS
  `.jj-layout.is-<nova-aba>` e adicione o `data-tab-block` no template.
- Tabs de janela: `.jj-page-nav` (links arredondados; `.is-active`).

### 6.5 States, acessibilidade e componentes reusáveis

- **Checkbox visual:** `.jj-checkbox` com `.jj-checkbox-input`
  (1×1px escondido), `.jj-checkbox-mark` (checkbox estilizado) e
  `.jj-checkbox-label`; estado checado em `.is-checked`; foco visível via
  `.jj-checkbox-input:focus-visible + .jj-checkbox-mark`. **Nunca estilizar
  o input nativo; sempre as três classes em conjunto.**
- **Death track:** `.jj-death-track-grid`, `.jj-death-track`,
  `.jj-death-pips`, `.jj-death-pip`.
- **Derivados:** `.jj-derived-row` (`minmax(0,1fr) 58px`), `.jj-derived-total`
  (valor grande centralizado), `.jj-derived-checks`, `.jj-derived-toggle`.
- **Tabelas de item:** `.jj-table-item` + `.jj-table-item-main` (com
  variante `--draggable`, `cursor: grab`), `.jj-table-item-thumb`,
  `.jj-table-item-text`, `.jj-table-item-actions`, `.jj-table-icon-button`
  (variante `--danger`).
- **Ações:** `.jj-action-button` (em painéis de invocação, inventário).

### 6.6 Breakpoints

`max-width`: **1100px** (sheet vira coluna única), **980px** (grids de
invocação/inventário), **900px** (aptidões, perfil, spells, invocação,
registro), **760px** (tags, lozenges, derived, death-track, training-board),
**680px** (aptidões, spells, status de invocação, quick-fields),
**560px** (compact-fields), **520px** (abilities, training-board).

---

## 7. Assets e localização

### 7.1 Imagens (`img/`)

`bg-jujutsu-1.jpg` (fundo da ficha), `picture-icon.svg`,
`subtemplate-logo.svg`, `template-logo.svg`, `user-input-logo.svg`.

### 7.2 Localização

- `lang/` contém apenas `de.json`, `en.json`, `fr.json`, `ru.json`.
- **Não existe `pt-BR.json`.** Todo o texto da ficha Jujutsu está
  hard-coded em português nos templates/JS (ver Risco R2).

---

## 8. Dependências e integrações

- `system.json` não declara `relationships` (recommends do upstream removidos
  no fork independente: `_chatcommands`, `dfreds-convenient-effects`,
  `statuscounter`).
- Libs embutidas em `lib/`: `deep-diff.min.js` (+map), `math.js` (+map).
- Sem build system; JS do Foundry carregado via entry point do sistema
  (sem bundler).

---

## 9. Riscos e anomalias de manutenção

> Marcar como **issues**, não copiar como padrão.

- **R1 — Dualidade V1/V2:** existem duas gerações de sheets (v1 legacy e v2
  HandlebarsApplication). Feature nova deve ir para v2; v1 é legado.
- **R2 — Português hard-coded, sem `lang/pt-BR.json`:** toda a ficha Jujutsu
  em português está fixada em JS/templates; tradução oficial não acompanha.
- **R3 — Arquivos grandes/acoplados:** `CharacterSheetV2.js` (~3622 linhas,
  domínio de ficha inteiro) e `jujutsu-sheet.css` (3462 linhas). Alterar com
  cuidado; mudanças em um frequentemente exigem o outro.
- **R4 — Distribuição pública incompleta:** `url` e `bugs` apontam para o
  repositório atual. Ainda faltam uma release própria com ZIP público e os
  respectivos campos `manifest` e `download`; não publicar links fictícios.
- **R5 — Variáveis CSS indefinidas:** `--jj-label-font`, `--jj-heading-font`,
  `--jj-ink-light`, `--jj-heading` são consumidas (inventário) mas nunca
  declaradas em `.jj-sheet`.
- **R6 — Inventário duplicado:** existem duas implementações de inventário
  (tabela Jujutsu e ItemContainer genérico); manter a Jujutsu como fonte da
  verdade na ficha do personagem.
- **R7 — Cabeçalho de active effect V2 malformado:** registro visual do
  efeito ativo pode quebrar o header da ficha V2; reproduzir antes de
  alterar `ActiveEffectContainer`/`CustomActiveEffectConfig`.
- **R8 — Sem pipeline de teste/build:** nenhum teste unitário no repo;
  validação é manual/orquestrador.

---

- **R9 — Migração de namespace:** a revisão corrigiu o acesso a configurações
  persistidas e a remoção de flags. A confirmação em Foundry continua pendente;
  o fluxo não tem transação global nem cobre compêndios ou atores sintéticos.
  Detalhes em `migration.md` e `release-audit.md`.
- **R10 — Licenciamento e procedência:** confirmar direitos de arte, textos de
  regras, bibliotecas e fontes. `LICENSE` não licencia automaticamente esses
  materiais; ver `THIRD_PARTY_NOTICES.md`.

## 10. Orientações de mudança

1. **Onde vai uma feature nova:** domínio de ficha Jujutsu →
   `CharacterSheetV2.js` + template `templates/actor/v2/*.hbs` +
   regras em `css/sheet/jujutsu-sheet.css`. Dado de cálculo →
   `module/jujutsu/sheetData.js` / `characteristicsCatalog.js`. Diálogo →
   `templates/actor/v2/dialogs/` + app em `module/sheets/actors/v2/`.
2. **Arquivos que andam juntos:** aba nova = `data-tab-block` no template +
   seletor `is-<aba>` no CSS. Checkbox = as três classes `jj-checkbox`
   juntas. Classe CSS nova = prefixo `jj-` e, se tiver cor, use os tokens
   `--jj-*` declarados (não crie hex novo nem reutilize token indefinido).
3. **Convenções a reter:** nomes em português nos dados da campanha
   (`for`, `des`, `con`, `int`, `sab`, `pre`), chaves de atributo em inglês
   no modelo; labels CSS sempre `text-transform: uppercase` com
   `letter-spacing`.
4. **Não fazer refatoração especulativa.** Riscos R1–R8 são aceitos como
   estado atual; só corrija sob pedido explícito.

---

## 11. Fluxo OpenCode (tooling de dev)

- `opencode.json`: model `openai/gpt-5.6-terra`, `default_agent:
  orchestrator`, `instructions: ["AGENTS.md"]`; agents `build`, `plan`,
  `general`, `explore`, `scout` desabilitados.
- `.opencode/agents/`: `orchestrator.md`, `mimo.md`, `nemotron.md`,
  `pickle.md` (fluxo completo em `AGENTS.md`: orquestrador delega,
  executores implementam/revisam, não rodam shell).
- **Testes unitários:** não podem ser criados, modificados, solicitados nem
  executados. Apenas o orquestrador pode executar, ao final da tarefa, no
  máximo um comando de validação não-unitário; se nenhuma checagem permitida
  servir, não executa.