// Load pantry and recipe data from localStorage
let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

// Function to remove a pantry item
function removePantryItem(index) {
  pantry.splice(index, 1); // Remove the item from the array
  localStorage.setItem('pantry', JSON.stringify(pantry)); // Update localStorage
  displayPantryItems(); // Refresh the list
}

// Function to group pantry items by category
function groupByCategory(items) {
  return items.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

// Display pantry items by category with delete buttons
function displayPantryItems(filteredItems = pantry) {
  const pantryCategories = document.getElementById('pantryCategories');
  pantryCategories.innerHTML = '';

  const grouped = groupByCategory(filteredItems);

  Object.keys(grouped).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    const header = document.createElement('div');
    header.classList.add('category-header');
    header.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    header.addEventListener('click', () => {
      itemsDiv.classList.toggle('open');
    });

    const itemsDiv = document.createElement('div');
    itemsDiv.classList.add('category-items');

    grouped[category].forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('item');
      itemDiv.innerHTML = `
        ${item.name} ${item.expiry ? `(Expires: ${item.expiry})` : '- No Expiry'}
        <button class="delete-btn" onclick="removePantryItem(${index})">Delete</button>
      `;
      itemsDiv.appendChild(itemDiv);
    });

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(itemsDiv);
    pantryCategories.appendChild(categoryDiv);
  });
}

// Display only the last 5 pantry items
function displayPantry() {
  const pantryList = document.getElementById('pantryList');
  pantryList.innerHTML = ''; // Clear current list

  const lastFiveItems = pantry.slice(-5); // Get the last 5 items
  lastFiveItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} (${item.category}) ${item.expiry ? `- Expires: ${item.expiry}` : '- No Expiry'}`;
    pantryList.appendChild(li);
  });
}

// Display only the last 5 recipes
function displayRecipes() {
  const recipeList = document.getElementById('recipeList');
  recipeList.innerHTML = ''; // Clear current list

  const lastFiveRecipes = recipes.slice(-5); // Get the last 5 recipes
  lastFiveRecipes.forEach(recipe => {
    const li = document.createElement('li');
    li.textContent = `${recipe.name} - Ingredients: ${recipe.ingredients.join(', ')}`;
    recipeList.appendChild(li);
  });
}

// Event listeners for adding pantry and recipe items
document.getElementById('addItemForm').addEventListener('submit', event => {
  event.preventDefault();
  const itemName = document.getElementById('itemName').value;
  const itemCategory = document.getElementById('itemCategory').value;
  const noExpiry = document.getElementById('noExpiry').checked;
  const expiryDate = noExpiry ? null : document.getElementById('expiryDate').value;

  pantry.push({ name: itemName, category: itemCategory, expiry: expiryDate });
  localStorage.setItem('pantry', JSON.stringify(pantry));
  event.target.reset();
  displayPantry();
});

document.getElementById('addRecipeForm').addEventListener('submit', event => {
  event.preventDefault();
  const recipeName = document.getElementById('recipeName').value;
  const recipeIngredients = document
    .getElementById('recipeIngredients')
    .value.split(',')
    .map(i => i.trim());
  const recipeInstructions = document.getElementById('recipeInstructions').value;

  // Collect tags from checkboxes
  const recipeTags = Array.from(
    document.querySelectorAll('input[name="tags"]:checked')
  ).map(tag => tag.value);

  recipes.push({
    name: recipeName,
    ingredients: recipeIngredients,
    instructions: recipeInstructions,
    tags: recipeTags,
  });

  localStorage.setItem('recipes', JSON.stringify(recipes));
  event.target.reset();
  displayRecipes();
});

// Helper functions for normalizing and merging ingredients
function normalizeIngredient(ingredient) {
  return ingredient.toLowerCase().trim();
}

function parseQuantity(ingredient) {
  const quantityRegex = /([\d/.\s]+)\s?([a-zA-Z]*)/;
  const match = ingredient.match(quantityRegex);

  if (match) {
    return {
      quantity: eval(match[1].replace(/\s+/g, '+')),
      unit: match[2] || '',
      name: ingredient.replace(match[0], '').trim(),
    };
  }

  return { quantity: 1, unit: '', name: ingredient };
}

function mergeIngredients(ingredients) {
  const ingredientMap = {};

  ingredients.forEach(ingredient => {
    const { quantity, unit, name } = parseQuantity(ingredient);
    const normalizedName = normalizeIngredient(name);

    if (!ingredientMap[normalizedName]) {
      ingredientMap[normalizedName] = { quantity, unit };
    } else {
      ingredientMap[normalizedName].quantity += quantity;
    }
  });

  return Object.entries(ingredientMap).map(([name, { quantity, unit }]) => {
    return `${quantity} ${unit} ${name}`.trim();
  });
}

// Updated displayFetchedRecipe and saveFetchedRecipe functions
function displayFetchedRecipe(recipe) {
  const ingredients = mergeIngredients(
    recipe.extendedIngredients?.map(ing => ing.original) || []
  );

  const fetchedRecipeDiv = document.getElementById('fetchedRecipe');
  fetchedRecipeDiv.innerHTML = `
    <h3>${recipe.title || 'No Title Available'}</h3>
    <p><strong>Ingredients:</strong> ${ingredients.join(', ') || 'No ingredients available'}</p>
    <p><strong>Instructions:</strong> ${recipe.instructions || 'No instructions provided.'}</p>
    <button id="saveRecipeButton">Save Recipe</button>
  `;

  document.getElementById('saveRecipeButton').addEventListener('click', () => saveFetchedRecipe(recipe));
}

function saveFetchedRecipe(recipe) {
  const ingredients = mergeIngredients(
    recipe.extendedIngredients?.map(ing => ing.original) || []
  );

  const newRecipe = {
    name: recipe.title,
    ingredients,
    instructions: recipe.instructions,
    tags: [],
  };

  recipes.push(newRecipe);
  localStorage.setItem('recipes', JSON.stringify(recipes));
  alert('Recipe saved!');
}

// Initial Display
displayPantry();
displayRecipes();
