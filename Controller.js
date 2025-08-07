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
        this.view.openRecipe(recipe);
        this.view.openModal();
        this.bindRecipeHandlers();
    };

    /* ---- FORM EVENT HANDLERS ---- */
    handleOpenAddForm = () => {
        this.view.openForm();
        this.view.openModal();
        this.bindFormHandlers();
    };

    handleOpenEditForm = (recipeId) => {
        const recipe = this.model.cache.get(recipeId);
        this.view.closeModal();
        this.view.closeOptionsMenu(recipeId);
        this.view.openForm('edit', recipe);
        this.view.openModal();
        this.bindFormHandlers();
    };

    handleAddInput = (fieldsetId) => {
        this.view.addTextInputsToFieldset(fieldsetId);
    };

    handlePreviewImage = (image) => {
        this.view.setImagePreview(image);
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const formValues = this.view.getFormValues();
        const recipe = this.createRecipeFromForm(formValues);
        const mode = this.view.form.dataset.mode;

        if (mode === 'add') {
            this.model.addRecipe(recipe);
            this.view.addRecipeCard(recipe);
        } else if (mode === 'edit') {
            this.model.updateRecipe(recipe);
            this.view.updateRecipeCard(recipe);
        }
        this.view.closeModal();
    };

    bindFormHandlers = () => {
        this.view.bindPreviewImage(this.handlePreviewImage);
        this.view.bindAddInput(this.handleAddInput);
        this.view.bindSubmit(this.handleSubmit);
        this.view.bindCloseModal(this.handleCloseModal);
    };

    unbindFormHandlers = () => {
        this.view.unbindPreviewImage(this.handlePreviewImage);
        this.view.unbindSubmit(this.handleSubmit);
        this.view.unbindAddInput(this.handleAddInput);
        this.view.unbindCloseModal(this.handleCloseModal);
    };

    bindRecipeHandlers = () => {
        this.view.bindCloseModal(this.handleCloseModal);
    };

    unbindRecipeHandlers = () => {
        this.view.bindCloseModal(this.handleCloseModal);
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
        const recipeId = this.view.form.dataset.id || crypto.randomUUID();
        const existingRecipe = this.model.cache.get(recipeId) || null;

        const formData = this.view.getFormValues();
        const uploadedPhoto = formData.get('img-input') ?? null;

        return {
            id: recipeId,
            name: formData.get('name'),
            description: formData.get('description') || null,
            ingredients: this.view.getFieldsetValues('ingredients'),
            instructions: this.view.getFieldsetValues('instructions'),
            photo: uploadedPhoto || existingRecipe?.photo || null,
        };
    }
}
