import { JUJUTSU_CHARACTERISTICS_CATALOG } from './characteristicsCatalog.js';

const ATTRIBUTE_OPTIONS = [
    { key: 'for', label: 'FOR' },
    { key: 'des', label: 'DEX' },
    { key: 'con', label: 'CON' },
    { key: 'int', label: 'INT' },
    { key: 'sab', label: 'SAB' },
    { key: 'pre', label: 'PRE' }
];

const ATTRIBUTE_KEYS = new Set(ATTRIBUTE_OPTIONS.map((attribute) => attribute.key));

const ATTRIBUTES = [
    { key: 'for', label: 'FOR' },
    { key: 'des', label: 'DEX' },
    { key: 'con', label: 'CONS' },
    { key: 'int', label: 'INT' },
    { key: 'sab', label: 'SAB' },
    { key: 'pre', label: 'PRE' }
];

const INVOCATION_SLOTS = [
    { key: 'invocacao1', label: 'Invocação 1' },
    { key: 'invocacao2', label: 'Invocação 2' },
    { key: 'invocacao3', label: 'Invocação 3' },
    { key: 'invocacao4', label: 'Invocação 4' }
];

const INVOCATION_ATTRIBUTES = [
    { key: 'for', label: 'Força' },
    { key: 'des', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'sab', label: 'Sabedoria' },
    { key: 'pre', label: 'Presença' }
];

const ATTACK_BONUSES = [
    { key: 'melee', label: 'Corpo a corpo', attribute: 'for', alwaysTrained: false },
    { key: 'ranged', label: '\u00c0 Dist\u00e2ncia', attribute: 'des', alwaysTrained: false },
    { key: 'cursed', label: 'Amaldi\u00e7oado', attribute: 'for', alwaysTrained: true }
];

const SAVING_THROWS = [
    { key: 'astucia', label: 'Ast\u00facia', attribute: 'int' },
    { key: 'fortitude', label: 'Fortitude', attribute: 'con' },
    { key: 'integridade', label: 'Integridade', attribute: 'con' },
    { key: 'reflexos', label: 'Reflexos', attribute: 'des' },
    { key: 'vontade', label: 'Vontade', attribute: 'sab' }
];

const SKILLS = [
    { key: 'atletismo', label: 'Atletismo', attribute: 'for' },
    { key: 'acrobacia', label: 'Acrobacia', attribute: 'des' },
    { key: 'furtividade', label: 'Furtividade', attribute: 'des' },
    { key: 'prestidigitacao', label: 'Prestidigita\u00e7\u00e3o', attribute: 'des' },
    { key: 'feiticaria', label: 'Feiti\u00e7aria', attribute: 'int' },
    { key: 'historia', label: 'Hist\u00f3ria', attribute: 'int' },
    { key: 'investigacao', label: 'Investiga\u00e7\u00e3o', attribute: 'int' },
    { key: 'oficio1', label: 'Of\u00edcio', attribute: 'int', customName: true, customAttribute: true },
    { key: 'oficio2', label: 'Of\u00edcio', attribute: 'int', customName: true, customAttribute: true },
    { key: 'oficio3', label: 'Of\u00edcio', attribute: 'int', customName: true, customAttribute: true },
    { key: 'tecnologia', label: 'Tecnologia', attribute: 'int' },
    { key: 'teologia', label: 'Teologia', attribute: 'int' },
    { key: 'direcao', label: 'Dire\u00e7\u00e3o', attribute: 'sab' },
    { key: 'intuicao', label: 'Intui\u00e7\u00e3o', attribute: 'sab' },
    { key: 'medicina', label: 'Medicina', attribute: 'sab' },
    { key: 'ocultismo', label: 'Ocultismo', attribute: 'sab' },
    { key: 'percepcao', label: 'Percep\u00e7\u00e3o', attribute: 'sab' },
    { key: 'sobrevivencia', label: 'Sobreviv\u00eancia', attribute: 'sab' },
    { key: 'enganacao', label: 'Engana\u00e7\u00e3o', attribute: 'pre' },
    { key: 'intimidacao', label: 'Intimida\u00e7\u00e3o', attribute: 'pre' },
    { key: 'performance', label: 'Performance', attribute: 'pre' },
    { key: 'persuasao', label: 'Persuas\u00e3o', attribute: 'pre' }
];

const RD_TYPES = ['cor', 'imp', 'per', 'con', 'que', 'cho', 'son', 'ene', 'psi', 'rad', 'nec', 'ven'];
const RD_LABELS = {
    cor: 'Cortante',
    imp: 'Impacto',
    per: 'Perfurante',
    con: 'Congelante',
    que: 'Queimante',
    cho: 'Chocante',
    son: 'Sonico',
    ene: 'Energetico',
    psi: 'Psiquico',
    rad: 'Radiante',
    nec: 'Necrotico',
    ven: 'Venenoso'
};

const HIT_DICE = ['d8', 'd10', 'd12'];

