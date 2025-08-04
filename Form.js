export default class Form {
    constructor() {
        this.id = null;
        this.element = document.querySelector('#add-update-recipe');
        this.name = this.element.querySelector('#name');
        this.description = this.element?.querySelector('#description');
        this.imgInput = this.element?.querySelector('#img-input');
        this.imgPreview = this.element?.querySelector('#img-preview');
        this.ingredients = this.element?.querySelector('#ingredients');
        this.instructions = this.element?.querySelector('#instructions');
        this.fieldsets = this.element?.querySelectorAll('fieldset');
        this.addInputButtons = this.element?.querySelectorAll('.add-input');
        this.cancelButton = this.element?.querySelector(
            'button[name="cancel"]'
        );
    }

    toggleState() {
        this.element.classList.toggle('open');
    }

    close() {
        this.element.classList.remove('open');
    }

    #roundUpToFillColumns(initialFieldCount, columnCount) {
        return Math.ceil(initialFieldCount / columnCount) * columnCount;
    }

    #getGridColumnCount(element) {
        if (!element) {
            throw new Error('Element is null in #getGridColumnCount');
        }
        return getComputedStyle(element).gridTemplateColumns.split(' ').length;
    }

    #getInputCountBasedOnColumnCount(fieldset, values) {
        const columnCount = this.#getGridColumnCount(fieldset);
        const newInputCount = this.#roundUpToFillColumns(
            values.length,
            columnCount
        );
        return newInputCount;
    }

    #getInputAttributesBasedOnFieldset(fieldset) {
        const inputs = fieldset.querySelectorAll('input');
        const lastExtantInputName = inputs[inputs.length - 1]?.name;
        const classList = fieldset.dataset.childClassList;
        const nameStart = lastExtantInputName
            ? Number(lastExtantInputName) + 1
            : 0;
        return { nameStart, classList };
    }

    #getTextInputHtml = ({ classList, name, value }) =>
        `<input type="text" class="${classList}" name="${name}" value="${value}" />`;

    #getTextInputSetHtml = (count, { classList, nameStart }, values) =>
        Array.from({ length: count })
            .map((_, index) =>
                this.#getTextInputHtml({
                    classList,
                    name: nameStart + index,
                    value: values[index] || '',
                })
            )
            .join('');

    #addFieldsToFieldset(fieldset, values = [null]) {
        const newInputCount = this.#getInputCountBasedOnColumnCount(
            fieldset,
            values
        );
        const attributes = this.#getInputAttributesBasedOnFieldset(fieldset);
        const newFieldsHtml = this.#getTextInputSetHtml(
            newInputCount,
            attributes,
            values
        );

        fieldset.insertAdjacentHTML('beforeend', newFieldsHtml);
    }

    #populateAddForm() {
        this.#addFieldsToFieldset(this.ingredients, Array.from({ length: 8 }));
        this.#addFieldsToFieldset(this.instructions, Array.from({ length: 4 }));
    }

    #populateEditForm(recipe) {
        this.element.setAttribute('data-id', recipe.id);
        this.element.name.value = recipe.name;
        this.element.description.value = recipe.description;

        this.#addFieldsToFieldset(this.ingredients, recipe.ingredients);
        this.#addFieldsToFieldset(this.instructions, recipe.instructions);
    }

    populate(recipe) {
        if (recipe) {
            this.id = recipe.id;
            this.#populateEditForm(recipe);
        } else {
            this.#populateAddForm();
        }
        this.toggleState();
    }

    addInputs(clickedButton) {
        const previousSibling = clickedButton.previousElementSibling;

        if ([...this.fieldsets].includes(previousSibling)) {
            this.#addFieldsToFieldset(clickedButton.previousElementSibling);
        }
    }

    #clearImagePreview() {
        this.imgPreview.src = '';
    }

    #clearFieldsFromFieldset(fieldset) {
        return [...fieldset.querySelectorAll('input')].forEach((input) =>
            input.remove()
        );
    }

    clear() {
        this.element.reset();
        this.element.removeAttribute('data-id');
        this.id = null;
        this.#clearImagePreview();
        this.close();
        this.fieldsets.forEach(this.#clearFieldsFromFieldset);
    }

    #getInputsInFieldset(fieldset) {
        return [...fieldset.children].filter((element) =>
            element.matches('input')
        );
    }

    #getValuesFromFieldset(fieldset) {
        return this.#getInputsInFieldset(fieldset)
            .filter((input) => input.value)
            .map((input) => input.value);
    }

    getValues() {
        const recipeId = this.id || crypto.randomUUID();
        const photoFile = this.imgInput?.files?.[0] ?? null;

        return {
            id: recipeId,
            name: this.name.value,
            description: this.description.value,
            ingredients: this.#getValuesFromFieldset(this.ingredients),
            instructions: this.#getValuesFromFieldset(this.instructions),
            photo: photoFile,
        };
    }
}
