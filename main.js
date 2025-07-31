const addRecipeForm = document.getElementById('add-recipe');
const editRecipeForm = document.getElementById('edit-recipe');
const recipeListElement = document.querySelector('.recipe-list');
const modalOuterElement = document.querySelector('.modal-outer');
const modalInnerElement = document.querySelector('.modal-inner');

let recipes = [];


/* TODOs:
    - open modal or side menu to add recipes
    - Figure out a way to allow commas in ingredients and instructions fields--separate field for each step/ingredient?
    - Add search to filter list of recipes
    - Add support for images
    - New flow for editing recipes: Click '...' button in corner of card to see options
    - Only show caard w/ recipe name, ingredients, and image on main screen. click 'see more' to open modal to see full recipe.
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


function displayRecipes() {
    recipeListElement.innerHTML = '';

    const html = recipes.map((recipe) => 
        `<div class="recipe" data-id="${recipe.id}">
            <h2 class="recipe-name">${recipe.name}</h2>
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
    ).join('');

    recipeListElement.innerHTML = html;
}


function handleRecipeForm(event) {
    event.preventDefault();
    
    const recipe = {
        id: event.currentTarget.dataset.id || crypto.randomUUID(),
        name: event.currentTarget.name.value, 
        description: event.currentTarget.description.value,
        ingredients: getArrayFromInput(event.currentTarget.ingredients.value),
        instructions: getArrayFromInput(event.currentTarget.instructions.value)
    };
    
    event.target.reset();
    return recipe;
}


function handleSubmit(event) {
    const recipe = handleRecipeForm(event);
    addRecipe(recipe);
}


function handleUpdate(event) {
    const recipe = handleRecipeForm(event);
    updateRecipe(recipe);
}


function closeModal() {
    modalOuterElement.classList.remove('open');
}

function getArrayFromInput(text) {
    return text.split(',').map((item) => item.trim());
}


function handleRecipeClick(event) {
    try {

        const recipeId = event.target.closest('.recipe').dataset.id;

        if (event.target.matches('button.edit-recipe')) {
            console.log('edit button clicked');
            const recipe = recipes.find((recipe) => recipe.id === recipeId);

            editRecipeForm.name.value = recipe.name;
            editRecipeForm.description.value = recipe.description;
            editRecipeForm.ingredients.value = recipe.ingredients;
            editRecipeForm.instructions.value = recipe.instructions;
            
            modalOuterElement.classList.add('open');
            editRecipeForm.setAttribute('data-id', recipeId);
        }
        
        if (event.target.matches('button.delete-recipe')) {
            deleteRecipe(recipeId);
        }
    } catch(error) {
        console.log(error);
    }
}


function handleModalClick(event) {
    const isInside = event.target.closest('.modal-inner');

    if (
        !isInside 
        || event.target.matches('button[name="cancel"]')
        || event.target.matches('button[name="save"]')
    ) {
        closeModal();
    }
}


addRecipeForm.addEventListener('submit', handleSubmit);
editRecipeForm.addEventListener('submit', handleUpdate);
editRecipeForm.addEventListener('click', handleModalClick);
recipeListElement.addEventListener('click', handleRecipeClick);
recipeListElement.addEventListener('recipesUpdated', displayRecipes);
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
            name: 'millionaire pound cake',
            description: 'why a millionaire pound cake?  because it\'s super rich!  this scrumptious cake is the pride of an elderly belle from jackson, mississippi.  the recipe comes from "the glory of southern cooking" by james villas.',
            instructions: [
                'preheat the oven to 300 degrees',
                'grease a 10-inch tube pan with butter, dust the bottom and sides with flour, and set aside',
                'in a large mixing bowl, cream the butter and sugar with an electric mixer and add the eggs one at a time, beating after each addition', 
                'alternately add the flour and milk, stirring till the batter is smooth',
                'add the two extracts and stir till well blended',
                'scrape the batter into the prepared pan and bake till a cake tester or knife blade inserted in the center comes out clean , about 1 1 / 2 hours', 
                'cool the cake in the pan on a rack for 5 minutes , then turn it out on the rack to cool completely'
            ],
            ingredients: ['butter', 'sugar', 'eggs', 'all-purpose flour', 'whole milk', 'pure vanilla extract', 'almond extract'],
        },
        {
            id: crypto.randomUUID(),
            name: 'berry french toast  oatmeal',
            description: 'the first time i made oatmeal this way i thought it tasted like french toast topped with berries...thus the name! :) use whichever kind of berries you like...my personal favorite is cherries.',
            instructions: ['add 1 / 2 cup old-fashioned oats and 1 cup water into a large microwaveable bowl', 'cook in microwave on 50% power for 6 minutes', 'place frozen berries in small bowl and defrost in microwave until the juice from the berries is released', 'add defrosted berries , sugar free syrup , butter spray , and flax seed together and stir well', 'enjoy !'],
            ingredients : ['old fashioned oats', 'water', 'berries', 'ground flax seeds', 'sugar-free syrup', 'i can\'t believe it\'s not butter spread'],
        }, 
        {
            id: crypto.randomUUID(),
            name: 'blepandekager danish apple pancakes',
            description: 'this recipe was found at website: mindspring.com - christian\'s danish recipes',
            instructions: [
                'beat the eggs lightly and add the milk',
                'combine the flour , sugar and salt',
                'stir the flour mixture into the egg mixture , stirring in the cup of cream as you mix',
                'fry the apple slices in butter in a skillet',
                'preheat oven to 500 degree',
                'cover the bottom of an oven-proof baking dish , or heavy skillet , with apples',
                'pour the batter over slices and bake in a preheated 500 oven',
                'when nearly done, remove from oven and sprinkle here and there with a mixture of sugar and cinnamon to taste', 'place dabs of butter on the pancake and return to oven until browned', 'just before serving , sprinkle with lemon juice , and cut into triangles'],
            ingredients: ['eggs', 'milk', 'flour', 'sugar', 'salt', 'cream', 'apples', 'butter', 'cinnamon', 'lemon, juice of'],
        }]
    ));
}
    
// preloadData();
restoreFromLocalStorage();
