import Database from './Database.js';
import Cache from './Cache.js';
import OptionsMenu from './OptionsMenu.js';

import { getObjectById } from './utils.js';

const addRecipeButton = document.querySelector('#add-recipe');
const recipeForm = document.querySelector('#add-update-recipe');
const imgInput = document.querySelector('#img-input');
const imgPreview = document.querySelector('#img-preview');
const ingredientsFieldset = recipeForm.querySelector('fieldset#ingredients');
const instructionsFieldset = recipeForm.querySelector('fieldset#instructions');
const recipeListElement = document.querySelector('.recipe-list');
const modalOuterElement = document.querySelector('.modal-outer');
const modalInnerElement = document.querySelector('.modal-inner');
const modalHeader = modalInnerElement.querySelector('h2');

/*---------- CREATE IN-MEMORY CACHE ----------*/
const cache = new Cache();

/*---------- CONNECT TO DATABASE ----------*/
const db = new Database();
await db.connect();

const fireUpdateEvent = () => {
    window.dispatchEvent(new CustomEvent('recipesUpdated'));
};

async function restoreRecipesFromDatabase() {
    const storedRecipes = await db.getAll();

    if (storedRecipes && storedRecipes.length) {
        // recipes.push(...storedRecipes);
        cache.add(...storedRecipes);
        console.log(storedRecipes);
    }
}

/* TODOs:
- Open modal to see full recipe. Triggered by:
    - Click on card image 
    - Click on e.g. 'see more' link at bottom of card
- Close recipe options menu on click outside
- Add search to filter list of recipes
- Format recipe text: Capitalize first letter of each field, undoubtedly more...
- All styling :)
*/

/* ---------- DATA OPERATIONS - BOTH IN-MEMORY & DATABASE ---------- */

function addRecipe(recipe) {
    cache.add(recipe);
    db.put(recipe);
}

function updateRecipe(recipe) {
    cache.update(recipe);
    db.put(recipe);
}

function deleteRecipe(id) {
    cache.delete(id);
    db.delete(id);
}

/* ---------- DEFINE UI COMPONENTS ---------- */

const getTextInputHtml = ({ classList, name, value }) =>
    `<input type="text" class="${classList}" name="${name}" value="${value}" />`;

const getTextInputSetHtml = (count, { classList, nameStart }, values) =>
    Array.from({ length: count })
        .map((_, index) =>
            getTextInputHtml({
                classList,
                name: nameStart + index,
                value: values[index] || '',
            })
        )
        .join('');

const getLiHtml = (text) => `<li>${text}</li>`;

function getRecipeCardHtml(recipe) {
    const imgSrc = recipe.photo
        ? URL.createObjectURL(recipe.photo)
        : './assets/icons/fast-food-100.png';

    return `<div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-card-img-container" >
                    <img src="${imgSrc}" ${
        recipe.photo ? '' : 'class="placeholder"'
    } alt="${recipe.name}" />
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
                        .map(getLiHtml)
                        .join('')}
                    </ul>
                </div>
            </div>`;
}

function getRecipeCardListHtml(recipes) {
    return recipes.map(getRecipeCardHtml).join('');
}

// function displayFullRecipe(recipe) {
//     const html =
//         `<div class="recipe" data-id="${recipe.id}">
//             <h2 class="recipe-name">${recipe.name}</h2>
//             <p>${recipe.description}</p>
//             <h3>Ingredients</h3>
//             <ul class="recipe-ingredients">${recipe.ingredients.map((ingredient) =>
//                 `<li>${ingredient}</li>`).join('')}</ul>
//             <h3>Instructions</h3>
//             <ol class="recipe-instructions">${
//                 recipe.instructions.map((step) => `<li>${step}</li>`).join('')
//             }</ol>
//             <button class="edit-recipe">Edit</button>
//             <button class="delete-recipe">Delete</button>
//         </div>`
//     // display in modal??
// }

/* ---------- UPDATE THE STATE OF THE DOM ---------- */

/* Update state of recipe options menu */

/* Update state of recipe list */

function displayRecipeCards() {
    const html = getRecipeCardListHtml(cache.contents);
    recipeListElement.innerHTML = html;
}

/* Update state of recipe form */

const clearImagePreview = () => (imgPreview.src = '');

const clearFieldsFromFieldset = (fieldset) =>
    [...fieldset.querySelectorAll('input')].forEach((input) => input.remove());

function clearRecipeForm() {
    recipeForm.reset();
    recipeForm.removeAttribute('data-id');
    clearImagePreview();
    [ingredientsFieldset, instructionsFieldset].forEach(
        clearFieldsFromFieldset
    );
}

function addFieldsToFieldset(fieldset, values = [null]) {
    const newInputCount = getInputCountBasedOnColumnCount(fieldset, values);
    const attributes = getInputAttributesBasedOnFieldset(fieldset);
    const newFieldsHtml = getTextInputSetHtml(
        newInputCount,
        attributes,
        values
    );

    fieldset.insertAdjacentHTML('beforeend', newFieldsHtml);
}

function populateAddForm() {
    modalHeader.textContent = 'New recipe';
    addFieldsToFieldset(ingredientsFieldset, Array.from({ length: 8 }));
    addFieldsToFieldset(instructionsFieldset, Array.from({ length: 4 }));
}

