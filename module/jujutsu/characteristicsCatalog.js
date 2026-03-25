const RAW_JUJUTSU_CHARACTERISTICS_CATALOG = [
    {
        nome: "Inato",
        tipo: "origem",
        categoria: "origem",
        efeito_resumido: "+3 pontos de atributo; ganha 1 talento no nível 1 e outro no nível 6.",
        modifica: ["atributosDistribuicao", "talentosBonus"],
        formula_sugerida: "atributosDistribuicao += 3; if (nivel >= 1) talentosBonus += 1; if (nivel >= 6) talentosBonus += 1;",
        observacoes: "A origem também possui a característica 'Marca Registrada', mas o trecho público acessível não mostrou o efeito completo."
    },
    {
        nome: "Herdado",
        tipo: "origem",
        categoria: "origem",
        efeito_resumido: "Bônus de atributo, maestrias e herança variam conforme o clã escolhido.",
        modifica: ["atributos", "pericias", "efeitosDeCla"],
        formula_sugerida: "aplicar bonificacoes do clã selecionado",
        observacoes: "É uma origem dependente da subescolha de clã."
    },
    {
        nome: "Derivado",
        tipo: "origem",
        categoria: "origem",
        efeito_resumido: "+3 pontos de atributo; ganha 1 habilidade amaldiçoada de aura; 1x/dia recupera energia amaldiçoada igual ao dobro do bônus de maestria; a cada 4 níveis aumenta em +2 o limite natural de um atributo, até 30.",
        modifica: ["atributosDistribuicao", "habilidadesAmaldicoadas", "energiaAtual", "limiteNaturalAtributo"],
        formula_sugerida: "atributosDistribuicao += 3; habilidadesAuraBonus += 1; 1xDia: energiaAtual += (2 * bonusMaestria); aCada4Niveis: limiteNaturalAtributoEscolhido += 2",
        observacoes: "Origem focada em crescimento excepcional de um atributo."
    },
    {
        nome: "Restringido",
        tipo: "origem",
        categoria: "origem",
        efeito_resumido: "+2 pontos de atributo; +1 FOR, +1 DES e +1 CON; origem vinculada à especialização Restringido.",
        modifica: ["atributosDistribuicao", "forca", "destreza", "constituicao", "especializacaoObrigatoria"],
        formula_sugerida: "atributosDistribuicao += 2; FOR += 1; DES += 1; CON += 1;",
        observacoes: "O trecho público acessível não mostrou o texto completo da característica 'Restrição Celeste'."
    },
    {
        nome: "Feto Amaldiçoado",
        tipo: "origem",
        categoria: "origem",
        efeito_resumido: "+3 pontos de atributo; não pode ser curado por energia reversa e é vulnerável a ela; escolhe 1 perícia para receber +2; ganha 1 característica de anatomia e outra a cada 5 níveis; pode se curar 2d6 + mod CON como ação bônus, usos por descanso = bônus de maestria.",
        modifica: ["atributosDistribuicao", "curaRecebida", "vulnerabilidades", "pericias", "anatomias", "curaPropria"],
        formula_sugerida: "atributosDistribuicao += 3; periciaEscolhida += 2; anatomias += 1 no nível 1 e +1 a cada 5 níveis; usosCura = bonusMaestria; cura = 2d6 + modCON",
        observacoes: "Funciona de forma única com cura e energia reversa."
    },
    {
        nome: "Alma Maldita",
        tipo: "origem",
        categoria: "anatomia de feto amaldiçoado",
        efeito_resumido: "Ao sofrer dano na alma, o agressor precisa passar em TR de Vontade contra CD 12 + bônus de maestria + mod CON; em falha, o dano é anulado. Usa 1x/dia, 2x no nível 6, 3x no 12 e 4x no 18.",
        modifica: ["defesaDaAlma", "usosPorDia"],
        formula_sugerida: "CD = 12 + bonusMaestria + modCON; usos = 1/2/3/4 nos níveis 1/6/12/18",
        observacoes: "Aplica-se apenas a dano na alma."
    },
    {
        nome: "Anatomia Incompreensível",
        tipo: "origem",
        categoria: "anatomia de feto amaldiçoado",
        efeito_resumido: "25% de chance de ignorar o dano adicional de ataque crítico ou furtivo.",
        modifica: ["mitigacaoCritico", "mitigacaoFurtivo"],
        formula_sugerida: "aoReceberDanoExtraCriticoOuFurtivo: ignorar se 1d4 == 1",
        observacoes: ""
    },
    {
        nome: "Kamo",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+2 CON ou SAB e +1 no outro; maestria em 2 perícias entre Atletismo, Integridade e Medicina, ou especialização em 1; ao subir de nível ganha +1 PV extra, e a partir do nível 10 passa a ganhar +2 PV extra por nível; se a rolagem de PV ao subir de nível ficar abaixo da média, pode rerrolar e ficar com o maior resultado.",
        modifica: ["constituicao", "sabedoria", "pericias", "pvMax", "rolagemPVNivel"],
        formula_sugerida: "atributoEscolhido += 2; outro += 1; maestriasClã; if nivelSubiu < 10: pvMax += 1; else pvMax += 2;",
        observacoes: ""
    },
    {
        nome: "Zenin",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+3 pontos de atributo; maestria em 2 perícias quaisquer ou especialização em 1; escolhe 1 habilidade de técnica para reduzir custo em 1 PE; escolhe um número adicional de habilidades focadas igual ao bônus de maestria.",
        modifica: ["atributosDistribuicao", "pericias", "custoTecnica", "habilidadesFocadas"],
        formula_sugerida: "atributosDistribuicao += 3; reduzirCusto(habilidadeEscolhida,1); habilidadesFocadas += bonusMaestria",
        observacoes: "O trecho acessível mostrou o começo de 'habilidades focadas', mas não a regra completa delas."
    },
    {
        nome: "Chikaku",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+2 DES ou SAB e +1 no outro; maestria em 2 perícias entre Furtividade, Prestidigitação e Ocultismo, ou especialização em 1; pode ficar invisível como ação bônus por 1 minuto em combate ou 10 minutos fora de combate.",
        modifica: ["destreza", "sabedoria", "pericias", "invisibilidade"],
        formula_sugerida: "atributoEscolhido += 2; outro += 1; ativacaoInvisibilidade()",
        observacoes: ""
    },
    {
        nome: "Ensetsu",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+2 CAR ou SAB e +1 no outro; recebe maestrias em perícias de Carisma.",
        modifica: ["carisma", "sabedoria", "pericias"],
        formula_sugerida: "atributoEscolhido += 2; outro += 1; aplicar maestrias de carisma",
        observacoes: "O trecho acessível ficou cortado e não mostrou a herança completa do clã."
    },
    {
        nome: "Inumaki",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "Usos por descanso longo iguais ao bônus de maestria para dar a um aliado um comando como ação bônus, executado por ele como reação; além disso, escolhe 1 perícia baseada em Carisma para ter vantagem.",
        modifica: ["acoesAliado", "pericias"],
        formula_sugerida: "usos = bonusMaestria por descanso longo; periciaCarismaEscolhida.vantagem = true",
        observacoes: "O trecho público acessível mostrou esse efeito, mas não exibiu o bloco inteiro do clã."
    },
    {
        nome: "Shoyu'mono",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+3 pontos de atributo; maestria em 2 perícias quaisquer ou especialização em 1; escolhe um número de habilidades de técnica igual ao bônus de maestria para reduzir custo em 1 PE; ganha maestria em 1 TR entre Astúcia, Fortitude, Reflexos e Vontade; resistência a dano necrótico.",
        modifica: ["atributosDistribuicao", "pericias", "custoTecnica", "testesDeResistencia", "resistencias"],
        formula_sugerida: "atributosDistribuicao += 3; reduzirCusto(em bonusMaestria habilidades,1); maestriaTR += 1; resistencias += ['necrotico']",
        observacoes: ""
    },
    {
        nome: "Shunsui",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+2 FOR, DES ou CON e +1 em outro dos três; maestria em 2 perícias entre Atletismo, Acrobacia e Integridade, ou especialização em 1; limite natural de FOR/DES/CON aumenta em 2; ganha +1 PV máximo a cada 2 níveis; 1x por descanso longo, ao cair a 0 PV sem morrer instantaneamente, fica com 1 PV.",
        modifica: ["forca", "destreza", "constituicao", "pericias", "limiteNaturalAtributo", "pvMax", "sobrevivencia"],
        formula_sugerida: "limiteNaturalFOR += 2; limiteNaturalDES += 2; limiteNaturalCON += 2; pvMax += floor(nivel/2)",
        observacoes: ""
    },
    {
        nome: "Taiho",
        tipo: "origem",
        categoria: "clã herdado",
        efeito_resumido: "+2 INT ou SAB e +1 no outro; maestria em 2 perícias de Inteligência/Sabedoria, ou especialização em 1.",
        modifica: ["inteligencia", "sabedoria", "pericias"],
        formula_sugerida: "atributoEscolhido += 2; outro += 1; aplicar maestrias INT/SAB",
        observacoes: "A habilidade 'Mente Celeste' ficou cortada no trecho acessível."
    },
    {
        nome: "Adepto de Combate",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Aprende 1 estilo de combate da especialização Especialista em Combate.",
        modifica: ["estilosDeCombate"],
        formula_sugerida: "estilosDeCombate += 1",
        observacoes: ""
    },
    {
        nome: "Afinidade com Técnica",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ganha 1 habilidade de técnica extra; aumenta o máximo de habilidades de técnica em metade do bônus de maestria; no nível 10 ganha outra habilidade de técnica extra.",
        modifica: ["habilidadesTecnica", "maxHabilidadesTecnica"],
        formula_sugerida: "habilidadesTecnica += 1; maxHabilidadesTecnica += floor(bonusMaestria/2); if nivel >= 10: habilidadesTecnica += 1",
        observacoes: ""
    },
    {
        nome: "Arremessos Debilitantes",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Em ataque com arma de arremesso, pode sofrer -5 no acerto para impor -5 na próxima rolagem do alvo se acertar.",
        modifica: ["ataqueArremesso", "debuffAlvo"],
        formula_sugerida: "opcao: ataque -= 5; emAcerto alvo.proximaRolagem -= 5",
        observacoes: ""
    },
    {
        nome: "Artesão Amaldiçoado",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Rolagens para criar ou melhorar ferramenta amaldiçoada são feitas com vantagem.",
        modifica: ["criacaoFerramentaAmaldicoada"],
        formula_sugerida: "vantagem = true em rolagens de criação/melhoria",
        observacoes: ""
    },
    {
        nome: "Atenção Infalível",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Não pode ser surpreendido se estiver consciente; ataques de inimigos não vistos não o deixam desprevenido; +5 em Atenção.",
        modifica: ["atencao", "surpresa", "desprevenido"],
        formula_sugerida: "atencao += 5",
        observacoes: ""
    },
    {
        nome: "Atirador Preciso",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ataques à distância em longo alcance não sofrem desvantagem; ignora meia cobertura e 3/4 de cobertura; pode sofrer -5 no acerto para causar +10 de dano.",
        modifica: ["ataqueDistancia", "cobertura", "danoDistancia"],
        formula_sugerida: "opcao: ataque -= 5; dano += 10",
        observacoes: ""
    },
    {
        nome: "Dedicação Recompensadora",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Aumenta recompensas de itens por grau.",
        modifica: ["recompensas", "inventario"],
        formula_sugerida: "aplicar tabela de itens extras por grau",
        observacoes: "Melhor modelar com tabela por grau, não como fórmula simples."
    },
    {
        nome: "Favorecido pela Sorte",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ganha 3 pontos de sorte; pode gastar 1 para rolar outro d20 em teste próprio ou quando for atacado; recupera após descanso longo.",
        modifica: ["pontosDeSorte", "rerrolagem"],
        formula_sugerida: "pontosSorteMax = 3",
        observacoes: ""
    },
    {
        nome: "Feiticeiro Companheiro",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Recebe um aliado; do nível 1-5 é iniciante, 6-10 veterano, 11+ mestre.",
        modifica: ["aliado"],
        formula_sugerida: "tierAliado = nivel <=5 ? 'iniciante' : nivel <=10 ? 'veterano' : 'mestre'",
        observacoes: ""
    },
    {
        nome: "Mestre das Armas",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+1 FOR ou DES; maestria em 4 armas quaisquer.",
        modifica: ["forca", "destreza", "maestriasArma"],
        formula_sugerida: "atributoEscolhido += 1; maestriasArma += 4",
        observacoes: ""
    },
    {
        nome: "Mestre Defensivo",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+1 FOR ou CON; maestria em 2 tipos de armadura e em escudos.",
        modifica: ["forca", "constituicao", "maestriasArmadura", "maestriaEscudo"],
        formula_sugerida: "atributoEscolhido += 1; maestriasArmadura += 2; maestriaEscudo = true",
        observacoes: ""
    },
    {
        nome: "Provocação Desafiadora",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Alvo de sua provocação só pode atacar você até escapar do efeito.",
        modifica: ["provocar"],
        formula_sugerida: "alvo.provocado = 'somenteAtacarVoce'",
        observacoes: ""
    },
    {
        nome: "Resiliência Melhorada",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Recebe maestria em 1 perícia usada para TR à escolha; se já tiver maestria, torna-se especialista; o atributo usado nessa perícia aumenta em 2.",
        modifica: ["testesDeResistencia", "atributos"],
        formula_sugerida: "if jaTemMaestria -> especialista; else maestria += 1; atributoRelacionado += 2",
        observacoes: ""
    },
    {
        nome: "Técnicas Agressivas de Escudo",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ao atacar, pode usar ação bônus para empurrar com escudo; se empurrar com sucesso, causa Xd4 + mod FOR de dano de impacto, onde X = mod FOR; alvo cai e pode ser empurrado até 4,5 m.",
        modifica: ["acaoBonus", "empurrao", "danoImpacto"],
        formula_sugerida: "dano = (modFOR)d4 + modFOR",
        observacoes: ""
    },
    {
        nome: "Técnicas de Arremesso",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+2 para acertar e +3 no dano com armas de arremesso; se errar, a arma volta para a mão, salvo bloqueio na trajetória.",
        modifica: ["ataqueArremesso", "danoArremesso", "retornoArma"],
        formula_sugerida: "ataque += 2; dano += 3",
        observacoes: ""
    },
    {
        nome: "Técnicas de Reação Rápida",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+5 de Iniciativa; após a rolagem de iniciativa, se não for o primeiro, pode rerrolar e ficar com o melhor resultado.",
        modifica: ["iniciativa"],
        formula_sugerida: "iniciativa += 5; podeRerrolarIniciativa = true",
        observacoes: ""
    },
    {
        nome: "Disparos Perfurantes",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ao atacar com arma de fogo um alvo adjacente a outra criatura, a adjacente faz TR de Reflexos; se falhar, recebe metade do dano causado ao alvo principal.",
        modifica: ["ataqueArmaDeFogo", "danoSecundario"],
        formula_sugerida: "secundarioDano = floor(danoPrincipal/2)",
        observacoes: "Pré-requisito: Nível 4."
    },
    {
        nome: "Mestre da Criação",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Cria 2 itens adicionais durante interlúdio; em interlúdio focado em Criação de Itens, cria 4 adicionais; +3 em duas perícias de Ofício.",
        modifica: ["criacaoItens", "pericias"],
        formula_sugerida: "itensCriados += 2 ou += 4; doisOficios += 3",
        observacoes: "Pré-requisitos: Nível 4 e maestria em dois Ofícios."
    },
    {
        nome: "Mestre dos Chicotes",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+4 de dano com chicotes; alcance +1,5 m; 1x por turno, ao acertar com chicote, o alvo faz TR de Fortitude e, se falhar, é puxado até 3 m.",
        modifica: ["ataqueChicote", "alcanceChicote", "controleDePosicao"],
        formula_sugerida: "dano += 4; alcance += 1.5",
        observacoes: "Pré-requisito: Nível 5."
    },
    {
        nome: "Técnicas do Sentinela",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ataque de oportunidade que acerta zera o deslocamento do alvo; criaturas provocam ataque de oportunidade mesmo se usarem Desengajar; quando uma criatura a 1,5 m atacar outro alvo, você pode atacá-la com reação.",
        modifica: ["ataqueDeOportunidade", "controleDeMovimento", "reacao"],
        formula_sugerida: "emAOOAcertado alvo.movimento = 0",
        observacoes: "Pré-requisito: Nível 5."
    },
    {
        nome: "Rápido no Gatilho",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "Ignora Recarga em armas à distância cuja recarga custe ação bônus; curta distância não impõe desvantagem com armas à distância.",
        modifica: ["armasADistancia", "recarga", "ataqueCurtaDistancia"],
        formula_sugerida: "ignorarRecargaAcaoBonus = true; semDesvantagemCurtaDistancia = true",
        observacoes: "Pré-requisitos: DES 16 e Nível 6."
    },
    {
        nome: "Especialista em Concussão",
        tipo: "talento",
        categoria: "talento geral",
        efeito_resumido: "+1 FOR ou CON; armas de impacto sobem 1 nível de dano; 1x por turno, ao causar dano de impacto, move o alvo até 3 m para espaço desocupado.",
        modifica: ["forca", "constituicao", "danoImpacto", "controleDePosicao"],
        formula_sugerida: "atributoEscolhido += 1; nivelDanoImpacto += 1",
        observacoes: ""
    }
];

const slugifyCharacteristicId = (value) => {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
};

export const JUJUTSU_CHARACTERISTICS_CATALOG = RAW_JUJUTSU_CHARACTERISTICS_CATALOG.map((entry, index) => ({
    id: slugifyCharacteristicId(entry.nome) || `characteristic-${index + 1}`,
    origem: "predefinida",
    ...entry,
    modifica: Array.isArray(entry.modifica) ? entry.modifica : []
}));
