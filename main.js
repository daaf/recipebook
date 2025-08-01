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
let uploadedImage;

/* TODOs:
    - Allow users to upload images for recipes. Store images (perhaps all recipe data) in IndexedDb
    - Add search to filter list of recipes
    - New flow for editing recipes: Click '...' button in corner of card to see options
    - Only show card w/ recipe name, ingredients, and image on main screen. click 'see more' to open modal to see full recipe.
    - Format recipe text: Capitalize first letter of each field, undoubtedly more...
    - All styling :)
*/


function mirrorRecipesToLocalStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}


function restoreFromLocalStorage() {
    console.log('Restoring recipes from local storage...');
    const storedRecipes = JSON.parse(localStorage.getItem('recipes'));

    if (storedRecipes && storedRecipes.length) {
        recipes.push(...storedRecipes);
        recipeListElement.dispatchEvent(new CustomEvent('recipesUpdated'));
    } else {
        console.log('No recipes in local storage')
    }
}


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

function displayFullRecipe(recipe) {
    const html = 
        `<div class="recipe" data-id="${recipe.id}">
            <h2 class="recipe-name">${recipe.name}</h2>
            <p>${recipe.description}</p>
            <h3>Ingredients</h3>
            <ul class="recipe-ingredients">${recipe.ingredients.map((ingredient) => 
                `<li>${ingredient}</li>`).join('')}</ul>
            <h3>Instructions</h3>
            <ol class="recipe-instructions">${
                recipe.instructions.map((step) => `<li>${step}</li>`).join('')
            }</ol>
            <button class="edit-recipe">Edit</button>
            <button class="delete-recipe">Delete</button>
        </div>`
    // display in modal??
}


