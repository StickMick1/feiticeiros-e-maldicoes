# Migração manual: troca do ID de sistema do mundo

Guia único de migração para mundos existentes criados com o sistema sob o ID
`custom-system-builder` (upstream) que agora usarão `sorcerers-and-curses`
(este sistema independente).

> **A troca de ID é um evento único e manual, feito uma vez por mundo.**
> A migração de *runtime* mantém os flags existentes — ela **não** apaga dados.

---

## Por que isso é necessário

O código armazena settings e flags sob a chave do **ID do sistema ativo**,
obtida via `game.system.id`:

- settings: `game.settings.register(game.system.id, ...)`
- flags de documento: `flags.<system.id>.version`, `flags.<system.id>.isPredefined`, etc.

Ao trocar o ID do sistema de `custom-system-builder` para
`sorcerers-and-curses`, essas chaves ficam sob o ID antigo e o sistema novo
não as enxerga — até a migração de runtime reescrevê-las.

O migration handler (`module/migrations/migrationHandler.js`) detecta o switch
em `needsMigration()`: ele varre settings e flags cuja chave começa com
`custom-system-builder` e compara com o `game.system.id` atual. Se houver
divergência, o GM vê um diálogo com 3 opções:

| Opção | Efeito |
|---|---|
| **Migrate Settings & Flags (recommended)** | copia settings e flags de `custom-system-builder` → `sorcerers-and-curses` e remove os antigos |
| **Do not migrate and only delete old settings & flags** | apaga settings/flags antigos sem migrar (dados de documento em `system.*` são preservados) |
| **Do nothing** | nada; o diálogo reaparece no próximo reload |

## Passo a passo (uma vez por mundo)

1. **Backup completo** da pasta do mundo (ex.: `Data/worlds/<meu-mundo>/`)
   — e, idealmente, do `Data/systems/` também. O diálogo de migração exige isso
   antes de oferecer a migração.
2. Abra `world.json` do mundo e altere a chave raiz `"system"`:

   ```json
   { "system": "sorcerers-and-curses" }
   ```

3. Renomeie a pasta do sistema instalado em `Data/systems/` para
   `sorcerers-and-curses` (o mesmo valor do `"id"` em `system.json`). O Foundry
   exige que o diretório tenha o nome do ID do sistema; nome divergente gera o
   erro de startup `Invalid system "sorcerers-and-curses" detected in directory
   "custom-system-builder"`. Veja a nota de diretório no final deste guia.
4. Como GM, o diálogo **System switch detected** aparecerá (se o mundo tiver
   actors/items com flags ou settings sob `custom-system-builder`). Escolha
   **Migrate Settings & Flags (recommended)**.
5. Confirme no console/navegador e em uma ficha que os dados continuam lá:
   itens, atributos, abas e efeitos ativos.

## O que é preservado no documento vs. o que é migrado

- **Migrado pela rotina de runtime**: settings registrados sob
  `custom-system-builder` (efeitos customizados, init formula, estilos, etc.) e
  flags de documento (`flags.custom-system-builder.*`) em users, actors, items,
  scenes, tokens, combats e combatants — reescritos sob `sorcerers-and-curses`.
- **Preservado como está**: o conteúdo em `system.*` de cada documento
  (atributos da ficha, tabelas, inventário, etc.). A troca de ID não toca nesses
  dados — por isso a migração de runtime **retém** flags/dados existentes.

## Limitações

- A detecção automática (`needsMigration`) só enxerga chaves com prefixo
  `custom-system-builder`. Se um mundo nunca rodou sob esse ID, o diálogo não
  aparece e não há nada a migrar.
- Mundos novos criados já sob `sorcerers-and-curses` não precisam deste guia.
- Se o mundo ainda estiver com o sistema original instalado e os dois
  coexistirem, só o ID escolhido no `world.json` determina qual sistema ativo.

## Nota de diretório (erro de startup verificado)

O Foundry detecta sistemas lendo cada subpasta de `Data/systems/` e compara o
nome do diretório com o `"id"` declarado no `system.json` dela. Se divergirem,
o startup falha com `Invalid system "<id>" detected in directory "<pasta>"`.

Portanto, além do `"system"` em `world.json`, a pasta do sistema **precisa**
ser renomeada de `custom-system-builder` para **`sorcerers-and-curses`** —
ex.: `Data/systems/sorcerers-and-curses/`. Isso é um evento único por
instalação, feito manualmente (ou via reinstalação pelo manifesto).