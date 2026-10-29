/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import Logger from '../Logger.js';
import migration_4_5_0 from './migration_4_5_0.js';
import migration_4_5_1 from './migration_4_5_1.js';
import migration_4_6_4 from './migration_4_6_4.js';
import CustomDialogV2 from '../applications/CustomDialogV2.js';
import migration_5_0_0 from './migration_5_0_0.js';

export default async function processMigrations() {
    if (!game.user.isGM || !(await detectSwitchVersion()) || needsMigration()) {
        return;
    }
    await migration_4_5_0.processMigration();
    await migration_4_5_1.processMigration();
    await migration_4_6_4.processMigration();
    await migration_5_0_0.processMigration();
}

async function detectSwitchVersion() {
    const migrateFrom = needsMigration();
    if (!migrateFrom) {
        return true;
    }
    return new Promise((resolve) => {
        // Closing the window is the same as postponing migration.
        class MigrationDialog extends CustomDialogV2 {
            async _preClose(options) {
                await super._preClose(options);
                resolve(false);
            }
        }
        const reportFailure = (error) => {
            Logger.error(error.message, error);
            ui.notifications.error('Sorcerers and Curses: Migration could not be completed. Previous system data may remain; restore a backup if necessary and retry.');
            resolve(false);
        };
        const migrate = async (deleteOnly = false) => {
            try {
                await switchCSBVersion(migrateFrom, game.system.id, deleteOnly);
                resolve(true);
            }
            catch (error) {
                reportFailure(error);
            }
        };
        try {
            const dialog = new MigrationDialog({
                window: { title: 'System switch detected' },
                content: '<h2>Previous system data detected</h2><p>Do you want to migrate settings and flags to Sorcerers and Curses (recommended)?</p><p>PLEASE BACK UP YOUR WORLD BEFORE DOING ANYTHING</p>',
                buttons: {
                    yes: {
                        default: true,
                        icon: 'fas fa-check',
                        label: 'Migrate Settings & Flags (recommended)',
                        callback: () => migrate()
                    },
                    delete: {
                        icon: 'fas fa-trash',
                        label: 'Do not migrate and only delete old settings & flags',
                        callback: () => migrate(true)
                    },
                    no: {
                        icon: 'fas fa-xmark',
                        label: 'Do nothing (this window will pop-up again on the next reload)',
                        callback: () => resolve(false)
                    }
                }
            });
            Promise.resolve(dialog.render({ force: true })).catch(reportFailure);
        }
        catch (error) {
            reportFailure(error);
        }
    });
}

function getWorldSettings() {
    return game.settings.storage.get('world').contents;
}

function* getMigratableDocuments() {
    yield* game.users;
    for (const actor of game.actors) {
        yield actor;
        yield* actor.items;
    }
    yield* game.items;
    for (const scene of game.scenes) {
        yield scene;
        yield* scene.tokens;
    }
    for (const combat of game.combats) {
        yield combat;
        yield* combat.combatants;
    }
}

// Keep the export name for existing integrations.
export const switchCSBVersion = async (fromKey, toKey, deleteOnly = false) => {
    if (!game.user.isGM || fromKey === toKey) {
        return;
    }
    const settings = getWorldSettings();
    const settingsByKey = new Map(settings.map((setting) => [setting.key, setting]));
    const sourcePrefix = fromKey + '.';
    const sourceSettings = settings.filter((setting) => setting.key.startsWith(sourcePrefix));
    // Work with persisted Setting documents, rather than the settings registration Map.
    // Updating only the key preserves the original stored value, including its type.
    for (const setting of sourceSettings) {
        const targetKey = toKey + '.' + setting.key.slice(sourcePrefix.length);
        if (deleteOnly || settingsByKey.has(targetKey)) {
            await setting.delete();
        }
        else {
            await setting.update({ key: targetKey });
            settingsByKey.set(targetKey, setting);
        }
    }
    const documents = Array.from(getMigratableDocuments())
        .filter((document) => Object.hasOwn(document.flags ?? {}, fromKey));
    const notification = ui.notifications.info('', { progress: true });
    for (let current = 0; current < documents.length; current++) {
        const document = documents[current];
        if (!deleteOnly) {
            const mergedFlags = foundry.utils.mergeObject(
                foundry.utils.deepClone(document.flags[fromKey]),
                foundry.utils.deepClone(document.flags[toKey] ?? {}),
                { inplace: false, recursive: true, overwrite: true }
            );
            // Existing destination values win; unrelated flag scopes are untouched.
            await document.update({ ['flags.' + toKey]: mergedFlags });
        }
        // Remove the old namespace only after the destination update succeeds.
        await document.update({ ['flags.-=' + fromKey]: null });
        logProgress(document, current, documents.length, notification);
    }
    notification.update({
        message: 'Sorcerers and Curses: Migration of settings and flags finished',
        pct: 1
    });
};

function isLegacySystemId(systemId) {
    return systemId !== game.system.id &&
        (systemId === 'custom-system-builder' || systemId.startsWith('custom-system-builder-'));
}

/** Return the previous system namespace when persisted settings or document flags need migration. */
export const needsMigration = () => {
    for (const setting of getWorldSettings()) {
        const separator = setting.key.indexOf('.');
        if (separator < 0) {
            continue;
        }
        const systemId = setting.key.slice(0, separator);
        if (isLegacySystemId(systemId)) {
            return systemId;
        }
    }
    for (const document of getMigratableDocuments()) {
        const systemId = Object.keys(document.flags ?? {}).find(isLegacySystemId);
        if (systemId) {
            return systemId;
        }
    }
};

export const logProgress = (document, current, total, notification) => {
    Logger.log('Migrating flags for ' + document.name + ' - ' + document.id);
    notification.update({
        message: 'Sorcerers and Curses: Migrating flags. Updating ' + document.constructor.name + ' ' + (current + 1) + ' / ' + total,
        pct: total ? (current + 1) / total : 1
    });
};
