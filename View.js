export default class View {
    constructor() {
        this._listeners = [];
        this.app = this.getElement('main');
        this.recipeCardContainer = this.createElement('div', {
            id: 'recipe-card-list',
        });
        this.addRecipeButton = document.querySelector('#add-recipe');
        this._modal = null;
        this._form = null;
        this.defaultImgSrc = './assets/icons/fast-food-100.png';

        this.app.append(this.recipeCardContainer);
    }

    get modal() {
        return this._modal;
    }

    set modal(value) {
        this._modal = value;
    }

    get modalInner() {
        return this.modal.querySelector('.modal-inner');
    }

    get form() {
        return this._form;
    }

    set form(value) {
        this._form = value;
    }

    get formState() {
        return this?.form?.dataset?.state;
    }

    get formMode() {
        return this?.form?.dataset?.mode || null;
    }

    get formId() {
        return this?.form?.dataset?.id || null;
    }

    get formValues() {
        return this.form ? new FormData(this.form) : null;
    }

    getElement(selector) {
        const element = document.querySelector(selector);

        return element;
    }

    createElement(tag, attributes) {
        const element = document.createElement(tag);

        if (attributes) {
            Object.entries(attributes).forEach(([attribute, value]) => {
                try {
                    element.setAttribute(attribute, value);
                } catch (error) {
                    console.log(
                        `Error setting attribute ${attribute} with value ${value}`
                    );
                }
            });
        }

        return element;
    }

    #createRecipeCard(recipe) {
        const div = this.createElement('div', {
            class: 'recipe-card',
            'data-id': recipe.id,
        });

        const imgSrc = this.#getImageSrc(recipe.photo) || this.defaultImgSrc;

        div.innerHTML = `
            <div class="img-container" >
                <img src="${imgSrc}" class="${
            recipe.photo ? '' : 'placeholder'
        }" alt="${recipe.name}" />
            </div>
            <div class="recipe-card-body">
                <div class="recipe-card-header">
                    <h2 class="recipe-name">${recipe.name}</h2>
                    <div class="options-dropdown">
                        <input type="image" src="./assets/icons/3-dots_black.png" class="see-options" aria-label="See more options" name="options" />
                        <div class="options">
                            <a class="edit-recipe">Edit</a>
                            <a class="delete-recipe">Delete</a>
                        </div>
                    </div>
                </div>
                <ul class="recipe-ingredients">${recipe.ingredients
                    .map((ingredient) => `<li>${ingredient}</li>`)
                    .join('')}
                </ul>
                </div>
                <a href="#" class="read-more">Read more &rarr;</a>`;

        return div;
    }

    addRecipeCard(recipe) {
        const card = this.#createRecipeCard(recipe);
        this.recipeCardContainer.append(card);
    }

    updateRecipeCard(recipe) {
        const card = this.getRecipeCardById(recipe.id);
        const image = card.querySelector('img');
        const cardHeader = card.querySelector('h2');
        const ingredientsUL = card.querySelector('ul');

        if (recipe.photo) {
            image.src = this.#getImageSrc(recipe.photo);
            image.classList?.remove('placeholder');
        } else {
            image.src = this.defaultImgSrc;
            image.classList.add('placeholder');
        }

        cardHeader.textContent = recipe.name;
        ingredientsUL.innerHTML = '';

        recipe.ingredients.forEach((ingredient) => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsUL.appendChild(li);
        });
    }

    deleteRecipeCard(recipeId) {
        const card = this.getRecipeCardById(recipeId);
        const imgSrc = card.querySelector('img')?.src;
        URL.revokeObjectURL(imgSrc);
        card.remove();
    }

    displayRecipeCards(recipes) {
        if (this.recipeCardContainer.firstChild) {
            this.recipeCardContainer.innerHTML = '';
        }

        if (!recipes.length) {
            const p = this.createElement('p');
            p.textContent = 'Click the + button to create your first recipe';
        } else {
            const recipeCards = recipes.map((recipe) =>
                this.#createRecipeCard(recipe)
            );
            this.recipeCardContainer.append(...recipeCards);
        }
    }

    #createFullRecipe(recipe) {
        const div = this.createElement('div', {
            class: 'recipe',
            'data-id': recipe.id,
        });

        const imgSrc = this.#getImageSrc(recipe.photo) || this.defaultImgSrc;

        div.innerHTML = `
        <h2>${recipe.name}</h2>
        <img src="${imgSrc}" class="${
            recipe.photo ? '' : 'placeholder'
        }" alt="${recipe.name}" />
        ${recipe.description ? `<p>${recipe.description}</p>` : ''}
        <section>
                <h3>Ingredients</h3>
                <ul class="recipe-ingredients">${recipe.ingredients
                    .map((ingredient) => `<li>${ingredient}</li>`)
                    .join('')}</ul>
        </section>
        <section>
        <h3>Instructions</h3>
                <ol class="recipe-instructions">${recipe.instructions
                    .map((step) => `<li>${step}</li>`)
                    .join('')}</ol>
        </section>
                <div class="modal-actions">
                    <button class="delete-recipe button-danger">Delete</button>
                    <button class="edit-recipe button-primary">Edit</button>
                </div>
                `;

        return div;
    }

    #createModal() {
        const outer = this.createElement('div', { class: 'modal-outer' });
        outer.innerHTML = `
            <div class="modal-inner">
            </div>`;

        return outer;
    }

    #createForm(recipe) {
        const attributes = {
            id: 'add-update-recipe',
            'aria-label': 'Create or update recipe',
        };

        if (recipe) attributes['data-id'] = recipe.id;

        const form = this.createElement('form', attributes);
        const imgSrc = this.#getImageSrc(recipe?.photo) || '';

        form.innerHTML = `
            <label for="name" class="visually-hidden">Recipe name</label>
            <input
                type="text"
                id="name"
                name="name"
                aria-label="Recipe name"
                placeholder="My awesome recipe"
                value="${recipe?.name || ''}"
                required
                />
                <div class="two-column main-left">
                    <div class="description-container">
                        <label for="description">Description</label>
                        <textarea
                        id="description"
                        name="description"
                        aria-label="Recipe description"
                        >${recipe?.description || ''}</textarea>
                    </div>
                    <div class="img-upload">
                        <h3>Photo</h3>
                        <img
                            src="${imgSrc}"
                            id="img-preview"
                            ${
                                imgSrc
                                    ? `alt="Preview of selected image: ${recipe.name}"`
                                    : ''
                            }
                            height="180"
                        />
                        <div id="img-upload-actions">
                            <input
                            type="file"
                            id="img-input"
                            class="visually-hidden"
                            name="img-input"
                            aria-label="Upload an image file"
                            accept="image/jpeg, image/png, image/jpg"
                            /><label for="img-input" class="label-button button-primary">${
                                imgSrc ? 'Change' : 'Add photo'
                            }</label>
                            <button type="button" role="button" id="remove-img" class="button-deemphasize" ${
                                imgSrc ? '' : 'disabled="true"'
                            }>Remove</button>
                        </div>
                    </div>
                </div>
                <div class="two-column main-right">
                    <fieldset
                        id="ingredients"
                        data-child-class-list="ingredient"
                    >
                        <legend>Ingredients</legend>
                    </fieldset>
                    <fieldset
                        id="instructions"
                        data-child-class-list="step"
                    >
                        <legend>Instructions</legend>
                    </fieldset>
                </div>
            <div class="modal-actions">
                <button
                    type="button"
                    name="cancel"
                    class="cancel button-deemphasize"
                    aria-label="Discard changes"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    name="submit"
                    class="submit button-primary"
                    aria-label="Save recipe"
                >
                    Save
                </button>
            </div>
        `;

        return form;
    }

    createModal() {
        this.modal = this.#createModal();
    }

    openModal() {
        if (this.modal) {
            this.app.append(this.modal);
            this.modal.classList.add('open');
        }
    }

    closeModal() {
        if (this.modal) {
            const imgSrc = this.modal.querySelector('img')?.src;
            URL.revokeObjectURL(imgSrc);
            this.modal.classList.remove('open');
            this.modal.remove();
            this.modal = null;
        }
    }

    setModalTitle(title) {
        if (this.modal) {
            this.modal.querySelector('.modal-title').textContent = title;
        }
    }

    setModalContent(element) {
        this.modal.querySelector('.modal-inner').append(element);
    }

    openRecipe(recipe) {
        if (this.modal) {
            const recipeElement = this.#createFullRecipe(recipe);
            this.setModalContent(recipeElement);
        }
    }

    createForm(recipe) {
        this.form = this.#createForm(recipe);
    }

    populateForm(mode = 'add', recipe = null) {
        if (this.form) {
            this.form.setAttribute('data-mode', mode);
            //TODO: Refactor to remove this modal operation from this method
            this.setModalContent(this.form);
            this.form.querySelectorAll('fieldset').forEach((fieldset) => {
                const values = recipe?.[fieldset.id];
                this.addTextInputsToFieldset(fieldset, values);
            });
        }
    }

    addTextInputsToFieldset(fieldset, values = []) {
        if (this.form) {
            const extraInput = [''];
            [...values, ...extraInput].forEach((value, index) => {
                const div = this.createElement('div', {
                    class: 'input-wrapper',
                });
                const button = this.createElement('button', {
                    type: 'button',
                    role: 'button',
                    class: 'remove-input',
                    'aria-label': `Remove input ${index}`,
                });
                button.textContent = '×';
                const input = this.createElement('input', {
                    type: 'text',
                    name: index,
                    maxLength: 48,
                    value,
                });
                const label = this.createElement('label', {
                    for: `${index}`,
                    class: 'visually-hidden',
                });
                div.append(label, input, button);
                fieldset.append(div);
            });
        } else {
            console.log('No form present in DOM');
        }
    }

    getFieldsetValues(fieldsetId) {
        const inputs = this.form.querySelectorAll(`#${fieldsetId} input`);
        return [...inputs]
            .filter((input) => input.value)
            .map((input) => input.value);
    }

    getInputsInFieldset(fieldsetId) {
        this.form.querySelectorAll(`#${fieldsetId} input`);
    }

    getImagePreview() {
        if (this.form) {
            return this.form.querySelector('#img-preview');
        }
    }

    setImagePreview(img, alt) {
        const imagePreview = this.form.querySelector('#img-preview');
        let src = '';

        if (img) {
            src = this.#getImageSrc(img);
        } else if (!alt) {
            imagePreview.removeAttribute('alt');
        }

        if (src) {
            imagePreview.alt = `Preview of selected image: ${alt}`;
        }

        imagePreview.src = src;
    }

    toggleImageRemoveButton() {
        const removeButton = this.form.querySelector('#remove-img');
        removeButton.disabled = !removeButton.disabled;
    }

    resetForm() {
        this.form.reset();
        [...this.form.querySelectorAll('fieldset .input-wrapper')].forEach(
            (input) => input.remove()
        );
        this.form.dataset.state = 'reset';
    }

    openOptionsMenu(recipeId) {
        const optionsMenu = this.recipeCardContainer
            .querySelector(`[data-id="${recipeId}"]`)
            .querySelector('.options');
        optionsMenu.classList.add('show');
    }

    closeOptionsMenu(recipeId) {
        const optionsMenu = this.recipeCardContainer
            .querySelector(`[data-id="${recipeId}"]`)
            .querySelector('.options');
        optionsMenu.classList.remove('show');
    }

    getIdByChildElement(child) {
        const recipeCard = child?.closest('[data-id]');
        const id = recipeCard?.dataset.id;
        return id;
    }

    getRecipeCardById(id) {
        return this.recipeCardContainer.querySelector(`[data-id="${id}"]`);
    }

    getOpenOptionsMenu() {
        return document.querySelector('.options.show') || null;
    }

    #getImageSrc(image) {
        if (image instanceof Blob) {
            try {
                return URL.createObjectURL(image);
            } catch (error) {
                console.warn(
                    'Failed to create image URL from photo Blob',
                    error
                );
            }
        }
        return null;
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
            this.getOpenOptionsMenu() &&
            event.target?.closest('.options-dropdown') !==
                document
                    .querySelector('.options.show')
                    ?.closest('.options-dropdown')
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
    bindPreviewImage(handler) {
        this.form &&
            this.bindListener({
                event: 'change',
                handler,
                root: this.form.querySelector('#img-input'),
            });
    }

    bindResetImage(handler) {
        this.form &&
            this.bindListener({
                event: 'click',
                handler,
                condition: this.shouldResetImage,
                root: this.form,
            });
    }

    bindAddInput(handler) {
        this.form &&
            this.bindListener({
                event: 'keypress',
                handler,
                root: this.form,
                condition: this.shouldAddInput,
            });
    }

    bindRemoveInput(handler) {
        this.form &&
            this.bindListener({
                event: 'click',
                handler,
                root: this.form,
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
        this.form &&
            this.bindListener({ event: 'submit', handler, root: this.form });
    }

    bindCloseModal(handler) {
        this.modal &&
            this.bindListener({
                event: 'click',
                handler,
                root: this.modal,
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
