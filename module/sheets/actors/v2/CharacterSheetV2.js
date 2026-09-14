/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
import { CustomActorSheetV2 } from './CustomActorSheetV2.js';
import CustomItem from '../../../documents/CustomItem.js';
import Logger from '../../../Logger.js';
import CustomDialogV2 from '../../../applications/CustomDialogV2.js';
import { JUJUTSU_CHARACTERISTICS_CATALOG } from '../../../jujutsu/characteristicsCatalog.js';
import {
    calculateJujutsuAttackTotal,
    calculateJujutsuAttributeMod,
    calculateJujutsuSkillTotal,
    calculateJujutsuSavingThrowTotal,
    calculateJujutsuTrainingBonus,
    createJujutsuTableRow,
    prepareJujutsuSheetData
} from '../../../jujutsu/sheetData.js';
var DragDrop = foundry.applications.ux.DragDrop;
/**
 * The character actor sheets
 * @extends {CustomActorSheetV2}
 */
export class CharacterSheetV2 extends CustomActorSheetV2 {
    activeJujutsuTab = 'resumo';
    static DEFAULT_OPTIONS = {
        position: {
            width: 1160,
            height: 900
        },
        window: {
            controls: [
                {
                    label: 'CSB.Sheets.SeeHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'openHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.Sheets.SeeAttributeBars',
                    icon: 'fas fa-bars-progress',
                    action: 'openAttributeBars',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            ]
        },
        actions: {
            openHiddenAttributes: CharacterSheetV2.openHiddenAttributes,
            openAttributeBars: CharacterSheetV2.openAttributeBars,
            createInvocation: CharacterSheetV2.createInvocation,
            removeInvocation: CharacterSheetV2.removeInvocation,
            addJujutsuRow: CharacterSheetV2.addJujutsuRow,
            editJujutsuRow: CharacterSheetV2.editJujutsuRow,
            removeJujutsuRow: CharacterSheetV2.removeJujutsuRow,
            configureJujutsuRds: CharacterSheetV2.configureJujutsuRds,
            configureJujutsuResistances: CharacterSheetV2.configureJujutsuResistances,
            configureJujutsuTrainings: CharacterSheetV2.configureJujutsuTrainings,
            configureJujutsuCharacteristics: CharacterSheetV2.configureJujutsuCharacteristics,
            configureJujutsuMovement: CharacterSheetV2.configureJujutsuMovement
        }
    };
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/actor/v2/actor-character-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
    static openHiddenAttributes(_event, _target) {
        void this.actor.templateSystem.openAttributesVision();
    }
    static openAttributeBars(_event, _target) {
        void this.actor.templateSystem.openAttributeBarsVision();
    }
    static _getJujutsuRowConfig(rowTypeOrPath) {
        const normalizedKey = String(rowTypeOrPath ?? '').trim();
        const invocationSkillPathPattern = /^(?:invocations\.[^.]+|tables\.invocations\.\d+)\.trainedSkills$/i;
        if (invocationSkillPathPattern.test(normalizedKey) || normalizedKey === 'invocationSkill') {
            return {
                rowType: 'invocationSkill',
                tablePath: invocationSkillPathPattern.test(normalizedKey) ? normalizedKey : '',
                entryTypeLabel: 'Perícia Treinada',
                entryTypeLabelLower: 'a perícia treinada',
                dialogTitle: 'Adicionar Perícia Treinada',
                templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-invocation-skill-entry-config.hbs`,
                attributeField: 'attribute',
                attributeOptions: [
                    { value: 'for', label: 'FOR' },
                    { value: 'des', label: 'DEX' },
                    { value: 'con', label: 'CONS' },
                    { value: 'int', label: 'INT' },
                    { value: 'sab', label: 'SAB' },
                    { value: 'pre', label: 'PRE' }
                ]
            };
        }
        switch (normalizedKey) {
            case 'attack':
            case 'tables.attacks':
                return {
                    rowType: 'attack',
                    tablePath: 'tables.attacks',
                    entryTypeLabel: 'Ataque',
                    entryTypeLabelLower: 'o ataque',
                    dialogTitle: 'Adicionar Ataque',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-attack-entry-config.hbs`
                };
            case 'ability':
            case 'tables.abilities':
                return {
                    rowType: 'ability',
                    tablePath: 'tables.abilities',
                    entryTypeLabel: 'Habilidade',
                    entryTypeLabelLower: 'a habilidade',
                    dialogTitle: 'Adicionar Habilidade',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-feature-entry-config.hbs`
                };
            case 'talent':
            case 'tables.talents':
                return {
                    rowType: 'talent',
                    tablePath: 'tables.talents',
                    entryTypeLabel: 'Talento',
                    entryTypeLabelLower: 'o talento',
                    dialogTitle: 'Adicionar Talento',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-feature-entry-config.hbs`
                };
            case 'aptitude':
            case 'tables.aptitudes':
                return {
                    rowType: 'aptitude',
                    tablePath: 'tables.aptitudes',
                    entryTypeLabel: 'Aptidão',
                    entryTypeLabelLower: 'a aptidão',
                    dialogTitle: 'Adicionar Aptidão',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-feature-entry-config.hbs`
                };
            case 'spell':
            case 'tables.spells':
                return {
                    rowType: 'spell',
                    tablePath: 'tables.spells',
                    entryTypeLabel: 'Feitiço',
                    entryTypeLabelLower: 'o feitiço',
                    dialogTitle: 'Adicionar Feitiço',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-feature-entry-config.hbs`,
                    levelOptions: [0, 1, 2, 3, 4, 5].map((level) => ({
                        value: level,
                        label: `Nível ${level}`
                    }))
                };
            case 'inventory':
            case 'tables.inventory':
                return {
                    rowType: 'inventory',
                    tablePath: 'tables.inventory',
                    entryTypeLabel: 'Item',
                    entryTypeLabelLower: 'o item',
                    dialogTitle: 'Adicionar Item ao Inventário',
                    templatePath: `systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-inventory-entry-config.hbs`,
                    rollOptions: [
                        { value: 'd4', label: 'd4' },
                        { value: 'd6', label: 'd6' },
                        { value: 'd8', label: 'd8' },
                        { value: 'd10', label: 'd10' },
                        { value: 'd12', label: 'd12' },
                        { value: 'd20', label: 'd20' }
                    ],
                    itemTypeOptions: [
                        { value: 'common', label: 'Comum' },
                        { value: 'weapon', label: 'Arma' },
                        { value: 'equipment', label: 'Equipamento' }
                    ],
                    attributeOptions: [
                        { value: '', label: 'Nenhum' },
                        { value: 'for', label: 'FOR' },
                        { value: 'des', label: 'DEX' },
                        { value: 'con', label: 'CONS' },
                        { value: 'int', label: 'INT' },
                        { value: 'sab', label: 'SAB' },
                        { value: 'pre', label: 'PRE' }
                    ]
                };
            default:
                return null;
        }
    }
    static _createJujutsuDialogEntry(config, source = {}) {
        return foundry.utils.mergeObject(createJujutsuTableRow(config.rowType), source ?? {}, {
            inplace: false,
            insertKeys: true,
            recursive: true
        });
    }
    static async _renderJujutsuDialogContent(config, entry) {
        const attributeField = config.attributeField ?? 'rollAttribute';
        const rollOptions = config.rollOptions ?? [
            { value: 'd4', label: 'd4' },
            { value: 'd6', label: 'd6' },
            { value: 'd8', label: 'd8' },
            { value: 'd10', label: 'd10' },
            { value: 'd12', label: 'd12' },
            { value: 'd20', label: 'd20' }
        ];
        const attributeOptions = config.attributeOptions ?? [
            { value: '', label: 'Nenhum' },
            { value: 'for', label: 'FOR' },
            { value: 'des', label: 'DEX' },
            { value: 'con', label: 'CONS' },
            { value: 'int', label: 'INT' },
            { value: 'sab', label: 'SAB' },
            { value: 'pre', label: 'PRE' }
        ];
        return foundry.applications.handlebars.renderTemplate(config.templatePath, {
            dialogTitle: config.dialogTitle,
            entryTypeLabel: config.entryTypeLabel,
            entryTypeLabelLower: config.entryTypeLabelLower,
            entry,
            levelOptions: (config.levelOptions ?? []).map((option) => ({
                ...option,
                selected: Number(option.value) === Number(entry?.level ?? 0)
            })),
            itemTypeOptions: (config.itemTypeOptions ?? []).map((option) => ({
                ...option,
                selected: option.value === (entry?.itemType ?? 'common')
            })),
            attributeOptions: attributeOptions.map((option) => ({
                ...option,
                selected: option.value === (entry?.[attributeField] ?? '')
            })),
            rollOptions: rollOptions.map((option) => ({
                ...option,
                selected: option.value === entry?.rollDie
            }))
        });
    }
    static _bindJujutsuItemImagePicker(element) {
        const root = element;
        if (!root)
            return;
        const imageInput = root.querySelector?.('[data-item-image-input]');
        const imagePreview = root.querySelector?.('[data-item-image-preview]');
        const syncPreview = () => {
            if (imageInput && imagePreview) {
                imagePreview.src = imageInput.value?.trim() || 'icons/svg/mystery-man.svg';
            }
        };
        imageInput?.addEventListener('input', syncPreview);
        imageInput?.addEventListener('change', syncPreview);
        root.querySelectorAll?.('[data-pick-item-image]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                if (!imageInput)
                    return;
                const PickerClass = foundry.applications.apps.FilePicker ?? globalThis.FilePicker;
                if (!PickerClass)
                    return;
                const picker = new PickerClass({
                    type: 'image',
                    current: imageInput.value,
                    callback: (path) => {
                        imageInput.value = path;
                        syncPreview();
                    }
                });
                try {
                    void picker.browse(imageInput.value);
                }
                catch (error) {
                    ui.notifications?.warn?.(error?.message ?? 'Não foi possível abrir o seletor de imagem.');
                }
            });
        });
        syncPreview();
    }
    static _bindJujutsuInventoryConfigDialog(element) {
        const root = element;
        if (!root)
            return;
        const checkbox = root.querySelector?.(`[name='hasRoll']`);
        const rollField = root.querySelector?.('[data-inventory-roll-field]');
        const itemTypeSelect = root.querySelector?.(`[name='itemType']`);
        const weaponFields = root.querySelector?.('[data-inventory-weapon-fields]');
        const equipmentFields = root.querySelector?.('[data-inventory-equipment-fields]');
        if (itemTypeSelect) {
            const syncType = () => {
                const itemType = itemTypeSelect.value;
                if (weaponFields) {
                    weaponFields.hidden = itemType !== 'weapon';
                    weaponFields.querySelectorAll('input, select').forEach((control) => {
                        control.disabled = itemType !== 'weapon';
                    });
                }
                if (equipmentFields) {
                    equipmentFields.hidden = itemType !== 'equipment';
                    equipmentFields.querySelectorAll('input, select').forEach((control) => {
                        control.disabled = itemType !== 'equipment';
                    });
                }
            };
            itemTypeSelect.addEventListener('change', syncType);
            syncType();
        }
        if (!checkbox || !rollField) {
            return;
        }
        const sync = () => {
            const enabled = !!checkbox.checked;
            rollField.hidden = !enabled;
            rollField.querySelectorAll('input, select').forEach((control) => {
                control.disabled = !enabled;
            });
        };
        checkbox.addEventListener('change', sync);
        sync();
    }
    static _collectJujutsuDialogEntry(config, form, source = {}) {
        const getValue = (name) => String(form?.querySelector?.(`[name='${name}']`)?.value ?? '').trim();
        const getNumber = (name) => CharacterSheetV2._toSafeNumber(getValue(name), 0);
        const entryId = String(source?.id ?? '').trim() || foundry.utils.randomID?.() || `${config.rowType}-${Date.now()}`;
        if (config.rowType === 'attack') {
            const hasRoll = !!form?.querySelector?.(`[name='hasRoll']`)?.checked;
            const rollDie = getValue('rollDie').toLowerCase();
            const rollAttribute = getValue('rollAttribute').toLowerCase();
            return {
                ...createJujutsuTableRow('attack'),
                id: entryId,
                name: getValue('name') || 'Ataque',
                image: getValue('image') || 'icons/svg/sword.svg',
                acerto: getNumber('acerto'),
                weapon: getValue('weapon'),
                bonus: getNumber('bonus'),
                damage: getValue('damage'),
                hasRoll,
                rollDie: hasRoll && ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(rollDie) ? rollDie : '',
                rollCount: hasRoll ? Math.max(1, Math.trunc(getNumber('rollCount') || 1)) : 1,
                rollBonus: hasRoll ? Math.trunc(getNumber('rollBonus') || 0) : 0,
                rollAttribute: hasRoll && ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(rollAttribute) ? rollAttribute : '',
                crit: getValue('crit'),
                type: getValue('type'),
                range: getValue('range'),
                properties: getValue('properties'),
                description: getValue('description'),
                observations: getValue('observations')
            };
        }
        if (config.rowType === 'inventory') {
            const hasRoll = !!form?.querySelector?.(`[name='hasRoll']`)?.checked;
            const rollDie = getValue('rollDie').toLowerCase();
            const rollAttribute = getValue('rollAttribute').toLowerCase();
            const itemType = getValue('itemType').toLowerCase();
            return {
                ...createJujutsuTableRow('inventory'),
                id: entryId,
                name: getValue('name') || 'Item',
                image: getValue('image') || 'icons/svg/item-bag.svg',
                quantity: Math.max(0, Math.trunc(getNumber('quantity') || 0)),
                weight: Math.max(0, getNumber('weight') || 0),
                price: Math.max(0, getNumber('price') || 0),
                itemType: ['common', 'weapon', 'equipment'].includes(itemType) ? itemType : 'common',
                equipped: !!form?.querySelector?.(`[name='equipped']`)?.checked,
                defenseBonus: Math.trunc(getNumber('defenseBonus') || 0),
                attackBonus: Math.trunc(getNumber('attackBonus') || 0),
                critMin: Math.max(1, Math.min(20, Math.trunc(getNumber('critMin') || 20))),
                damage: getValue('damage'),
                weaponType: getValue('weaponType'),
                range: getValue('range'),
                hasRoll,
                rollDie: hasRoll && ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(rollDie) ? rollDie : '',
                rollCount: hasRoll ? Math.max(1, Math.trunc(getNumber('rollCount') || 1)) : 1,
                rollBonus: hasRoll ? Math.trunc(getNumber('rollBonus') || 0) : 0,
                rollAttribute: hasRoll && ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(rollAttribute) ? rollAttribute : ''
            };
        }
        if (config.rowType === 'invocationSkill') {
            const attribute = getValue('attribute').toLowerCase();
            return {
                ...createJujutsuTableRow('invocationSkill'),
                id: entryId,
                name: getValue('name') || 'Perícia Treinada',
                attribute: ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(attribute) ? attribute : 'for',
                others: Math.trunc(getNumber('others') || 0)
            };
        }
        const hasRoll = !!form?.querySelector?.(`[name='hasRoll']`)?.checked;
        const rollDie = getValue('rollDie').toLowerCase();
        const rollAttribute = getValue('rollAttribute').toLowerCase();
        return {
            ...createJujutsuTableRow(config.rowType),
            id: entryId,
            name: getValue('name') || config.entryTypeLabel,
            image: getValue('image') || 'icons/svg/book.svg',
            acerto: getNumber('acerto'),
            current: getNumber('current'),
            max: getNumber('max'),
            cost: getNumber('cost'),
            level: Math.max(0, Math.min(5, Math.trunc(getNumber('level')))),
            hasRoll,
            rollDie: hasRoll && ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(rollDie) ? rollDie : '',
            rollCount: hasRoll ? Math.max(1, Math.trunc(getNumber('rollCount') || 1)) : 1,
            rollBonus: hasRoll ? Math.trunc(getNumber('rollBonus') || 0) : 0,
            rollAttribute: hasRoll && ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(rollAttribute) ? rollAttribute : '',
            rollFormula: hasRoll ? getValue('rollFormula') : '',
            damageFormula: hasRoll ? getValue('damageFormula') : '',
            description: getValue('description'),
            observations: getValue('observations')
        };
    }
    static async _openJujutsuRowDialog({ actor, sheet, config, entry, title, onSave }) {
        const content = await CharacterSheetV2._renderJujutsuDialogContent(config, entry);
        await new CustomDialogV2({
            tag: 'div',
            modal: true,
            content,
            buttons: {
                save: {
                    default: true,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar'
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Cancelar'
                }
            },
            onRender: (element) => {
                element.classList.add('jj-item-dialog');
                CharacterSheetV2._bindJujutsuItemImagePicker(element);
                CharacterSheetV2._bindJujutsuInventoryConfigDialog(element);
                queueMicrotask(() => {
                    element.querySelector(`input[name='name'], input, textarea, select`)?.focus();
                });
            },
            submit: async (result, _submitEvent, _button, dialog) => {
                if (result !== 'save')
                    return;
                const form = dialog.querySelector('form');
                if (!form)
                    return;
                await onSave(form, actor, sheet);
            },
            position: {
                width: 760,
                height: 'auto'
            },
            window: {
                title
            }
        }).render({ force: true });
    }
    static async addJujutsuRow(_event, target) {
        const actor = this.actor ?? this.document;
        const actionTarget = target?.closest?.('[data-table-path]') ?? target;
        const tablePath = actionTarget?.dataset?.tablePath ?? '';
        const rowType = actionTarget?.dataset?.rowType ?? '';
        const localInvocationDetails = actionTarget?.closest?.('.jj-invocation-details');
        const localInvocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
        const useLocalInvocationSkills = !!(localInvocationDetails && localInvocationPathMatch);
        const config = CharacterSheetV2._getJujutsuRowConfig(rowType || tablePath);
        if (!config)
            return;
        if (tablePath) {
            config.tablePath = tablePath;
        }
        if (!useLocalInvocationSkills && game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const sheet = this;
        await CharacterSheetV2._openJujutsuRowDialog({
            actor,
            sheet,
            config,
            entry: CharacterSheetV2._createJujutsuDialogEntry(config),
            title: config.dialogTitle,
            onSave: async (form) => {
                if (useLocalInvocationSkills) {
                    const trainedSkills = CharacterSheetV2._getInvocationDetailLocalSkills(localInvocationDetails);
                    trainedSkills.push(CharacterSheetV2._collectJujutsuDialogEntry(config, form));
                    localInvocationDetails.dataset.localTrainedSkills = JSON.stringify(trainedSkills);
                    CharacterSheetV2._renderInvocationDetailSkills(localInvocationDetails, actor, sheet);
                    CharacterSheetV2._syncInvocationDetailDirtyState(localInvocationDetails);
                    return;
                }
                const invocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(config.tablePath);
                if (invocationPathMatch) {
                    const invocationIndex = Number(invocationPathMatch[1]);
                    const rows = CharacterSheetV2._getPreparedInvocationRows(actor);
                    if (invocationIndex < 0 || invocationIndex >= rows.length) {
                        return;
                    }
                    const trainedSkills = Array.isArray(rows[invocationIndex]?.trainedSkills) ? foundry.utils.deepClone(rows[invocationIndex].trainedSkills) : [];
                    trainedSkills.push(CharacterSheetV2._collectJujutsuDialogEntry(config, form));
                    rows[invocationIndex] = {
                        ...rows[invocationIndex],
                        trainedSkills
                    };
                    await actor.update({
                        'system.props.tables.invocations': rows
                    });
                    await sheet.render({ force: true });
                    return;
                }
                const rows = CharacterSheetV2._getJujutsuTableRows(actor.system.props, config.tablePath);
                rows.push(CharacterSheetV2._collectJujutsuDialogEntry(config, form));
                await actor.update({
                    [`system.props.${config.tablePath}`]: rows
                });
                await sheet.render({ force: true });
            }
        });
    }
    static async editJujutsuRow(_event, target) {
        const actor = this.actor ?? this.document;
        const actionTarget = target?.closest?.('[data-table-path]') ?? target;
        const tablePath = actionTarget?.dataset?.tablePath ?? '';
        const rowIndex = Number(actionTarget?.dataset?.rowIndex);
        const localInvocationDetails = actionTarget?.closest?.('.jj-invocation-details');
        const localInvocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
        const useLocalInvocationSkills = !!(localInvocationDetails && localInvocationPathMatch);
        const config = CharacterSheetV2._getJujutsuRowConfig(tablePath);
        if (!config || !Number.isFinite(rowIndex))
            return;
        if (!useLocalInvocationSkills && game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const invocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
        const rows = useLocalInvocationSkills
            ? CharacterSheetV2._getInvocationDetailLocalSkills(localInvocationDetails)
            : invocationPathMatch
            ? (CharacterSheetV2._getPreparedInvocationRows(actor)[Number(invocationPathMatch[1])]?.trainedSkills ?? [])
            : CharacterSheetV2._getJujutsuTableRows(actor.system.props, tablePath);
        if (rowIndex < 0 || rowIndex >= rows.length)
            return;
        const currentEntry = CharacterSheetV2._createJujutsuDialogEntry(config, rows[rowIndex]);
        const currentLabel = String(currentEntry?.name ?? config.entryTypeLabel).trim() || config.entryTypeLabel;
        const sheet = this;
        await CharacterSheetV2._openJujutsuRowDialog({
            actor,
            sheet,
            config,
            entry: currentEntry,
            title: `Editar ${currentLabel}`,
            onSave: async (form) => {
                if (useLocalInvocationSkills) {
                    const nextRows = CharacterSheetV2._getInvocationDetailLocalSkills(localInvocationDetails);
                    if (rowIndex < 0 || rowIndex >= nextRows.length) {
                        return;
                    }
                    nextRows[rowIndex] = CharacterSheetV2._collectJujutsuDialogEntry(config, form, nextRows[rowIndex]);
                    localInvocationDetails.dataset.localTrainedSkills = JSON.stringify(nextRows);
                    CharacterSheetV2._renderInvocationDetailSkills(localInvocationDetails, actor, sheet);
                    CharacterSheetV2._syncInvocationDetailDirtyState(localInvocationDetails);
                    return;
                }
                const invocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
                if (invocationPathMatch) {
                    const invocationIndex = Number(invocationPathMatch[1]);
                    const nextInvocations = CharacterSheetV2._getPreparedInvocationRows(actor);
                    if (invocationIndex < 0 || invocationIndex >= nextInvocations.length) {
                        return;
                    }
                    const nextRows = Array.isArray(nextInvocations[invocationIndex]?.trainedSkills) ? foundry.utils.deepClone(nextInvocations[invocationIndex].trainedSkills) : [];
                    if (rowIndex < 0 || rowIndex >= nextRows.length) {
                        return;
                    }
                    nextRows[rowIndex] = CharacterSheetV2._collectJujutsuDialogEntry(config, form, nextRows[rowIndex]);
                    nextInvocations[invocationIndex] = {
                        ...nextInvocations[invocationIndex],
                        trainedSkills: nextRows
                    };
                    await actor.update({
                        'system.props.tables.invocations': nextInvocations
                    });
                    await sheet.render({ force: true });
                    return;
                }
                const nextRows = CharacterSheetV2._getJujutsuTableRows(actor.system.props, tablePath);
                if (rowIndex < 0 || rowIndex >= nextRows.length)
                    return;
                nextRows[rowIndex] = CharacterSheetV2._collectJujutsuDialogEntry(config, form, nextRows[rowIndex]);
                await actor.update({
                    [`system.props.${tablePath}`]: nextRows
                });
                await sheet.render({ force: true });
            }
        });
    }
    static _confirmJujutsuRowRemoval(label) {
        return globalThis.confirm?.(`Excluir ${label}?`) ?? false;
    }
    static async removeJujutsuRow(_event, target) {
        const actor = this.actor ?? this.document;
        const actionTarget = target?.closest?.('[data-table-path]') ?? target;
        const tablePath = actionTarget?.dataset?.tablePath ?? '';
        const rowIndex = Number(actionTarget?.dataset?.rowIndex);
        const localInvocationDetails = actionTarget?.closest?.('.jj-invocation-details');
        const localInvocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
        const useLocalInvocationSkills = !!(localInvocationDetails && localInvocationPathMatch);
        const config = CharacterSheetV2._getJujutsuRowConfig(tablePath);
        if (!config || !Number.isFinite(rowIndex))
            return;
        if (!useLocalInvocationSkills && game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const invocationPathMatch = CharacterSheetV2._getInvocationTablePathMatch(tablePath);
        const rows = useLocalInvocationSkills
            ? CharacterSheetV2._getInvocationDetailLocalSkills(localInvocationDetails)
            : invocationPathMatch
            ? (CharacterSheetV2._getPreparedInvocationRows(actor)[Number(invocationPathMatch[1])]?.trainedSkills ?? [])
            : CharacterSheetV2._getJujutsuTableRows(actor.system.props, tablePath);
        if (rowIndex < 0 || rowIndex >= rows.length)
            return;
        const currentLabel = String(rows[rowIndex]?.name ?? config.entryTypeLabel).trim() || config.entryTypeLabel;
        if (!CharacterSheetV2._confirmJujutsuRowRemoval(currentLabel))
            return;
        if (useLocalInvocationSkills) {
            const nextRows = CharacterSheetV2._getInvocationDetailLocalSkills(localInvocationDetails);
            nextRows.splice(rowIndex, 1);
            localInvocationDetails.dataset.localTrainedSkills = JSON.stringify(nextRows);
            CharacterSheetV2._renderInvocationDetailSkills(localInvocationDetails, actor, this);
            CharacterSheetV2._syncInvocationDetailDirtyState(localInvocationDetails);
            return;
        }
        if (invocationPathMatch) {
            const invocationIndex = Number(invocationPathMatch[1]);
            const nextInvocations = CharacterSheetV2._getPreparedInvocationRows(actor);
            if (invocationIndex < 0 || invocationIndex >= nextInvocations.length) {
                return;
            }
            const nextRows = Array.isArray(nextInvocations[invocationIndex]?.trainedSkills) ? foundry.utils.deepClone(nextInvocations[invocationIndex].trainedSkills) : [];
            if (rowIndex < 0 || rowIndex >= nextRows.length) {
                return;
            }
            nextRows.splice(rowIndex, 1);
            nextInvocations[invocationIndex] = {
                ...nextInvocations[invocationIndex],
                trainedSkills: nextRows
            };
            await actor.update({
                'system.props.tables.invocations': nextInvocations
            });
            await this.render({ force: true });
            return;
        }
        rows.splice(rowIndex, 1);
        await actor.update({
            [`system.props.${tablePath}`]: rows
        });
        await this.render({ force: true });
    }
    static _toSafeNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }
    static _toBoolean(value) {
        return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
    }
    static _getJujutsuTableRows(props, tablePath) {
        const rawRows = foundry.utils.getProperty(props ?? {}, tablePath);
        if (Array.isArray(rawRows)) {
            return foundry.utils.deepClone(rawRows);
        }
        if (rawRows && typeof rawRows === 'object') {
            return foundry.utils.deepClone(Object.values(rawRows));
        }
        return [];
    }
    static async _submitJujutsuActorIfNeeded(actor) {
        if (!actor || !game.settings.get(game.system.id, 'manualEntitySaving') || !actor.templateSystem?.isModified) {
            return;
        }
        if (typeof actor.sheet?.submit === 'function') {
            await actor.sheet.submit();
        }
    }
    static _getInvocationDetailLocalSkills(details) {
        try {
            const parsed = JSON.parse(details?.dataset?.localTrainedSkills ?? '[]');
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (_error) {
            return [];
        }
    }
    static _getInvocationSkillAttributeLabelMap(actor) {
        const attributeOptions = prepareJujutsuSheetData(actor?.system?.props ?? {}).attributeOptions ?? [];
        return new Map(attributeOptions.map((option) => [String(option.key ?? ''), String(option.label ?? option.key ?? '')]));
    }
    static _getInvocationAttributeValueFromDetails(details, invocationIndex, attributeKey) {
        const fieldPath = `system.props.tables.invocations.${invocationIndex}.attributes.${attributeKey}`;
        const field = details?.querySelector?.(`[data-field-path="${fieldPath}"]`);
        const value = field instanceof HTMLInputElement ? Number(field.value) : 0;
        return Number.isFinite(value) ? value : 0;
    }
    static _renderInvocationDetailSkills(details, actor, sheet) {
        const tbody = details?.querySelector?.('[data-invocation-trained-skills-body]');
        if (!(tbody instanceof HTMLTableSectionElement)) {
            return;
        }
        const rowIndex = Number(details?.dataset?.invocationRowIndex);
        const tablePath = `tables.invocations.${rowIndex}.trainedSkills`;
        const attributeLabels = CharacterSheetV2._getInvocationSkillAttributeLabelMap(actor);
        const skills = CharacterSheetV2._getInvocationDetailLocalSkills(details);
        tbody.replaceChildren();
        if (!skills.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.className = 'jj-inventory-empty';
            cell.textContent = 'Nenhuma perícia treinada cadastrada.';
            row.append(cell);
            tbody.append(row);
            return;
        }
        skills.forEach((skill, skillIndex) => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.className = 'jj-table-item-cell';
            const item = document.createElement('div');
            item.className = 'jj-table-item';
            const itemMain = document.createElement('div');
            itemMain.className = 'jj-table-item-main';
            const textWrap = document.createElement('div');
            textWrap.className = 'jj-table-item-text';
            const strong = document.createElement('strong');
            strong.textContent = String(skill?.name ?? '').trim() || `Perícia ${skillIndex + 1}`;
            textWrap.append(strong);
            itemMain.append(textWrap);
            const actions = document.createElement('div');
            actions.className = 'jj-table-item-actions';
            const editButton = document.createElement('button');
            editButton.className = 'jj-table-icon-button';
            editButton.type = 'button';
            editButton.dataset.action = 'editJujutsuRow';
            editButton.dataset.tablePath = tablePath;
            editButton.dataset.rowIndex = String(skillIndex);
            editButton.dataset.tooltip = `Editar ${strong.textContent}`;
            editButton.setAttribute('aria-label', `Editar ${strong.textContent}`);
            editButton.innerHTML = "<i class='fas fa-pen'></i>";
            editButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                void CharacterSheetV2.editJujutsuRow.call(sheet, event, editButton);
            });
            const removeButton = document.createElement('button');
            removeButton.className = 'jj-table-icon-button jj-table-icon-button--danger';
            removeButton.type = 'button';
            removeButton.dataset.action = 'removeJujutsuRow';
            removeButton.dataset.tablePath = tablePath;
            removeButton.dataset.rowIndex = String(skillIndex);
            removeButton.dataset.tooltip = `Excluir ${strong.textContent}`;
            removeButton.setAttribute('aria-label', `Excluir ${strong.textContent}`);
            removeButton.innerHTML = "<i class='fas fa-trash'></i>";
            removeButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                void CharacterSheetV2.removeJujutsuRow.call(sheet, event, removeButton);
            });
            actions.append(editButton, removeButton);
            item.append(itemMain, actions);
            nameCell.append(item);
            row.append(nameCell);
            const attributeCell = document.createElement('td');
            const attributeKey = String(skill?.attribute ?? '').trim();
            attributeCell.textContent = attributeLabels.get(attributeKey) ?? attributeKey;
            row.append(attributeCell);
            const othersCell = document.createElement('td');
            const others = Number(skill?.others ?? 0);
            othersCell.textContent = Number.isFinite(others) ? String(others) : '0';
            row.append(othersCell);
            const bonusCell = document.createElement('td');
            const attributeValue = CharacterSheetV2._getInvocationAttributeValueFromDetails(details, rowIndex, attributeKey);
            const bonus = calculateJujutsuAttributeMod(attributeValue) + (Number.isFinite(others) ? others : 0);
            bonusCell.textContent = String(bonus);
            row.append(bonusCell);
            tbody.append(row);
        });
    }
    static _getInvocationDetailFields(container) {
        return Array.from(container?.querySelectorAll?.('[data-invocation-field][data-field-path]') ?? []);
    }
    static _readInvocationDetailFieldValue(field) {
        const dtype = String(field?.dataset?.dtype ?? '').trim().toLowerCase();
        const rawValue = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement
            ? field.value
            : '';
        if (dtype === 'number') {
            const numericValue = Number(rawValue);
            return Number.isFinite(numericValue) ? numericValue : 0;
        }
        return String(rawValue ?? '');
    }
    static _createInvocationDetailSnapshot(container) {
        const snapshot = {};
        for (const field of CharacterSheetV2._getInvocationDetailFields(container)) {
            const path = String(field.dataset?.fieldPath ?? '').trim();
            if (!path) {
                continue;
            }
            snapshot[path] = CharacterSheetV2._readInvocationDetailFieldValue(field);
        }
        const trainedSkillsPath = String(container?.dataset?.trainedSkillsPath ?? '').trim();
        if (trainedSkillsPath) {
            snapshot[trainedSkillsPath] = foundry.utils.deepClone(CharacterSheetV2._getInvocationDetailLocalSkills(container));
        }
        return snapshot;
    }
    static _getInvocationDetailInitialState(details) {
        try {
            const parsed = JSON.parse(details?.dataset?.initialState ?? '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        }
        catch (_error) {
            return {};
        }
    }
    static _setInvocationDetailDirtyState(details, isDirty) {
        if (!details) {
            return;
        }
        details.dataset.dirty = isDirty ? 'true' : 'false';
        const saveButton = details.querySelector('[data-action="saveInvocationDetails"]');
        if (saveButton instanceof HTMLButtonElement) {
            saveButton.disabled = !isDirty;
        }
    }
    static _syncInvocationDetailDirtyState(details) {
        if (!details) {
            return false;
        }
        const initialState = CharacterSheetV2._getInvocationDetailInitialState(details);
        const currentState = CharacterSheetV2._createInvocationDetailSnapshot(details);
        const isDirty = JSON.stringify(initialState) !== JSON.stringify(currentState);
        CharacterSheetV2._setInvocationDetailDirtyState(details, isDirty);
        return isDirty;
    }
    static _resetInvocationDetailFields(details) {
        const initialState = CharacterSheetV2._getInvocationDetailInitialState(details);
        for (const field of CharacterSheetV2._getInvocationDetailFields(details)) {
            const path = String(field.dataset?.fieldPath ?? '').trim();
            if (!path) {
                continue;
            }
            const value = initialState[path];
            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
                if (String(field.dataset?.dtype ?? '').trim().toLowerCase() === 'number') {
                    const numericValue = Number(value);
                    field.value = Number.isFinite(numericValue) ? String(numericValue) : '0';
                }
                else {
                    field.value = value == null ? '' : String(value);
                }
            }
        }
        const trainedSkillsPath = String(details?.dataset?.trainedSkillsPath ?? '').trim();
        if (trainedSkillsPath) {
            details.dataset.localTrainedSkills = JSON.stringify(foundry.utils.deepClone(initialState[trainedSkillsPath] ?? []));
            CharacterSheetV2._renderInvocationDetailSkills(details, this.actor ?? this.document, this);
        }
        CharacterSheetV2._setInvocationDetailDirtyState(details, false);
    }
    static _bindInvocationDetailInteractions(root, actor, sheet) {
        root?.querySelectorAll?.('.jj-invocation-details').forEach((details) => {
            const rowIndex = Number(details?.dataset?.invocationRowIndex);
            const preparedInvocations = prepareJujutsuSheetData(actor?.system?.props ?? {}).props?.tables?.invocations ?? [];
            const trainedSkills = rowIndex >= 0 && rowIndex < preparedInvocations.length
                ? foundry.utils.deepClone(preparedInvocations[rowIndex]?.trainedSkills ?? [])
                : [];
            details.dataset.localTrainedSkills = JSON.stringify(trainedSkills);
            CharacterSheetV2._renderInvocationDetailSkills(details, actor, sheet);
            details.dataset.initialState = JSON.stringify(CharacterSheetV2._createInvocationDetailSnapshot(details));
            CharacterSheetV2._setInvocationDetailDirtyState(details, false);
            const summary = details.querySelector('.jj-invocation-details-toggle');
            if (summary) {
                summary.addEventListener('click', (event) => {
                    if (!details.open || !CharacterSheetV2._syncInvocationDetailDirtyState(details)) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    const invocationName = String(details.dataset?.invocationName ?? 'esta invocação').trim() || 'esta invocação';
                    const shouldDiscard = window.confirm(`Deseja realmente fechar os detalhes de ${invocationName} sem salvar as alterações?`);
                    if (!shouldDiscard) {
                        return;
                    }
                    CharacterSheetV2._resetInvocationDetailFields.call(sheet, details);
                    details.open = false;
                });
            }
            CharacterSheetV2._getInvocationDetailFields(details).forEach((field) => {
                const syncFieldState = (event) => {
                    event.stopPropagation();
                    const path = String(field.dataset?.fieldPath ?? '');
                    if (path.includes('.attributes.')) {
                        const value = Number(field.value);
                        const mod = calculateJujutsuAttributeMod(Number.isFinite(value) ? value : 0);
                        const modInput = field.closest('tr')?.querySelector('[data-invocation-attribute-mod]');
                        if (modInput) {
                            modInput.value = mod > 0 ? `+${mod}` : String(mod);
                        }
                        CharacterSheetV2._renderInvocationDetailSkills(details, actor, sheet);
                    }
                    CharacterSheetV2._syncInvocationDetailDirtyState(details);
                };
                field.addEventListener('input', syncFieldState);
                field.addEventListener('change', syncFieldState);
            });
        });
    }
    static async saveInvocationDetails(_event, target) {
        const actor = this.actor ?? this.document;
        const actionTarget = target?.closest?.('[data-row-index]') ?? target;
        const rowIndex = Number(actionTarget?.dataset?.rowIndex);
        const details = actionTarget?.closest?.('.jj-invocation-details');
        if (!(actor instanceof Actor) || !actor.isOwner || !Number.isFinite(rowIndex) || !(details instanceof HTMLDetailsElement)) {
            return;
        }
        const pendingUpdate = CharacterSheetV2._createInvocationDetailSnapshot(details);
        if (!Object.keys(pendingUpdate).length) {
            details.open = false;
            return;
        }
        try {
            if (typeof this.submit === 'function') {
                await this.submit();
            }
            else {
                await actor.update(pendingUpdate);
            }
            CharacterSheetV2._setInvocationDetailDirtyState(details, false);
            details.open = false;
        }
        catch (error) {
            CharacterSheetV2._syncInvocationDetailDirtyState(details);
            const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
            ui.notifications.error(`Não foi possível salvar os detalhes da invocação: ${message}`);
        }
    }
    static _getInvocationTablePathMatch(tablePath) {
        return String(tablePath ?? '').trim().match(/^tables\.invocations\.(\d+)\.trainedSkills$/i);
    }
    static _getPreparedInvocationRows(actor) {
        return foundry.utils.deepClone(prepareJujutsuSheetData(actor?.system?.props ?? {}).props?.tables?.invocations ?? []);
    }
    static async createInvocation(_event, target) {
        const actor = this.actor ?? this.document;
        if (!(actor instanceof Actor) || !actor.isOwner) {
            return;
        }
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const rows = CharacterSheetV2._getPreparedInvocationRows(actor);
        rows.push({
            ...createJujutsuTableRow('invocation'),
            name: `Invocação ${rows.length + 1}`
        });
        await actor.update({
            'system.props.tables.invocations': rows
        });
        await this.render({ force: true });
    }
    static async removeInvocation(_event, target) {
        const actor = this.actor ?? this.document;
        const actionTarget = target?.closest?.('[data-row-index]') ?? target;
        const rowIndex = Number(actionTarget?.dataset?.rowIndex);
        if (!(actor instanceof Actor) || !actor.isOwner || !Number.isFinite(rowIndex)) {
            return;
        }
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const rows = CharacterSheetV2._getPreparedInvocationRows(actor);
        if (rowIndex < 0 || rowIndex >= rows.length) {
            return;
        }
        const currentLabel = String(rows[rowIndex]?.name ?? `Invocação ${rowIndex + 1}`).trim() || `Invocação ${rowIndex + 1}`;
        if (!CharacterSheetV2._confirmJujutsuRowRemoval(currentLabel)) {
            return;
        }
        rows.splice(rowIndex, 1);
        await actor.update({
            'system.props.tables.invocations': rows
        });
        await this.render({ force: true });
    }
    static _getJujutsuTableLabel(tableKey) {
        switch (String(tableKey ?? '').trim().toLowerCase()) {
            case 'attacks':
                return 'Ataque';
            case 'abilities':
                return 'Habilidade';
            case 'talents':
                return 'Talento';
            case 'aptitudes':
                return 'Aptidão';
            case 'spells':
                return 'Feitiço';
            case 'invocations':
                return 'Invocação';
            case 'inventory':
                return 'Item';
            default:
                return 'Entrada';
        }
    }
    static _getJujutsuTableFallbackImage(tableKey) {
        switch (String(tableKey ?? '').trim().toLowerCase()) {
            case 'attacks':
                return 'icons/svg/sword.svg';
            case 'abilities':
            case 'talents':
            case 'aptitudes':
            case 'spells':
                return 'icons/svg/book.svg';
            case 'invocations':
                return 'icons/svg/mystery-man.svg';
            case 'inventory':
                return 'icons/svg/item-bag.svg';
            default:
                return 'icons/svg/mystery-man.svg';
        }
    }
    static _getPreparedJujutsuTableRows(actor, tableKey) {
        if (!actor) {
            return [];
        }
        const jujutsu = prepareJujutsuSheetData(actor.system?.props ?? {});
        return Array.isArray(jujutsu.props.tables?.[tableKey]) ? jujutsu.props.tables[tableKey] : [];
    }
    static _getPreparedJujutsuTableEntry(actor, tableKey, { rowId = null, rowIndex = -1 } = {}) {
        const rows = CharacterSheetV2._getPreparedJujutsuTableRows(actor, tableKey);
        const normalizedRowId = String(rowId ?? '').trim();
        if (normalizedRowId) {
            const matchIndex = rows.findIndex((entry) => String(entry?.id ?? '').trim() === normalizedRowId);
            if (matchIndex !== -1) {
                return {
                    entry: rows[matchIndex],
                    rowIndex: matchIndex
                };
            }
        }
        if (Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < rows.length) {
            return {
                entry: rows[rowIndex],
                rowIndex
            };
        }
        return {
            entry: null,
            rowIndex: -1
        };
    }
    static _getJujutsuInventoryRows(actor) {
        return CharacterSheetV2._getPreparedJujutsuTableRows(actor, 'inventory');
    }
    static _getJujutsuInventoryEntry(actor, { rowId = null, rowIndex = -1 } = {}) {
        return CharacterSheetV2._getPreparedJujutsuTableEntry(actor, 'inventory', { rowId, rowIndex });
    }
    static _createJujutsuInventoryDragData(actor, { rowId = null, rowIndex = -1 } = {}) {
        if (!actor?.uuid) {
            return null;
        }
        const { entry, rowIndex: resolvedRowIndex } = CharacterSheetV2._getJujutsuInventoryEntry(actor, {
            rowId,
            rowIndex
        });
        if (!entry) {
            return null;
        }
        return {
            type: 'JujutsuInventoryItem',
            actorUuid: actor.uuid,
            actorName: actor.name ?? '',
            rowId: entry.id ?? rowId ?? null,
            rowIndex: resolvedRowIndex,
            name: entry.name ?? 'Item',
            img: entry.image ?? actor.img ?? 'icons/svg/item-bag.svg',
            hasRoll: !!entry.hasRoll
        };
    }
    static _createJujutsuTableDragData(actor, tableKey, { rowId = null, rowIndex = -1 } = {}) {
        const normalizedTableKey = String(tableKey ?? '').trim().toLowerCase();
        if (!actor?.uuid || !['attacks', 'abilities', 'talents', 'aptitudes', 'spells'].includes(normalizedTableKey)) {
            return null;
        }
        const { entry, rowIndex: resolvedRowIndex } = CharacterSheetV2._getPreparedJujutsuTableEntry(actor, normalizedTableKey, {
            rowId,
            rowIndex
        });
        if (!entry) {
            return null;
        }
        return {
            type: 'JujutsuTableEntry',
            actorUuid: actor.uuid,
            actorName: actor.name ?? '',
            tableKey: normalizedTableKey,
            rowId: entry.id ?? rowId ?? null,
            rowIndex: resolvedRowIndex,
            name: entry.name ?? CharacterSheetV2._getJujutsuTableLabel(normalizedTableKey),
            img: entry.image ?? actor.img ?? CharacterSheetV2._getJujutsuTableFallbackImage(normalizedTableKey)
        };
    }
    static _buildJujutsuItemChatHeader(entry, subtitle = '') {
        const escapeHtml = foundry.utils.escapeHTML ?? ((value) => String(value ?? ''));
        const image = escapeHtml(entry?.image || 'icons/svg/mystery-man.svg');
        const name = escapeHtml(entry?.name || 'Item');
        const safeSubtitle = escapeHtml(subtitle);
        return `
            <div style="align-items:center; display:flex; gap:10px; margin-bottom:8px;">
                <img src="${image}" alt="${name}" style="border:1px solid rgba(0,0,0,0.2); border-radius:6px; height:40px; object-fit:cover; width:40px;" />
                <div style="min-width:0;">
                    <div style="font-weight:700;">${name}</div>
                    ${safeSubtitle ? `<div style="font-size:12px; opacity:0.8;">${safeSubtitle}</div>` : ''}
                </div>
            </div>
        `;
    }
    static _buildJujutsuConfiguredRollFormula(entry, actor) {
        const explicitFormula = String(entry?.rollFormula ?? '').trim();
        if (explicitFormula) {
            return explicitFormula;
        }
        const rollDie = String(entry?.rollDie ?? '').trim().toLowerCase();
        if (!['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(rollDie)) {
            return '';
        }
        const rollCount = Math.max(1, Math.trunc(CharacterSheetV2._toSafeNumber(entry?.rollCount, 1)));
        const rollBonus = Math.trunc(CharacterSheetV2._toSafeNumber(entry?.rollBonus, 0));
        const rollAttribute = String(entry?.rollAttribute ?? '').trim().toLowerCase();
        const attributeValue = CharacterSheetV2._toSafeNumber(actor?.system?.props?.attributes?.[rollAttribute]?.value, 10);
        const attributeMod = ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(rollAttribute)
            ? calculateJujutsuAttributeMod(attributeValue)
            : 0;
        const formulaParts = [`${rollCount}${rollDie}`];
        if (rollBonus > 0)
            formulaParts.push(`+ ${rollBonus}`);
        else if (rollBonus < 0)
            formulaParts.push(`- ${Math.abs(rollBonus)}`);
        if (attributeMod > 0)
            formulaParts.push(`+ ${attributeMod}`);
        else if (attributeMod < 0)
            formulaParts.push(`- ${Math.abs(attributeMod)}`);
        return formulaParts.join(' ');
    }
    static async rollJujutsuTableAttack(actorOrUuid, { rowId = null, rowIndex = -1 } = {}) {
        const actor = typeof actorOrUuid === 'string' ? await fromUuid(actorOrUuid) : actorOrUuid;
        if (!(actor instanceof Actor)) {
            ui.notifications.warn('Não foi possível localizar o ator do ataque.');
            return null;
        }
        if (!actor.isOwner) {
            ui.notifications.warn('Você não tem permissão para usar este ataque.');
            return null;
        }
        await CharacterSheetV2._submitJujutsuActorIfNeeded(actor);
        const { entry: attack } = CharacterSheetV2._getPreparedJujutsuTableEntry(actor, 'attacks', {
            rowId,
            rowIndex
        });
        if (!attack) {
            ui.notifications.warn('Não foi possível localizar o ataque arrastado.');
            return null;
        }
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
            actor
        });
        const attackRoll = new Roll(`1d20 + ${CharacterSheetV2._toSafeNumber(attack.acerto, 0)}`);
        await attackRoll.evaluate({ async: true });
        const criticalState = CharacterSheetV2._getD20CriticalStateWithThreshold(attackRoll, attack.critMin);
        await attackRoll.toMessage({
            speaker,
            flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(attack, attack.weapon || attack.type || 'Ataque')}<p><strong>Acerto</strong></p>`,
            flags: {
                [game.system.id]: {
                    jujutsuCritical: {
                        state: criticalState,
                        context: 'attack'
                    },
                    jujutsuHitCheck: {
                        total: Math.trunc(CharacterSheetV2._toSafeNumber(attackRoll.total, 0))
                    }
                }
            }
        });
        const damageFormula = String(attack.damage ?? '').trim();
        if (!damageFormula)
            return attackRoll;
        try {
            const damageRoll = new Roll(damageFormula);
            await damageRoll.evaluate({ async: true });
            await damageRoll.toMessage({
                speaker,
                flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(attack, attack.weapon || attack.type || 'Ataque')}<p><strong>Dano</strong></p>`,
                flags: {
                    [game.system.id]: {
                        jujutsuDamage: {
                            amount: Math.max(0, Math.trunc(CharacterSheetV2._toSafeNumber(damageRoll.total, 0)))
                        }
                    }
                }
            });
            return attackRoll;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
            ui.notifications.error(`Não foi possível rolar o dano de ${attack.name}: ${message}`);
            return attackRoll;
        }
    }
    static async useJujutsuTableFeature(actorOrUuid, { tableKey = '', rowId = null, rowIndex = -1 } = {}) {
        const actor = typeof actorOrUuid === 'string' ? await fromUuid(actorOrUuid) : actorOrUuid;
        if (!(actor instanceof Actor)) {
            ui.notifications.warn('Não foi possível localizar o ator da habilidade.');
            return null;
        }
        if (!actor.isOwner) {
            ui.notifications.warn('Você não tem permissão para usar esta entrada.');
            return null;
        }
        const normalizedTableKey = String(tableKey ?? '').trim().toLowerCase();
        if (!['abilities', 'talents', 'aptitudes', 'spells'].includes(normalizedTableKey)) {
            ui.notifications.warn('Tipo de habilidade invalido para a hotbar.');
            return null;
        }
        await CharacterSheetV2._submitJujutsuActorIfNeeded(actor);
        const { entry } = CharacterSheetV2._getPreparedJujutsuTableEntry(actor, normalizedTableKey, {
            rowId,
            rowIndex
        });
        if (!entry) {
            ui.notifications.warn('Não foi possível localizar a entrada arrastada.');
            return null;
        }
        const cost = CharacterSheetV2._toSafeNumber(entry.cost, 0);
        const currentEnergy = CharacterSheetV2._toSafeNumber(actor.system.props?.resources?.energia?.atuais, 0);
        const nextEnergy = Math.max(0, currentEnergy - Math.max(0, cost));
        if (cost > 0) {
            await actor.update({
                'system.props.resources.energia.atuais': nextEnergy
            });
        }
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
            actor
        });
        const escapeHtml = foundry.utils.escapeHTML ?? ((value) => String(value ?? ''));
        const description = escapeHtml(entry.description || 'Sem descrição.');
        const costLine = cost > 0
            ? `<p><strong>Custo:</strong> ${cost} PE</p><p><strong>PE restante:</strong> ${nextEnergy}</p>`
            : `<p><strong>Custo:</strong> 0 PE</p>`;
        const subtitle = normalizedTableKey === 'spells'
            ? `Feitiço • Nível ${CharacterSheetV2._toSafeNumber(entry.level, 0)}`
            : CharacterSheetV2._getJujutsuTableLabel(normalizedTableKey);
        if (entry.hasRoll) {
            const formula = CharacterSheetV2._buildJujutsuConfiguredRollFormula(entry, actor);
            if (formula) {
                try {
                    const roll = await new Roll(formula).evaluate({ async: true });
                    const criticalState = CharacterSheetV2._getD20CriticalState(roll);
                    const isHitRoll = CharacterSheetV2._isSingleD20Roll(roll);
                    const criticalText = criticalState === 'success'
                        ? '<div><strong>Sucesso CrÃ­tico</strong></div>'
                        : criticalState === 'failure'
                            ? '<div><strong>Erro CrÃ­tico</strong></div>'
                            : '';
                    await roll.toMessage({
                        speaker,
                        flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(entry, subtitle)}<p>${description}</p>${costLine}`,
                        flags: {
                            [game.system.id]: {
                                jujutsuCritical: {
                                    state: criticalState,
                                    context: 'feature'
                                },
                                jujutsuHitCheck: isHitRoll ? {
                                    total: Math.trunc(CharacterSheetV2._toSafeNumber(roll.total, 0))
                                } : null
                            }
                        }
                    }, {
                        // V14: rollMode renamed to messageMode
                        messageMode: game.settings.get('core', 'messageMode')
                    });
                    const damageFormula = String(entry.damageFormula ?? '').trim();
                    if (damageFormula) {
                        const damageRoll = await new Roll(damageFormula).evaluate({ async: true });
                        await damageRoll.toMessage({
                            speaker,
                            flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(entry, subtitle)}<p><strong>Dano/Efeito</strong></p>`,
                            flags: {
                                [game.system.id]: {
                                    jujutsuDamage: {
                                        amount: Math.max(0, Math.trunc(CharacterSheetV2._toSafeNumber(damageRoll.total, 0)))
                                    }
                                }
                            }
                        }, {
                            // V14: rollMode renamed to messageMode
                            messageMode: game.settings.get('core', 'messageMode')
                        });
                    }
                    return roll;
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
                    ui.notifications.error(`Não foi possível rolar ${entry.name}: ${message}`);
                    return null;
                }
            }
        }
        await foundry.documents.ChatMessage.implementation.create({
            speaker,
            content: `${CharacterSheetV2._buildJujutsuItemChatHeader(entry, subtitle)}<p>${description}</p>${costLine}`
        });
        return entry;
    }
    static async rollJujutsuInventoryItem(actorOrUuid, { rowId = null, rowIndex = -1 } = {}) {
        const actor = typeof actorOrUuid === 'string' ? await fromUuid(actorOrUuid) : actorOrUuid;
        if (!(actor instanceof Actor)) {
            ui.notifications.warn('Não foi possível localizar o ator do item de inventário.');
            return null;
        }
        if (!actor.isOwner) {
            ui.notifications.warn('Você não tem permissão para usar este item de inventário.');
            return null;
        }
        await CharacterSheetV2._submitJujutsuActorIfNeeded(actor);
        const { entry } = CharacterSheetV2._getJujutsuInventoryEntry(actor, {
            rowId,
            rowIndex
        });
        if (!entry) {
            ui.notifications.warn('Não foi possível localizar o item de inventário arrastado.');
            return null;
        }
        const rollDie = String(entry?.rollDie ?? '').trim().toLowerCase();
        if (!entry?.hasRoll || !['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(rollDie)) {
            ui.notifications.warn(`${entry?.name || 'Este item'} nao possui uma rolagem configurada.`);
            return null;
        }
        const rollCount = Math.max(1, Math.trunc(CharacterSheetV2._toSafeNumber(entry?.rollCount, 1)));
        const rollBonus = Math.trunc(CharacterSheetV2._toSafeNumber(entry?.rollBonus, 0));
        const rollAttribute = String(entry?.rollAttribute ?? '').trim().toLowerCase();
        const attributeValue = CharacterSheetV2._toSafeNumber(actor.system?.props?.attributes?.[rollAttribute]?.value, 10);
        const attributeMod = ['for', 'des', 'con', 'int', 'sab', 'pre'].includes(rollAttribute)
            ? calculateJujutsuAttributeMod(attributeValue)
            : 0;
        const formulaParts = [`${rollCount}${rollDie}`];
        if (rollBonus > 0)
            formulaParts.push(`+ ${rollBonus}`);
        else if (rollBonus < 0)
            formulaParts.push(`- ${Math.abs(rollBonus)}`);
        if (attributeMod > 0)
            formulaParts.push(`+ ${attributeMod}`);
        else if (attributeMod < 0)
            formulaParts.push(`- ${Math.abs(attributeMod)}`);
        const roll = await new Roll(formulaParts.join(' ')).evaluate({ async: true });
        const criticalState = CharacterSheetV2._getD20CriticalStateWithThreshold(roll, entry?.critMin);
        await roll.toMessage({
            speaker: foundry.documents.ChatMessage.implementation.getSpeaker({ actor }),
            flavor: `${entry?.name || 'Item'} • Rolagem de inventário`,
            flags: {
                [game.system.id]: {
                    jujutsuCritical: {
                        state: criticalState,
                        context: 'item'
                    }
                }
            }
        });
        return roll;
    }
    static async createJujutsuTableMacro(dropData, slot) {
        const actor = await fromUuid(String(dropData?.actorUuid ?? ''));
        if (!(actor instanceof Actor) || !actor.isOwner) {
            ui.notifications.warn('Não foi possível criar a macro para esta entrada sem permissão.');
            return null;
        }
        const tableKey = String(dropData?.tableKey ?? '').trim().toLowerCase();
        if (!['attacks', 'abilities', 'talents', 'aptitudes', 'spells'].includes(tableKey)) {
            ui.notifications.warn('Tipo de entrada invalido para criar macro.');
            return null;
        }
        const { entry, rowIndex } = CharacterSheetV2._getPreparedJujutsuTableEntry(actor, tableKey, {
            rowId: dropData?.rowId ?? null,
            rowIndex: Number(dropData?.rowIndex ?? -1)
        });
        if (!entry) {
            ui.notifications.warn('Não foi possível localizar a entrada para criar a macro.');
            return null;
        }
        const apiMethod = tableKey === 'attacks' ? 'rollTableAttack' : 'useTableFeature';
        const command = `game.CustomSystemBuilder?.API?.Jujutsu?.${apiMethod}?.(${JSON.stringify(actor.uuid)}, { tableKey: ${JSON.stringify(tableKey)}, rowId: ${JSON.stringify(entry.id ?? null)}, rowIndex: ${rowIndex} });`;
        const macroData = {
            name: `${actor.name}: ${entry.name ?? CharacterSheetV2._getJujutsuTableLabel(tableKey)}`,
            type: CONST.MACRO_TYPES.SCRIPT,
            scope: 'actor',
            img: entry.image ?? actor.img ?? CharacterSheetV2._getJujutsuTableFallbackImage(tableKey),
            command,
            flags: {
                [game.system.id]: {
                    jujutsuTableMacro: true,
                    actorUuid: actor.uuid,
                    tableKey,
                    rowId: entry.id ?? null,
                    rowIndex
                }
            }
        };
        const macro = game.macros.find((candidate) => {
            return candidate.name === macroData.name && candidate.command === macroData.command && candidate.isAuthor;
        }) ?? await Macro.create(macroData);
        if (!macro) {
            return null;
        }
        await game.user.assignHotbarMacro(macro, slot);
        return macro;
    }
    static async createJujutsuInventoryMacro(dropData, slot) {
        const actor = await fromUuid(String(dropData?.actorUuid ?? ''));
        if (!(actor instanceof Actor) || !actor.isOwner) {
            ui.notifications.warn('Não foi possível criar a macro para um item de inventário sem permissão.');
            return null;
        }
        const { entry, rowIndex } = CharacterSheetV2._getJujutsuInventoryEntry(actor, {
            rowId: dropData?.rowId ?? null,
            rowIndex: Number(dropData?.rowIndex ?? -1)
        });
        if (!entry) {
            ui.notifications.warn('Não foi possível localizar o item de inventário para criar a macro.');
            return null;
        }
        const command = `game.CustomSystemBuilder?.API?.Jujutsu?.rollInventoryItem?.(${JSON.stringify(actor.uuid)}, { rowId: ${JSON.stringify(entry.id ?? null)}, rowIndex: ${rowIndex} });`;
        const macroData = {
            name: `${actor.name}: ${entry.name ?? 'Item'}`,
            type: CONST.MACRO_TYPES.SCRIPT,
            scope: 'actor',
            img: entry.image ?? actor.img ?? 'icons/svg/item-bag.svg',
            command,
            flags: {
                [game.system.id]: {
                    jujutsuInventoryMacro: true,
                    actorUuid: actor.uuid,
                    rowId: entry.id ?? null,
                    rowIndex
                }
            }
        };
        const macro = game.macros.find((candidate) => {
            return candidate.name === macroData.name && candidate.command === macroData.command && candidate.isAuthor;
        }) ?? await Macro.create(macroData);
        if (!macro) {
            return null;
        }
        await game.user.assignHotbarMacro(macro, slot);
        return macro;
    }
    static _toSignedNumber(value) {
        const number = CharacterSheetV2._toSafeNumber(value, 0);
        return number > 0 ? `+${number}` : `${number}`;
    }
    static _getD20CriticalState(roll) {
        const firstDie = roll?.dice?.[0];
        if (!firstDie || Number(firstDie.faces) !== 20 || Number(firstDie.number) !== 1) {
            return null;
        }
        const firstResult = firstDie.results?.find((result) => result?.active !== false);
        if (!firstResult)
            return null;
        if (Number(firstResult.result) === 20)
            return 'success';
        if (Number(firstResult.result) === 1)
            return 'failure';
        return null;
    }
    static _getD20CriticalStateWithThreshold(roll, criticalMin = 20) {
        const firstDie = roll?.dice?.[0];
        if (!firstDie || Number(firstDie.faces) !== 20 || Number(firstDie.number) !== 1) {
            return null;
        }
        const firstResult = firstDie.results?.find((result) => result?.active !== false);
        if (!firstResult)
            return null;
        const dieResult = Number(firstResult.result);
        if (dieResult === 1)
            return 'failure';
        const threshold = Math.max(2, Math.min(20, Math.trunc(CharacterSheetV2._toSafeNumber(criticalMin, 20))));
        if (dieResult >= threshold)
            return 'success';
        return null;
    }
    static _isSingleD20Roll(roll) {
        const firstDie = roll?.dice?.[0];
        return !!firstDie && Number(firstDie.faces) === 20 && Number(firstDie.number) === 1;
    }
    static _getFormNumberValue(form, name, fallback = 0) {
        const input = form?.querySelector?.(`[name='${name}']`);
        return CharacterSheetV2._toSafeNumber(input?.value, fallback);
    }
    static _getFormCheckboxValue(form, name, fallback = false) {
        const input = form?.querySelector?.(`[name='${name}']`);
        return input ? !!input.checked : fallback;
    }
    static _getScopedNumberValue(scope, selector, fallback = 0) {
        const input = scope?.querySelector?.(selector);
        return CharacterSheetV2._toSafeNumber(input?.value, fallback);
    }
    static _getScopedCheckboxValue(scope, selector, fallback = false) {
        const input = scope?.querySelector?.(selector);
        return input ? !!input.checked : fallback;
    }
    static _applyLevelScaledResourceBonus({ currentMax, previousLevel, nextLevel, previousEnabled, nextEnabled }) {
        if (previousEnabled && nextEnabled) {
            return Math.max(0, currentMax + (nextLevel - previousLevel));
        }
        if (!previousEnabled && nextEnabled) {
            return Math.max(0, currentMax + nextLevel);
        }
        if (previousEnabled && !nextEnabled) {
            return Math.max(0, currentMax - previousLevel);
        }
        return Math.max(0, currentMax);
    }
    static _getKamoHpBonusForLevel(level) {
        const safeLevel = Math.max(0, Math.trunc(CharacterSheetV2._toSafeNumber(level, 0)));
        const firstBand = Math.min(safeLevel, 9);
        const secondBand = Math.max(0, safeLevel - 9);
        return firstBand + (secondBand * 2);
    }
    static _applyKamoHpResourceBonus({ currentMax, previousLevel, nextLevel, previousEnabled, nextEnabled }) {
        const previousBonus = CharacterSheetV2._getKamoHpBonusForLevel(previousLevel);
        const nextBonus = CharacterSheetV2._getKamoHpBonusForLevel(nextLevel);
        if (previousEnabled && nextEnabled) {
            return Math.max(0, currentMax + (nextBonus - previousBonus));
        }
        if (!previousEnabled && nextEnabled) {
            return Math.max(0, currentMax + nextBonus);
        }
        if (previousEnabled && !nextEnabled) {
            return Math.max(0, currentMax - previousBonus);
        }
        return Math.max(0, currentMax);
    }
    static _syncJujutsuRdConfigRow(row) {
        const toggle = row?.querySelector?.('[data-rd-enabled]');
        const valueInput = row?.querySelector?.('[data-rd-value]');
        if (!toggle || !valueInput)
            return;
        const enabled = toggle.checked;
        row.classList.toggle('is-enabled', enabled);
        if (enabled) {
            const value = Number(valueInput.value);
            if (!Number.isFinite(value) || value <= 0) {
                valueInput.value = '1';
            }
        }
        else {
            valueInput.value = '0';
        }
        valueInput.disabled = !enabled;
    }
    static _bindJujutsuRdConfigDialog(element) {
        const form = element?.querySelector?.('form');
        if (!form)
            return;
        form.querySelectorAll('[data-rd-row]').forEach((row) => {
            const toggle = row.querySelector('[data-rd-enabled]');
            const valueInput = row.querySelector('[data-rd-value]');
            if (toggle) {
                toggle.addEventListener('change', () => CharacterSheetV2._syncJujutsuRdConfigRow(row));
            }
            if (valueInput) {
                valueInput.addEventListener('input', () => {
                    const value = Number(valueInput.value);
                    if (Number.isFinite(value) && value < 0) {
                        valueInput.value = '0';
                    }
                });
            }
            CharacterSheetV2._syncJujutsuRdConfigRow(row);
        });
    }
    static async configureJujutsuRds(_event, _target) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const actor = this.actor ?? this.document;
        const jujutsu = prepareJujutsuSheetData(actor.system.props ?? {});
        const content = await foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-rds-config.hbs`, {
            rdDefinitions: jujutsu.rdDefinitions
        });
        await new CustomDialogV2({
            modal: true,
            content,
            buttons: {
                save: {
                    default: true,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar'
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Cancelar'
                }
            },
            onRender: (element) => {
                CharacterSheetV2._bindJujutsuRdConfigDialog(element);
            },
            submit: async (result, _submitEvent, _button, dialog) => {
                if (result !== 'save')
                    return;
                const form = dialog.querySelector('form');
                if (!form)
                    return;
                const formValues = foundry.utils.expandObject(Object.fromEntries(new FormData(form).entries()));
                const nextRds = foundry.utils.deepClone(actor.system.props?.rds ?? {});
                for (const rd of jujutsu.rdDefinitions) {
                    const entry = formValues.rds?.[rd.type] ?? {};
                    const enabled = !!entry.enabled;
                    const rawValue = Number(entry.value);
                    nextRds[rd.type] = enabled ? Math.max(1, Number.isFinite(rawValue) ? Math.floor(rawValue) : 1) : 0;
                }
                await actor.update({
                    'system.props.rds': nextRds
                });
            },
            position: {
                width: 520,
                height: 'auto'
            },
            window: {
                title: 'Configurar Redução de Danos (RDs)'
            }
        }).render({ force: true });
    }
    static async configureJujutsuMovement(_event, _target) {
        const actor = this.actor ?? this.document;
        if (!this.isEditable || !actor?.isOwner) {
            return;
        }
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const jujutsu = prepareJujutsuSheetData(actor.system.props ?? {});
        const content = await foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-movement-config.hbs`, {
            movement: jujutsu.computed.movement
        });
        await new CustomDialogV2({
            modal: true,
            content,
            buttons: {
                save: {
                    default: true,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar'
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Cancelar'
                }
            },
            submit: async (result, _submitEvent, _button, dialog) => {
                if (result !== 'save')
                    return;
                const form = dialog.querySelector('form');
                if (!form)
                    return;
                if (!form.checkValidity()) {
                    form.reportValidity();
                    ui.notifications?.warn?.('Informe um bônus numérico válido.');
                    throw new Error('Bônus inválido');
                }
                const input = form.querySelector('input[name="movementBonus"]');
                if (!input) {
                    ui.notifications?.warn?.('Campo de bônus não encontrado.');
                    throw new Error('Bônus inválido');
                }
                const bonusRaw = input.value?.trim() ?? '';
                const bonus = bonusRaw === '' ? 0 : input.valueAsNumber;
                if (!Number.isFinite(bonus) || input.validity?.badInput) {
                    ui.notifications?.warn?.('Bônus inválido: insira um número finito.');
                    throw new Error('Bônus inválido');
                }
                if (!this.isEditable || !actor?.isOwner) {
                    return;
                }
                await actor.update({
                    'system.props.movementBonus': bonus
                });
            },
            position: {
                width: 380,
                height: 'auto'
            },
            window: {
                title: 'Configurar Deslocamento'
            }
        }).render({ force: true });
    }
    static _syncJujutsuCharacteristicConfigRow(row) {
        const toggle = row?.querySelector?.('[data-characteristic-selected]');
        if (!toggle)
            return;
        row.classList.toggle('is-enabled', !!toggle.checked);
    }
    static _applyJujutsuCharacteristicFilters(form) {
        if (!form)
            return;
        const search = (form.querySelector('[data-characteristics-search]')?.value ?? '').trim().toLowerCase();
        const type = (form.querySelector('[data-characteristics-type-filter]')?.value ?? '').trim().toLowerCase();
        const category = (form.querySelector('[data-characteristics-category-filter]')?.value ?? '').trim().toLowerCase();
        let visibleCount = 0;
        let totalCount = 0;
        form.querySelectorAll('[data-characteristic-row]').forEach((row) => {
            totalCount += 1;
            const haystack = (row.dataset.searchText ?? '').toLowerCase();
            const rowType = (row.dataset.type ?? '').toLowerCase();
            const rowCategory = (row.dataset.category ?? '').toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            const matchesType = !type || rowType === type;
            const matchesCategory = !category || rowCategory === category;
            const isVisible = matchesSearch && matchesType && matchesCategory;
            row.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });
        const countDisplay = form.querySelector('[data-characteristics-filter-count]');
        if (countDisplay) {
            countDisplay.textContent = `${visibleCount} de ${totalCount} características exibidas`;
        }
    }
    static _createJujutsuCharacteristicCustomRow(index, characteristic = {}) {
        const escape = foundry.utils.escapeHTML;
        const text = (value) => escape(String(value ?? ''));
        const id = text(characteristic.id ?? `custom-characteristic-${index + 1}`);
        const nome = text(characteristic.nome ?? '');
        const tipo = text(characteristic.tipo ?? '');
        const categoria = text(characteristic.categoria ?? '');
        const modifica = text(Array.isArray(characteristic.modifica) ? characteristic.modifica.join(', ') : characteristic.modifica ?? '');
        const efeito = text(characteristic.efeito_resumido ?? '');
        const formula = text(characteristic.formula_sugerida ?? '');
        const observacoes = text(characteristic.observacoes ?? '');
        return `
            <div class="jj-characteristics-custom-row" data-custom-characteristic-row>
                <input type="hidden" name="custom.${index}.id" value="${id}" />
                <input type="hidden" name="custom.${index}.origem" value="custom" />
                <div class="jj-characteristics-custom-grid">
                    <label class="jj-characteristics-custom-field">
                        <span>Nome</span>
                        <input name="custom.${index}.nome" type="text" value="${nome}" />
                    </label>
                    <label class="jj-characteristics-custom-field">
                        <span>Tipo</span>
                        <input name="custom.${index}.tipo" type="text" value="${tipo}" placeholder="custom" />
                    </label>
                    <label class="jj-characteristics-custom-field">
                        <span>Categoria</span>
                        <input name="custom.${index}.categoria" type="text" value="${categoria}" />
                    </label>
                    <label class="jj-characteristics-custom-field">
                        <span>Modifica</span>
                        <input name="custom.${index}.modifica" type="text" value="${modifica}" placeholder="atributo1, atributo2" />
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Efeito Resumido</span>
                        <textarea name="custom.${index}.efeito_resumido" rows="2">${efeito}</textarea>
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Fórmula Sugerida</span>
                        <textarea
                            name="custom.${index}.formula_sugerida"
                            rows="2"
                            placeholder="Campo descritivo para registrar a lógica da característica. Ex.: if (nivel >= 6) pvMax += 2; ou periciaEscolhida += 2"
                        >${formula}</textarea>
                        <small class="jj-characteristics-custom-help">Campo descritivo. Ele não executa a fórmula automaticamente; serve para documentar a lógica da característica para uso futuro.</small>
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Observações</span>
                        <textarea name="custom.${index}.observacoes" rows="2">${observacoes}</textarea>
                    </label>
                </div>
                <div class="jj-characteristics-custom-actions">
                    <button class="jj-action-button jj-action-button--danger" type="button" data-remove-custom-characteristic>Remover custom</button>
                </div>
            </div>
        `;
    }
    static _bindJujutsuCharacteristicCustomRow(row) {
        const removeButton = row?.querySelector?.('[data-remove-custom-characteristic]');
        if (!removeButton)
            return;
        removeButton.addEventListener('click', (event) => {
            event.preventDefault();
            row.remove();
        });
    }
    static _syncJujutsuResistanceConfigRow(row) {
        const toggle = row?.querySelector?.('[data-resistance-enabled]');
        if (!toggle)
            return;
        row.classList.toggle('is-enabled', !!toggle.checked);
    }
    static _createJujutsuResistanceCustomRow(index, resistance = {}) {
        const escapeHtml = foundry.utils.escapeHTML ?? ((value) => String(value ?? ''));
        const id = escapeHtml(resistance.id ?? `custom-resistance-${index + 1}`);
        const label = escapeHtml(resistance.label ?? '');
        const code = escapeHtml(resistance.code ?? '');
        const description = escapeHtml(resistance.description ?? '');
        const observations = escapeHtml(resistance.observations ?? '');
        return `
            <div class="jj-characteristics-custom-row" data-custom-resistance-row>
                <input type="hidden" name="custom.${index}.id" value="${id}" />
                <input type="hidden" name="custom.${index}.origem" value="custom" />
                <div class="jj-characteristics-custom-grid">
                    <label class="jj-characteristics-custom-field">
                        <span>Nome</span>
                        <input name="custom.${index}.label" type="text" value="${label}" />
                    </label>
                    <label class="jj-characteristics-custom-field">
                        <span>Sigla</span>
                        <input name="custom.${index}.code" type="text" value="${code}" maxlength="6" placeholder="RES" />
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Descrição</span>
                        <textarea name="custom.${index}.description" rows="2">${description}</textarea>
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Observações</span>
                        <textarea name="custom.${index}.observations" rows="2">${observations}</textarea>
                    </label>
                </div>
                <div class="jj-characteristics-custom-actions">
                    <button class="jj-action-button jj-action-button--danger" type="button" data-remove-custom-resistance>Remover custom</button>
                </div>
            </div>
        `;
    }
    static _bindJujutsuResistanceCustomRow(row) {
        const removeButton = row?.querySelector?.('[data-remove-custom-resistance]');
        if (!removeButton)
            return;
        removeButton.addEventListener('click', (event) => {
            event.preventDefault();
            row.remove();
        });
    }
    static _collectJujutsuResistanceConfig(form, validResistanceIds = new Set()) {
        const readFieldValue = (row, selector) => String(row?.querySelector?.(selector)?.value ?? '').trim();
        const selected = Array.from(form.querySelectorAll('[data-resistance-enabled][name^="selected."]:checked'))
            .map((input) => String(input.name ?? '').replace(/^selected\./, '').trim())
            .filter((id) => validResistanceIds.has(id));
        const customToggleInputs = Array.from(form.querySelectorAll('[data-resistance-enabled][name^="customSelected."]'));
        const selectedCustom = new Set(customToggleInputs
            .filter((input) => input.checked)
            .map((input) => String(input.name ?? '').replace(/^customSelected\./, '').trim())
            .filter(Boolean));
        const custom = Array.from(form.querySelectorAll('[data-custom-resistance-row]')).map((row, index) => {
            const id = readFieldValue(row, 'input[name$=".id"]') || `custom-resistance-${index + 1}`;
            const label = readFieldValue(row, 'input[name$=".label"]');
            const code = readFieldValue(row, 'input[name$=".code"]');
            const description = readFieldValue(row, 'textarea[name$=".description"]');
            const observations = readFieldValue(row, 'textarea[name$=".observations"]');
            if (!label && !code && !description && !observations) {
                return null;
            }
            return {
                id,
                label: label || `Resistência Custom ${index + 1}`,
                code,
                description,
                observations,
                origem: 'custom',
                enabled: customToggleInputs.some((input) => input.name === `customSelected.${id}`) ? selectedCustom.has(id) : true
            };
        }).filter(Boolean);
        return { selected, custom };
    }
    static _bindJujutsuResistanceConfigDialog(element, { saveResistances, dialogApp } = {}) {
        const form = element?.querySelector?.('form');
        if (!form)
            return;
        form.querySelectorAll('[data-resistance-row]').forEach((row) => {
            const toggle = row.querySelector('[data-resistance-enabled]');
            if (toggle) {
                toggle.addEventListener('change', () => CharacterSheetV2._syncJujutsuResistanceConfigRow(row));
            }
            CharacterSheetV2._syncJujutsuResistanceConfigRow(row);
        });
        form.querySelectorAll('[data-custom-resistance-row]').forEach((row) => {
            CharacterSheetV2._bindJujutsuResistanceCustomRow(row);
        });
        const customList = form.querySelector('[data-resistances-custom-list]');
        const addCustomButton = form.querySelector('[data-add-custom-resistance]');
        if (customList && addCustomButton) {
            addCustomButton.addEventListener('click', (event) => {
                event.preventDefault();
                const nextIndex = CharacterSheetV2._toSafeNumber(customList.dataset.nextIndex, customList.children.length);
                customList.insertAdjacentHTML('beforeend', CharacterSheetV2._createJujutsuResistanceCustomRow(nextIndex));
                customList.dataset.nextIndex = String(nextIndex + 1);
                const row = customList.lastElementChild;
                if (row) {
                    CharacterSheetV2._bindJujutsuResistanceCustomRow(row);
                }
            });
        }
        form.querySelectorAll('[data-save-resistances]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await saveResistances?.(form, { refreshDialog: true });
            });
        });
    }
    static _syncJujutsuTrainingConfigRow(row) {
        const toggle = row?.querySelector?.('[data-training-enabled]');
        if (!toggle)
            return;
        row.classList.toggle('is-enabled', !!toggle.checked);
    }
    static _createJujutsuTrainingCustomRow(index, training = {}) {
        const escapeHtml = foundry.utils.escapeHTML ?? ((value) => String(value ?? ''));
        const id = escapeHtml(training.id ?? `custom-training-${index + 1}`);
        const label = escapeHtml(training.label ?? '');
        const code = escapeHtml(training.code ?? '');
        const description = escapeHtml(training.description ?? '');
        const observations = escapeHtml(training.observations ?? '');
        return `
            <div class="jj-characteristics-custom-row" data-custom-training-row>
                <input type="hidden" name="custom.${index}.id" value="${id}" />
                <input type="hidden" name="custom.${index}.origem" value="custom" />
                <div class="jj-characteristics-custom-grid">
                    <label class="jj-characteristics-custom-field">
                        <span>Nome</span>
                        <input name="custom.${index}.label" type="text" value="${label}" />
                    </label>
                    <label class="jj-characteristics-custom-field">
                        <span>Sigla</span>
                        <input name="custom.${index}.code" type="text" value="${code}" maxlength="6" placeholder="TRN" />
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Descrição</span>
                        <textarea name="custom.${index}.description" rows="2">${description}</textarea>
                    </label>
                    <label class="jj-characteristics-custom-field jj-characteristics-custom-field--wide">
                        <span>Observações</span>
                        <textarea name="custom.${index}.observations" rows="2">${observations}</textarea>
                    </label>
                </div>
                <div class="jj-characteristics-custom-actions">
                    <button class="jj-action-button jj-action-button--danger" type="button" data-remove-custom-training>Remover treinamento</button>
                </div>
            </div>
        `;
    }
    static _bindJujutsuTrainingCustomRow(row) {
        const removeButton = row?.querySelector?.('[data-remove-custom-training]');
        if (!removeButton)
            return;
        removeButton.addEventListener('click', (event) => {
            event.preventDefault();
            row.remove();
        });
    }
    static _collectJujutsuTrainingConfig(form) {
        const readFieldValue = (row, selector) => String(row?.querySelector?.(selector)?.value ?? '').trim();
        const customToggleInputs = Array.from(form.querySelectorAll('[data-training-enabled][name^="customSelected."]'));
        const selectedCustom = new Set(customToggleInputs
            .filter((input) => input.checked)
            .map((input) => String(input.name ?? '').replace(/^customSelected\./, '').trim())
            .filter(Boolean));
        const custom = Array.from(form.querySelectorAll('[data-custom-training-row]')).map((row, index) => {
            const id = readFieldValue(row, 'input[name$=".id"]') || `custom-training-${index + 1}`;
            const label = readFieldValue(row, 'input[name$=".label"]');
            const code = readFieldValue(row, 'input[name$=".code"]');
            const description = readFieldValue(row, 'textarea[name$=".description"]');
            const observations = readFieldValue(row, 'textarea[name$=".observations"]');
            if (!label && !code && !description && !observations) {
                return null;
            }
            return {
                id,
                label: label || `Treinamento ${index + 1}`,
                code,
                description,
                observations,
                origem: 'custom',
                enabled: customToggleInputs.some((input) => input.name === `customSelected.${id}`) ? selectedCustom.has(id) : true
            };
        }).filter(Boolean);
        return { custom };
    }
    static _bindJujutsuTrainingConfigDialog(element, { saveTrainings, dialogApp } = {}) {
        const form = element?.querySelector?.('form');
        if (!form)
            return;
        form.querySelectorAll('[data-training-row]').forEach((row) => {
            const toggle = row.querySelector('[data-training-enabled]');
            if (toggle) {
                toggle.addEventListener('change', () => CharacterSheetV2._syncJujutsuTrainingConfigRow(row));
            }
            CharacterSheetV2._syncJujutsuTrainingConfigRow(row);
        });
        form.querySelectorAll('[data-custom-training-row]').forEach((row) => {
            CharacterSheetV2._bindJujutsuTrainingCustomRow(row);
        });
        const customList = form.querySelector('[data-trainings-custom-list]');
        const addCustomButton = form.querySelector('[data-add-custom-training]');
        if (customList && addCustomButton) {
            addCustomButton.addEventListener('click', (event) => {
                event.preventDefault();
                const nextIndex = CharacterSheetV2._toSafeNumber(customList.dataset.nextIndex, customList.children.length);
                customList.insertAdjacentHTML('beforeend', CharacterSheetV2._createJujutsuTrainingCustomRow(nextIndex));
                customList.dataset.nextIndex = String(nextIndex + 1);
                const row = customList.lastElementChild;
                if (row) {
                    CharacterSheetV2._bindJujutsuTrainingCustomRow(row);
                }
            });
        }
        form.querySelectorAll('[data-save-trainings]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await saveTrainings?.(form, { refreshDialog: true });
            });
        });
    }
    static _collectJujutsuCharacteristicsConfig(form, validCharacteristicIds) {
        const readFieldValue = (row, selector) => String(row?.querySelector?.(selector)?.value ?? '').trim();
        const selected = Array.from(form.querySelectorAll('[data-characteristic-selected][name^="selected."]:checked'))
            .map((input) => String(input.name ?? '').replace(/^selected\./, '').trim())
            .filter((id) => validCharacteristicIds.has(id));
        const customToggleInputs = Array.from(form.querySelectorAll('[data-characteristic-selected][name^="customSelected."]'));
        const selectedCustom = new Set(customToggleInputs
            .filter((input) => input.checked)
            .map((input) => String(input.name ?? '').replace(/^customSelected\./, '').trim())
            .filter(Boolean));
        const custom = Array.from(form.querySelectorAll('[data-custom-characteristic-row]')).map((row, index) => {
            const id = readFieldValue(row, 'input[name$=".id"]') || `custom-characteristic-${index + 1}`;
            const nome = readFieldValue(row, 'input[name$=".nome"]');
            const tipo = readFieldValue(row, 'input[name$=".tipo"]');
            const categoria = readFieldValue(row, 'input[name$=".categoria"]');
            const efeito_resumido = readFieldValue(row, 'textarea[name$=".efeito_resumido"]');
            const formula_sugerida = readFieldValue(row, 'textarea[name$=".formula_sugerida"]');
            const observacoes = readFieldValue(row, 'textarea[name$=".observacoes"]');
            const modifica = readFieldValue(row, 'input[name$=".modifica"]')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            if (!nome && !tipo && !categoria && !efeito_resumido && !formula_sugerida && !observacoes && modifica.length === 0) {
                return null;
            }
            return {
                id,
                nome: nome || `Característica Custom ${index + 1}`,
                tipo,
                categoria,
                efeito_resumido,
                modifica,
                formula_sugerida,
                observacoes,
                origem: 'custom',
                enabled: customToggleInputs.some((input) => input.name === `customSelected.${id}`) ? selectedCustom.has(id) : true
            };
        }).filter(Boolean);
        return { selected, custom };
    }
    static _bindJujutsuCharacteristicsConfigDialog(element, { saveCharacteristics, dialogApp } = {}) {
        const form = element?.querySelector?.('form');
        if (!form)
            return;
        form.querySelectorAll('[data-characteristic-row]').forEach((row) => {
            const toggle = row.querySelector('[data-characteristic-selected]');
            if (toggle) {
                toggle.addEventListener('change', () => CharacterSheetV2._syncJujutsuCharacteristicConfigRow(row));
            }
            CharacterSheetV2._syncJujutsuCharacteristicConfigRow(row);
        });
        form.querySelectorAll('[data-custom-characteristic-row]').forEach((row) => {
            CharacterSheetV2._bindJujutsuCharacteristicCustomRow(row);
        });
        const customList = form.querySelector('[data-characteristics-custom-list]');
        const addCustomButton = form.querySelector('[data-add-custom-characteristic]');
        if (customList && addCustomButton) {
            addCustomButton.addEventListener('click', (event) => {
                event.preventDefault();
                const nextIndex = CharacterSheetV2._toSafeNumber(customList.dataset.nextIndex, customList.children.length);
                customList.insertAdjacentHTML('beforeend', CharacterSheetV2._createJujutsuCharacteristicCustomRow(nextIndex));
                customList.dataset.nextIndex = String(nextIndex + 1);
                const row = customList.lastElementChild;
                if (row) {
                    CharacterSheetV2._bindJujutsuCharacteristicCustomRow(row);
                }
            });
        }
        form.querySelectorAll('[data-save-characteristics]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await saveCharacteristics?.(form, { refreshDialog: true });
            });
        });
        form.querySelectorAll('[data-characteristics-search], [data-characteristics-type-filter], [data-characteristics-category-filter]').forEach((input) => {
            input.addEventListener('input', () => CharacterSheetV2._applyJujutsuCharacteristicFilters(form));
            input.addEventListener('change', () => CharacterSheetV2._applyJujutsuCharacteristicFilters(form));
        });
        CharacterSheetV2._applyJujutsuCharacteristicFilters(form);
    }
    static async configureJujutsuResistances(_event, _target) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const sheet = this;
        const actor = this.actor ?? this.document;
        const renderDialogContent = async (propsSource = actor.system.props ?? {}) => {
            const currentJujutsu = prepareJujutsuSheetData(propsSource);
            return foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-resistances-config.hbs`, {
                resistanceDefinitions: currentJujutsu.resistanceDefinitions,
                customResistances: currentJujutsu.props.resistanceConfig?.custom ?? []
            });
        };
        const validResistanceIds = new Set((prepareJujutsuSheetData(actor.system.props ?? {}).resistanceDefinitions ?? [])
            .filter((entry) => entry.origem !== 'custom')
            .map((entry) => entry.id));
        let dialogApp;
        const saveResistances = async (form, { refreshDialog = false } = {}) => {
            if (!form)
                return false;
            const resistanceConfig = CharacterSheetV2._collectJujutsuResistanceConfig(form, validResistanceIds);
            const nextProps = foundry.utils.deepClone(actor.system.props ?? {});
            nextProps.resistanceConfig = {
                selected: resistanceConfig.selected,
                custom: resistanceConfig.custom
            };
            try {
                try {
                    await actor.update({
                        'system.props.resistanceConfig': nextProps.resistanceConfig
                    });
                }
                catch (_nestedUpdateError) {
                    await actor.update({
                        system: {
                            props: nextProps
                        }
                    });
                }
                actor.prepareData();
                ui.notifications.info('Resistencias salvas.');
                await sheet.render({ force: true });
                if (refreshDialog && dialogApp) {
                    const dialogContent = dialogApp.element?.querySelector?.('.dialog-content');
                    if (dialogContent) {
                        const scrollTop = dialogContent.scrollTop;
                        dialogContent.innerHTML = await renderDialogContent(nextProps);
                        dialogContent.scrollTop = scrollTop;
                        CharacterSheetV2._bindJujutsuResistanceConfigDialog(dialogApp.element, {
                            saveResistances,
                            dialogApp
                        });
                    }
                }
                return true;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
                ui.notifications.error(`Não foi possível salvar as resistências: ${message}`);
                return false;
            }
        };
        dialogApp = new CustomDialogV2({
            modal: true,
            content: await renderDialogContent(),
            buttons: {
                save: {
                    default: true,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar',
                    callback: async (event, button, element) => {
                        const form = element.querySelector('form');
                        await saveResistances(form, { refreshDialog: true });
                        return 'handled';
                    }
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Fechar',
                    callback: async () => {
                        await dialogApp?.close();
                        return 'handled';
                    }
                }
            },
            onRender: (element) => {
                element.classList.add('jj-characteristics-dialog');
                CharacterSheetV2._bindJujutsuResistanceConfigDialog(element, {
                    saveResistances,
                    dialogApp
                });
            },
            position: {
                width: 920,
                height: 780
            },
            window: {
                title: 'Configurar Resistências'
            }
        });
        await dialogApp.render({ force: true });
    }
    static async configureJujutsuTrainings(_event, _target) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const sheet = this;
        const actor = this.actor ?? this.document;
        const renderDialogContent = async (propsSource = actor.system.props ?? {}) => {
            const currentJujutsu = prepareJujutsuSheetData(propsSource);
            return foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-trainings-config.hbs`, {
                trainingDefinitions: currentJujutsu.trainingDefinitions,
                customTrainings: currentJujutsu.props.trainingConfig?.custom ?? []
            });
        };
        let dialogApp;
        const saveTrainings = async (form, { refreshDialog = false } = {}) => {
            if (!form)
                return false;
            const trainingConfig = CharacterSheetV2._collectJujutsuTrainingConfig(form);
            const nextProps = foundry.utils.deepClone(actor.system.props ?? {});
            nextProps.trainingConfig = {
                custom: trainingConfig.custom
            };
            try {
                try {
                    await actor.update({
                        'system.props.trainingConfig': nextProps.trainingConfig
                    });
                }
                catch (_nestedUpdateError) {
                    await actor.update({
                        system: {
                            props: nextProps
                        }
                    });
                }
                actor.prepareData();
                ui.notifications.info('Treinamentos salvos.');
                await sheet.render({ force: true });
                if (refreshDialog && dialogApp) {
                    const dialogContent = dialogApp.element?.querySelector?.('.dialog-content');
                    if (dialogContent) {
                        const scrollTop = dialogContent.scrollTop;
                        dialogContent.innerHTML = await renderDialogContent(nextProps);
                        dialogContent.scrollTop = scrollTop;
                        CharacterSheetV2._bindJujutsuTrainingConfigDialog(dialogApp.element, {
                            saveTrainings,
                            dialogApp
                        });
                    }
                }
                return true;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
                ui.notifications.error(`Não foi possível salvar os treinamentos: ${message}`);
                return false;
            }
        };
        dialogApp = new CustomDialogV2({
            modal: true,
            content: await renderDialogContent(),
            buttons: {
                save: {
                    default: true,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar',
                    callback: async (event, button, element) => {
                        const form = element.querySelector('form');
                        await saveTrainings(form, { refreshDialog: true });
                        return 'handled';
                    }
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Fechar',
                    callback: async () => {
                        await dialogApp?.close();
                        return 'handled';
                    }
                }
            },
            onRender: (element) => {
                element.classList.add('jj-characteristics-dialog');
                CharacterSheetV2._bindJujutsuTrainingConfigDialog(element, {
                    saveTrainings,
                    dialogApp
                });
            },
            position: {
                width: 920,
                height: 780
            },
            window: {
                title: 'Configurar Treinamentos'
            }
        });
        await dialogApp.render({ force: true });
    }
    static async configureJujutsuCharacteristics(_event, _target) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && this?.actor?.templateSystem?.isModified) {
            await this.submit();
        }
        const sheet = this;
        const actor = this.actor ?? this.document;
        const renderDialogContent = async (propsSource = actor.system.props ?? {}) => {
            const currentJujutsu = prepareJujutsuSheetData(propsSource);
            return foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/actor/v2/dialogs/jujutsu-characteristics-config.hbs`, {
                characteristicDefinitions: currentJujutsu.characteristicDefinitions,
                characteristicTypeOptions: currentJujutsu.characteristicTypeOptions,
                characteristicCategoryOptions: currentJujutsu.characteristicCategoryOptions,
                customCharacteristics: (currentJujutsu.props.characteristics?.custom ?? []).map((entry) => ({
                    ...entry,
                    modificaText: Array.isArray(entry.modifica) ? entry.modifica.join(', ') : ''
                }))
            });
        };
        const validCharacteristicIds = new Set(JUJUTSU_CHARACTERISTICS_CATALOG.map((entry) => entry.id));
        let dialogApp;
        const saveCharacteristics = async (form, { refreshDialog = false } = {}) => {
            if (!form)
                return false;
            const characteristics = CharacterSheetV2._collectJujutsuCharacteristicsConfig(form, validCharacteristicIds);
            const nextProps = foundry.utils.deepClone(actor.system.props ?? {});
            nextProps.characteristics = {
                selected: characteristics.selected,
                custom: characteristics.custom
            };
            const selectedOrigin = JUJUTSU_CHARACTERISTICS_CATALOG.find((entry) => {
                return characteristics.selected.includes(entry.id) && String(entry.tipo ?? '').toLowerCase() === 'origem';
            });
            if (selectedOrigin?.nome) {
                nextProps.origem = selectedOrigin.nome;
            }
            const previousAppliedOrigin = actor.system.props?.appliedOriginAttributeBonus ?? {};
            for (const [attributeKey, appliedValue] of Object.entries(previousAppliedOrigin)) {
                const currentValue = CharacterSheetV2._toSafeNumber(nextProps.attributes?.[attributeKey]?.value, 10);
                foundry.utils.setProperty(nextProps, `attributes.${attributeKey}.value`, currentValue - CharacterSheetV2._toSafeNumber(appliedValue, 0));
            }
            const nextAppliedOrigin = {};
            if (selectedOrigin?.id === 'restringido') {
                for (const attributeKey of ['for', 'des', 'con']) {
                    const currentValue = CharacterSheetV2._toSafeNumber(nextProps.attributes?.[attributeKey]?.value, 10);
                    foundry.utils.setProperty(nextProps, `attributes.${attributeKey}.value`, currentValue + 1);
                    nextAppliedOrigin[attributeKey] = 1;
                }
            }
            nextProps.appliedOriginAttributeBonus = nextAppliedOrigin;
            try {
                try {
                    await actor.update({
                        system: {
                            props: nextProps
                        }
                    });
                }
                catch (_nestedUpdateError) {
                    await actor.update({
                        system: {
                            props: nextProps
                        }
                    });
                }
                actor.prepareData();
                ui.notifications.info('Caracteristicas salvas.');
                await sheet.render({ force: true });
                if (refreshDialog && dialogApp) {
                    const dialogContent = dialogApp.element?.querySelector?.('.dialog-content');
                    if (dialogContent) {
                        const scrollTop = dialogContent.scrollTop;
                        dialogContent.innerHTML = await renderDialogContent(nextProps);
                        dialogContent.scrollTop = scrollTop;
                        CharacterSheetV2._bindJujutsuCharacteristicsConfigDialog(dialogApp.element, {
                            saveCharacteristics,
                            dialogApp
                        });
                    }
                }
                return true;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error ?? 'Erro desconhecido');
                ui.notifications.error(`Não foi possível salvar as características: ${message}`);
                return false;
            }
        };
        dialogApp = new CustomDialogV2({
            modal: true,
            content: await renderDialogContent(),
            form: {
                closeOnSubmit: false
            },
            buttons: {
                save: {
                    default: false,
                    icon: 'fa-solid fa-save',
                    label: 'Salvar',
                    callback: async (_event, _target, element) => {
                        const form = element.querySelector('form');
                        await saveCharacteristics(form, { refreshDialog: true });
                        return 'handled';
                    }
                },
                cancel: {
                    icon: 'fa-solid fa-xmark',
                    label: 'Fechar',
                    callback: async () => {
                        await dialogApp?.close();
                        return 'handled';
                    }
                }
            },
            onRender: (element) => {
                element.classList.add('jj-characteristics-dialog');
                CharacterSheetV2._bindJujutsuCharacteristicsConfigDialog(element, {
                    saveCharacteristics,
                    dialogApp
                });
            },
            position: {
                width: 980,
                height: 860
            },
            window: {
                title: 'Configurar Características'
            }
        });
        await dialogApp.render({ force: true });
    }
    /* ------------------------------------- */
    dragDrop;
    dragDropOptions = [
        { dragSelector: '.item-list .item', dropSelector: null }
    ];
    constructor(options) {
        super(options);
        this.dragDrop = this.createDragDropHandlers();
    }
    _setJujutsuTab(tab) {
        const allowedTabs = new Set(['resumo', 'pericias', 'habilidades', 'invocacoes', 'aptidoes', 'treinamentos', 'perfil-a', 'expansao', 'inventario', 'registro']);
        this.activeJujutsuTab = allowedTabs.has(tab) ? tab : 'resumo';
        this._syncJujutsuTabs();
    }
    _syncJujutsuTabs(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('[data-tab-target]').forEach((button) => {
            const isActive = button.dataset.tabTarget === this.activeJujutsuTab;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
        const layout = root.querySelector('.jj-layout');
        if (layout) {
            layout.classList.toggle('is-resumo', this.activeJujutsuTab === 'resumo');
            layout.classList.toggle('is-pericias', this.activeJujutsuTab === 'pericias');
            layout.classList.toggle('is-habilidades', this.activeJujutsuTab === 'habilidades');
            layout.classList.toggle('is-invocacoes', this.activeJujutsuTab === 'invocacoes');
            layout.classList.toggle('is-aptidoes', this.activeJujutsuTab === 'aptidoes');
            layout.classList.toggle('is-treinamentos', this.activeJujutsuTab === 'treinamentos');
            layout.classList.toggle('is-perfil-a', this.activeJujutsuTab === 'perfil-a');
            layout.classList.toggle('is-expansao', this.activeJujutsuTab === 'expansao');
            layout.classList.toggle('is-inventario', this.activeJujutsuTab === 'inventario');
            layout.classList.toggle('is-registro', this.activeJujutsuTab === 'registro');
        }
        root.querySelectorAll('[data-tab-block]').forEach((block) => {
            const tabs = (block.dataset.tabBlock ?? '').split(/\s+/);
            const isActive = tabs.includes(this.activeJujutsuTab);
            block.hidden = !isActive;
            block.setAttribute('aria-hidden', String(!isActive));
        });
        root.querySelectorAll('[data-tab-panel]').forEach((panel) => {
            const isActive = panel.dataset.tabPanel === this.activeJujutsuTab;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
            panel.setAttribute('aria-hidden', String(!isActive));
        });
    }
    _updateAbilityModDisplays(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('[data-ability-card]').forEach((card) => {
            const valueInput = card.querySelector('[data-ability-value]');
            const modDisplay = card.querySelector('[data-ability-mod-display]');
            const modHidden = card.querySelector('[data-ability-mod-hidden]');
            if (!valueInput || !modDisplay || !modHidden)
                return;
            const value = Number(valueInput.value);
            const safeValue = Number.isFinite(value) ? value : 0;
            const mod = Math.floor((safeValue - 10) / 2);
            modDisplay.value = mod > 0 ? `+${mod}` : `${mod}`;
            modHidden.value = String(mod);
        });
    }
    _bindAbilityModDisplays(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('[data-ability-value]').forEach((input) => {
            const sync = () => {
                this._updateAbilityModDisplays(root);
                this._syncAttackTotals(root);
                this._syncSkillTotals(root);
                this._syncSavingThrowTotals(root);
            };
            input.addEventListener('input', sync);
            input.addEventListener('change', sync);
        });
        this._updateAbilityModDisplays(root);
    }
    _syncTrainingBonusDisplays(root = this.element) {
        if (!root)
            return;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const trainingBonus = calculateJujutsuTrainingBonus(level);
        root.querySelectorAll('[data-training-bonus-display]').forEach((element) => {
            element.textContent = `+${trainingBonus}`;
        });
        root.querySelectorAll('[data-training-bonus-input]').forEach((input) => {
            input.value = String(trainingBonus);
        });
    }
    _syncAttackTotals(root = this.element) {
        if (!root)
            return;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const levelHalf = Math.floor(level / 2);
        const baseTrainingBonus = calculateJujutsuTrainingBonus(level);
        root.querySelectorAll('[data-attack-card]').forEach((card) => {
            const attackKey = card.dataset.attackKey ?? '';
            const attributeInput = card.querySelector(`[name='system.props.attackBonuses.${attackKey}.attribute']`);
            const attributeKey = attributeInput?.value ?? card.dataset.attackAttribute ?? '';
            const alwaysTrained = card.dataset.attackAlwaysTrained === 'true';
            if (!attackKey || !attributeKey)
                return;
            const trainedInput = card.querySelector(`[name='system.props.attackBonuses.${attackKey}.t']`);
            if (alwaysTrained && trainedInput && !trainedInput.checked) {
                trainedInput.checked = true;
                trainedInput.closest('.jj-checkbox')?.classList.add('is-checked');
            }
            const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
            const trained = alwaysTrained ? true : CharacterSheetV2._getScopedCheckboxValue(card, `[name='system.props.attackBonuses.${attackKey}.t']`, false);
            const others = CharacterSheetV2._getScopedNumberValue(card, `[name='system.props.attackBonuses.${attackKey}.others']`, 0);
            const attributeMod = calculateJujutsuAttributeMod(attributeValue);
            const trainingBonus = trained ? baseTrainingBonus : 0;
            const total = calculateJujutsuAttackTotal({
                attributeValue,
                level,
                trained,
                others
            });
            const attributeModInput = card.querySelector('[data-attack-attribute-mod]');
            const levelHalfInput = card.querySelector('[data-attack-level-half]');
            const trainingInput = card.querySelector('[data-attack-training-bonus]');
            const totalInput = card.querySelector('[data-attack-total]');
            if (attributeModInput) {
                attributeModInput.value = String(attributeMod);
            }
            if (levelHalfInput) {
                levelHalfInput.value = String(levelHalf);
            }
            if (trainingInput) {
                trainingInput.value = String(trainingBonus);
            }
            if (totalInput) {
                totalInput.value = String(total);
            }
        });
        this._syncTrainingBonusDisplays(root);
    }
    _bindAttackTotals(root = this.element) {
        if (!root)
            return;
        const levelInput = root.querySelector("[name='system.props.level']");
        if (levelInput) {
            levelInput.addEventListener('input', () => this._syncAttackTotals(root));
            levelInput.addEventListener('change', () => this._syncAttackTotals(root));
        }
        root.querySelectorAll('[data-attack-others], [data-attack-trained]').forEach((input) => {
            input.addEventListener('input', () => this._syncAttackTotals(root));
            input.addEventListener('change', () => this._syncAttackTotals(root));
        });
        root.querySelectorAll('[data-attack-attribute-input]').forEach((input) => {
            input.addEventListener('input', () => this._syncAttackTotals(root));
            input.addEventListener('change', () => this._syncAttackTotals(root));
        });
        this._syncAttackTotals(root);
    }
    _syncSkillTotals(root = this.element) {
        if (!root)
            return;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        let perceptionSkillTotal = null;
        root.querySelectorAll('[data-skill-row]').forEach((row) => {
            const skillKey = row.dataset.skillKey ?? '';
            const attributeInput = row.querySelector(`[name='system.props.skills.${skillKey}.attribute']`);
            const attributeKey = attributeInput?.value ?? row.dataset.skillAttribute ?? '';
            const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
            const others = CharacterSheetV2._getScopedNumberValue(row, `[name='system.props.skills.${skillKey}.others']`, 0);
            const trained = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.skills.${skillKey}.t']`, false);
            const master = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.skills.${skillKey}.m']`, false);
            const total = calculateJujutsuSkillTotal({
                attributeValue,
                level,
                trained,
                master,
                others
            });
            const totalInput = row.querySelector('[data-skill-total]');
            if (totalInput) {
                totalInput.value = String(total);
            }
            if (skillKey === 'percepcao') {
                perceptionSkillTotal = total;
            }
        });
        if (perceptionSkillTotal !== null) {
            root.querySelectorAll('[data-attention-perception]').forEach((input) => {
                input.value = String(perceptionSkillTotal);
            });
        }
        this._syncTrainingBonusDisplays(root);
        this._syncJujutsuSummaryTotals(root);
    }
    _bindSkillTotals(root = this.element) {
        if (!root)
            return;
        const levelInput = root.querySelector("[name='system.props.level']");
        if (levelInput) {
            levelInput.addEventListener('input', () => this._syncSkillTotals(root));
            levelInput.addEventListener('change', () => this._syncSkillTotals(root));
        }
        root.querySelectorAll('[data-skill-others], [data-skill-trained], [data-skill-master], [data-skill-attribute-input]').forEach((input) => {
            input.addEventListener('input', () => this._syncSkillTotals(root));
            input.addEventListener('change', () => this._syncSkillTotals(root));
        });
        this._syncSkillTotals(root);
    }
    _getCurrentJujutsuAttackData(attackKey, root = this.element) {
        if (!root || !attackKey)
            return null;
        const card = root.querySelector(`[data-attack-card][data-attack-key='${attackKey}']`);
        if (!card)
            return null;
        const label = card.dataset.attackLabel ?? attackKey;
        const attributeInput = card.querySelector(`[name='system.props.attackBonuses.${attackKey}.attribute']`);
        const attributeKey = attributeInput?.value ?? card.dataset.attackAttribute ?? '';
        const alwaysTrained = card.dataset.attackAlwaysTrained === 'true';
        if (!attributeKey)
            return null;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
        const trained = alwaysTrained ? true : CharacterSheetV2._getScopedCheckboxValue(card, `[name='system.props.attackBonuses.${attackKey}.t']`, false);
        const others = CharacterSheetV2._getScopedNumberValue(card, `[name='system.props.attackBonuses.${attackKey}.others']`, 0);
        const attributeMod = calculateJujutsuAttributeMod(attributeValue);
        const levelHalf = Math.floor(level / 2);
        const trainingBonus = trained ? calculateJujutsuTrainingBonus(level) : 0;
        const total = calculateJujutsuAttackTotal({
            attributeValue,
            level,
            trained,
            others
        });
        return {
            attackKey,
            label,
            attributeKey,
            attributeMod,
            level,
            levelHalf,
            trainingBonus,
            trained,
            alwaysTrained,
            others,
            total
        };
    }
    async _rollJujutsuAttack(attackKey, root = this.element) {
        const attackData = this._getCurrentJujutsuAttackData(attackKey, root);
        if (!attackData)
            return;
        const roll = await new Roll('1d20 + (@modifier)', {
            modifier: attackData.total
        }).evaluate();
        const criticalState = CharacterSheetV2._getD20CriticalState(roll);
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
            actor: this.actor
        });
        const flavorParts = [
            `<strong>Ataque: ${attackData.label}</strong>`,
            `<div>Mod. Atr. ${CharacterSheetV2._toSignedNumber(attackData.attributeMod)} | Nível/2 ${CharacterSheetV2._toSignedNumber(attackData.levelHalf)} | Treino ${CharacterSheetV2._toSignedNumber(attackData.trainingBonus)} | Outros ${CharacterSheetV2._toSignedNumber(attackData.others)}</div>`
        ];
        if (attackData.alwaysTrained) {
            flavorParts.push('<div>Treino base ativo para este ataque.</div>');
        }
        await roll.toMessage({
            speaker,
            flavor: flavorParts.join(''),
            flags: {
                [game.system.id]: {
                    jujutsuCritical: {
                        state: criticalState,
                        context: 'attack'
                    },
                    jujutsuHitCheck: {
                        total: Math.trunc(CharacterSheetV2._toSafeNumber(roll.total, 0))
                    },
                    jujutsuAttackRoll: {
                        key: attackData.attackKey,
                        label: attackData.label,
                        attribute: attackData.attributeKey,
                        total: attackData.total,
                        attributeMod: attackData.attributeMod,
                        levelHalf: attackData.levelHalf,
                        trainingBonus: attackData.trainingBonus,
                        trained: attackData.trained,
                        alwaysTrained: attackData.alwaysTrained,
                        others: attackData.others
                    }
                }
            }
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    _getCurrentJujutsuSkillData(skillKey, root = this.element) {
        if (!root || !skillKey)
            return null;
        const row = root.querySelector(`[data-skill-row][data-skill-key='${skillKey}']`);
        if (!row)
            return null;
        const baseLabel = row.dataset.skillLabel ?? skillKey;
        const attributeInput = row.querySelector(`[name='system.props.skills.${skillKey}.attribute']`);
        const attributeKey = attributeInput?.value ?? row.dataset.skillAttribute ?? '';
        if (!attributeKey)
            return null;
        const nameInput = row.querySelector(`[name='system.props.skills.${skillKey}.name']`);
        const customName = (nameInput?.value ?? '').trim();
        const label = nameInput && customName ? `${baseLabel} (${customName})` : baseLabel;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
        const trained = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.skills.${skillKey}.t']`, false);
        const master = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.skills.${skillKey}.m']`, false);
        const others = CharacterSheetV2._getScopedNumberValue(row, `[name='system.props.skills.${skillKey}.others']`, 0);
        const attributeMod = calculateJujutsuAttributeMod(attributeValue);
        const levelHalf = Math.floor(level / 2);
        const baseTrainingBonus = calculateJujutsuTrainingBonus(level);
        const trainingBonus = master ? baseTrainingBonus + Math.floor(baseTrainingBonus / 2) : trained ? baseTrainingBonus : 0;
        const total = calculateJujutsuSkillTotal({
            attributeValue,
            level,
            trained,
            master,
            others
        });
        return {
            skillKey,
            label,
            attributeKey,
            attributeMod,
            level,
            levelHalf,
            trainingBonus,
            trained,
            master,
            others,
            total
        };
    }
    async _rollJujutsuSkill(skillKey, root = this.element) {
        const skillData = this._getCurrentJujutsuSkillData(skillKey, root);
        if (!skillData)
            return;
        const roll = await new Roll('1d20 + (@modifier)', {
            modifier: skillData.total
        }).evaluate();
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
            actor: this.actor
        });
        const flavorParts = [
            `<strong>Perícia: ${skillData.label}</strong>`,
            `<div>Mod. Atr. ${CharacterSheetV2._toSignedNumber(skillData.attributeMod)} | Nível/2 ${CharacterSheetV2._toSignedNumber(skillData.levelHalf)} | Treino ${CharacterSheetV2._toSignedNumber(skillData.trainingBonus)} | Outros ${CharacterSheetV2._toSignedNumber(skillData.others)}</div>`
        ];
        await roll.toMessage({
            speaker,
            flavor: flavorParts.join(''),
            flags: {
                [game.system.id]: {
                    jujutsuSkillRoll: {
                        key: skillData.skillKey,
                        label: skillData.label,
                        attribute: skillData.attributeKey,
                        total: skillData.total,
                        attributeMod: skillData.attributeMod,
                        levelHalf: skillData.levelHalf,
                        trainingBonus: skillData.trainingBonus,
                        trained: skillData.trained,
                        master: skillData.master,
                        others: skillData.others
                    }
                }
            }
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    _syncSavingThrowTotals(root = this.element) {
        if (!root)
            return;
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        root.querySelectorAll('[data-save-row]').forEach((row) => {
            const saveKey = row.dataset.saveKey ?? '';
            const attributeKey = row.dataset.saveAttribute ?? '';
            if (!saveKey || !attributeKey)
                return;
            const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
            const others = CharacterSheetV2._getScopedNumberValue(row, `[name='system.props.savingThrows.${saveKey}.others']`, 0);
            const trained = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.savingThrows.${saveKey}.t']`, false);
            const master = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.savingThrows.${saveKey}.m']`, false);
            const total = calculateJujutsuSavingThrowTotal({
                attributeValue,
                level,
                trained,
                master,
                others
            });
            const totalInput = row.querySelector('[data-save-total]');
            if (totalInput) {
                totalInput.value = String(total);
            }
        });
    }
    _bindSavingThrowTotals(root = this.element) {
        if (!root)
            return;
        const levelInput = root.querySelector("[name='system.props.level']");
        if (levelInput) {
            levelInput.addEventListener('input', () => this._syncSavingThrowTotals(root));
            levelInput.addEventListener('change', () => this._syncSavingThrowTotals(root));
        }
        root.querySelectorAll('[data-save-others], [data-save-trained], [data-save-master]').forEach((input) => {
            input.addEventListener('input', () => this._syncSavingThrowTotals(root));
            input.addEventListener('change', () => this._syncSavingThrowTotals(root));
        });
        this._syncSavingThrowTotals(root);
    }
    _syncJujutsuSummaryTotals(root = this.element) {
        if (!root)
            return;
        const prepared = prepareJujutsuSheetData(this.actor?.system?.props ?? {});
        const equippedDefenseBonus = CharacterSheetV2._toSafeNumber(prepared?.computed?.equippedDefenseBonus, 0);
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const levelHalf = Math.floor(level / 2);
        const dexMod = calculateJujutsuAttributeMod(CharacterSheetV2._getFormNumberValue(root, 'system.props.attributes.des.value', 10));
        const attentionTotal = CharacterSheetV2._getFormNumberValue(root, 'system.props.attention.base', 0) +
            CharacterSheetV2._getFormNumberValue(root, 'system.props.attention.perception', 0) +
            CharacterSheetV2._getFormNumberValue(root, 'system.props.attention.others', 0);
        const initiativeTotal = dexMod + CharacterSheetV2._getFormNumberValue(root, 'system.props.initiative.others', 0);
        const defenseEquipTotal = CharacterSheetV2._getFormNumberValue(root, 'system.props.defense.equip', 0) + equippedDefenseBonus;
        const defenseTotal = CharacterSheetV2._getFormNumberValue(root, 'system.props.defense.base', 0) +
            defenseEquipTotal +
            dexMod +
            levelHalf +
            CharacterSheetV2._getFormNumberValue(root, 'system.props.defense.others', 0);
        root.querySelectorAll('[data-attention-total]').forEach((input) => {
            input.value = String(attentionTotal);
        });
        root.querySelectorAll('[data-initiative-dex]').forEach((input) => {
            input.value = String(dexMod);
        });
        root.querySelectorAll('[data-initiative-total]').forEach((input) => {
            input.value = String(initiativeTotal);
        });
        root.querySelectorAll('[data-defense-level-half]').forEach((input) => {
            input.value = String(levelHalf);
        });
        root.querySelectorAll('[data-defense-total]').forEach((input) => {
            input.value = String(defenseTotal);
        });
        root.querySelectorAll('[data-defense-equipped-items]').forEach((input) => {
            input.value = String(equippedDefenseBonus);
        });
        if (root instanceof HTMLFormElement) {
            const initiativeDexInput = root.querySelector(`[name='system.props.initiative.dex']`);
            if (initiativeDexInput) {
                initiativeDexInput.value = String(dexMod);
            }
            const defenseDexInput = root.querySelector(`[name='system.props.defense.dex']`);
            if (defenseDexInput) {
                defenseDexInput.value = String(dexMod);
            }
        }
    }
    _bindJujutsuSummaryTotals(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('[data-attention-input], [data-initiative-input], [data-defense-input], [data-ability-value], [name="system.props.level"]').forEach((input) => {
            input.addEventListener('input', () => this._syncJujutsuSummaryTotals(root));
            input.addEventListener('change', () => this._syncJujutsuSummaryTotals(root));
        });
        this._syncJujutsuSummaryTotals(root);
    }
    _bindAptitudeRollToggles(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('[data-aptitude-roll-toggle]').forEach((toggle) => {
            const sync = () => {
                const row = toggle.closest('tr');
                const bonusInput = row?.querySelector?.('[data-aptitude-roll-bonus]');
                if (bonusInput) {
                    bonusInput.disabled = !toggle.checked;
                }
            };
            toggle.addEventListener('input', sync);
            toggle.addEventListener('change', sync);
            sync();
        });
    }
    _getCurrentJujutsuSavingThrowData(saveKey, root = this.element) {
        if (!root || !saveKey)
            return null;
        const row = root.querySelector(`[data-save-row][data-save-key='${saveKey}']`);
        if (!row)
            return null;
        const label = row.dataset.saveLabel ?? saveKey;
        const attributeKey = row.dataset.saveAttribute ?? '';
        const level = CharacterSheetV2._getFormNumberValue(root, 'system.props.level', CharacterSheetV2._toSafeNumber(this.actor.system.props?.level, 1));
        const attributeValue = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
        const trained = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.savingThrows.${saveKey}.t']`, false);
        const master = CharacterSheetV2._getScopedCheckboxValue(row, `[name='system.props.savingThrows.${saveKey}.m']`, false);
        const others = CharacterSheetV2._getScopedNumberValue(row, `[name='system.props.savingThrows.${saveKey}.others']`, 0);
        const attributeMod = calculateJujutsuAttributeMod(attributeValue);
        const levelHalf = Math.floor(level / 2);
        const baseTrainingBonus = calculateJujutsuTrainingBonus(level);
        const trainingBonus = master ? baseTrainingBonus + Math.floor(baseTrainingBonus / 2) : trained ? baseTrainingBonus : 0;
        const total = calculateJujutsuSavingThrowTotal({
            attributeValue,
            level,
            trained,
            master,
            others
        });
        return {
            saveKey,
            label,
            attributeKey,
            attributeMod,
            level,
            levelHalf,
            trainingBonus,
            trained,
            master,
            others,
            total
        };
    }
    async _rollJujutsuSavingThrow(saveKey, root = this.element) {
        const saveData = this._getCurrentJujutsuSavingThrowData(saveKey, root);
        if (!saveData)
            return;
        const roll = await new Roll('1d20 + (@modifier)', {
            modifier: saveData.total
        }).evaluate();
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
            actor: this.actor
        });
        const flavorParts = [
            `<strong>Teste de Resistência: ${saveData.label}</strong>`,
            `<div>Mod. Atr. ${CharacterSheetV2._toSignedNumber(saveData.attributeMod)} | Nível/2 ${CharacterSheetV2._toSignedNumber(saveData.levelHalf)} | Treino ${CharacterSheetV2._toSignedNumber(saveData.trainingBonus)} | Outros ${CharacterSheetV2._toSignedNumber(saveData.others)}</div>`
        ];
        if (saveData.master) {
            flavorParts.push('<div>Mestre ativo: o grau de sucesso pode chegar a sucesso crítico ao superar a CD em 10 ou mais.</div>');
        }
        await roll.toMessage({
            speaker,
            flavor: flavorParts.join(''),
            flags: {
                [game.system.id]: {
                    jujutsuSavingThrow: {
                        key: saveData.saveKey,
                        label: saveData.label,
                        attribute: saveData.attributeKey,
                        total: saveData.total,
                        attributeMod: saveData.attributeMod,
                        levelHalf: saveData.levelHalf,
                        trainingBonus: saveData.trainingBonus,
                        trained: saveData.trained,
                        master: saveData.master,
                        others: saveData.others
                    }
                }
            }
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    _getJujutsuTableEntry(tableKey, rowIndex) {
        return CharacterSheetV2._getPreparedJujutsuTableEntry(this.actor, tableKey, { rowIndex }).entry;
    }
    async _rollJujutsuTableAttack(rowIndex) {
        await CharacterSheetV2.rollJujutsuTableAttack(this.actor, { rowIndex });
    }
    async _rollJujutsuInventoryWeaponAttack(rowIndex) {
        const jujutsu = prepareJujutsuSheetData(this.actor?.system?.props ?? {});
        const attack = jujutsu.inventoryWeaponAttacks?.[rowIndex];
        if (!attack)
            return;
        const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({ actor: this.actor });
        const attackRoll = await new Roll(`1d20 + ${CharacterSheetV2._toSafeNumber(attack.acerto, 0)}`).evaluate({ async: true });
        const criticalState = CharacterSheetV2._getD20CriticalStateWithThreshold(attackRoll, attack.critMin);
        const criticalText = criticalState === 'success'
            ? '<div><strong>Sucesso Crítico</strong></div>'
            : criticalState === 'failure'
                ? '<div><strong>Erro Crítico</strong></div>'
                : '';
        await attackRoll.toMessage({
            speaker,
            flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(attack, attack.weapon || attack.type || 'Arma do inventário')}<p><strong>Acerto</strong></p>`,
            flags: {
                [game.system.id]: {
                    jujutsuCritical: {
                        state: criticalState,
                        context: 'attack'
                    },
                    jujutsuHitCheck: {
                        total: Math.trunc(CharacterSheetV2._toSafeNumber(attackRoll.total, 0))
                    }
                }
            }
        });
        const damageFormula = String(attack.damage ?? '').trim();
        if (damageFormula) {
            const damageRoll = await new Roll(damageFormula).evaluate({ async: true });
            await damageRoll.toMessage({
                speaker,
                flavor: `${CharacterSheetV2._buildJujutsuItemChatHeader(attack, attack.weapon || attack.type || 'Arma do inventário')}<p><strong>Dano</strong></p>`,
                flags: {
                    [game.system.id]: {
                        jujutsuDamage: {
                            amount: Math.max(0, Math.trunc(CharacterSheetV2._toSafeNumber(damageRoll.total, 0)))
                        }
                    }
                }
            });
        }
    }
    async _useJujutsuTableFeature(tableKey, rowIndex) {
        await CharacterSheetV2.useJujutsuTableFeature(this.actor, { tableKey, rowIndex });
    }
    async _rollJujutsuInventoryItem(rowIndex) {
        await CharacterSheetV2.rollJujutsuInventoryItem(this.actor, { rowIndex });
    }
    async _rollJujutsuInitiative(root = this.element) {
        if (!this.actor)
            return;
        const modifier = CharacterSheetV2._getFormNumberValue(root, 'system.props.initiative.others', 0) +
            calculateJujutsuAttributeMod(CharacterSheetV2._getFormNumberValue(root, 'system.props.attributes.des.value', 10));
        const roll = await new Roll('1d20 + (@modifier)', { modifier }).evaluate({ async: true });
        await roll.toMessage({
            speaker: foundry.documents.ChatMessage.implementation.getSpeaker({ actor: this.actor }),
            flavor: `<strong>Iniciativa</strong><div>Total ${CharacterSheetV2._toSignedNumber(modifier)}</div>`
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    async _rollJujutsuAttribute(attributeKey, root = this.element) {
        if (!this.actor || !attributeKey)
            return;
        const value = CharacterSheetV2._getFormNumberValue(root, `system.props.attributes.${attributeKey}.value`, 10);
        const modifier = calculateJujutsuAttributeMod(value);
        const label = String(attributeKey).toUpperCase();
        const roll = await new Roll('1d20 + (@modifier)', { modifier }).evaluate({ async: true });
        await roll.toMessage({
            speaker: foundry.documents.ChatMessage.implementation.getSpeaker({ actor: this.actor }),
            flavor: `<strong>Atributo: ${label}</strong><div>Mod. Atr. ${CharacterSheetV2._toSignedNumber(modifier)}</div>`
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    async _rollJujutsuAptitudeLevel(aptitudeKey, root = this.element) {
        if (!this.actor || !aptitudeKey)
            return;
        const input = root?.querySelector?.(`[name='system.props.aptitudeLevels.${aptitudeKey}']`);
        const modifier = CharacterSheetV2._toSafeNumber(input?.value, 0);
        const label = input?.closest?.('[data-aptitude-level-card]')?.dataset?.aptitudeLabel ?? aptitudeKey;
        const roll = await new Roll('1d20 + (@modifier)', { modifier }).evaluate({ async: true });
        await roll.toMessage({
            speaker: foundry.documents.ChatMessage.implementation.getSpeaker({ actor: this.actor }),
            flavor: `<strong>Teste de Aptidão: ${label}</strong><div>Bônus ${CharacterSheetV2._toSignedNumber(modifier)}</div>`
        }, {
            // V14: rollMode renamed to messageMode
            messageMode: game.settings.get('core', 'messageMode')
        });
    }
    _onJujutsuTableDragStart(event, element) {
        if (!event.dataTransfer) {
            return;
        }
        event.stopPropagation();
        const tableKey = String(element?.dataset?.tableKey ?? '').trim().toLowerCase();
        const rowIndex = Number(element?.dataset?.rowIndex ?? -1);
        const rowId = String(element?.dataset?.entryId ?? '').trim() || null;
        const dragData = CharacterSheetV2._createJujutsuTableDragData(this.actor, tableKey, {
            rowId,
            rowIndex
        });
        if (!dragData) {
            return;
        }
        const serialized = JSON.stringify(dragData);
        event.dataTransfer.setData('text', serialized);
        event.dataTransfer.setData('text/plain', serialized);
        event.dataTransfer.setData('application/json', serialized);
        event.dataTransfer.effectAllowed = 'copy';
        const dragPreview = element?.closest?.('.jj-table-item-main') ?? element;
        const dragBox = dragPreview?.getBoundingClientRect?.();
        if (dragPreview && dragBox) {
            event.dataTransfer.setDragImage(dragPreview, Math.min(24, dragBox.width / 2), dragBox.height / 2);
        }
    }
    _onJujutsuInventoryDragStart(event, element) {
        if (!event.dataTransfer) {
            return;
        }
        event.stopPropagation();
        const rowIndex = Number(element?.dataset?.rowIndex ?? -1);
        const rowId = String(element?.dataset?.entryId ?? '').trim() || null;
        const dragData = CharacterSheetV2._createJujutsuInventoryDragData(this.actor, {
            rowId,
            rowIndex
        });
        if (!dragData) {
            return;
        }
        const serialized = JSON.stringify(dragData);
        event.dataTransfer.setData('text', serialized);
        event.dataTransfer.setData('text/plain', serialized);
        event.dataTransfer.setData('application/json', serialized);
        event.dataTransfer.effectAllowed = 'copy';
        const dragPreview = element?.closest?.('.jj-inventory-item-main') ?? element;
        const dragBox = dragPreview?.getBoundingClientRect?.();
        if (dragPreview && dragBox) {
            event.dataTransfer.setDragImage(dragPreview, Math.min(24, dragBox.width / 2), dragBox.height / 2);
        }
    }
    _syncCheckboxVisuals(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('.jj-checkbox').forEach((checkbox) => {
            const input = checkbox.querySelector('.jj-checkbox-input');
            checkbox.classList.toggle('is-checked', !!input?.checked);
        });
    }
    _syncDeathTrackCounters(root = this.element) {
        if (!root)
            return;
        const successCount = Array.from(root.querySelectorAll('[data-death-track="successes"]')).filter((input) => input.checked).length;
        const failureCount = Array.from(root.querySelectorAll('[data-death-track="failures"]')).filter((input) => input.checked).length;
        const successDisplay = root.querySelector('[data-death-count="successes"]');
        const failureDisplay = root.querySelector('[data-death-count="failures"]');
        if (successDisplay) {
            successDisplay.value = String(successCount);
        }
        if (failureDisplay) {
            failureDisplay.value = String(failureCount);
        }
    }
    _bindCheckboxVisuals(root = this.element) {
        if (!root)
            return;
        root.querySelectorAll('.jj-checkbox-input').forEach((input) => {
            const sync = () => {
                const checkbox = input.closest('.jj-checkbox');
                if (checkbox) {
                    checkbox.classList.toggle('is-checked', input.checked);
                }
                if (input.dataset.deathTrack) {
                    this._syncDeathTrackCounters(root);
                }
            };
            input.addEventListener('input', sync);
            input.addEventListener('change', sync);
            sync();
        });
        this._syncCheckboxVisuals(root);
        this._syncDeathTrackCounters(root);
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const jujutsu = prepareJujutsuSheetData(context.document.system.props ?? {});
        const skillAttributeLabels = {
            for: 'FOR',
            des: 'DEX',
            int: 'INT',
            sab: 'SAB',
            pre: 'PRE',
            con: 'CON'
        };
        const skillDisplay = jujutsu.skills.map((skill) => ({
            ...skill,
            attributeDisplay: skillAttributeLabels[skill.attribute] ?? String(skill.attribute ?? '').toUpperCase()
        }));
        const skillColumnSize = Math.ceil(skillDisplay.length / 2);
        jujutsu.skillColumns = [skillDisplay.slice(0, skillColumnSize), skillDisplay.slice(skillColumnSize)];
        jujutsu.aptitudeLevelCards = [
            { key: 'aura', label: 'Aptidão em Aura', value: jujutsu.props.aptitudeLevels?.aura ?? 0 },
            { key: 'controleLeitura', label: 'Aptidão em Controle e Leitura', value: jujutsu.props.aptitudeLevels?.controleLeitura ?? 0 },
            { key: 'barreira', label: 'Aptidão em Barreira', value: jujutsu.props.aptitudeLevels?.barreira ?? 0 },
            { key: 'dominio', label: 'Aptidão em Domínio', value: jujutsu.props.aptitudeLevels?.dominio ?? 0 },
            { key: 'energiaReversa', label: 'Aptidão em Energia Reversa', value: jujutsu.props.aptitudeLevels?.energiaReversa ?? 0 }
        ];
        return {
            ...context,
            jujutsu
        };
    }
    createDragDropHandlers() {
        return this.dragDropOptions.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            };
            d.callbacks = {
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                drop: this._onDrop.bind(this)
            };
            return new DragDrop.implementation(d);
        });
    }
    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param selector       The candidate HTML selector for dragging
     * @returns              Can the current user drag this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragStart(_selector) {
        return this.isEditable;
    }
    /* -------------------------------------------- */
    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param selector       The candidate HTML selector for the drop target
     * @returns              Can the current user drop on this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragDrop(_selector) {
        return this.isEditable;
    }
    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.dragDrop.forEach((d) => d.bind(this.element));
        const root = this.element;
        if (root) {
            root.querySelectorAll('[data-action="addJujutsuRow"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.addJujutsuRow.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="editJujutsuRow"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.editJujutsuRow.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="removeJujutsuRow"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.removeJujutsuRow.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="createInvocation"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.createInvocation.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="removeInvocation"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.removeInvocation.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="saveInvocationDetails"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.saveInvocationDetails.call(this, event, button);
                });
            });
            CharacterSheetV2._bindInvocationDetailInteractions(root, this.actor ?? this.document, this);
            root.querySelectorAll('[data-roll-table-attack]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuTableAttack(Number(button.dataset.rowIndex));
                });
            });
            root.querySelectorAll('[data-roll-inventory-weapon-attack]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuInventoryWeaponAttack(Number(button.dataset.rowIndex));
                });
            });
            root.querySelectorAll('[data-use-table-feature]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._useJujutsuTableFeature(button.dataset.collection ?? '', Number(button.dataset.rowIndex));
                });
            });
            root.querySelectorAll('[data-roll-inventory-item]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuInventoryItem(Number(button.dataset.rowIndex));
                });
            });
            root.querySelectorAll('[data-jujutsu-table-drag]').forEach((element) => {
                element.addEventListener('dragstart', (event) => {
                    this._onJujutsuTableDragStart(event, element);
                });
            });
            root.querySelectorAll('[data-jujutsu-inventory-drag]').forEach((element) => {
                element.addEventListener('dragstart', (event) => {
                    this._onJujutsuInventoryDragStart(event, element);
                });
            });
            root.querySelectorAll('[data-action="configureJujutsuRds"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.configureJujutsuRds.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="configureJujutsuResistances"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.configureJujutsuResistances.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="configureJujutsuTrainings"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.configureJujutsuTrainings.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-action="configureJujutsuCharacteristics"]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void CharacterSheetV2.configureJujutsuCharacteristics.call(this, event, button);
                });
            });
            root.querySelectorAll('[data-tab-target]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this._setJujutsuTab(button.dataset.tabTarget ?? 'resumo');
                });
            });
            root.querySelectorAll('[data-roll-saving-throw]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuSavingThrow(button.dataset.saveKey ?? '', root);
                });
            });
            root.querySelectorAll('[data-roll-attack]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuAttack(button.dataset.attackKey ?? '', root);
                });
            });
            root.querySelectorAll('[data-roll-skill]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuSkill(button.dataset.skillKey ?? '', root);
                });
            });
            root.querySelectorAll('[data-roll-initiative]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuInitiative(root);
                });
            });
            root.querySelectorAll('[data-roll-attribute]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuAttribute(button.dataset.attributeKey ?? '', root);
                });
            });
            root.querySelectorAll('[data-roll-aptitude-level]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void this._rollJujutsuAptitudeLevel(button.dataset.aptitudeKey ?? '', root);
                });
            });
            this._syncJujutsuTabs(root);
            this._bindAbilityModDisplays(root);
            this._bindCheckboxVisuals(root);
            this._bindAttackTotals(root);
            this._bindSkillTotals(root);
            this._bindSavingThrowTotals(root);
            this._bindJujutsuSummaryTotals(root);
            this._bindAptitudeRollToggles(root);
        }
    }
    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDragStart(event) {
        // Extract the data you need
        const dragData = null;
        if (!dragData)
            return;
        // Set data transfer
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @protected
     */
    _onDragOver(_event) { }
    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) {
        if (!this.actor.isOwner)
            return;
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        if (data) {
            const dragData = data;
            // Handle different data types
            switch (dragData.type) {
                case 'Item':
                    void this._onDropItem(event, dragData);
            }
        }
    }
    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @returns   The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
    async _onDropItem(event, data) {
        if (!this.actor.isOwner)
            return null;
        const item = await Item.implementation.fromDropData(data);
        if (item && CustomItem.isEquippableItem(item)) {
            // Handle item sorting within the same Actor
            if (this.actor.uuid === item.parent?.uuid) {
                if (item.system.container !== null && item.system.container !== undefined) {
                    const originalParent = this.actor.items.get(item.system.container);
                    return ((await item.update({ system: { container: null } }).then(() => {
                        originalParent.render(false);
                        void this.render({ force: false });
                    })) ?? null);
                }
            }
            // Create the owned item
            return (await this._onDropItemCreate(item, event))[0] ?? null;
        }
        return null;
    }
    /**
     * Handle the final creation of dropped Item data on the Actor.
     * @protected
     */
    async _onDropItemCreate(itemData, _event) {
        const items = itemData instanceof Array ? itemData : [itemData];
        // Create the owned items & contents as normal
        const toCreate = await CustomItem.createWithContents(items);
        Logger.info('Created item contents ' + toCreate.map((item) => item._id).join(', '));
        return CustomItem.createDocuments(toCreate, { pack: this.actor.pack, parent: this.actor, keepId: true });
    }
    async _processSubmitData(event, form, submitData) {
        const deathSuccesses = Array.from(form.querySelectorAll('[data-death-track="successes"]')).map((input) => input.checked);
        const deathFailures = Array.from(form.querySelectorAll('[data-death-track="failures"]')).map((input) => input.checked);
        foundry.utils.setProperty(submitData, 'system.props.deathTests.successes', deathSuccesses);
        foundry.utils.setProperty(submitData, 'system.props.deathTests.failures', deathFailures);
        const currentProps = this.actor.system.props ?? {};
        const previousLevel = CharacterSheetV2._toSafeNumber(currentProps.level, 1);
        const submittedLevel = CharacterSheetV2._toSafeNumber(foundry.utils.getProperty(submitData, 'system.props.level'), previousLevel);
        const nextLevel = CharacterSheetV2._getFormNumberValue(form, 'system.props.level', submittedLevel);
        foundry.utils.setProperty(submitData, 'system.props.level', nextLevel);
        foundry.utils.setProperty(submitData, 'system.props.treinamento', calculateJujutsuTrainingBonus(nextLevel));
        form.querySelectorAll('[data-attack-card]').forEach((card) => {
            const attackKey = card.dataset.attackKey ?? '';
            const attributeInput = card.querySelector(`[name='system.props.attackBonuses.${attackKey}.attribute']`);
            const attributeKey = attributeInput?.value ?? card.dataset.attackAttribute ?? '';
            const alwaysTrained = card.dataset.attackAlwaysTrained === 'true';
            if (!attackKey || !attributeKey)
                return;
            const attributeValue = CharacterSheetV2._getFormNumberValue(form, `system.props.attributes.${attributeKey}.value`, 10);
            const trained = alwaysTrained ? true : CharacterSheetV2._getFormCheckboxValue(form, `system.props.attackBonuses.${attackKey}.t`, false);
            const others = CharacterSheetV2._getFormNumberValue(form, `system.props.attackBonuses.${attackKey}.others`, 0);
            const bonus = trained ? calculateJujutsuTrainingBonus(nextLevel) : 0;
            const total = calculateJujutsuAttackTotal({
                attributeValue,
                level: nextLevel,
                trained,
                others
            });
            foundry.utils.setProperty(submitData, `system.props.attackBonuses.${attackKey}.attribute`, attributeKey);
            foundry.utils.setProperty(submitData, `system.props.attackBonuses.${attackKey}.bonus`, bonus);
            foundry.utils.setProperty(submitData, `system.props.attackBonuses.${attackKey}.others`, others);
            foundry.utils.setProperty(submitData, `system.props.attackBonuses.${attackKey}.t`, trained);
            foundry.utils.setProperty(submitData, `system.props.attackBonuses.${attackKey}.total`, total);
        });
        form.querySelectorAll('[data-save-row]').forEach((row) => {
            const saveKey = row.dataset.saveKey ?? '';
            const attributeKey = row.dataset.saveAttribute ?? '';
            if (!saveKey || !attributeKey)
                return;
            const attributeValue = CharacterSheetV2._getFormNumberValue(form, `system.props.attributes.${attributeKey}.value`, 10);
            const others = CharacterSheetV2._getFormNumberValue(form, `system.props.savingThrows.${saveKey}.others`, 0);
            const trained = CharacterSheetV2._getFormCheckboxValue(form, `system.props.savingThrows.${saveKey}.t`, false);
            const master = CharacterSheetV2._getFormCheckboxValue(form, `system.props.savingThrows.${saveKey}.m`, false);
            const total = calculateJujutsuSavingThrowTotal({
                attributeValue,
                level: nextLevel,
                trained,
                master,
                others
            });
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.bonus`, others);
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.others`, others);
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.t`, trained);
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.m`, master);
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.o`, false);
            foundry.utils.setProperty(submitData, `system.props.savingThrows.${saveKey}.total`, total);
        });
        form.querySelectorAll('[data-skill-row]').forEach((row) => {
            const skillKey = row.dataset.skillKey ?? '';
            const attributeInput = form.querySelector(`[name='system.props.skills.${skillKey}.attribute']`);
            const attributeKey = attributeInput?.value ?? row.dataset.skillAttribute ?? '';
            if (!skillKey || !attributeKey)
                return;
            const nameInput = form.querySelector(`[name='system.props.skills.${skillKey}.name']`);
            const attributeValue = CharacterSheetV2._getFormNumberValue(form, `system.props.attributes.${attributeKey}.value`, 10);
            const others = CharacterSheetV2._getFormNumberValue(form, `system.props.skills.${skillKey}.others`, 0);
            const trained = CharacterSheetV2._getFormCheckboxValue(form, `system.props.skills.${skillKey}.t`, false);
            const master = CharacterSheetV2._getFormCheckboxValue(form, `system.props.skills.${skillKey}.m`, false);
            const total = calculateJujutsuSkillTotal({
                attributeValue,
                level: nextLevel,
                trained,
                master,
                others
            });
            if (nameInput) {
                foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.name`, nameInput.value ?? '');
            }
            if (attributeInput) {
                foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.attribute`, attributeInput.value ?? row.dataset.skillAttribute ?? '');
            }
            foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.others`, others);
            foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.t`, trained);
            foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.m`, master);
            foundry.utils.setProperty(submitData, `system.props.skills.${skillKey}.total`, total);
            if (skillKey === 'percepcao') {
                foundry.utils.setProperty(submitData, 'system.props.attention.perception', total);
            }
        });
        const previousRobustez = CharacterSheetV2._toBoolean(currentProps.extra?.robustez);
        const previousVigorInf = CharacterSheetV2._toBoolean(currentProps.extra?.vigorInf);
        const previousKamo = CharacterSheetV2._toBoolean(currentProps.extra?.kamo);
        const previousDesExa = CharacterSheetV2._toBoolean(currentProps.extra?.desExa);
        const submittedRobustez = CharacterSheetV2._toBoolean(foundry.utils.getProperty(submitData, 'system.props.extra.robustez'));
        const submittedVigorInf = CharacterSheetV2._toBoolean(foundry.utils.getProperty(submitData, 'system.props.extra.vigorInf'));
        const submittedKamo = CharacterSheetV2._toBoolean(foundry.utils.getProperty(submitData, 'system.props.extra.kamo'));
        const submittedDesExa = CharacterSheetV2._toBoolean(foundry.utils.getProperty(submitData, 'system.props.extra.desExa'));
        const nextRobustez = CharacterSheetV2._getFormCheckboxValue(form, 'system.props.extra.robustez', submittedRobustez);
        const nextVigorInf = CharacterSheetV2._getFormCheckboxValue(form, 'system.props.extra.vigorInf', submittedVigorInf);
        const nextKamo = CharacterSheetV2._getFormCheckboxValue(form, 'system.props.extra.kamo', submittedKamo);
        const nextDesExa = CharacterSheetV2._getFormCheckboxValue(form, 'system.props.extra.desExa', submittedDesExa);
        foundry.utils.setProperty(submitData, 'system.props.extra.robustez', nextRobustez);
        foundry.utils.setProperty(submitData, 'system.props.extra.vigorInf', nextVigorInf);
        foundry.utils.setProperty(submitData, 'system.props.extra.kamo', nextKamo);
        foundry.utils.setProperty(submitData, 'system.props.extra.desExa', nextDesExa);
        const currentDexValue = CharacterSheetV2._getFormNumberValue(form, 'system.props.attributes.des.value', 10);
        const currentDexMod = calculateJujutsuAttributeMod(currentDexValue);
        foundry.utils.setProperty(submitData, 'system.props.initiative.dex', currentDexMod);
        foundry.utils.setProperty(submitData, 'system.props.defense.dex', currentDexMod);
        const submittedVidaMax = CharacterSheetV2._toSafeNumber(
            foundry.utils.getProperty(submitData, 'system.props.resources.vida.maximos'),
            CharacterSheetV2._toSafeNumber(currentProps.resources?.vida?.maximos)
        );
        const submittedEnergiaMax = CharacterSheetV2._toSafeNumber(
            foundry.utils.getProperty(submitData, 'system.props.resources.energia.maximos'),
            CharacterSheetV2._toSafeNumber(currentProps.resources?.energia?.maximos)
        );
        const currentVidaMax = CharacterSheetV2._getFormNumberValue(form, 'system.props.resources.vida.maximos', submittedVidaMax);
        const currentEnergiaMax = CharacterSheetV2._getFormNumberValue(form, 'system.props.resources.energia.maximos', submittedEnergiaMax);
        foundry.utils.setProperty(submitData, 'system.props.resources.vida.maximos', CharacterSheetV2._applyLevelScaledResourceBonus({
            currentMax: currentVidaMax,
            previousLevel,
            nextLevel,
            previousEnabled: previousRobustez,
            nextEnabled: nextRobustez
        }));
        foundry.utils.setProperty(submitData, 'system.props.resources.vida.maximos', CharacterSheetV2._applyKamoHpResourceBonus({
            currentMax: CharacterSheetV2._toSafeNumber(foundry.utils.getProperty(submitData, 'system.props.resources.vida.maximos'), currentVidaMax),
            previousLevel,
            nextLevel,
            previousEnabled: previousKamo,
            nextEnabled: nextKamo
        }));
        foundry.utils.setProperty(submitData, 'system.props.resources.vida.maximos', CharacterSheetV2._applyLevelScaledResourceBonus({
            currentMax: CharacterSheetV2._toSafeNumber(foundry.utils.getProperty(submitData, 'system.props.resources.vida.maximos'), currentVidaMax),
            previousLevel,
            nextLevel,
            previousEnabled: previousDesExa,
            nextEnabled: nextDesExa
        }));
        foundry.utils.setProperty(submitData, 'system.props.resources.energia.maximos', CharacterSheetV2._applyLevelScaledResourceBonus({
            currentMax: currentEnergiaMax,
            previousLevel,
            nextLevel,
            previousEnabled: previousVigorInf,
            nextEnabled: nextVigorInf
        }));
        const nextVidaAtual = CharacterSheetV2._getFormNumberValue(form, 'system.props.resources.vida.atuais', CharacterSheetV2._toSafeNumber(currentProps.resources?.vida?.atuais, 0));
        const nextEnergiaAtual = CharacterSheetV2._getFormNumberValue(form, 'system.props.resources.energia.atuais', CharacterSheetV2._toSafeNumber(currentProps.resources?.energia?.atuais, 0));
        const nextVidaMaximos = CharacterSheetV2._toSafeNumber(foundry.utils.getProperty(submitData, 'system.props.resources.vida.maximos'), 0);
        const nextEnergiaMaximos = CharacterSheetV2._toSafeNumber(foundry.utils.getProperty(submitData, 'system.props.resources.energia.maximos'), 0);
        foundry.utils.setProperty(submitData, 'system.props.tokenResources.hp.value', Math.max(0, nextVidaAtual));
        foundry.utils.setProperty(submitData, 'system.props.tokenResources.hp.max', Math.max(0, nextVidaMaximos));
        foundry.utils.setProperty(submitData, 'system.props.tokenResources.pe.value', Math.max(0, nextEnergiaAtual));
        foundry.utils.setProperty(submitData, 'system.props.tokenResources.pe.max', Math.max(0, nextEnergiaMaximos));
        if (game.settings.get(game.system.id, 'manualEntitySaving') && event.type === 'change') {
            return this.actor.templateSystem.handleSheetSubmit();
        }
        else {
            this.actor.templateSystem.isModified = false;
            return super._processSubmitData(event, form, submitData);
        }
    }
    async close(options) {
        if (options?.renderContext !== 'deleteActor')
            await this.submit();
        return super.close(options);
    }
}