const n = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};
const b = (value) => value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
export const calculateJujutsuAttributeMod = (value) => Math.floor((n(value) - 10) / 2);
export const calculateJujutsuTrainingBonus = (level) => {
    const safeLevel = n(level);
    return 2 + (safeLevel >= 5 ? 1 : 0) + (safeLevel >= 9 ? 1 : 0) + (safeLevel >= 13 ? 1 : 0) + (safeLevel >= 17 ? 1 : 0);
};
export const calculateJujutsuMasterTrainingBonus = (level) => {
    const trainingBonus = calculateJujutsuTrainingBonus(level);
    return trainingBonus + Math.floor(trainingBonus / 2);
};
export const calculateJujutsuSkillTotal = ({ attributeValue = 10, level = 1, trained = false, master = false, others = 0 }) => {
    const attributeMod = calculateJujutsuAttributeMod(attributeValue);
    const levelHalf = Math.floor(n(level) / 2);
    const trainingBonus = calculateJujutsuTrainingBonus(level);
    const masteryBonus = calculateJujutsuMasterTrainingBonus(level);
    const proficiencyBonus = b(master) ? masteryBonus : b(trained) ? trainingBonus : 0;
    return attributeMod + levelHalf + proficiencyBonus + n(others);
};
export const calculateJujutsuSavingThrowTotal = ({ attributeValue = 10, level = 1, trained = false, master = false, others = 0 }) => {
    const attributeMod = calculateJujutsuAttributeMod(attributeValue);
    const levelHalf = Math.floor(n(level) / 2);
    const trainingBonus = calculateJujutsuTrainingBonus(level);
    const masteryBonus = calculateJujutsuMasterTrainingBonus(level);
    const proficiencyBonus = b(master) ? masteryBonus : b(trained) ? trainingBonus : 0;
    return attributeMod + levelHalf + proficiencyBonus + n(others);
};
// Attack totals follow the system's fixed rule: attribute mod + level/2 + BT when trained + others.
export const calculateJujutsuAttackTotal = ({ attributeValue = 10, level = 1, trained = false, others = 0 }) => {
    const attributeMod = calculateJujutsuAttributeMod(attributeValue);
    const levelHalf = Math.floor(n(level) / 2);
    const trainingBonus = b(trained) ? calculateJujutsuTrainingBonus(level) : 0;
    return attributeMod + levelHalf + trainingBonus + n(others);
};
const percent = (current, max) => {
    if (max <= 0)
        return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
};
const resourceDisplay = (current, max) => {
    const safeCurrent = Math.max(0, current);
    const safeMax = Math.max(0, max);
    const extra = Math.max(0, safeCurrent - safeMax);
    if (safeCurrent <= 0) {
        return {
            current: safeCurrent,
            max: safeMax,
            lost: Math.max(0, safeMax - safeCurrent),
            percent: 0,
            extra,
            extraPercent: 0
        };
    }
    if (safeCurrent <= safeMax || safeMax <= 0) {
        return {
            current: safeCurrent,
            max: safeMax,
            lost: Math.max(0, safeMax - safeCurrent),
            percent: percent(safeCurrent, safeMax),
            extra,
            extraPercent: 0
        };
    }
    const total = safeCurrent;
    return {
        current: safeCurrent,
        max: safeMax,
        lost: 0,
        percent: (safeMax / total) * 100,
        extra,
        extraPercent: (extra / total) * 100
    };
};

const buildRdValues = (rds = {}) => {
    return RD_TYPES.map((type) => {
        const value = n(rds?.[type]);
        const label = RD_LABELS[type] ?? type.toUpperCase();
        const code = type.toUpperCase();
        return {
            type,
            code,
            label,
            value,
            enabled: value > 0,
            tooltip: `${code} - ${label} | Redução: ${value}`
        };
    });
};

const buildBaseResistanceCatalog = () => {
    return RD_TYPES.map((type) => {
        const label = RD_LABELS[type] ?? type.toUpperCase();
        return {
            id: type,
            type,
            label,
            code: type.toUpperCase(),
            description: `Recebe apenas 50% do dano do tipo ${label.toLowerCase()}.`,
            observations: '',
            origem: 'base'
        };
    });
};

const CHARACTERISTIC_TYPE_SHORT = {
    origem: 'ORG',
    talento: 'TAL',
    custom: 'CUS',
    legado: 'LEG'
};

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');
const coerceTextValue = (value) => {
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value))
        return value.map((entry) => coerceTextValue(entry)).find((entry) => entry !== '') ?? '';
    if (value && typeof value === 'object')
        return Object.values(value).map((entry) => coerceTextValue(entry)).find((entry) => entry !== '') ?? '';
    if (value === null || value === undefined)
        return '';
    return String(value);
};
const toArrayValues = (value) => {
    if (Array.isArray(value))
        return value;
    if (value && typeof value === 'object')
        return Object.values(value);
    return [];
};

const normalizeCharacteristicId = (value, fallbackPrefix, index) => {
    const raw = cleanText(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return raw || `${fallbackPrefix}-${index + 1}`;
};

const normalizeCharacteristicEntry = (entry, fallbackPrefix = 'custom', index = 0, origem = 'custom') => {
    if (!entry || typeof entry !== 'object')
        return null;
    const nome = cleanText(entry.nome ?? entry.name);
    const tipo = cleanText(entry.tipo);
    const categoria = cleanText(entry.categoria);
    const efeito_resumido = cleanText(entry.efeito_resumido ?? entry.efeito);
    const formula_sugerida = cleanText(entry.formula_sugerida);
    const observacoes = cleanText(entry.observacoes);
    const modifica = Array.isArray(entry.modifica)
        ? entry.modifica.map((item) => cleanText(item)).filter(Boolean)
        : cleanText(entry.modifica)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    if (!nome && !tipo && !categoria && !efeito_resumido && !formula_sugerida && !observacoes && modifica.length === 0) {
        return null;
    }
    return {
        id: normalizeCharacteristicId(entry.id ?? nome, fallbackPrefix, index),
        nome: nome || `Característica Custom ${index + 1}`,
        tipo,
        categoria,
        efeito_resumido,
        modifica,
        formula_sugerida,
        observacoes,
        origem,
        enabled: entry.enabled !== undefined ? b(entry.enabled) : true
    };
};

const createLegacyCharacteristic = (value) => {
    const text = cleanText(value);
    if (!text)
        return null;
    return {
        id: 'caracteristica-importada',
        nome: 'Característica Importada',
        tipo: 'legado',
        categoria: 'migração',
        efeito_resumido: text,
        modifica: [],
        formula_sugerida: '',
        observacoes: 'Migrada automaticamente do campo de texto antigo.',
        origem: 'custom',
        enabled: true
    };
};

const buildCharacteristicTooltip = (entry) => {
    const parts = [
        entry.nome,
        entry.tipo ? `Tipo: ${entry.tipo}` : '',
        entry.categoria ? `Categoria: ${entry.categoria}` : '',
        entry.efeito_resumido ? `Efeito: ${entry.efeito_resumido}` : '',
        entry.observacoes ? `Observações: ${entry.observacoes}` : ''
    ].filter(Boolean);
    return parts.join(' | ');
};

const buildCharacteristicDisplay = (entry) => {
    const tipo = cleanText(entry.tipo);
    const categoria = cleanText(entry.categoria);
    return {
        ...entry,
        isCustom: entry.origem === 'custom',
        typeShort: CHARACTERISTIC_TYPE_SHORT[tipo] ?? (tipo ? tipo.slice(0, 3).toUpperCase() : 'CAR'),
        meta: [tipo, categoria].filter(Boolean).join(' • '),
        modificaText: Array.isArray(entry.modifica) ? entry.modifica.join(', ') : '',
        tooltip: buildCharacteristicTooltip(entry),
        searchText: [entry.nome, tipo, categoria, entry.efeito_resumido, entry.observacoes].filter(Boolean).join(' ').toLowerCase()
    };
};

const buildResistanceCode = (entry) => {
    const explicitCode = cleanText(entry.code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (explicitCode)
        return explicitCode.slice(0, 6);
    const label = cleanText(entry.label ?? entry.nome ?? entry.name)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]+/g, ' ')
        .trim();
    if (!label)
        return 'RES';
    const initials = label
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    return (initials || label.replace(/\s+/g, '').slice(0, 3)).slice(0, 6).toUpperCase();
};

