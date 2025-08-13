import ModalView from './ModalView.js';
import FormView from './FormView.js';
import RecipeView from './RecipeView.js';
import { createElement } from './utils.js';

export default class View {
    constructor() {
        this.modal = null;
        this.form = null;
        this.recipeViews = [];
        this._listeners = [];
        this.app = document.querySelector('main');
        this.recipeCardContainer = createElement('div', {
            id: 'recipe-card-list',
        });

        this.appendToRoot(this.recipeCardContainer);
    }

    appendToRoot(element) {
        this.app.append(element);
    }

    createModalView(contents) {
        this.modal = new ModalView(contents);
    }

    removeModalView() {
        this.modal.remove();
        this.modal = null;
    }

    createFormView(recipe) {
        this.form = new FormView(recipe);
    }

    removeFormView() {
        this.form.remove();
        this.form = null;
    }

    createRecipeView(recipe) {
        let recipeView;

        const existingRecipeView = this.recipeViews.find(
            (recipeView) => recipeView.recipe.id === recipe.id
        );

        if (existingRecipeView) {
            recipeView = existingRecipeView;
        } else {
            recipeView = new RecipeView(recipe);
            this.recipeViews.push(recipeView);
        }

        return recipeView;
    }

    addRecipeView(recipeView) {
        this.recipeViews.push(recipeView);
        const card = recipeView.card;
        this.recipeCardContainer.append(card);
    }

    getRecipeView(recipeId) {
        return this.recipeViews.find((rv) => rv.recipe.id === recipeId);
    }

    updateRecipeView(recipe) {
        let recipeView = this.getRecipeView(recipe.id);

        const newRecipeView = new RecipeView(recipe);
        newRecipeView.updateCard(recipeView.card);

        recipeView = newRecipeView;
    }

    deleteRecipeView(recipeId) {
        const card = this.getRecipeView(recipeId).card;
        const imgSrc = card.querySelector('img')?.src;

        URL.revokeObjectURL(imgSrc);

        this.recipeViews = this.recipeViews.filter(
            (rv) => rv.recipe.id !== recipeId
        );
        card.remove();
    }

    loadRecipeViews(recipes) {
        if (this.recipeCardContainer.firstChild) {
            this.recipeCardContainer.innerHTML = '';
        }

        if (!recipes.length) {
            const p = createElement('p');
            p.textContent = 'Click the + button to create your first recipe';
        } else {
            const cards = recipes
                .map((recipe) => this.createRecipeView(recipe))
                .map((view) => view.card);
            this.recipeCardContainer.append(...cards);
        }
    }

    /* ---- HELPER FUNCTIONS FOR GETTING STATE OF DOM ---- */

    getParentId(child) {
        const parentWithId = child?.closest('[data-id]');
        const id = parentWithId?.dataset.id;
        return id;
    }

    getOpenOptionsMenu() {
        return document.querySelector('.options.show') || null;
    }

    /* ---- CONDITIONS FOR EVENT DELEGATION ---- */

    shouldCloseModal = (event) =>
        !event.target.closest('.modal-inner') ||
        event.target.matches('.cancel');

    shouldOpenRecipe = (event) =>
        event.target.closest('.recipe-card .img-container') ||
        event.target.matches('.read-more');

    shouldOpenAddForm = (event) => event.target.matches('#add-recipe');

    shouldOpenEditForm = (event) => event.target.matches('.edit-recipe');

    shouldOpenOptionsMenu = (event) => event.target.matches('.see-options');

    shouldCloseOptionsMenu = (event) => {
        return (
            this.getOpenOptionsMenu() && !event.target.matches('.see-options')
        );
    };

    shouldResetImage = (event) => event.target.matches('#remove-img');

    shouldAddInput = (event) =>
        event.target.closest('.input-wrapper:last-child');

    shouldRemoveInput = (event) => event.target.matches('.remove-input');

    shouldDelete = (event) => event.target.matches('.delete-recipe');

    /* ---- METHODS TO BIND/UNBIND EVENT LISTENERS ---- */

    bindListener({ event, handler, root = document, condition = () => true }) {
        const listener = (e) => {
            condition(e) && handler(e);
        };
        root.addEventListener(event, listener);
        this._listeners.push({
            event: event,
            listener,
            condition,
            handler,
            root,
        });
    }

    unbindAllListeners() {
        this._listeners.forEach(({ event, listener, root }) => {
            root.removeEventListener(event, listener);
        });
        this._listeners = [];
    }

    bindOpenRecipe(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldOpenRecipe,
        });
    }

    bindOpenAddForm(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldOpenAddForm,
        });
    }
    bindOpenEditForm(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldOpenEditForm,
        });
    }
    bindValidateForm(handler) {
        this.bindListener({
            event: 'change',
            handler,
            root: this.form.element,
        });
    }
    bindPreviewImage(handler) {
        this.form.element &&
            this.bindListener({
                event: 'change',
                handler,
                root: this.form.element.querySelector('#img-input'),
            });
    }

    bindResetImage(handler) {
        this.form.element &&
            this.bindListener({
                event: 'click',
                handler,
                condition: this.shouldResetImage,
                root: this.form.element,
            });
    }

    bindAddInput(handler) {
        this.form.element &&
            this.bindListener({
                event: 'keypress',
                handler,
                root: this.form.element,
                condition: this.shouldAddInput,
            });
    }

    bindRemoveInput(handler) {
        this.form.element &&
            this.bindListener({
                event: 'click',
                handler,
                root: this.form.element,
                condition: this.shouldRemoveInput,
            });
    }

    bindDelete(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldDelete,
        });
    }

    bindSubmit(handler) {
        this.form.element &&
            this.bindListener({
                event: 'submit',
                handler,
                root: this.form.element,
            });
    }

    bindCloseModal(handler) {
        this.modal &&
            this.bindListener({
                event: 'click',
                handler,
                root: this.modal.element,
                condition: this.shouldCloseModal,
            });
    }

    bindOpenOptionsMenu(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldOpenOptionsMenu,
        });
    }

    bindCloseOptionsMenu(handler) {
        this.bindListener({
            event: 'click',
            handler,
            condition: this.shouldCloseOptionsMenu,
        });
    }
}
