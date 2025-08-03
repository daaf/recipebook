import { getObjectById, getObjectIndexById } from './utils.js';

export default class Cache {
    #store = [];

    constructor() {
        this.updateEvent = new CustomEvent('cacheUpdated');
    }

    get contents() {
        return [...this.#store];
    }

    #fireUpdateEvent() {
        window.dispatchEvent(this.updateEvent);
    }

    get(id) {
        return getObjectById(this.contents, id);
    }

    add(...objects) {
        this.#store.push(...objects);
        this.#fireUpdateEvent();
    }

    update(object) {
        const index = getObjectIndexById(this.contents, object.id);
        this.#store[index] = object;
        this.#fireUpdateEvent();
    }

    delete(id) {
        const index = getObjectIndexById(this.contents, id);
        this.#store.splice(index, 1);
        this.#fireUpdateEvent();
    }

    async restoreFromDatabase(db) {
        const storedObjects = await db.getAll();
        const storedObjectCount = storedObjects.length;

        if (storedObjects && storedObjectCount && db.connection) {
            this.add(...storedObjects);
            console.log(
                `Restored ${storedObjectCount} ${
                    storedObjectCount === 1 ? 'item' : 'items'
                } from database`
            );
            this.#fireUpdateEvent();
        }
    }
}
