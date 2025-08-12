import {
    createElement,
    sanitizeText,
    sanitizeObject,
    escapeQuotesInObject,
    getImageSrc,
} from './utils.js';

export default class FormView {
    constructor(recipe) {
        this.recipe = recipe;
        this.element = this.create(this.recipe);
    }

    get state() {
        return this.element?.dataset?.state;
    }

    get mode() {
        return this.element?.dataset?.mode || null;
    }

    get id() {
        return this.element?.dataset?.id || null;
    }

    get values() {
        return this.element ? new FormData(this.element) : null;
    }

    create(recipeData) {
        const recipe = recipeData
            ? sanitizeObject(escapeQuotesInObject(recipeData))
            : null;
        const attributes = {
            id: 'add-update-recipe',
            'aria-label': 'Create or update recipe',
        };

        if (recipe) attributes['data-id'] = recipe.id;

        const form = createElement('form', attributes);
        const imgSrc = getImageSrc(recipe?.photo) || '';

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
                                    ? `alt="Preview of selected image: ${recipe.name}" data-populated`
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
                            /><label for="img-input" id="add-img" class="label-button button-primary">${
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

    populate(mode = 'add', recipe = null) {
        this.element.setAttribute('data-mode', mode);

        this.element.querySelectorAll('fieldset').forEach((fieldset) => {
            const values = recipe?.[fieldset.id];
            this.addTextInputsToFieldset(fieldset, values);
        });
    }

    addTextInputsToFieldset(fieldset, values = []) {
        const extraInput = [''];
        [...values, ...extraInput].forEach((value, index) => {
            const div = createElement('div', {
                class: 'input-wrapper',
            });
            const button = createElement('button', {
                type: 'button',
                role: 'button',
                class: 'remove-input',
                'aria-label': `Remove input ${index}`,
            });
            button.textContent = '×';
            const input = createElement('input', {
                type: 'text',
                name: index,
                maxLength: 48,
                value,
            });
            const label = createElement('label', {
                for: `${index}`,
                class: 'visually-hidden',
            });
            div.append(label, input, button);
            fieldset.append(div);
        });
    }

    removeTextInput(removeButton) {
        removeButton.parentElement.remove();
    }

    getFieldsetValues(fieldsetId) {
        const inputs = this.element.querySelectorAll(`#${fieldsetId} input`);
        return [...inputs]
            .filter((input) => input.value)
            .map((input) => sanitizeText(input.value));
    }

    getInputsInFieldset(fieldsetId) {
        this.element.querySelectorAll(`#${fieldsetId} input`);
    }

    getImagePreview() {
        return this.element.querySelector('#img-preview');
    }

    setImagePreview(img, alt) {
        const imagePreview = this.element.querySelector('#img-preview');
        let src = '';

        if (img) {
            src = getImageSrc(img);
        } else if (!alt) {
            imagePreview.removeAttribute('alt');
        }

        if (src) {
            imagePreview.alt = `Preview of selected image: ${alt}`;
            imagePreview.setAttribute('data-populated', '');
        } else if (imagePreview.hasAttribute('data-populated')) {
            imagePreview.removeAttribute('data-populated');
        }

        imagePreview.src = src;
    }

    toggleImageAddButton() {
        const addButton = this.element.querySelector('#add-img');
        if (addButton.textContent === 'Change') {
            addButton.textContent = 'Add photo';
        } else {
            addButton.textContent = 'Change';
        }
    }

    toggleImageRemoveButton() {
        const removeButton = this.element.querySelector('#remove-img');
        removeButton.disabled = !removeButton.disabled;
    }

    remove() {
        this.element.remove();
    }

    reset() {
        this.element.reset();
        [...this.element.querySelectorAll('fieldset .input-wrapper')].forEach(
            (input) => input.remove()
        );
        this.element.dataset.state = 'reset';
    }
}