const normalizeResistanceEntry = (entry, index = 0, origem = 'custom') => {
    if (!entry || typeof entry !== 'object')
        return null;
    const label = cleanText(entry.label ?? entry.nome ?? entry.name);
    const description = cleanText(entry.description ?? entry.efeito_resumido ?? entry.summary);
    const observations = cleanText(entry.observations ?? entry.observacoes);
    const code = buildResistanceCode(entry);
    if (!label && !description && !observations && !code) {
        return null;
    }
    return {
        id: normalizeCharacteristicId(entry.id ?? label ?? code, 'custom-resistance', index),
        label: label || `Resistência Custom ${index + 1}`,
        code,
        description,
        observations,
        origem,
        enabled: entry.enabled !== undefined ? b(entry.enabled) : true
    };
};

const createLegacyResistanceEntries = (value) => {
    return cleanText(value)
        .split(/\r?\n/g)
        .map((line) => cleanText(line))
        .filter(Boolean)
        .map((line, index) => normalizeResistanceEntry({
        id: `legacy-resistance-${index + 1}`,
        label: line,
        description: 'Migrada automaticamente do campo de texto antigo.',
        observations: '',
        enabled: true
    }, index, 'custom'))
        .filter(Boolean);
};

const buildResistanceDisplay = (entry) => {
    const tooltipParts = [
        entry.label,
        entry.code ? `Sigla: ${entry.code}` : '',
        entry.description ? `Descrição: ${entry.description}` : '',
        entry.observations ? `Observações: ${entry.observations}` : ''
    ].filter(Boolean);
    return {
        ...entry,
        summary: entry.description || entry.observations || 'Resistência custom configurada.',
        tooltip: tooltipParts.join(' | ')
    };
};

const buildTrainingCode = (entry) => {
    const explicitCode = cleanText(entry.code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (explicitCode)
        return explicitCode.slice(0, 6);
    const label = cleanText(entry.label ?? entry.nome ?? entry.name)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]+/g, ' ')
        .trim();
    if (!label)
        return 'TRN';
    const initials = label
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    return (initials || label.replace(/\s+/g, '').slice(0, 3)).slice(0, 6).toUpperCase();
};

const normalizeTrainingEntry = (entry, index = 0, origem = 'custom') => {
    if (!entry || typeof entry !== 'object')
        return null;
    const label = cleanText(entry.label ?? entry.nome ?? entry.name);
    const description = cleanText(entry.description ?? entry.efeito_resumido ?? entry.summary);
    const observations = cleanText(entry.observations ?? entry.observacoes);
    const code = buildTrainingCode(entry);
    if (!label && !description && !observations && !code) {
        return null;
    }
    return {
        id: normalizeCharacteristicId(entry.id ?? label ?? code, 'custom-training', index),
        label: label || `Treinamento ${index + 1}`,
        code,
        description,
        observations,
        origem,
        enabled: entry.enabled !== undefined ? b(entry.enabled) : true
    };
};

const createLegacyTrainingEntries = (value) => {
    return cleanText(value)
        .split(/\r?\n/g)
        .map((line) => cleanText(line))
        .filter(Boolean)
        .map((line, index) => normalizeTrainingEntry({
        id: `legacy-training-${index + 1}`,
        label: line,
        description: 'Migrado automaticamente do campo de texto antigo.',
        observations: '',
        enabled: true
    }, index, 'custom'))
        .filter(Boolean);
};

const buildTrainingDisplay = (entry) => {
    const tooltipParts = [
        entry.label,
        entry.code ? `Sigla: ${entry.code}` : '',
        entry.description ? `Descrição: ${entry.description}` : '',
        entry.observations ? `Observações: ${entry.observations}` : ''
    ].filter(Boolean);
    return {
        ...entry,
        summary: entry.description || entry.observations || 'Treinamento custom configurado.',
        tooltip: tooltipParts.join(' | ')
    };
};

const normalizeJujutsuTableEntryId = (value, prefix, index) => {
    return normalizeCharacteristicId(value ?? `${prefix}-${index + 1}`, prefix, index);
};

const normalizeAttackTableEntry = (entry, index = 0) => {
    const weapon = cleanText(entry?.weapon);
    const name = cleanText(entry?.name) || weapon || `Ataque ${index + 1}`;
    return {
        id: normalizeJujutsuTableEntryId(entry?.id ?? name, 'attack-entry', index),
        name,
        image: cleanText(entry?.image) || 'icons/svg/sword.svg',
        acerto: n(entry?.acerto),
        weapon,
        bonus: n(entry?.bonus),
        damage: cleanText(entry?.damage),
        crit: cleanText(entry?.crit),
        type: cleanText(entry?.type),
        range: cleanText(entry?.range),
        properties: cleanText(entry?.properties),
        description: cleanText(entry?.description),
        observations: cleanText(entry?.observations)
    };
};

const normalizeFeatureTableEntry = (entry, index = 0, prefix = 'feature-entry', fallbackLabel = 'Item') => {
    const name = cleanText(entry?.name) || `${fallbackLabel} ${index + 1}`;
    return {
        id: normalizeJujutsuTableEntryId(entry?.id ?? name, prefix, index),
        name,
        image: cleanText(entry?.image) || 'icons/svg/book.svg',
        acerto: n(entry?.acerto),
        current: n(entry?.current),
        max: n(entry?.max),
        cost: n(entry?.cost),
        level: Math.max(0, Math.min(5, Math.trunc(n(entry?.level)))),
        description: cleanText(entry?.description),
        observations: cleanText(entry?.observations)
    };
};

