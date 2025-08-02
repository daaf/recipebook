const addRecipeButton = document.querySelector('#add-recipe');
const recipeForm = document.querySelector('#add-update-recipe');
const ingredientsFieldset = recipeForm.querySelector('fieldset#ingredients');
const instructionsFieldset = recipeForm.querySelector('fieldset#instructions');
const addMoreFieldsButtons = recipeForm.querySelectorAll('fieldset>button');
const recipeListElement = document.querySelector('.recipe-list');
const modalOuterElement = document.querySelector('.modal-outer');
const modalInnerElement = document.querySelector('.modal-inner');
const modalHeader = modalInnerElement.querySelector('h2');


let recipes = [];


/* TODOs:
    - Allow users to upload images for recipes. Store images (perhaps all recipe data) in IndexedDb
    - Add search to filter list of recipes
    - Add support for images
    - New flow for editing recipes: Click '...' button in corner of card to see options
    - Only show card w/ recipe name, ingredients, and image on main screen. click 'see more' to open modal to see full recipe.
    - Format recipe text: Capitalize first letter of each field, undoubtedly more...
    - All styling :)
*/



/* ---------- MOVE DATA TO/FROM STORAGE ---------- */

function restoreRecipesFromLocalStorage() {
    const storedRecipes = JSON.parse(localStorage.getItem('recipes'));

    if (storedRecipes && storedRecipes.length) {
        recipes.push(...storedRecipes);
        recipeListElement.dispatchEvent(new CustomEvent('recipesUpdated'));
    }
}


function mirrorRecipesToLocalStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}



/* ---------- MANIPULATE DATA IN MEMORY ---------- */

function addRecipe(recipe) {
    recipes.push(recipe);
    recipeListElement.dispatchEvent(new CustomEvent('recipesUpdated'));
}


function updateRecipe(recipe) {
    const recipeToUpdateIndex = recipes.findIndex((existingRecipe) => existingRecipe.id === recipe.id);
    recipes[recipeToUpdateIndex] = recipe;
    recipeListElement.dispatchEvent(new CustomEvent('recipesUpdated'));
}


function deleteRecipe(id) {
    recipes = recipes.filter((recipe) => recipe.id !== id);
    recipeListElement.dispatchEvent(new CustomEvent('recipesUpdated'));
}



/* ---------- GET DATA IN MEMORY ---------- */

const getRecipeById = (recipeId) => recipes.find((recipe) => recipe.id === recipeId);



/* ---------- DEFINE UI COMPONENTS ---------- */

const getTextInputHtml = ({classList, name, value}) => 
    `<input type="text" class="${classList}" name="${name}" value="${value}" />`;


const getTextInputSetHtml = (count, {classList, nameStart}, values) => 
    Array.from({length: count})
        .map((_, index) => 
            getTextInputHtml({
                classList,
                name: nameStart + index,
                value: values[index] || "",
            }
        ))
        .join('');