function displayRecipeCards() {
    const html = recipes.map((recipe) => 
        `<div class="recipe-card" data-id="${recipe.id}">
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
    ).join('');

    recipeListElement.innerHTML = html;
}

function addFieldsToFieldset(fieldset, values=[null]) {
    const columnCount = getComputedStyle(fieldset).gridTemplateColumns.split(' ').length;
    const newFieldCount = Math.ceil(values.length / columnCount) * columnCount;

    const inputs = fieldset.querySelectorAll('input');
    const lastInput = inputs[inputs.length - 1];

    const classList = fieldset.dataset.childClassList;
    const firstInputName = lastInput ? (Number(lastInput.name) + 1) : 0;

    const newFieldHtml = Array.from({length: newFieldCount})
        .map((_, index) => 
            `<input type="text" class="${classList}" name="${firstInputName + index}" value="${values[index] || ""}" />`
        ).join('');

    if (lastInput) {
        lastInput.insertAdjacentHTML('afterend', newFieldHtml)
    } else {
        fieldset.insertAdjacentHTML('afterbegin', newFieldHtml)
    }
}

function inputsInFieldset(fieldset) {
    return [...fieldset.children]
        .filter((element) => element.matches('input'));
}


function valuesInFieldset(fieldset) {
    return inputsInFieldset(fieldset)
        .filter((input) => input.value)
        .map((input) => input.value);
}


function handleSave(event) {
    event.preventDefault();
    
    const recipe = {
        id: event.currentTarget.dataset.id || crypto.randomUUID(),
        name: event.currentTarget.name.value, 
        description: event.currentTarget.description.value,
        ingredients: valuesInFieldset(ingredientsFieldset),
        instructions: valuesInFieldset(instructionsFieldset),
    };
    return recipe;
}


function handleAdd(event) {
    const recipe = handleSave(event);
    console.log(event)
    addRecipe(recipe);
}


function handleUpdate(event) {
    const recipe = handleSave(event);
    event.currentTarget.removeAttribute('data-id');
    updateRecipe(recipe);
}


function openModal() {
    modalOuterElement.classList.add('open');
}


function closeModal() {
    modalOuterElement.classList.remove('open');
    recipeForm.removeAttribute('data-id');

    [ingredientsFieldset, instructionsFieldset]
        .forEach((fieldset) => 
            [...fieldset.querySelectorAll('input')]
                .forEach((input) => 
                    input.remove()) );
    
    recipeForm.reset();
}

function populateAddForm() {
    modalHeader.textContent = 'New recipe';
    addFieldsToFieldset(ingredientsFieldset, Array.from({length: 8}));
    addFieldsToFieldset(instructionsFieldset, Array.from({length: 4}));
}

function populateEditForm(recipeId) {

    modalHeader.textContent = 'Edit recipe';
    
    const recipe = recipes.find((recipe) => recipe.id === recipeId);
        
    recipeForm.setAttribute('data-id', recipeId);
    recipeForm.name.value = recipe.name;
    recipeForm.description.value = recipe.description;

    addFieldsToFieldset(ingredientsFieldset, recipe.ingredients);
    addFieldsToFieldset(instructionsFieldset, recipe.instructions);
}

function toggleOptionsMenu(event) {
    const seeOptionsButton = event.target.closest('.recipe-card').querySelector('.see-options');
    const optionsElement = event.target.closest('.recipe-card').querySelector('.options');
    seeOptionsButton.classList.toggle('menu-open')
    optionsElement.classList.toggle('show');
}


function handleRecipeClick(event) {

    if (event.target.matches('.see-options')) {
        toggleOptionsMenu(event);
    }

    const recipeId = event.target.closest('.recipe-card')?.dataset.id;
    
    if (event.target.matches('.edit-recipe')) {
        toggleOptionsMenu(event);
        populateEditForm(recipeId);
        openModal();
    }
    
    if (event.target.matches('.delete-recipe')) {
        toggleOptionsMenu(event);
        deleteRecipe(recipeId);
    }
    
}


function handleModalClick(event) {
    const isInInnerModal = event.target.closest('.modal-inner');
    const parentFieldset = event.target.closest('fieldset');

    if (
        !isInInnerModal 
        || event.target.matches('button[name="cancel"]')
    ) {
        closeModal();
    } else if (parentFieldset) {
        addFieldsToFieldset(parentFieldset);
    }
}

function handleAddRecipeClick(event) {
    populateAddForm();
    openModal();
}


addRecipeButton.addEventListener('click', handleAddRecipeClick);
recipeForm.addEventListener('submit', (event) => {
    if (event.currentTarget.dataset.id) {
        handleUpdate(event);
    } else {
        handleAdd(event);
    }
    closeModal();
});
recipeListElement.addEventListener('click', handleRecipeClick);
recipeListElement.addEventListener('recipesUpdated', displayRecipeCards);
recipeListElement.addEventListener('recipesUpdated', mirrorRecipesToLocalStorage);
modalOuterElement.addEventListener('click', handleModalClick);
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});


function preloadData() {
    localStorage.setItem('recipes',  JSON.stringify(
        [{
            id: crypto.randomUUID(),
            name: 'Millionaire pound cake',
            description: 'Why a millionaire pound cake? Because it\'s super rich! This scrumptious cake is the pride of an elderly belle from Jackson, Mississippi. The recipe comes from "The Glory of Southern Cooking" by James Villas.',
            instructions: [
                'Preheat the oven to 300 degrees',
                'Grease a 10-inch tube pan with butter, dust the bottom and sides with flour, and set aside',
                'In a large mixing bowl, cream the butter and sugar with an electric mixer and add the eggs one at a time, beating after each addition', 
                'Alternately add the flour and milk, stirring till the batter is smooth',
                'Add the two extracts and stir till well blended',
                'Scrape the batter into the prepared pan and bake till a cake tester or knife blade inserted in the center comes out clean , about 1 1 / 2 hours', 
                'Cool the cake in the pan on a rack for 5 minutes, then turn it out on the rack to cool completely'
            ],
            ingredients: ['butter', 'sugar', 'eggs', 'all-purpose flour', 'whole milk', 'pure vanilla extract', 'almond extract'],
        },
        {
            id: crypto.randomUUID(),
            name: 'Berry french toast  oatmeal',
            description: 'the first time i made oatmeal this way i thought it tasted like french toast topped with berries...thus the name! :) use whichever kind of berries you like...my personal favorite is cherries.',
            instructions: ['Add 1/2 cup old-fashioned oats and 1 cup water into a large microwaveable bowl', 'Cook in microwave on 50% power for 6 minutes', 'Place frozen berries in small bowl and defrost in microwave until the juice from the berries is released', 'Add defrosted berries, sugar free syrup, butter spray, and flax seed together and stir well.', 'Enjoy!'],
            ingredients : ['old fashioned oats', 'water', 'berries', 'ground flax seeds', 'sugar-free syrup', 'i can\'t believe it\'s not butter spread'],
            photo: 'assets/recipes/berry-oatmeal.jpg',
        }, 
        {
            id: crypto.randomUUID(),
            name: 'blepandekager danish apple pancakes',
            description: 'this recipe was found at website: mindspring.com - christian\'s danish recipes',
            instructions: [
                'Beat the eggs lightly and add the milk',
                'Combine the flour , sugar and salt',
                'Stir the flour mixture into the egg mixture , stirring in the cup of cream as you mix',
                'Fry the apple slices in butter in a skillet',
                'Preheat oven to 500 degrees',
                'Cover the bottom of an oven-proof baking dish , or heavy skillet , with apples',
                'Pour the batter over slices and bake in a preheated 500 oven',
                'When nearly done, remove from oven and sprinkle here and there with a mixture of sugar and cinnamon to taste', 'place dabs of butter on the pancake and return to oven until browned', 'just before serving , sprinkle with lemon juice , and cut into triangles'],
            ingredients: ['eggs', 'milk', 'flour', 'sugar', 'salt', 'cream', 'apples', 'butter', 'cinnamon', 'lemon juice'],
            photo: 'assets/recipes/danish-apple-pancakes.jpg',
        }]
    ));
}
    
// preloadData();
restoreFromLocalStorage();
