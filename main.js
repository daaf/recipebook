import Database from './Database.js';
import Cache from './Cache.js';
import Modal from './Modal.js';
import Form from './Form.js';
import OptionsMenu from './OptionsMenu.js';

const addRecipeButton = document.querySelector('#add-recipe');
const recipeListElement = document.querySelector('.recipe-list');

/*---------- CREATE IN-MEMORY CACHE ----------*/
const cache = new Cache();

/*---------- CONNECT TO DATABASE ----------*/
const db = new Database();
await db.connect();

/* TODOs:
- IDEA! Pattern to keep cache and db in sync:
    - Listen for both `cacheUpdated` and a yet-to-be-created event `dbUpdated`,
    - Only rerender if both events are fired. Or something like that.
      Basically, make critical operations dependent on both events firing 
      as a way to guarantee the two data stores stay in sync.
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

const modal = new Modal();
const form = new Form();

const getLiHtml = (text) => `<li>${text}</li>`;

function getRecipeCardHtml(recipe) {
    let imgSrc = './assets/icons/fast-food-100.png';

    if (recipe.photo instanceof Blob) {
        try {
            imgSrc = URL.createObjectURL(recipe.photo);
        } catch (error) {
            console.warn('Failed to create image URL from photo Blob', error);
        }
    }

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

function getRecipeHtml(recipe) {
    let imgSrc = './assets/icons/fast-food-100.png';

    if (recipe.photo instanceof Blob) {
        try {
            imgSrc = URL.createObjectURL(recipe.photo);
        } catch (error) {
            console.warn('Failed to create image URL from photo Blob', error);
        }
    }

    return `<div class="recipe" data-id="${recipe.id}">
            <img src="${imgSrc}" ${
        recipe.photo ? '' : 'class="placeholder"'
    } alt="${recipe.name}" />
            <h2 class="recipe-name">${recipe.name}</h2>
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
            <button class="delete-recipe">Delete</button>
        </div>`;
}

/* ---------- UPDATE THE STATE OF THE DOM ---------- */

/* Update state of recipe list */

function displayRecipeCards() {
    const html = getRecipeCardListHtml(cache.contents);
    recipeListElement.innerHTML = html;
}

function displayAddForm() {
    modal.header = 'New recipe';
    form.populate();
    modal.toggleState();
}

function displayEditForm(recipeId) {
    modal.header = 'Edit recipe';
    const recipe = cache.get(recipeId);
    form.populate(recipe);
    modal.toggleState();
}

function displayRecipe(recipeId) {
    const recipe = cache.get(recipeId);
    modal.header = `${recipe.name}`;
    modal.innerHtml = getRecipeHtml(recipe);
    modal.toggleState();
}

/* ---------- EVENT HANDLERS ---------- */

/* Recipe card event handlers */

function handleRecipeClick(event) {
    const optionsMenu = new OptionsMenu(event);
    const recipeId = event.target.closest('.recipe-card')?.dataset.id;

    if (event.target.closest('.recipe-card-img-container')) {
        displayRecipe(recipeId);
        return;
    }

    if (event.target.matches('.see-options')) {
        optionsMenu.toggleState();
        return;
    }

    if (event.target.matches('.edit-recipe')) {
        displayEditForm(recipeId);
        optionsMenu.toggleState();
    } else if (event.target.matches('.delete-recipe')) {
        deleteRecipe(recipeId);
        optionsMenu.toggleState();
    }
}

/* Modal event handlers */

function handleModalClick(event) {
    const isInInnerModal = event.target.closest('.modal-inner');

    if (!isInInnerModal || event.target.matches('button[name="cancel"]')) {
        modal.close();
        form.clear();
    } else if (event.target.matches('.add-input')) {
        form.addInputs(event.target);
    }
}

const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        modal.close();
        form.clear();
    }
};

/* Form event handlers */

function handleImageUpload() {
    const img = form.imgInput.files[0];

    if (img) {
        form.imgPreview.src = URL.createObjectURL(img);
    } else {
        form.imgPreview.src = '';
    }
}

function getPhoto(formValues) {
    // Prefer a valid Blob from the form
    if (formValues.photo instanceof Blob) {
        return formValues.photo;
    }

    // Fallback: check cache for a preexisting
    const cachedRecipe = cache.get(formValues.id);
    if (cachedRecipe?.photo instanceof Blob) {
        return cachedRecipe.photo;
    }

    // Otherwise, return null
    return null;
}

function handleFormSubmission(event) {
    event.preventDefault();

    const data = form.getValues();
    const recipe = { ...data, photo: getPhoto(data) };

    if (form.id) {
        updateRecipe(recipe);
    } else {
        addRecipe(recipe);
    }
    modal.close();
    form.clear();
}

/* ---------- EVENT LISTENERS ---------- */

addRecipeButton.addEventListener('click', displayAddForm);
form.imgInput?.addEventListener('change', handleImageUpload);
form.element?.addEventListener('submit', handleFormSubmission);
recipeListElement.addEventListener('click', handleRecipeClick);
modal.outer.addEventListener('click', handleModalClick);
window.addEventListener('cacheUpdated', displayRecipeCards);
window.addEventListener('keydown', handleKeyDown);

/* ---------- INITIALIZATION ---------- */

await cache.restoreFromDatabase(db);
