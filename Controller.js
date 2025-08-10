export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.recipes = this.model.cache.contents;

        this.view.bindOpenRecipe(this.handleOpenRecipe);
        this.view.bindOpenAddForm(this.handleOpenAddForm);
        this.view.bindOpenEditForm(this.handleOpenEditForm);
        this.view.bindDelete(this.handleDelete);
        this.view.bindOpenOptionsMenu(this.handleOpenOptionsMenu);
        this.view.bindCloseOptionsMenu(this.handleCloseOptionsMenu);

        this.view.displayRecipeCards(this.recipes);
    }

    /* ---- MODAL EVENT HANDLERS ---- */
    handleCloseModal = () => {
        this.unbindFormHandlers();
        this.unbindRecipeHandlers();
        this.view.closeModal();
    };

    handleOpenRecipe = (recipeId) => {
        const recipe = this.model.cache.get(recipeId);
        this.view.closeOptionsMenu(recipeId);
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

    handleOpenEditForm = (recipeId) => {
        const recipe = this.model.cache.get(recipeId);
        this.view.closeModal();
        this.view.closeOptionsMenu(recipeId);
        this.view.createModal();
        this.view.createForm(recipe);
        this.view.populateForm('edit', recipe);
        this.view.openModal();
        this.bindFormHandlers();
    };

    handleAddInput = (fieldset) => {
        this.view.addTextInputsToFieldset(fieldset);
    };

    handleRemoveInput = (element) => {
        element.remove();
    };

    handlePreviewImage = (image, alt, recipeId) => {
        const recipeName = this.model.cache.get(recipeId)?.name;
        this.view.setImagePreview(image, alt || recipeName);
    };

    handleResetImage = (recipeId) => {
        const updatedRecipe = { ...this.createRecipeFromForm(), photo: null };
        this.view.resetForm();
        this.view.setImagePreview();
        this.view.populateForm(this.view.formMode, updatedRecipe);
    };

    handleSubmit = () => {
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
    handleDelete = (recipeId) => {
        this.view.closeModal();
        this.model.deleteRecipe(recipeId);
        this.view.deleteRecipeCard(recipeId);
    };

    handleOpenOptionsMenu = (recipeId) => {
        this.view.openOptionsMenu(recipeId);
    };

    handleCloseOptionsMenu = (recipeId) => {
        this.view.closeOptionsMenu(recipeId);
    };

    /* ---- HELPER FUNCTIONS ---- */
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

    bindFormHandlers = () => {
        this.view.bindPreviewImage(this.handlePreviewImage);
        this.view.bindResetImage(this.handleResetImage);
        this.view.bindAddInput(this.handleAddInput);
        this.view.bindRemoveInput(this.handleRemoveInput);
        this.view.bindSubmit(this.handleSubmit);
        this.view.bindCloseModal(this.handleCloseModal);
    };

    unbindFormHandlers = () => {
        this.view.unbindPreviewImage(this.handlePreviewImage);
        this.view.unbindResetImage(this.handleResetImage);
        this.view.unbindSubmit(this.handleSubmit);
        this.view.unbindAddInput(this.handleAddInput);
        this.view.unbindRemoveInput(this.handleRemoveInput);
        this.view.unbindCloseModal(this.handleCloseModal);
    };

    bindRecipeHandlers = () => {
        this.view.bindCloseModal(this.handleCloseModal);
    };

    unbindRecipeHandlers = () => {
        this.view.bindCloseModal(this.handleCloseModal);
    };
}