function populateEditForm(recipeId) {
    const recipe = getObjectById(cache.contents, recipeId);

    modalHeader.textContent = 'Edit recipe';
    recipeForm.setAttribute('data-id', recipeId);
    recipeForm.name.value = recipe.name;
    recipeForm.description.value = recipe.description;

    addFieldsToFieldset(ingredientsFieldset, recipe.ingredients);
    addFieldsToFieldset(instructionsFieldset, recipe.instructions);
}

function displayAddForm() {
    populateAddForm();
    toggleModalState();
}

function displayEditForm(recipeId) {
    populateEditForm(recipeId);
    toggleModalState();
}

/* Update state of modal */

const toggleModalState = () => modalOuterElement.classList.toggle('open');

const closeModal = () => modalOuterElement.classList.remove('open');

/* ---------- GET DATA FROM THE DOM ---------- */

const getInputsInFieldset = (fieldset) =>
    [...fieldset.children].filter((element) => element.matches('input'));

const getValuesFromFieldset = (fieldset) =>
    getInputsInFieldset(fieldset)
        .filter((input) => input.value)
        .map((input) => input.value);

const getValuesFromForm = (form) => {
    const recipeId = form.dataset.id || crypto.randomUUID();
    const photoFile =
        imgInput.files[0] ||
        getObjectById(cache.contents, recipeId)?.photo ||
        null;

    return {
        id: recipeId,
        name: form.name.value,
        description: form.description.value,
        ingredients: getValuesFromFieldset(ingredientsFieldset),
        instructions: getValuesFromFieldset(instructionsFieldset),
        photo: photoFile,
    };
};

/* ---------- GET THE STATE OF THE DOM ---------- */

const roundUpToFillColumns = (initialFieldCount, columnCount) =>
    Math.ceil(initialFieldCount / columnCount) * columnCount;

const getGridColumnCount = (element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').length;

function getInputCountBasedOnColumnCount(fieldset, values) {
    const columnCount = getGridColumnCount(fieldset);
    const newInputCount = roundUpToFillColumns(values.length, columnCount);
    return newInputCount;
}

function getInputAttributesBasedOnFieldset(fieldset) {
    const inputs = fieldset.querySelectorAll('input');
    const lastExtantInputName = inputs[inputs.length - 1]?.name;
    const classList = fieldset.dataset.childClassList;
    const nameStart = lastExtantInputName ? Number(lastExtantInputName) + 1 : 0;
    return { nameStart, classList };
}

/* ---------- EVENT HANDLERS ---------- */

/* Recipe card event handlers */

function handleOptionsClick(event) {
    const optionsMenu = new OptionsMenu(event);
    optionsMenu.toggleState();
}

function handleEditClick(event) {
    const recipeId = event.target.closest('.recipe-card')?.dataset.id;
    handleOptionsClick(event);
    displayEditForm(recipeId);
}

function handleDeleteClick(event) {
    const recipeId = event.target.closest('.recipe-card')?.dataset.id;
    handleOptionsClick(event);
    deleteRecipe(recipeId);
}

function handleRecipeClick(event) {
    const recipeId = event.target.closest('.recipe-card')?.dataset.id;

    if (event.target.matches('.see-options')) {
        handleOptionsClick(event);
    } else if (event.target.matches('.edit-recipe')) {
        handleEditClick(event);
    } else if (event.target.matches('.delete-recipe')) {
        handleDeleteClick(event, recipeId);
    }
}

/* Modal event handlers */

function handleModalClose() {
    closeModal();
    clearRecipeForm();
}

const handleAddInput = (event) => {
    const previousSibling = event.target.previousElementSibling;

    if (previousSibling.matches('fieldset')) {
        addFieldsToFieldset(event.target.previousElementSibling);
    }
};

function handleModalClick(event) {
    const isInInnerModal = event.target.closest('.modal-inner');

    if (!isInInnerModal || event.target.matches('button[name="cancel"]')) {
        handleModalClose();
    } else if (event.target.matches('.add-input')) {
        handleAddInput(event);
    }
}

const handleKeyDown = (event) => {
    event.key === 'Escape' && handleModalClose();
};

/* Form event handlers */

function handleImagePreview() {
    const img = imgInput.files[0];

    if (img) {
        imgPreview.src = URL.createObjectURL(img);
    } else {
        imgPreview.src = '';
    }
}

function handleUpdate(event) {
    const recipe = getValuesFromForm(event.currentTarget);
    updateRecipe(recipe);
}

function handleAdd(event) {
    const recipe = getValuesFromForm(event.currentTarget);
    addRecipe(recipe);
}

function handleFormSubmission(event) {
    event.preventDefault();

    if (event.currentTarget.dataset.id) {
        handleUpdate(event);
    } else {
        handleAdd(event);
    }
    handleModalClose();
}

/* ---------- EVENT LISTENERS ---------- */

addRecipeButton.addEventListener('click', displayAddForm);
imgInput.addEventListener('change', handleImagePreview);
recipeForm.addEventListener('submit', handleFormSubmission);
recipeListElement.addEventListener('click', handleRecipeClick);
modalOuterElement.addEventListener('click', handleModalClick);
window.addEventListener('cacheUpdated', displayRecipeCards);
window.addEventListener('keydown', handleKeyDown);

/* ---------- INITIALIZATION ---------- */

restoreRecipesFromDatabase();