const normalizeInventoryTableEntry = (entry, index = 0) => {
    const name = cleanText(entry?.name) || `Item ${index + 1}`;
    const rollDie = cleanText(entry?.rollDie).toLowerCase();
    const hasRoll = b(entry?.hasRoll);
    const rollCount = Math.max(1, Math.trunc(n(entry?.rollCount) || 1));
    const rollBonus = Math.trunc(n(entry?.rollBonus));
    const rollAttribute = ATTRIBUTE_KEYS.has(cleanText(entry?.rollAttribute).toLowerCase()) ? cleanText(entry?.rollAttribute).toLowerCase() : '';
    const rollAttributeLabel = ATTRIBUTE_OPTIONS.find((option) => option.key === rollAttribute)?.label ?? '';
    const rollLabelParts = [];
    if (hasRoll && ['d4', 'd8', 'd10', 'd12', 'd20'].includes(rollDie)) {
        rollLabelParts.push(`${rollCount}${rollDie}`);
        if (rollBonus > 0)
            rollLabelParts.push(`+${rollBonus}`);
        else if (rollBonus < 0)
            rollLabelParts.push(`${rollBonus}`);
        if (rollAttributeLabel)
            rollLabelParts.push(`+${rollAttributeLabel}`);
    }
    return {
        id: normalizeJujutsuTableEntryId(entry?.id ?? name, 'inventory-entry', index),
        name,
        image: cleanText(entry?.image) || 'icons/svg/item-bag.svg',
        quantity: Math.max(0, Math.trunc(n(entry?.quantity))),
        weight: n(entry?.weight),
        price: n(entry?.price),
        hasRoll,
        rollDie: hasRoll && ['d4', 'd8', 'd10', 'd12', 'd20'].includes(rollDie) ? rollDie : '',
        rollCount,
        rollBonus,
        rollAttribute,
        rollAttributeLabel,
        rollLabel: rollLabelParts.join(' ')
    };
};

const defaultAttributeModel = () => ({ value: 10, mod: 0 });
const defaultAttackBonusModel = (defaultAttribute, alwaysTrained = false) => ({
    attribute: defaultAttribute,
    bonus: 0,
    others: 0,
    t: alwaysTrained,
    total: 0
});
const defaultSavingThrowModel = () => ({ bonus: 0, others: 0, total: 0, t: false, m: false, o: false });
const defaultSkillModel = () => ({ name: '', attribute: '', others: 0, t: false, m: false, total: 0 });
const defaultCharacteristicsModel = () => ({ selected: [], custom: [] });
const defaultResistanceConfigModel = () => ({ selected: [], custom: [] });
const defaultTrainingConfigModel = () => ({ custom: [] });
const defaultInvocationModel = () => ({
    name: '',
    grau: '',
    image: '',
    hpCurrent: 0,
    hpMax: 0,
    defense: 0,
    movement: '',
    attributes: {
        for: 0,
        des: 0,
        con: 0,
        int: 0,
        sab: 0,
        pre: 0
    },
    acoesCaracteristicas: '',
    trainedSkills: []
});

const normalizeInvocationSkillEntry = (entry, index = 0) => {
    const name = cleanText(entry?.name) || `Perícia ${index + 1}`;
    const rawAttribute = cleanText(entry?.attribute).toLowerCase();
    const attribute = ATTRIBUTE_KEYS.has(rawAttribute) ? rawAttribute : 'for';
    return {
        id: normalizeJujutsuTableEntryId(entry?.id ?? name, 'invocation-skill-entry', index),
        name,
        attribute,
        others: Math.trunc(n(entry?.others))
    };
};

const hasInvocationContent = (entry = {}) => {
    if (cleanText(entry?.name) || cleanText(entry?.grau) || cleanText(entry?.image) || cleanText(entry?.movement) || cleanText(entry?.acoesCaracteristicas)) {
        return true;
    }
    if (Math.trunc(n(entry?.hpCurrent)) || Math.trunc(n(entry?.hpMax)) || Math.trunc(n(entry?.defense))) {
        return true;
    }
    if (INVOCATION_ATTRIBUTES.some((attribute) => Math.trunc(n(entry?.attributes?.[attribute.key])))) {
        return true;
    }
    return toArrayValues(entry?.trainedSkills).length > 0;
};

const normalizeInvocationEntry = (entry = {}) => {
    const attributes = {};
    for (const attribute of INVOCATION_ATTRIBUTES) {
        attributes[attribute.key] = Math.trunc(n(entry?.attributes?.[attribute.key]));
    }
    return {
        name: cleanText(entry?.name),
        grau: coerceTextValue(entry?.grau),
        image: coerceTextValue(entry?.image),
        hpCurrent: Math.max(0, Math.trunc(n(entry?.hpCurrent))),
        hpMax: Math.max(0, Math.trunc(n(entry?.hpMax))),
        defense: Math.trunc(n(entry?.defense)),
        movement: coerceTextValue(entry?.movement),
        attributes,
        acoesCaracteristicas: coerceTextValue(entry?.acoesCaracteristicas),
        trainedSkills: toArrayValues(entry?.trainedSkills).map((skill, index) => normalizeInvocationSkillEntry(skill, index))
    };
};

const normalizeInvocationTableEntry = (entry = {}, index = 0, fallbackName = `Invocação ${index + 1}`) => {
    const invocation = normalizeInvocationEntry(entry);
    const name = cleanText(invocation.name) || fallbackName;
    return {
        id: normalizeJujutsuTableEntryId(entry?.id ?? name, 'invocation-entry', index),
        ...invocation,
        name
    };
};

export const createJujutsuTableRow = (type) => {
    if (type === 'talent') {
        return normalizeFeatureTableEntry({}, 0, 'talent-entry', 'Talento');
    }
    if (type === 'ability') {
        return normalizeFeatureTableEntry({}, 0, 'ability-entry', 'Habilidade');
    }
    if (type === 'aptitude') {
        return normalizeFeatureTableEntry({}, 0, 'aptitude-entry', 'Aptidão');
    }
    if (type === 'spell') {
        return normalizeFeatureTableEntry({
            level: 0
        }, 0, 'spell-entry', 'Feitiço');
    }
    if (type === 'invocation') {
        return normalizeInvocationTableEntry({
            name: 'Invocação'
        }, 0, 'Invocação');
    }
    if (type === 'invocationSkill') {
        return normalizeInvocationSkillEntry({
            name: '',
            attribute: 'for',
            others: 0
        }, 0);
    }
    if (type === 'inventory') {
        return normalizeInventoryTableEntry({
            name: '',
            quantity: 1,
            weight: 0,
            price: 0,
            image: 'icons/svg/item-bag.svg',
            hasRoll: false,
            rollDie: '',
            rollCount: 1,
            rollBonus: 0,
            rollAttribute: ''
        }, 0);
    }
    return normalizeAttackTableEntry({}, 0);
};

