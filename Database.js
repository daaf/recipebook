import data from './preload.js';

const DB_NAME = 'RecipeBookDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'recipes';

export default class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const objectStore = db.createObjectStore(OBJECT_STORE_NAME, {
                    keyPath: 'id',
                });

                objectStore.createIndex('id', 'id', { unique: true });

                objectStore.transaction.oncomplete = () =>
                    this.mirrorRecipesToDb();
            };

            request.onsuccess = (event) => {
                this.connection = event.target.result;
                console.log(`Connected to ${DB_NAME}`);
                resolve(this.connection);
            };

            request.onerror = (event) => {
                reject(
                    new Error(`IndexedDB error: ${event.target.error?.message}`)
                );
            };
        });
    }

    async getObjectStore(mode = 'readonly') {
        if (!this.connection) throw new Error('Database not connected');
        const transaction = this.connection.transaction(
            [OBJECT_STORE_NAME],
            mode
        );
        return transaction.objectStore(OBJECT_STORE_NAME);
    }

    async get(id) {
        const store = await this.getObjectStore();

        return new Promise((resolve, reject) => {
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(
                    new Error(
                        `Error reading data: ${event.target.error?.message}`
                    )
                );
            };
        });
    }

    async getAll() {
        const store = await this.getObjectStore();

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(
                    new Error(
                        `Error reading data: ${event.target.error?.message}`
                    )
                );
            };
        });
    }

    async put(recipe) {
        const store = await this.getObjectStore('readwrite');

        return new Promise((resolve, reject) => {
            const request = store.put(recipe);

            request.onsuccess = () => {
                `Successfully saved recipe with id ${recipe.id} to database`;
                resolve(recipe);
            };
            request.onerror = (event) => {
                console.error(
                    `Failed to add recipe with id ${recipe.id}: ${event.target.error?.message}`
                );
                reject(event.target.error);
            };
        });
    }

    async delete(id) {
        const store = await this.getObjectStore('readwrite');

        return new Promise((resolve, reject) => {
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(
                    `Successfully deleted recipe with id ${id} from database`
                );
                resolve();
            };

            request.onerror = (event) => {
                console.error(
                    `Failed to add recipe with id ${id}: ${event.target.error?.message}`
                );
                reject(event.target.error);
            };
        });
    }

    async mirrorRecipesToDb() {
        return await this.addMultiple(recipes);
    }

    async preloadData() {
        return await this.addMultiple(data);
    }

    async addMultiple(data) {
        if (!data.length) {
            console.log('No data provided for save to database');
            return;
        }

        try {
            const results = await Promise.all(data.map((row) => this.put(row)));
            console.log('Recipes saved to IndexedDB successfully');
            return results;
        } catch (error) {
            console.error(`Error while saving recipes to DB: ${error.message}`);
        }
    }
}
