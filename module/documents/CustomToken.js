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
export default class CustomToken extends TokenDocument {
    getBarAttribute(barName, options) {
        const configuredAttribute = this[barName]?.attribute ?? '';
        if (configuredAttribute === 'props.tokenResources.hp' || configuredAttribute === 'props.tokenResources.pe') {
            const isHp = configuredAttribute.endsWith('.hp');
            const resourceKey = isHp ? 'vida' : 'energia';
            const value = Number(foundry.utils.getProperty(this.actor?.system, `props.resources.${resourceKey}.atuais`) ?? 0);
            const max = Number(foundry.utils.getProperty(this.actor?.system, `props.resources.${resourceKey}.maximos`) ?? 0);
            return {
                type: 'bar',
                attribute: configuredAttribute,
                value,
                max,
                editable: true
            };
        }
        const barData = super.getBarAttribute(barName, options);
        if (barData) {
            const barAttribute = barData.attribute;
            const actor = this.actor;
            if (barAttribute.startsWith('attributeBar')) {
                barData.editable = foundry.utils.getProperty(actor.system, barAttribute).editable;
            }
            else {
                if (foundry.utils.getProperty(actor.system, barAttribute) !== undefined)
                    barData.editable = true;
            }
        }
        return barData;
    }
    static getTrackedAttributes(data, _path = []) {
        const attributeBarDescription = this._getTrackedAttributesFromObject(data?.attributeBar ?? {}, [
            'attributeBar'
        ]);
        const propBarDescription = this._getTrackedAttributesFromObject(data?.props ?? {}, ['props']);
        if (_path.length === 0) {
            const pushBarPath = (collection, path) => {
                const key = path.join('.');
                const alreadyExists = collection.some((entry) => (Array.isArray(entry) ? entry.join('.') : String(entry)) === key);
                if (!alreadyExists)
                    collection.push(path);
            };
            pushBarPath(propBarDescription.bar, ['props', 'tokenResources', 'hp']);
            pushBarPath(propBarDescription.bar, ['props', 'tokenResources', 'pe']);
        }
        const dedupePaths = (collection) => {
            const seen = new Set();
            return collection.filter((entry) => {
                const key = Array.isArray(entry) ? entry.join('.') : String(entry);
                if (seen.has(key))
                    return false;
                seen.add(key);
                return true;
            });
        };
        return {
            bar: dedupePaths([...attributeBarDescription.bar, ...propBarDescription.bar]),
            value: dedupePaths([...attributeBarDescription.value, ...propBarDescription.value])
        };
    }
}
