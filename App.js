import Database from './Database.js';
import Cache from './Cache.js';
import Model from './Model.js';
import View from './View.js';
import Controller from './Controller.js';

/* TODOs:
    - Confirmation prompts:
        - On `Delete` button click
    - Confirmation popups:
        - On submit: "recipe added" or "recipe deleted"
        - On delete confirmation: "recipe deleted"
*/

const db = new Database();
const cache = new Cache();
const model = new Model(db, cache);
await model.init();
const view = new View();
const app = new Controller(model, view);
