export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.recipes = this.model.cache.contents;

        this.bindDefaultHandlers();

        this.view.loadRecipeViews(this.recipes);
    }

    /* ---- MODAL EVENT HANDLERS ---- */
    handleCloseModal = () => {
        this.view.modal.close();
        this.view.unbindAllListeners();
        if (this.view.form) this.view.removeFormView();
        this.view.removeModalView();
        this.bindDefaultHandlers();
    };

    handleOpenRecipe = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        const recipeView = this.view.createRecipeView(recipe);
        this.view.createModalView(recipeView.fullRecipe);
        this.view.appendToRoot(this.view.modal.element);
        this.view.modal.open();
        this.bindRecipeHandlers();
    };

    /* ---- FORM EVENT HANDLERS ---- */
    handleOpenAddForm = () => {
        this.view.createFormView();
        this.view.form.populate();
        this.view.createModalView(this.view.form.element);
        this.view.appendToRoot(this.view.modal.element);
        this.view.modal.open();
        this.bindFormHandlers();
    };

    handleOpenEditForm = (event) => {
        const recipe = this.getRecipeFromEvent(event);

        if (this.view.modal) {
            this.view.modal.close();
            this.view.removeModalView();
        }
        this.view.createFormView(recipe);
        this.view.form.populate('edit', recipe);
        this.view.createModalView(this.view.form.element);
        this.view.appendToRoot(this.view.modal.element);
        this.view.modal.open();
        this.bindFormHandlers();
    };

    handleAddInput = (event) => {
        this.view.form.addTextInputsToFieldset(
            event.target.closest('fieldset')
        );
    };

    handleRemoveInput = (event) => {
        event.stopPropagation();
        this.view.form.removeTextInput(event.target);
    };

    handlePreviewImage = (event) => {
        const image = event.currentTarget.files[0];
        const alt = event.currentTarget.name.value;
        const recipe = this.getRecipeFromEvent(event);

        if (!this.view.form.getImagePreview().hasAttribute('data-populated')) {
            this.view.form.toggleImageAddButton();
            this.view.form.toggleImageRemoveButton();
        }
        this.view.form.setImagePreview(image, alt || recipe?.name);
    };

    handleResetImage = () => {
        const formValues = { ...this.createRecipeFromForm(), photo: null };
        this.view.form.reset();
        this.view.form.toggleImageRemoveButton();
        this.view.form.toggleImageAddButton();
        this.view.form.setImagePreview();
        this.view.form.populate(this.view.form.mode, formValues);
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const formValues = this.view.form.values;
        const recipe = this.createRecipeFromForm(formValues);
        const mode = this.view.form.mode;

        if (mode === 'add') {
            const recipeView = this.view.createRecipeView(recipe);
            this.model.addRecipe(recipe);
            this.view.addRecipeView(recipeView);
        } else if (mode === 'edit') {
            this.model.updateRecipe(recipe);
            this.view.updateRecipeView(recipe);
        }
        this.handleCloseModal();
    };

    /* ---- OPTIONS MENU EVENT HANDLERS ---- */
    handleDelete = (event) => {
        const recipe = this.getRecipeFromEvent(event);
        if (this.view.modal) this.handleCloseModal();
        this.model.deleteRecipe(recipe.id);
        this.view.deleteRecipeView(recipe.id);
    };

    handleOpenOptionsMenu = (event) => {
        const recipeId = this.view.getParentId(event.target);
        const recipeView = this.view.getRecipeView(recipeId);
        recipeView.openOptionsMenu();
    };

    handleCloseOptionsMenu = () => {
        const openMenu = this.view.getOpenOptionsMenu();
        const recipeId = this.view.getParentId(openMenu);
        const recipeView = this.view.getRecipeView(recipeId);
        recipeView.closeOptionsMenu();
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
        const recipeId = this.view.form.id || crypto.randomUUID();
        const existingRecipe = this.model.cache.get(recipeId) || null;
        const formData = this.view.form.values;
        const uploadedImage = formData.get('img-input') ?? null;
        let photo;

        if (uploadedImage?.size) {
            photo = uploadedImage;
        } else if (this.view.form.state !== 'reset' && existingRecipe?.photo) {
            photo = existingRecipe?.photo;
        } else {
            photo = null;
        }

        return {
            id: recipeId,
            name: formData.get('name'),
            description: formData.get('description') || null,
            ingredients: this.view.form.getFieldsetValues('ingredients'),
            instructions: this.view.form.getFieldsetValues('instructions'),
            photo,
        };
    }

    getRecipeFromEvent(event) {
        const recipeId = this.view.getParentId(event.target);
        const recipe = this.model.cache.get(recipeId);
        return recipe;
    }
}
