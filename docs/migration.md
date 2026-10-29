# Migração de mundos existentes

A troca do sistema de um mundo envolve migrar configurações e flags, além de
alterar seu identificador. Mundos novos criados com `sorcerers-and-curses` não
precisam desta troca.

## Situação da rotina

A revisão estática identificou e motivou correções em
`module/migrations/migrationHandler.js` e `migrationUtils.js`. A detecção deixou
de tratar o registro `game.settings.settings` como uma coleção de documentos;
a rotina passou a ler as configurações persistidas em
`game.settings.storage.get('world').contents`. A remoção do namespace de flags
também foi corrigida. Referências:
[ClientSettings V14](https://foundryvtt.com/api/v14/classes/foundry.helpers.ClientSettings.html),
[WorldSettings V14](https://foundryvtt.com/api/v14/classes/foundry.documents.collections.WorldSettings.html).

As correções foram feitas no código. O fluxo ainda precisa ser confirmado em
um mundo de teste na versão de Foundry declarada antes de migrar um mundo em uso.

## Identificadores de compatibilidade

O namespace legado `custom-system-builder` permanece no código de migração para
reconhecer configurações e flags de mundos antigos. Ele é um identificador de
dados necessário para localizar a origem; a interface usa o nome do sistema
atual. As chaves de localização `CSB.*` e hooks antigos também são mantidos
para compatibilidade com código e integrações existentes.

O sistema atual registra configurações com `game.system.id` e armazena flags em
`flags.sorcerers-and-curses.*`. Os atributos e tabelas dos documentos em
`system.*` não são renomeados pela troca de namespace.

## Preparação da migração

1. Fazer backup completo do mundo e trabalhar primeiro em uma cópia. O diálogo
   recomenda backup; ele não cria nem verifica esse backup.
2. Instalar este sistema em `Data/systems/sorcerers-and-curses/`, mantendo o
   sistema antigo disponível para recuperar o mundo original. O diretório do
   novo sistema deve corresponder ao `id` de seu `system.json`.
3. Com o mundo encerrado, alterar somente na cópia a chave raiz `system` de
   `world.json` para `sorcerers-and-curses`. Não renomear a instalação do
   sistema antigo como atalho.
4. Abrir a cópia como GM e conferir a operação do diálogo de migração.
5. Conferir configurações, flags, atores, itens, inventário, efeitos, tokens,
   chat e macros. Somente então planejar a migração do mundo original.

## Comportamento implementado e limites

- Configurações persistidas do mundo são transferidas para o namespace atual.
  Configurações já existentes no destino são preservadas.
- Flags de usuários, atores, itens, cenas, tokens, combates, combatentes e itens
  incorporados em atores são procuradas. A cópia combina os dados, preservando
  valores já presentes no destino, antes de remover o namespace de origem.
- Adiar, fechar o diálogo ou falhar na migração libera a continuação do hook
  de inicialização e evita executar as migrações de versão nessa tentativa.
- Não existe transação global: se uma etapa falhar, etapas anteriores podem
  já ter sido concluídas. O backup continua necessário.
- Compêndios, flags de atores sintéticos e configurações de cliente não estão
  cobertos pelo fluxo descrito. Avaliar esses casos antes de migrar um mundo
  que dependa deles.

## Opções do diálogo

O código oferece migrar configurações e flags, excluir os dados antigos sem
migrar ou adiar. A opção de exclusão remove os dados legados e não serve para
preservá-los. A opção de migrar é a que procura conservar os dados, mas o
resultado ainda precisa ser confirmado em execução na cópia do mundo.

O plano de lançamento e as demais pendências estão em
[release-audit.md](release-audit.md).
