export default class View {
    constructor() {
        this.app = this.getElement('main');
        this.recipeCardContainer = this.createElement('div', {
            id: 'recipe-card-list',
        });
        this.addRecipeButton = document.querySelector('#add-recipe');
        this._modal = null;
        this._form = null;
        this.defaultImgSrc = './assets/icons/fast-food-100.png';
        this.INGREDIENTS_COLUMN_COUNT = 2;
        this.INSTRUCTIONS_COLUMN_COUNT = 1;
        this.DEFAULT_INGREDIENTS_INPUT_COUNT = 8;
        this.DEFAULT_INSTRUCTIONS_INPUT_COUNT = 4;

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

    get formResetState() {
        return this?.form?.dataset?.reset;
    }

    getElement(selector) {
        const element = document.querySelector(selector);

        return element;
    }

    createElement(tag, attributes) {
        const element = document.createElement(tag);
        if (attributes?.id) element.id = attributes.id;
        if (attributes?.className) element.classList.add(attributes.className);

        return element;
    }

    #createRecipeCard(recipe) {
        const div = document.createElement('div');
        div.className = 'recipe-card';
        div.dataset.id = recipe.id;

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
            </div>`;

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
        const div = document.createElement('div');
        div.className = 'recipe';
        div.dataset.id = recipe.id;

        const imgSrc = this.#getImageSrc(recipe.photo) || this.defaultImgSrc;

        div.innerHTML = `
                <img src="${imgSrc}" class="${
            recipe.photo ? '' : 'placeholder'
        }" alt="${recipe.name}" />
                <p>${recipe.description}</p>
                <h3>Ingredients</h3>
                <ul class="recipe-ingredients">${recipe.ingredients
                    .map((ingredient) => `<li>${ingredient}</li>`)
                    .join('')}</ul>
                <h3>Instructions</h3>
                <ol class="recipe-instructions">${recipe.instructions
                    .map((step) => `<li>${step}</li>`)
                    .join('')}</ol>
                <button class="edit-recipe">Edit</button>
                <button class="delete-recipe">Delete</button>`;

        return div;
    }

    #createModal() {
        const outer = document.createElement('div');
        outer.classList.add('modal-outer');
        outer.innerHTML = `
            <div class="modal-inner">
                <h2 class="modal-title"></h2>
            </div>`;

        return outer;
    }

    #createForm(recipe) {
        const form = document.createElement('form');
        form.id = 'add-update-recipe';
        form.setAttribute('aria-label', 'Create or update recipe');
        recipe && form.setAttribute('data-id', recipe.id);

        const imgSrc = this.#getImageSrc(recipe?.photo) || '';

        form.innerHTML = `
            <input
                type="text"
                id="name"
                name="name"
                aria-label="Recipe name"
                placeholder="My awesome recipe"
                value="${recipe?.name || ''}"
                required
                />
                <div class="two-column">
                    <div class="description-container">
                        <label for="description">Description</label>
                        <textarea
                        id="description"
                        name="description"
                        aria-label="Recipe description"
                        >${recipe?.description || ''}</textarea>
                    </div>
                    <div class="img-upload">
                        <h3>Photo</h2>
                        <img
                            src="${imgSrc}"
                            id="img-preview"
                            ${
                                imgSrc
                                    ? `alt="Preview of selected image: ${recipe.name}"`
                                    : ''
                            }
                            height="200"
                        />
                        <input
                        type="file"
                        id="img-input"
                        class="visually-hidden"
                        name="img-input"
                        aria-label="Upload an image file"
                        accept="image/jpeg, image/png, image/jpg"
                        /><label for="img-input" class="label-button">${
                            imgSrc ? 'Change' : 'Add'
                        } photo</label>
                        <button type="button" id="remove-img" ${
                            imgSrc ? '' : 'disabled'
                        }>Remove photo</button>
                    </div>
                </div>
            <fieldset
                id="ingredients"
                data-child-class-list="ingredient"
            >
                <legend>Ingredients</legend>
            </fieldset>
            <button
                type="button"
                class="add-input"
                aria-label="Add fields for more ingredients"
            >
                +
            </button>
            <fieldset
                id="instructions"
                data-child-class-list="step"
            >
                <legend>Instructions</legend>
            </fieldset>
            <button
                type="button"
                class="add-input"
                aria-label="Add fields for more steps"
            >
                +
            </button>
            <div id="form-actions">
                <button
                    type="button"
                    name="cancel"
                    class="cancel"
                    aria-label="Discard changes"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    name="submit"
                    class="submit"
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
        } else {
            console.log('No modal present in the DOM');
        }
    }

    closeModal() {
        if (this.modal) {
            const imgSrc = this.modal.querySelector('img')?.src;
            URL.revokeObjectURL(imgSrc);
            this.modal.classList.remove('open');
            this.modal.remove();
            this.modal = null;
        } else {
            console.log('No modal present in the DOM');
        }
    }

    setModalTitle(title) {
        if (this.modal) {
            this.modal.querySelector('.modal-title').textContent = title;
        } else {
            console.log('No modal present in the DOM');
        }
    }

    setModalContent(element) {
        this.modal.querySelector('.modal-inner').append(element);
    }

    populateModal(title, element) {
        this.setModalTitle(title);
        this.setModalContent(element);
    }

    openRecipe(recipe) {
        if (this.modal) {
            const recipeElement = this.#createFullRecipe(recipe);
            this.populateModal(`${recipe.name}`, recipeElement);
        }
    }

    createForm(recipe) {
        this.form = this.#createForm(recipe);
    }

    populateForm(mode = 'add', recipe = null) {
        if (this.form) {
            this.form.setAttribute('data-mode', mode);
            //TODO: Refactor to remove this modal operation from this method
            this.populateModal(
                `${this.#capitalizeFirstLetter(mode)} recipe`,
                this.form
            );
            this.form.querySelectorAll('fieldset').forEach((fieldset) => {
                const values = recipe
                    ? recipe[fieldset.id]
                    : new Array(
                          this[
                              `DEFAULT_${fieldset.id.toUpperCase()}_INPUT_COUNT`
                          ]
                      ).fill('');
                this.addTextInputsToFieldset(fieldset, values);
            });
        }
    }

    addTextInputsToFieldset(fieldset, values = []) {
        if (this.form) {
            const columnCount =
                this[`${fieldset.id.toUpperCase()}_COLUMN_COUNT`];

            const inputCountToFillColumns =
                Math.ceil(values.length / columnCount) * columnCount ||
                columnCount;

            const extraValuesToFillColumns = new Array(
                inputCountToFillColumns - values.length
            ).fill('');

            [...values, ...extraValuesToFillColumns].forEach((value, index) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.name = index;
                input.maxLength = 48;
                input.value = value;
                fieldset.appendChild(input);
            });
        } else {
            console.log('No form present in DOM');
        }
    }

    getFormMode() {
        if (this.form) {
            return this.form?.dataset?.mode || null;
        } else {
            console.log('No form present in DOM');
        }
    }

    getFormValues() {
        return new FormData(this.form);
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

    resetForm() {
        this.form.reset();
        [...this.form.querySelectorAll('fieldset input')].forEach((input) =>
            input.remove()
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

    #getIdByChildElement(child) {
        const recipeCard = child?.closest('[data-id]');
        const id = recipeCard?.dataset.id;
        return id;
    }

    getRecipeCardById(id) {
        return this.recipeCardContainer.querySelector(`[data-id="${id}"]`);
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

    #capitalizeFirstLetter(text) {
        return [text[0].toUpperCase(), text.slice(1)].join('');
    }

    /* ---- EVENT LISTENER LOGIC ---- */
    #getOpenRecipeListener(handler) {
        return (event) => {
            if (event.target.closest('.recipe-card .img-container')) {
                const id = this.#getIdByChildElement(event.target);
                handler(id);
            }
        };
    }

    #getOpenEditFormListener(handler) {
        return (event) => {
            if (event.target.matches('.edit-recipe')) {
                const id = this.#getIdByChildElement(event.target);
                handler(id);
            }
        };
    }

    #getPreviewImageListener(handler) {
        return (event) => {
            const image = event.currentTarget.files[0];
            const alt = event.currentTarget.name.value;
            const id = this.#getIdByChildElement(event.currentTarget);
            handler(image, alt, id);
        };
    }

    #getResetImageListener(handler) {
        return (event) => {
            if (event.target.matches('#remove-img')) {
                const id = event.currentTarget?.id || null;
                handler(id);
            }
        };
    }

    #getAddInputListener(handler) {
        return (event) => {
            if (event.target.matches('.add-input')) {
                const fieldset = event.target.previousElementSibling;
                handler(fieldset);
            }
        };
    }

    #getDeleteListener(handler) {
        return (event) => {
            if (event.target.matches('.delete-recipe')) {
                const id = this.#getIdByChildElement(event.target);
                handler(id);
            }
        };
    }

    #getCloseModalListener(handler) {
        return (event) => {
            if (
                !event.target.closest('.modal-inner') ||
                event.target.matches('.cancel')
            ) {
                handler();
            }
        };
    }

    #getOpenOptionsMenuListener(handler) {
        return (event) => {
            if (event.target.matches('.see-options')) {
                const id = this.#getIdByChildElement(event.target);
                handler(id);
            }
        };
    }

    #getCloseOptionsMenuListener(handler) {
        return (event) => {
            const openMenu = document.querySelector('.options.show');

            if (!openMenu) return;

            const isInsideMenu =
                event.target.closest('.options-dropdown') ===
                openMenu.closest('.options-dropdown');

            if (isInsideMenu) return;

            const id = this.#getIdByChildElement(openMenu);
            handler(id);
        };
    }

    /* ---- METHODS TO BIND/UNBIND EVENT HANDLERS TO/FROM VIEW + LISTENERS ---- */
    bindOpenRecipe(handler) {
        this.recipeCardContainer.addEventListener(
            'click',
            this.#getOpenRecipeListener(handler)
        );
    }
    bindOpenAddForm(handler) {
        this.addRecipeButton.addEventListener('click', handler);
    }
    bindOpenEditForm(handler) {
        document.addEventListener(
            'click',
            this.#getOpenEditFormListener(handler)
        );
    }
    bindPreviewImage(handler) {
        if (this.form) {
            const imageInput = this.form.querySelector('#img-input');
            imageInput.addEventListener(
                'change',
                this.#getPreviewImageListener(handler)
            );
        }
    }
    unbindPreviewImage(handler) {
        if (this.form) {
            const imageInput = this.form.querySelector('#img-input');
            imageInput.removeEventListener(
                'change',
                this.#getPreviewImageListener(handler)
            );
        }
    }
    bindResetImage(handler) {
        if (this.form) {
            this.form.addEventListener(
                'click',
                this.#getResetImageListener(handler)
            );
        }
    }
    unbindResetImage(handler) {
        if (this.form) {
            this.form.removeEventListener(
                'click',
                this.#getResetImageListener(handler)
            );
        }
    }
    bindAddInput(handler) {
        if (this.form) {
            this.form.addEventListener(
                'click',
                this.#getAddInputListener(handler)
            );
        }
    }
    unbindAddInput(handler) {
        if (this.form) {
            this.form.removeEventListener(
                'click',
                this.#getAddInputListener(handler)
            );
        }
    }
    bindDelete(handler) {
        document.addEventListener('click', this.#getDeleteListener(handler));
    }
    bindSubmit(handler) {
        if (this.form) {
            this.form.addEventListener('submit', handler);
        }
    }
    unbindSubmit(handler) {
        if (this.form) {
            this.form.removeEventListener('submit', handler);
        }
    }
    bindCloseModal(handler) {
        if (this.modal) {
            this.modal.addEventListener(
                'click',
                this.#getCloseModalListener(handler)
            );
        }
    }
    unbindCloseModal(handler) {
        if (this.modal) {
            this.modal.removeEventListener(
                'click',
                this.#getCloseModalListener(handler)
            );
        }
    }
    bindOpenOptionsMenu(handler) {
        this.recipeCardContainer.addEventListener(
            'click',
            this.#getOpenOptionsMenuListener(handler)
        );
    }
    bindCloseOptionsMenu(handler) {
        this.recipeCardContainer.addEventListener(
            'click',
            this.#getCloseOptionsMenuListener(handler)
        );
    }
}