export const createJujutsuDefaultProps = () => {
    const attributes = {};
    for (const attribute of ATTRIBUTES) {
        attributes[attribute.key] = defaultAttributeModel();
    }

    const attackBonuses = {};
    for (const attackBonus of ATTACK_BONUSES) {
        attackBonuses[attackBonus.key] = defaultAttackBonusModel(attackBonus.attribute, attackBonus.alwaysTrained);
    }

    const savingThrows = {};
    for (const savingThrow of SAVING_THROWS) {
        savingThrows[savingThrow.key] = defaultSavingThrowModel();
    }

    const skills = {};
    for (const skill of SKILLS) {
        skills[skill.key] = defaultSkillModel();
    }

    const rds = {};
    for (const rdType of RD_TYPES) {
        rds[rdType] = 0;
    }

    const hitDice = {};
    for (const die of HIT_DICE) {
        hitDice[die] = { gastos: 0, disponiveis: 0 };
    }
    const invocations = {};
    for (const slot of INVOCATION_SLOTS) {
        invocations[slot.key] = defaultInvocationModel();
    }

    return {
        jogador: '',
        origem: '',
        especializacao: '',
        tecnica: '',
        campanha: '',
        grau: '',
        experiencia: '',
        level: 1,
        treinamento: 0,
        attributes,
        attention: {
            base: 10,
            perception: 0,
            others: 0
        },
        initiative: {
            others: 0
        },
        resources: {
            vida: { atuais: 0, perdidos: 0, maximos: 0 },
            energia: { atuais: 0, perdidos: 0, maximos: 0 },
            integridade: { atual: 0, perdidos: 0, maxima: 0 }
        },
        extra: {
            kamo: false,
            robustez: false,
            desExa: false,
            vigorInf: false,
            outros: 0
        },
        estadoAtual: {
            estado: '',
            rdLabel: 'RD',
            valor: 0
        },
        defense: {
            base: 10,
            equip: 0,
            dex: 0,
            others: 0
        },
        attackBonuses,
        savingThrows,
        movement: '9m',
        specializationCd: {
            base: 10,
            attribute: 'des',
            treino: 0,
            others: 0
        },
        deathTests: {
            successes: [false, false, false],
            failures: [false, false, false]
        },
        hitDice,
        invocations,
        skills,
        rds,
        resistanceConfig: defaultResistanceConfigModel(),
        trainingConfig: defaultTrainingConfigModel(),
        resistencias: '',
        treinamentos: '',
        notes: '',
        registro: {
            aparencia: '',
            nome: '',
            idade: '',
            altura: '',
            peso: '',
            genero: '',
            cabelos: '',
            olhos: '',
            pele: '',
            roupas: '',
            marca: '',
            tracosPersonalidade: '',
            ideais: '',
            ligacoes: '',
            complicacoes: '',
            dominioInato: ''
        },
        aptitudeLevels: {
            aura: 0,
            controleLeitura: 0,
            barreira: 0,
            dominio: 0,
            energiaReversa: 0
        },
        perfilAmaldicoado: {
            tecnicaNome: '',
            tecnicaDescricao: '',
            expansaoNome: '',
            expansaoTipo: '',
            expansaoDescricao: '',
            tecnicaMaximaNome: '',
            tecnicaMaximaDescricao: '',
            atributoPrincipal: 'des',
            cdTecnica: {
                others: 0
            },
            cdAmaldicoada: {
                others: 0
            }
        },
        inventory: {
            spaceLimit: 18
        },
        characteristics: defaultCharacteristicsModel(),
        tables: {
            attacks: [],
            abilities: [],
            talents: [],
            aptitudes: [],
            spells: [],
            invocations: [],
            inventory: []
        }
    };
};

