export default class Model {
    constructor(database, cache) {
        this.db = database;
        this.cache = cache;
    }

    async init() {
        await this.db.connect();
        await this.cache.restoreFromDatabase(this.db);
    }

    addRecipe(recipe) {
        this.cache.add(recipe);
        this.db.put(recipe);
    }

    updateRecipe(recipe) {
        this.cache.update(recipe);
        this.db.put(recipe);
    }

    deleteRecipe(id) {
        this.cache.delete(id);
        this.db.delete(id);
    }
}