function getRecipeCardHtml(recipe) {
    return `<div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-card-img-container" >
                    <img src="${recipe.photo || './assets/icons/fast-food-100.png'}" ${recipe.photo ? '' : 'class="placeholder"'} alt="${recipe.name}" />
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
                    <ul class="recipe-ingredients">${recipe.ingredients.map((ingredient) => 
                        `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
            </div>`
}


function getRecipeListHtml() {
    return recipes.map(getRecipeCardHtml).join('');
}



/* ---------- UPDATE THE DOM BASED ON DATA ---------- */

/* Update state of recipe options menu */

function toggleOptionsMenu(event) {
    const seeOptionsButton = event.target.closest('.recipe-card').querySelector('.see-options');
    const optionsElement = event.target.closest('.recipe-card').querySelector('.options');
    seeOptionsButton.classList.toggle('menu-open')
    optionsElement.classList.toggle('show');
}


/* Update state of recipe list */

function displayRecipeCards() {
    const html = getRecipeListHtml();
    recipeListElement.innerHTML = html;
}


/* Update state of recipe form */

const clearFieldsFromFieldset = (fieldset) => 
    [...fieldset.querySelectorAll('input')]
        .forEach((input) => input.remove());


function clearRecipeForm() {
    recipeForm.removeAttribute('data-id');
    [ingredientsFieldset, instructionsFieldset].forEach(clearFieldsFromFieldset);
    recipeForm.reset();
}


function addFieldsToFieldset(fieldset, values=[null]) {
    const newInputCount = getInputCountFromColumnCount(fieldset, values);
    const attributes = getInputAttributesFromFieldset(fieldset);
    const newFieldsHtml = getTextInputSetHtml(newInputCount, attributes, values) 

    fieldset.insertAdjacentHTML('beforeend', newFieldsHtml)
}


function populateAddForm() {
    modalHeader.textContent = 'New recipe';
    addFieldsToFieldset(ingredientsFieldset, Array.from({length: 8}));
    addFieldsToFieldset(instructionsFieldset, Array.from({length: 4}));
}


function populateEditForm(recipeId) {
    const recipe = getRecipeById(recipeId);
    
    modalHeader.textContent = 'Edit recipe';
    recipeForm.setAttribute('data-id', recipeId);
    recipeForm.name.value = recipe.name;
    recipeForm.description.value = recipe.description;

    addFieldsToFieldset(ingredientsFieldset, recipe.ingredients);
    addFieldsToFieldset(instructionsFieldset, recipe.instructions);
}


/* Update state of modal */

const closeModal = () => modalOuterElement.classList.remove('open');


const openModal = () => modalOuterElement.classList.add('open');



/* ---------- GET DATA FROM THE DOM ---------- */

const getInputsInFieldset = (fieldset) => [...fieldset.children]
    .filter((element) => element.matches('input'));


const getValuesFromFieldset = (fieldset) => getInputsInFieldset(fieldset)
    .filter((input) => input.value)
    .map((input) => input.value);


const getValuesFromForm = (form) => ({
    id: form.dataset.id || crypto.randomUUID(),
    name: form.name.value, 
    description: form.description.value,
    ingredients: getValuesFromFieldset(ingredientsFieldset),
    instructions: getValuesFromFieldset(instructionsFieldset),
});



/* ---------- GET THE STATE OF THE DOM ---------- */

const roundUpToFillColumns = (initialFieldCount, columnCount) => 
    Math.ceil(initialFieldCount / columnCount) * columnCount;


const getGridColumnCount = (element) => getComputedStyle(element)
    .gridTemplateColumns
    .split(' ')
    .length;


function getInputCountFromColumnCount(fieldset, values) {
    const columnCount = getGridColumnCount(fieldset);
    const newInputCount = roundUpToFillColumns(values.length, columnCount);
    return newInputCount
}


function getInputAttributesFromFieldset(fieldset) {
    const inputs = fieldset.querySelectorAll('input');
    const lastExtantInputName = inputs[inputs.length - 1]?.name;
    const classList = fieldset.dataset.childClassList;
    const nameStart = lastExtantInputName ? (Number(lastExtantInputName) + 1) : 0;
    return {nameStart, classList}
}



/* ---------- EVENT HANDLERS ---------- */

/* Third-tier event handlers */

function handleSave(event) {
    event.preventDefault();
    return getValuesFromForm(event.currentTarget);
}



/* Second-tier event handlers */

function handleAdd(event) {
    const recipe = handleSave(event);
    addRecipe(recipe);
}


function handleUpdate(event) {
    const recipe = handleSave(event);
    updateRecipe(recipe);
}


function handleEditClick(event, recipeId) {
    toggleOptionsMenu(event);
    populateEditForm(recipeId);
    openModal();
}


function handleDeleteClick(event, recipeId) {
    toggleOptionsMenu(event);
    deleteRecipe(recipeId);
}


const handleAddInputClick = (event) => {
    const previousSibling = event.target.previousElementSibling;
    
    if (previousSibling.matches('fieldset')) {
        addFieldsToFieldset(event.target.previousElementSibling)
    }
};


function handleModalClose() {
    clearRecipeForm();
    closeModal();
}



/* First-tier event handlers (mostly for delegation) */

function handleAddRecipeClick() {
    populateAddForm();
    openModal();
}


function handleRecipeClick(event) {
    const recipeId = event.target.closest('.recipe-card')?.dataset.id;

    if (event.target.matches('.see-options')) {
        toggleOptionsMenu(event);
    } else if (event.target.matches('.edit-recipe')) {
        handleEditClick(event, recipeId)
    } else if (event.target.matches('.delete-recipe')) {
        handleDeleteClick(event, recipeId);
    }
}


function handleModalClick(event) {
    const isInInnerModal = event.target.closest('.modal-inner');

    if (
        !isInInnerModal 
        || event.target.matches('button[name="cancel"]')
    ) {
        handleModalClose();

    } else if (event.target.matches('.add-input')) {
        handleAddInputClick(event);
    }
}


const handleKeyDown = (event) => {(event.key === 'Escape') && handleModalClose()};


function handleFormSubmission(event) {
    if (event.currentTarget.dataset.id) {
        handleUpdate(event);
    } else {
        handleAdd(event);
    }
    handleModalClose();
}



/* ---------- EVENT LISTENERS ---------- */

addRecipeButton.addEventListener('click', handleAddRecipeClick);
recipeForm.addEventListener('submit', handleFormSubmission);
recipeListElement.addEventListener('click', handleRecipeClick);
recipeListElement.addEventListener('recipesUpdated', displayRecipeCards);
recipeListElement.addEventListener('recipesUpdated', mirrorRecipesToLocalStorage);
modalOuterElement.addEventListener('click', handleModalClick);
window.addEventListener('keydown', handleKeyDown);



/* ---------- INITIALIZATION ---------- */

restoreRecipesFromLocalStorage();
