# Auditoria de preparação para lançamento

Data: 29 de outubro de 2026. Escopo: revisão estática do pacote local, manifesto,
procedência de recursos e requisitos documentados do Foundry VTT. Não houve
instalação pública, execução de um mundo nem confirmação visual da ficha nesta
revisão. Este documento não atesta a titularidade de materiais de terceiros.

## Parecer

O pacote ainda não está pronto para submissão pública. A estrutura principal de
um sistema independente existe, mas a distribuição instalável, a comprovação de
direitos sobre materiais restantes e a confirmação de funcionamento no Foundry
V14 precisam ser concluídas. A listagem oficial passa por análise manual do
Foundry; publicar um ZIP por conta própria não equivale à aprovação na listagem.
[FAQ oficial](https://foundryvtt.com/article/faq/).

## Manifesto e distribuição

| Item | Situação | Ação para lançamento |
|---|---|---|
| Identidade | `id: sorcerers-and-curses` corresponde ao diretório; título próprio. | Manter o ID estável após o lançamento. |
| Carregamento | Entry point próprio `module/sorcerers-and-curses.js`, scripts, estilos, idiomas e tipos de documento declarados. | Confirmar carregamento completo em um mundo novo. |
| Compatibilidade | Declarada: mínimo 14, verificada 14.367, máximo 14. | Confirmar na build declarada e ajustar a versão verificada somente com evidência de execução. |
| Versão do pacote | `5.2.0`. | Pode ser mantida: não é necessário reiniciar em 1.0 por ser um sistema independente. Definir tags e processo de atualização próprios. |
| Endereços de projeto | `url` e `bugs` do repositório atual adicionados. | Confirmar que o repositório e os canais de suporte estarão públicos. |
| Instalação e atualização | Ainda faltam `manifest` e `download` de uma release própria. | Publicar o ZIP e um manifesto públicos; usar URL estável para `manifest` e ZIP correspondente à versão em `download`. |
| Autoria | Autor/mantenedor público confirmado: Infernalisch; créditos herdados nos avisos e cabeçalhos. | Nome confirmado pelo mantenedor. |
| Documentação e licença | `readme` e `license` locais adicionados ao manifesto; MPL integral e avisos de terceiros incluídos. | Completar os avisos das bibliotecas e comprovar os direitos do restante do conteúdo. |
| Idiomas | Infraestrutura em en/fr/de/ru; ficha em português fixo, sem arquivo pt-BR. | Descrever o suporte real. Internacionalização completa é uma melhoria, não condição técnica para instalar. |
| Dependências e conteúdo | Não há dependência declarada de outro sistema nem compêndios empacotados. | Conferir integrações opcionais em execução; não anunciar conteúdo que o pacote não fornece. |

Os campos de instalação e a correspondência entre ID, pasta e manifesto seguem
as [instruções de desenvolvimento de sistemas](https://foundryvtt.com/article/system-development/).
Não foram preenchidas URLs de releases inexistentes para simular prontidão.

Preparar um ZIP de distribuição com `system.json` na raiz do conteúdo instalável
e os diretórios de execução e recursos necessários. Incluir o código-fonte,
licenças e avisos exigidos. Excluir `.git/`, `.opencode/`, `opencode.json`,
`AGENTS.md` e outros arquivos exclusivamente de desenvolvimento. Um pipeline
automatizado é útil, mas sua ausência não impede a publicação.

## Recursos relacionados à interface do sistema D&D5e

Foram encontrados oito recursos gráficos em `import-items/ui/` com os mesmos
nomes dos recursos da [interface do repositório D&D5e](https://github.com/foundryvtt/dnd5e/tree/master/ui).
Os SVGs também apresentavam paths idênticos aos recursos correspondentes da
instalação local do sistema D&D5e 5.3.0. A comparação de hashes dos binários não
foi executada porque o Node.js do ambiente de shell estava indisponível. Essa
comparação fica pendente para uma próxima tarefa com um runtime funcional.

| Arquivo retirado | Uso observado antes da alteração | Substituição |
|---|---|---|
| `level-badge.webp` | Emblema do nível no cabeçalho e no retrato. | Selo octogonal original em CSS. |
| `lozenge.svg` | Fundo dos indicadores derivados. | Placa original com cantos chanfrados em CSS. |
| `ability-score-tab-dark.svg` | Moldura dos seis atributos. | Placa original em CSS, com borda superior dourada e cantos inferiores chanfrados. |
| `notable-left-corner.svg` | Sem consumidor de execução encontrado. | Removido; sem reposição necessária. |
| `notable-right-corner.svg` | Sem consumidor de execução encontrado. | Removido; sem reposição necessária. |
| `texture1.webp` | Sem consumidor de execução encontrado. | Removido; superfícies existentes permanecem em CSS. |
| `texture-gray1.webp` | Sem consumidor de execução encontrado. | Removido; sem reposição necessária. |
| `texture-gray2.webp` | Sem consumidor de execução encontrado. | Removido; sem reposição necessária. |

As substituições preservam a função, o espaço ocupado e a paleta escura/dourada;
não reutilizam os caminhos dos SVGs. O skill impeccable orientou a preservação
da identidade existente, a separação entre ornamento e controles e o foco de
teclado. Falta conferir a aparência na ficha real.

Não foi encontrada nas fontes examinadas dependência/import de `dnd5e`, menção
explícita a Dungeons & Dragons, Wizards, SRD ou OGL, nem compêndio de D&D. Isso
não prova ausência de toda adaptação textual ou de código: procedência e
comparação de conteúdo continuam necessárias. O próprio projeto D&D5e distingue
a licença MIT do software dos diferentes termos dos recursos gráficos; a licença
do código não deve ser aplicada por inferência às imagens.
[README de origem](https://raw.githubusercontent.com/foundryvtt/dnd5e/master/README.md).

## Regras semelhantes que exigem conferir a origem

`module/jujutsu/sheetData.js` implementa estruturas também encontradas em jogos
da família d20. A semelhança abaixo não permite concluir, sozinha, que houve
cópia de D&D ou que a regra precisa ser trocada.

| Elemento local | O que conferir |
|---|---|
| Modificador `floor((atributo - 10) / 2)`. | Confirmar que é a regra pretendida de Feiticeiros e Maldições e a fonte de sua implementação. |
| Treino +2, +3, +4, +5 e +6, com aumentos nos níveis 5/9/13/17. | Progressão coincide com a proficiência de D&D5e; registrar a procedência e comparar eventuais textos usados. |
| Seis atributos FOR, DES, CON, INT, SAB, PRE. | O atributo local é Presença. Não converter as regras ou os dados existentes por associação com Carisma. |
| Perícias de nomes comuns e testes de resistência. | Conferir os textos e o catálogo; nomes comuns isolados não comprovam cópia. |
| Acerto em d20 com destaque para 1/20, dados de vida d8/d10/d12 e tipos de dano. | Confirmar regras pretendidas e conteúdo textual associado; não alterar o RPG silenciosamente. |
| Marcador de morte com três sucessos e três fracassos. | Outra semelhança mecânica com D&D5e; conferir procedência e regra pretendida, sem presumir cópia textual. |

Não foram modificadas fórmulas, nomes de regras nem dados de personagem para
mudar a identidade do jogo. Se uma comparação posterior identificar texto ou
código sob licença que exige atribuição, as opções são cumprir os termos ou
substituir integralmente o conteúdo por material cuja distribuição seja
permitida. Apenas apagar o nome do fornecedor não resolve a procedência.

## Marca de origem e obrigações do código herdado

A apresentação e os logs passam a usar Sorcerers and Curses. O entry point ganhou
nome próprio e pastas internas novas usam o nome atual, com reconhecimento das
pastas antigas. As chaves internas `CSB.*`, hooks e namespaces legados necessários
à compatibilidade permanecem; renomeá-los exige uma migração específica e pode
quebrar mundos ou integrações.

Os cabeçalhos MPL e a autoria de arquivos herdados foram preservados. A
independência do sistema não elimina a licença do código que o compõe. As seções
3.1 e 3.4 exigem manter o código coberto sob a MPL e preservar os avisos
aplicáveis. A origem está documentada em
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md), e a licença integral acompanha
[LICENSE](../LICENSE). [Texto oficial da MPL 2.0](https://www.mozilla.org/MPL/2.0/).

## Pendências que ainda impedem tratar o pacote como pronto

1. Publicar e conferir o manifesto e ZIP próprios, e testar instalação e
   atualização a partir desses endereços.
2. Documentar permissão de redistribuição da imagem `img/bg-jujutsu-1.jpg`, dos
   ícones restantes, dos textos do catálogo e do uso do material de Feiticeiros
   e Maldições/Jujutsu Kaisen. A publicação precisa comprovar os direitos sobre
   o conteúdo incluído. [Orientação de licenciamento do Foundry](https://foundryvtt.com/article/licensing-guide/).
3. Completar o inventário e os avisos de math.js, seus componentes incorporados
   e deep-diff. Há avisos em conteúdo de source maps de math.js, incluindo
   seedrandom e decimal.js; não equivalem a um inventário completo da
   distribuição. As licenças das fontes Roboto foram incluídas a partir dos
   arquivos da instalação local de origem. A comparação de hashes dos quatro
   binários de fontes não foi executada por indisponibilidade do Node.js no
   shell e fica pendente para uma próxima tarefa com um runtime funcional.
4. Confirmar o fluxo de inicialização e a migração em Foundry V14, além das
   fichas, itens, efeitos, tokens, chat e macros. A revisão encontrou uso
   incorreto do registro de configurações e remoção de flags, corrigido no
   código. Configurações de mundo agora são lidas do armazenamento persistido,
   valores existentes no destino são preservados e adiar/falhar libera o hook
   de inicialização. Falta confirmar em execução; não há transação global nem
   cobertura de compêndios ou atores sintéticos. Ver [migration.md](migration.md).
5. Conferir a origem humana das mídias e textos preparados. A política atual
   permite código e documentação assistidos por IA se o autor entende e mantém
   o código; não permite mídias preparadas geradas por IA. SVG é tratado como
   código. A manutenção precisa observar os critérios da política e não
   reivindicar o selo Zero AI sem atendê-los.
   [Política de IA do Foundry](https://foundryvtt.com/article/ai-policy/).

## Limites da revisão

A análise não executou testes unitários. A única tentativa de checagem automática
foi abortada antes da execução: o comando Node.js disponível no shell era um
shim do NVM sem versão ativa, que informou "No active Node.js version is
configured". Portanto, não há resultado automático de parse de JSON, sintaxe de
JavaScript, resolução de caminhos/imports/URLs CSS ou comparação de hashes. Não
foi feita uma segunda tentativa, respeitando o limite de um comando de validação
por tarefa. As conclusões de código desta revisão se baseiam na inspeção manual.

Não houve execução de Foundry, submissão,
upload, release ou publicação. A inspeção estática não substitui a confirmação
em execução da compatibilidade declarada, da migração nem da aparência dos
substitutos CSS. Os materiais de procedência desconhecida permanecem pendentes;
a inclusão da MPL não resolve os direitos sobre arte, fontes ou textos de regras.
