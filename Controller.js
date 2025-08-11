export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.recipes = this.model.cache.contents;

        this.bindDefaultHandlers();

        this.view.displayRecipeCards(this.recipes);
    }

    /* ---- MODAL EVENT HANDLERS ---- */
    handleCloseModal = () => {
        this.view.closeModal();
        this.view.unbindAllListeners();
        this.bindDefaultHandlers();
    };

    handleOpenRecipe = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        this.view.closeOptionsMenu(recipe.id);
        this.view.createModal();
        this.view.openRecipe(recipe);
        this.view.openModal();
        this.bindRecipeHandlers();
    };

    /* ---- FORM EVENT HANDLERS ---- */
    handleOpenAddForm = () => {
        this.view.createModal();
        this.view.createForm();
        this.view.populateForm();
        this.view.openModal();
        this.bindFormHandlers();
    };

    handleOpenEditForm = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        this.view.closeModal();
        this.view.closeOptionsMenu(recipe.id);
        this.view.createModal();
        this.view.createForm(recipe);
        this.view.populateForm('edit', recipe);
        this.view.openModal();
        this.bindFormHandlers();
    };

    handleAddInput = (event) => {
        this.view.addTextInputsToFieldset(event.target.closest('fieldset'));
    };

    handleRemoveInput = (event) => {
        event.stopPropagation();
        event.target.parentElement.remove();
    };

    handlePreviewImage = (event) => {
        const image = event.currentTarget.files[0];
        const alt = event.currentTarget.name.value;
        const recipe = this.getRecipeFromEvent(event);

        if (!this.view.getImagePreview().hasAttribute('data-populated')) {
            this.view.toggleImageAddButton();
            this.view.toggleImageRemoveButton();
        }
        this.view.setImagePreview(image, alt || recipe.name);
    };

    handleResetImage = () => {
        const updatedRecipe = { ...this.createRecipeFromForm(), photo: null };
        this.view.resetForm();
        this.view.toggleImageRemoveButton();
        this.view.toggleImageAddButton();
        this.view.setImagePreview();
        this.view.populateForm(this.view.formMode, updatedRecipe);
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const formValues = this.view.formValues;
        const recipe = this.createRecipeFromForm(formValues);
        const mode = this.view.formMode;

        if (mode === 'add') {
            this.model.addRecipe(recipe);
            this.view.addRecipeCard(recipe);
        } else if (mode === 'edit') {
            this.model.updateRecipe(recipe);
            this.view.updateRecipeCard(recipe);
        }
        this.view.closeModal();
    };

    /* ---- OPTIONS MENU EVENT HANDLERS ---- */
    handleDelete = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        this.view.closeModal();
        this.model.deleteRecipe(recipe.id);
        this.view.deleteRecipeCard(recipe.id);
    };

    handleOpenOptionsMenu = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        this.view.openOptionsMenu(recipe.id);
    };

    handleCloseOptionsMenu = () => {
        const openMenu = this.view.getOpenOptionsMenu();
        const recipeId = this.view.getIdByChildElement(openMenu);
        this.view.closeOptionsMenu(recipeId);
    };

    /* ---- HELPER FUNCTIONS ---- */
    bindDefaultHandlers = () => {
        this.view.bindOpenRecipe(this.handleOpenRecipe);
        this.view.bindOpenAddForm(this.handleOpenAddForm);
        this.view.bindOpenEditForm(this.handleOpenEditForm);
        this.view.bindDelete(this.handleDelete);
        this.view.bindOpenOptionsMenu(this.handleOpenOptionsMenu);
        this.view.bindCloseOptionsMenu(this.handleCloseOptionsMenu);
    };

    bindFormHandlers = () => {
        this.view.bindPreviewImage(this.handlePreviewImage);
        this.view.bindResetImage(this.handleResetImage);
        this.view.bindAddInput(this.handleAddInput);
        this.view.bindRemoveInput(this.handleRemoveInput);
        this.view.bindSubmit(this.handleSubmit);
        this.view.bindCloseModal(this.handleCloseModal);
    };

    bindRecipeHandlers = () => {
        this.view.bindCloseModal(this.handleCloseModal);
    };

    createRecipeFromForm() {
        const recipeId = this.view.formId || crypto.randomUUID();
        const existingRecipe = this.model.cache.get(recipeId) || null;
        const formData = this.view.formValues;
        const uploadedImage = formData.get('img-input') ?? null;
        let photo;

        if (uploadedImage.size) {
            photo = uploadedImage;
        } else if (this.view.formState !== 'reset' && existingRecipe?.photo) {
            photo = existingRecipe?.photo;
        } else {
            photo = null;
        }

        return {
            id: recipeId,
            name: formData.get('name'),
            description: formData.get('description') || null,
            ingredients: this.view.getFieldsetValues('ingredients'),
            instructions: this.view.getFieldsetValues('instructions'),
            photo,
        };
    }

    getRecipeFromEvent(event) {
        const recipeId = this.view.getIdByChildElement(event.target);
        const recipe = this.model.cache.get(recipeId);
        return recipe;
    }
}
