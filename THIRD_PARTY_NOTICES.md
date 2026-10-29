# Avisos de terceiros e procedência

## Código herdado

Partes deste sistema derivam do projeto
[Custom System Builder](https://gitlab.com/custom-system-builder/custom-system-builder).
Os arquivos que contêm cabeçalhos da Mozilla Public License 2.0 continuam
sujeitos a essa licença, inclusive as modificações feitas nesses arquivos.
A cópia da licença está em [LICENSE](LICENSE); os cabeçalhos de autoria e
licença existentes devem ser preservados. O código-fonte correspondente deve
acompanhar a distribuição ou estar disponível nos termos da licença.

A lista de autores do manifesto de origem registrava Jean-Baptiste
Louvet-Daniel, Martin1522, adorablecoin e Caloup. Esta indicação reconhece a
origem do código; não atribui a essas pessoas a manutenção ou o endosso deste
sistema independente. Os avisos específicos de cada arquivo prevalecem.

Referências: [licença do projeto de origem](https://gitlab.com/custom-system-builder/custom-system-builder/-/raw/develop/LICENSE),
[MPL 2.0, seções 3.1 e 3.4](https://www.mozilla.org/MPL/2.0/).

## Materiais cujo licenciamento ainda precisa ser documentado

A MPL do código herdado não concede automaticamente direitos sobre todo o
conteúdo do pacote. Antes da distribuição, registrar a fonte, a versão, a
licença aplicável e os avisos exigidos para cada material abaixo:

| Material | Situação nesta revisão |
|---|---|
| `lib/math.js` e seu source map | Biblioteca embutida; confirmar versão, componentes incluídos e reunir avisos de distribuição. O source map contém avisos de componentes, incluindo seedrandom e decimal.js, sem constituir inventário completo. |
| `lib/deep-diff.min.js` e seu source map | Biblioteca embutida; confirmar versão e incluir os avisos aplicáveis. |
| Roboto Slab em `import-items/fonts/roboto-slab/` | Licença Apache 2.0 e avisos de autoria incluídos em `LICENSE` nesse diretório; a licença foi copiada fielmente da instalação local de origem. A comparação de hashes dos binários não foi executada por indisponibilidade do Node.js no shell e fica pendente para uma próxima tarefa com runtime funcional. |
| Roboto Condensed em `import-items/fonts/roboto-condensed/` | Licença SIL Open Font License 1.1 e avisos de autoria incluídos em `LICENSE` nesse diretório; a licença foi copiada fielmente da instalação local de origem. A comparação de hashes dos binários não foi executada por indisponibilidade do Node.js no shell e fica pendente para uma próxima tarefa com runtime funcional. |
| `img/bg-jujutsu-1.jpg` | Fonte e permissão de redistribuição ainda não documentadas. |
| Ícones SVG em `img/` | Confirmar procedência e licença de cada arquivo; preservar eventuais avisos existentes. |
| Textos de `module/jujutsu/characteristicsCatalog.js` e demais materiais de regras | Confirmar autoria ou permissão de reprodução/adaptação; acesso público não implica licença de redistribuição. |
| Nomes, marcas e conteúdo associados a Feiticeiros e Maldições/Jujutsu Kaisen | Confirmar a autorização ou os termos que sustentam a distribuição pretendida. |

Este inventário registra pendências de procedência. Não representa uma
concessão de licença sobre os materiais listados.
