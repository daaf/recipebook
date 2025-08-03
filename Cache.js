import { getObjectIndexById } from './utils.js';

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

    add(...objects) {
        objects.forEach((object) => {
            this.#store.push(object);
        });
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
        const storedRecipes = await db.getAll();

        if (storedRecipes && storedRecipes.length) {
            this.#store.push(...storedRecipes);
            this.#fireUpdateEvent();
        }
    }
}
