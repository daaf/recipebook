import {
    createElement,
    createSanitizedProxy,
    encodeAttribute,
    getImageSrc,
    recipeValidator,
} from './utils.js';
import config from './config.js';

export default class RecipeView {
    constructor(recipe) {
        this.recipe = recipe;
        this.fullRecipe = this.createFullRecipe(recipe);
        this.card = this.createRecipeCard(this.recipe);
        this.optionsMenu = this.card.querySelector('.options');
    }

    createFullRecipe(sanitizedData) {
        const div = createElement('div', {
            class: 'recipe',
            'data-id': sanitizedData.id,
        });

        const imgSrc =
            getImageSrc(sanitizedData.photo) || config.DEFAULT_IMG_SRC;

        div.innerHTML = `
        <h2>${sanitizedData.name}</h2>
        <img src="${imgSrc}" class="${
            sanitizedData.photo ? '' : 'placeholder'
        }" alt="${encodeAttribute(sanitizedData.name)}" />
        ${
            sanitizedData.description
                ? `<p>${sanitizedData.description}</p>`
                : ''
        }
        <section>
            <h3>Ingredients</h3>
            <ul class="recipe-ingredients">${sanitizedData.ingredients
                .map((ingredient) => `<li>${ingredient}</li>`)
                .join('')}</ul>
        </section>
        <section>
        <h3>Instructions</h3>
            <ol class="recipe-instructions">${sanitizedData.instructions
                .map((step) => `<li>${step}</li>`)
                .join('')}</ol>
        </section>
                <div class="modal-actions">
                    <button class="delete-recipe button-danger">Delete</button>
                    <button class="edit-recipe button-primary">Edit</button>
                </div>
                `;

        return div;
    }

    createRecipeCard(sanitizedData) {
        const div = createElement('div', {
            class: 'recipe-card',
            'data-id': sanitizedData.id,
        });

        const imgSrc =
            getImageSrc(sanitizedData.photo) || config.DEFAULT_IMG_SRC;

        div.innerHTML = `
            <div class="img-container" >
                <img src="${imgSrc}" class="${
            sanitizedData.photo ? '' : 'placeholder'
        }" alt="${encodeAttribute(sanitizedData.name)}" />
            </div>
            <div class="recipe-card-body">
                <div class="recipe-card-header">
                    <h2 class="recipe-name">${sanitizedData.name}</h2>
                    <div class="options-dropdown">
                        <input type="image" src="./assets/icons/3-dots_black.png" class="see-options" aria-label="See more options" name="options" />
                        <div class="options">
                            <a class="edit-recipe">Edit</a>
                            <a class="delete-recipe">Delete</a>
                        </div>
                    </div>
                </div>
                <ul class="recipe-ingredients">${sanitizedData.ingredients
                    .map((ingredient) => `<li>${ingredient}</li>`)
                    .join('')}
                </ul>
                </div>
                <a href="#" class="read-more">Read more &rarr;</a>`;

        return div;
    }

    updateCard(card) {
        const image = card.querySelector('img');
        const cardHeader = card.querySelector('h2');
        const ingredientsUL = card.querySelector('ul');

        if (this.recipe.photo) {
            image.src = getImageSrc(this.recipe.photo);
            image.classList?.remove('placeholder');
        } else {
            image.src = config.DEFAULT_IMG_SRC;
            image.classList.add('placeholder');
        }

        cardHeader.textContent = this.recipe.name;
        ingredientsUL.innerHTML = '';

        this.recipe.ingredients.forEach((ingredient) => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsUL.appendChild(li);
        });
    }

    openOptionsMenu() {
        this.optionsMenu.classList.add('show');
    }

    closeOptionsMenu() {
        this.optionsMenu.classList.remove('show');
    }
}