export const prepareJujutsuSheetData = (sourceProps = {}) => {
    const normalizedSourceProps = foundry.utils.deepClone(sourceProps);
    if (typeof normalizedSourceProps.characteristics === 'string') {
        const legacyCharacteristic = createLegacyCharacteristic(normalizedSourceProps.characteristics);
        normalizedSourceProps.characteristics = {
            selected: [],
            custom: legacyCharacteristic ? [legacyCharacteristic] : []
        };
    }
    if ((!normalizedSourceProps.resistanceConfig ||
        (!toArrayValues(normalizedSourceProps.resistanceConfig?.selected).length &&
            !toArrayValues(normalizedSourceProps.resistanceConfig?.custom).length)) &&
        typeof normalizedSourceProps.resistencias === 'string' &&
        cleanText(normalizedSourceProps.resistencias)) {
        normalizedSourceProps.resistanceConfig = {
            selected: [],
            custom: createLegacyResistanceEntries(normalizedSourceProps.resistencias)
        };
    }
    if ((!normalizedSourceProps.trainingConfig || !toArrayValues(normalizedSourceProps.trainingConfig?.custom).length) &&
        typeof normalizedSourceProps.treinamentos === 'string' &&
        cleanText(normalizedSourceProps.treinamentos)) {
        normalizedSourceProps.trainingConfig = {
            custom: createLegacyTrainingEntries(normalizedSourceProps.treinamentos)
        };
    }
    const defaults = createJujutsuDefaultProps();
    const props = foundry.utils.mergeObject(defaults, normalizedSourceProps, {
        inplace: false,
        insertKeys: true,
        recursive: true
    });

    props.extra = {
        ...props.extra,
        kamo: b(props.extra?.kamo),
        robustez: b(props.extra?.robustez),
        desExa: b(props.extra?.desExa),
        vigorInf: b(props.extra?.vigorInf),
        outros: n(props.extra?.outros)
    };

    props.registro = {
        aparencia: coerceTextValue(props.registro?.aparencia),
        nome: coerceTextValue(props.registro?.nome),
        idade: coerceTextValue(props.registro?.idade),
        altura: coerceTextValue(props.registro?.altura),
        peso: coerceTextValue(props.registro?.peso),
        genero: coerceTextValue(props.registro?.genero),
        cabelos: coerceTextValue(props.registro?.cabelos),
        olhos: coerceTextValue(props.registro?.olhos),
        pele: coerceTextValue(props.registro?.pele),
        roupas: coerceTextValue(props.registro?.roupas),
        marca: coerceTextValue(props.registro?.marca),
        tracosPersonalidade: coerceTextValue(props.registro?.tracosPersonalidade),
        ideais: coerceTextValue(props.registro?.ideais),
        ligacoes: coerceTextValue(props.registro?.ligacoes),
        complicacoes: coerceTextValue(props.registro?.complicacoes),
        dominioInato: coerceTextValue(props.registro?.dominioInato)
    };

    props.aptitudeLevels = {
        aura: Math.max(0, Math.trunc(n(props.aptitudeLevels?.aura))),
        controleLeitura: Math.max(0, Math.trunc(n(props.aptitudeLevels?.controleLeitura))),
        barreira: Math.max(0, Math.trunc(n(props.aptitudeLevels?.barreira))),
        dominio: Math.max(0, Math.trunc(n(props.aptitudeLevels?.dominio))),
        energiaReversa: Math.max(0, Math.trunc(n(props.aptitudeLevels?.energiaReversa)))
    };

    const perfilAmaldicoadoAttributeKey = cleanText(props.perfilAmaldicoado?.atributoPrincipal).toLowerCase();
    props.perfilAmaldicoado = {
        tecnicaNome: coerceTextValue(props.perfilAmaldicoado?.tecnicaNome),
        tecnicaDescricao: coerceTextValue(props.perfilAmaldicoado?.tecnicaDescricao),
        expansaoNome: coerceTextValue(props.perfilAmaldicoado?.expansaoNome),
        expansaoTipo: coerceTextValue(props.perfilAmaldicoado?.expansaoTipo),
        expansaoDescricao: coerceTextValue(props.perfilAmaldicoado?.expansaoDescricao),
        tecnicaMaximaNome: coerceTextValue(props.perfilAmaldicoado?.tecnicaMaximaNome),
        tecnicaMaximaDescricao: coerceTextValue(props.perfilAmaldicoado?.tecnicaMaximaDescricao),
        atributoPrincipal: ATTRIBUTE_KEYS.has(perfilAmaldicoadoAttributeKey) ? perfilAmaldicoadoAttributeKey : 'des',
        cdTecnica: {
            others: n(props.perfilAmaldicoado?.cdTecnica?.others)
        },
        cdAmaldicoada: {
            others: n(props.perfilAmaldicoado?.cdAmaldicoada?.others)
        }
    };
    const normalizedInvocations = {};
    for (const slot of INVOCATION_SLOTS) {
        normalizedInvocations[slot.key] = normalizeInvocationEntry(props.invocations?.[slot.key]);
    }
    props.invocations = normalizedInvocations;
    const legacyInvocations = INVOCATION_SLOTS.reduce((rows, slot) => {
        const invocation = props.invocations?.[slot.key];
        if (!hasInvocationContent(invocation)) {
            return rows;
        }
        rows.push(normalizeInvocationTableEntry({
            ...invocation,
            name: invocation.name || slot.label
        }, rows.length, slot.label));
        return rows;
    }, []);
    const normalizedInvocationTable = toArrayValues(props.tables?.invocations).map((entry, index) => normalizeInvocationTableEntry(entry, index));
    props.tables = {
        ...props.tables,
        invocations: normalizedInvocationTable.length ? normalizedInvocationTable : legacyInvocations
    };

    const attributeMap = {};
    for (const attribute of ATTRIBUTES) {
        const value = n(props.attributes?.[attribute.key]?.value);
        const mod = calculateJujutsuAttributeMod(value);
        attributeMap[attribute.key] = {
            value,
            mod
        };
    }

    const level = n(props.level);
    const levelHalf = Math.floor(level / 2);
    // BT uses the system's fixed progression by level.
    const trainingBonus = calculateJujutsuTrainingBonus(level);
    const masterTrainingBonus = calculateJujutsuMasterTrainingBonus(level);
    props.treinamento = trainingBonus;

    const getAttrMod = (key) => attributeMap[key]?.mod ?? 0;
    const attentionTotal = n(props.attention?.base) + n(props.attention?.perception) + n(props.attention?.others);
    const initiativeDex = getAttrMod('des');
    const initiativeTotal = initiativeDex + n(props.initiative?.others);

    const defenseDex = n(props.defense?.dex);
    const defenseTotal = n(props.defense?.base) + n(props.defense?.equip) + defenseDex + levelHalf + n(props.defense?.others);

    const cdAttrKey = props.specializationCd?.attribute ?? 'des';
    const cdAttrMod = getAttrMod(cdAttrKey);
    const specializationCdTotal =
        n(props.specializationCd?.base) +
            cdAttrMod +
            n(props.specializationCd?.treino) +
            n(props.specializationCd?.others);

    const characteristicCatalogMap = new Map(JUJUTSU_CHARACTERISTICS_CATALOG.map((entry) => [entry.id, entry]));
    const selectedCharacteristicIds = toArrayValues(props.characteristics?.selected)
        .map((id) => cleanText(id))
        .filter((id) => characteristicCatalogMap.has(id));
    const customCharacteristics = toArrayValues(props.characteristics?.custom)
        .map((entry, index) => normalizeCharacteristicEntry(entry, 'custom-characteristic', index, 'custom'))
        .filter(Boolean);
    props.characteristics = {
        selected: selectedCharacteristicIds,
        custom: customCharacteristics
    };
    const selectedCharacteristicIdsSet = new Set(selectedCharacteristicIds);
    const characteristicDefinitions = [
        ...JUJUTSU_CHARACTERISTICS_CATALOG.map((entry) => buildCharacteristicDisplay({
            ...entry,
            selected: selectedCharacteristicIdsSet.has(entry.id),
            selectionName: `selected.${entry.id}`
        })),
        ...customCharacteristics.map((entry) => buildCharacteristicDisplay({
            ...entry,
            selected: entry.enabled !== false,
            selectionName: `customSelected.${entry.id}`
        }))
    ];
    const activeCharacteristics = characteristicDefinitions.filter((entry) => entry.selected);
    const characteristicTypeOptions = Array.from(new Set(characteristicDefinitions.map((entry) => entry.tipo).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right, 'pt-BR'));
    const characteristicCategoryOptions = Array.from(new Set(characteristicDefinitions.map((entry) => entry.categoria).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right, 'pt-BR'));
    const baseResistanceCatalog = buildBaseResistanceCatalog();
    const baseResistanceMap = new Map(baseResistanceCatalog.map((entry) => [entry.id, entry]));
    const selectedResistanceIds = toArrayValues(props.resistanceConfig?.selected)
        .map((id) => cleanText(id))
        .filter((id) => baseResistanceMap.has(id));
    const customResistanceEntries = toArrayValues(props.resistanceConfig?.custom)
        .map((entry, index) => normalizeResistanceEntry(entry, index, 'custom'))
        .filter(Boolean);
    props.resistanceConfig = {
        selected: selectedResistanceIds,
        custom: customResistanceEntries.map((entry) => ({
            id: entry.id,
            label: entry.label,
            code: entry.code,
            description: entry.description,
            observations: entry.observations,
            enabled: entry.enabled,
            origem: entry.origem
        }))
    };
    const selectedResistanceIdsSet = new Set(selectedResistanceIds);
    const resistanceDefinitions = [
        ...baseResistanceCatalog.map((entry) => buildResistanceDisplay({
            ...entry,
            enabled: selectedResistanceIdsSet.has(entry.id),
            selected: selectedResistanceIdsSet.has(entry.id),
            selectionName: `selected.${entry.id}`
        })),
        ...customResistanceEntries.map((entry) => buildResistanceDisplay({
            ...entry,
            enabled: entry.enabled !== false,
            selected: entry.enabled !== false,
            selectionName: `customSelected.${entry.id}`
        }))
    ];
    const activeResistanceDefinitions = resistanceDefinitions.filter((entry) => entry.selected);
    const trainingDefinitions = toArrayValues(props.trainingConfig?.custom)
        .map((entry, index) => normalizeTrainingEntry(entry, index, 'custom'))
        .filter(Boolean)
        .map((entry) => buildTrainingDisplay({
        ...entry,
        selected: entry.enabled !== false,
        selectionName: `customSelected.${entry.id}`
    }));
    props.trainingConfig = {
        custom: trainingDefinitions.map((entry) => ({
            id: entry.id,
            label: entry.label,
            code: entry.code,
            description: entry.description,
            observations: entry.observations,
            enabled: entry.selected,
            origem: entry.origem
        }))
    };
    const activeTrainingDefinitions = trainingDefinitions.filter((entry) => entry.selected);
    props.tables = {
        attacks: toArrayValues(props.tables?.attacks).map((entry, index) => normalizeAttackTableEntry(entry, index)),
        abilities: toArrayValues(props.tables?.abilities).map((entry, index) => normalizeFeatureTableEntry(entry, index, 'ability-entry', 'Habilidade')),
        talents: toArrayValues(props.tables?.talents).map((entry, index) => normalizeFeatureTableEntry(entry, index, 'talent-entry', 'Talento')),
        aptitudes: toArrayValues(props.tables?.aptitudes).map((entry, index) => normalizeFeatureTableEntry(entry, index, 'aptitude-entry', 'Aptidão')),
        spells: toArrayValues(props.tables?.spells).map((entry, index) => normalizeFeatureTableEntry(entry, index, 'spell-entry', 'Feitiço')),
        invocations: toArrayValues(props.tables?.invocations).map((entry, index) => normalizeInvocationTableEntry(entry, index)),
        inventory: toArrayValues(props.tables?.inventory).map((entry, index) => normalizeInventoryTableEntry(entry, index))
    };
    const inventorySpaceLimitValue = Number(props.inventory?.spaceLimit);
    props.inventory = {
        ...props.inventory,
        spaceLimit: Number.isFinite(inventorySpaceLimitValue) ? Math.max(0, Math.trunc(inventorySpaceLimitValue)) : 18
    };
    const inventoryUsedSpaces = props.tables.inventory.length;
    const inventorySpaceRemaining = props.inventory.spaceLimit - inventoryUsedSpaces;

    const attributeDisplay = (key) => ATTRIBUTE_OPTIONS.find((option) => option.key === key)?.label ?? String(key ?? '').toUpperCase();
    const perfilAmaldicoadoAttrKey = props.perfilAmaldicoado?.atributoPrincipal ?? 'des';
    const perfilAmaldicoadoAttrMod = getAttrMod(perfilAmaldicoadoAttrKey);
    const perfilAmaldicoadoKnownSpells = props.tables.spells.length;
    const perfilAmaldicoadoCdTecnicaOthers = n(props.perfilAmaldicoado?.cdTecnica?.others);
    const perfilAmaldicoadoCdAmaldicoadaOthers = n(props.perfilAmaldicoado?.cdAmaldicoada?.others);
    const perfilAmaldicoado = {
        knownSpells: perfilAmaldicoadoKnownSpells,
        attributeKey: perfilAmaldicoadoAttrKey,
        attributeLabel: attributeDisplay(perfilAmaldicoadoAttrKey),
        attributeMod: perfilAmaldicoadoAttrMod,
        levelHalf,
        cdTecnica: {
            attribute: perfilAmaldicoadoAttrMod,
            others: perfilAmaldicoadoCdTecnicaOthers,
            total: perfilAmaldicoadoAttrMod + levelHalf + perfilAmaldicoadoCdTecnicaOthers
        },
        cdAmaldicoada: {
            attribute: perfilAmaldicoadoAttrMod,
            others: perfilAmaldicoadoCdAmaldicoadaOthers,
            total: perfilAmaldicoadoAttrMod + levelHalf + perfilAmaldicoadoCdAmaldicoadaOthers
        }
    };
    const invocations = props.tables.invocations.map((invocation, rowIndex) => {
        const attributeRows = INVOCATION_ATTRIBUTES.map((attribute) => {
            const value = Math.trunc(n(invocation.attributes?.[attribute.key]));
            const mod = calculateJujutsuAttributeMod(value);
            return {
                key: attribute.key,
                label: attribute.label,
                value,
                mod,
                signedMod: mod > 0 ? `+${mod}` : `${mod}`
            };
        });
        const trainedSkillsTablePath = `tables.invocations.${rowIndex}.trainedSkills`;
        const trainedSkills = invocation.trainedSkills.map((skill, rowIndex) => {
            const attribute = ATTRIBUTE_KEYS.has(skill.attribute) ? skill.attribute : 'for';
            const attributeLabel = attributeDisplay(attribute);
            const bonus = calculateJujutsuAttributeMod(invocation.attributes?.[attribute] ?? 0) + n(skill.others);
            return {
                ...skill,
                attribute,
                attributeLabel,
                bonus,
                rowIndex
            };
        });
        return {
            rowIndex,
            displayName: invocation.name || `Invocação ${rowIndex + 1}`,
            imageField: `system.props.tables.invocations.${rowIndex}.image`,
            image: invocation.image,
            imageSrc: invocation.image || 'icons/svg/mystery-man.svg',
            movementDisplay: invocation.movement || '-',
            trainedSkillsTablePath,
            ...invocation,
            attributeRows,
            trainedSkills
        };
    });
    // Attack cards and chat rolls both rely on this derived attack model.
    const attackBonuses = ATTACK_BONUSES.map((attackBonus) => {
        const entry = props.attackBonuses?.[attackBonus.key] ?? {};
        const attribute = attackBonus.attribute;
        const trained = attackBonus.alwaysTrained || (entry.t !== undefined ? b(entry.t) : n(entry.bonus) > 0);
        const others = n(entry.others);
        const attributeMod = getAttrMod(attribute);
        const proficiencyBonus = trained ? trainingBonus : 0;
        const total = calculateJujutsuAttackTotal({
            attributeValue: attributeMap[attribute]?.value ?? 10,
            level,
            trained,
            others
        });
        props.attackBonuses[attackBonus.key] = {
            ...entry,
            attribute,
            bonus: proficiencyBonus,
            others,
            t: trained,
            total
        };
        return {
            ...attackBonus,
            attribute,
            attributeDisplay: attributeDisplay(attribute),
            attributeMod,
            levelHalf,
            trainingBonus,
            proficiencyBonus,
            bonus: proficiencyBonus,
            others,
            t: trained,
            total
        };
    });

    const savingThrows = SAVING_THROWS.map((savingThrow) => {
        const entry = props.savingThrows?.[savingThrow.key] ?? {};
        const others = entry.others !== undefined ? n(entry.others) : n(entry.bonus);
        const trained = b(entry.t);
        const master = b(entry.m);
        const total = calculateJujutsuSavingThrowTotal({
            attributeValue: attributeMap[savingThrow.attribute]?.value ?? 10,
            level,
            trained,
            master,
            others
        });
        const proficiencyBonus = master ? masterTrainingBonus : trained ? trainingBonus : 0;
        props.savingThrows[savingThrow.key] = {
            ...entry,
            bonus: others,
            others,
            total,
            t: trained,
            m: master,
            o: b(entry.o)
        };
        return {
            ...savingThrow,
            attributeMod: getAttrMod(savingThrow.attribute),
            levelHalf,
            trainingBonus,
            proficiencyBonus,
            bonus: others,
            others,
            total,
            t: trained,
            m: master,
            o: b(entry.o)
        };
    });

    const skills = SKILLS.map((skill) => {
        const entry = props.skills?.[skill.key] ?? {};
        const name = typeof entry.name === 'string' ? entry.name : '';
        const attribute = skill.customAttribute && ATTRIBUTE_KEYS.has(entry.attribute) ? entry.attribute : skill.attribute;
        const others = n(entry.others);
        const trained = b(entry.t);
        const master = b(entry.m);
        // Mestre has precedence over Treinado when deriving the proficiency bonus.
        const proficiencyBonus = master ? masterTrainingBonus : trained ? trainingBonus : 0;
        const total = getAttrMod(attribute) + levelHalf + proficiencyBonus + others;
        props.skills[skill.key] = {
            ...entry,
            name,
            attribute,
            others,
            t: trained,
            m: master,
            total
        };
        return {
            ...skill,
            name,
            attribute,
            attributeMod: getAttrMod(attribute),
            levelHalf,
            trainingBonus,
            proficiencyBonus,
            others,
            t: trained,
            m: master,
            total
        };
    });

    const deathSuccesses = [0, 1, 2].map((index) => b(props.deathTests?.successes?.[index]));
    const deathFailures = [0, 1, 2].map((index) => b(props.deathTests?.failures?.[index]));
    const deathSuccessCount = deathSuccesses.filter(Boolean).length;
    const deathFailureCount = deathFailures.filter(Boolean).length;
    const hitDiceSpentTotal = HIT_DICE.reduce((total, die) => total + n(props.hitDice?.[die]?.gastos), 0);
    const hitDiceAvailableTotal = HIT_DICE.reduce((total, die) => total + n(props.hitDice?.[die]?.disponiveis), 0);

    const rdValues = buildRdValues(props.rds);
    const activeRdValues = rdValues.filter((rd) => rd.enabled);
    const vidaDisplay = resourceDisplay(n(props.resources?.vida?.atuais), n(props.resources?.vida?.maximos));
    const energiaDisplay = resourceDisplay(n(props.resources?.energia?.atuais), n(props.resources?.energia?.maximos));
    const integridadeDisplay = resourceDisplay(n(props.resources?.integridade?.atual), n(props.resources?.integridade?.maxima));

    return {
        props,
        attributes: ATTRIBUTES.map((attribute) => ({
            ...attribute,
            value: attributeMap[attribute.key].value,
            mod: attributeMap[attribute.key].mod,
            signedMod: attributeMap[attribute.key].mod > 0 ? `+${attributeMap[attribute.key].mod}` : `${attributeMap[attribute.key].mod}`
        })),
        attackBonuses,
        savingThrows,
        skills,
        characteristicDefinitions,
        characteristicTypeOptions,
        characteristicCategoryOptions,
        activeCharacteristics,
        hasActiveCharacteristics: activeCharacteristics.length > 0,
        resistanceDefinitions,
        activeResistanceDefinitions,
        hasActiveResistances: activeResistanceDefinitions.length > 0,
        trainingDefinitions,
        activeTrainingDefinitions,
        hasActiveTrainings: activeTrainingDefinitions.length > 0,
        rdValues,
        rdDefinitions: rdValues,
        activeRdValues,
        hasActiveRds: activeRdValues.length > 0,
        invocations,
        attributeOptions: ATTRIBUTE_OPTIONS,
        computed: {
            levelHalf,
            trainingBonus,
            masterTrainingBonus,
            attentionTotal,
            initiativeDex,
            initiativeTotal,
            defenseDex,
            defenseTotal,
            cdAttrMod,
            specializationCdTotal,
            perfilAmaldicoado,
            deathSuccessCount,
            deathFailureCount,
            hitDiceSpentTotal,
            hitDiceAvailableTotal,
            inventory: {
                usedSpaces: inventoryUsedSpaces,
                spaceLimit: props.inventory.spaceLimit,
                spaceRemaining: inventorySpaceRemaining
            },
            resources: {
                vida: {
                    ...vidaDisplay
                },
                energia: {
                    ...energiaDisplay
                },
                integridade: {
                    ...integridadeDisplay
                }
            }
        },
        deathSuccesses,
        deathFailures
    };
};
