const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];
let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};

// Select grid container
const grid = document.querySelector('.meal-grid');

if (grid) {
  days.forEach(day => {
    meals.forEach(meal => {
      const div = document.createElement('div');
      div.classList.add('meal-cell');
      div.innerHTML = `
        <strong>${day} - ${meal}</strong><br>
        <span>${mealPlan[day]?.[meal] || 'Click to add'}</span><br>
        <button class="clear-button" style="display: ${mealPlan[day]?.[meal] ? 'inline-block' : 'none'};">Clear</button>
      `;

      // Add event listener for selecting a recipe
      div.querySelector('span').addEventListener('click', () => selectRecipe(day, meal, div));

      // Add event listener for clearing a meal slot
      const clearButton = div.querySelector('.clear-button');
      clearButton.addEventListener('click', (event) => {
        event.stopPropagation();
        clearMeal(day, meal, div);
      });

      grid.appendChild(div);
    });
  });
} else {
  console.error('Meal grid container not found.');
}

// Function to clear a meal slot
function clearMeal(day, meal, element) {
  if (mealPlan[day]) {
    delete mealPlan[day][meal];
    if (Object.keys(mealPlan[day]).length === 0) {
      delete mealPlan[day];
    }
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }

  element.querySelector('span').textContent = 'Click to add';
  element.querySelector('.clear-button').style.display = 'none';

  // Update grocery list after clearing a meal
  updateGroceryList();
}

// Function to select a recipe
function selectRecipe(day, meal, element) {
  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  const recipeName = prompt(`Enter recipe name (${recipes.map(r => r.name).join(', ')}):`);
  const recipe = recipes.find(r => r.name.toLowerCase() === recipeName.toLowerCase());

  if (recipe) {
    if (!mealPlan[day]) mealPlan[day] = {};
    mealPlan[day][meal] = recipe.name;
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));

    element.querySelector('span').textContent = recipe.name;
    element.querySelector('.clear-button').style.display = 'inline-block';

    // Update grocery list after selecting a recipe
    updateGroceryList();
  }
}

// Function to show recipe recommendations
function showRecommendations() {
  const pantry = JSON.parse(localStorage.getItem('pantry')) || [];
  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  const pantryIngredients = pantry.map(item => item.name.toLowerCase());

  const recommendations = recipes.map(recipe => {
    const overlap = recipe.ingredients.filter(ingredient =>
      pantryIngredients.includes(ingredient.toLowerCase())
    ).length;
    return { name: recipe.name, overlap };
  }).sort((a, b) => b.overlap - a.overlap); // Sort by overlap

  const recommendationList = document.getElementById('recommendationList');
  if (recommendationList) {
    recommendationList.innerHTML = '';
    recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = `${rec.name} (Overlap: ${rec.overlap})`;
      recommendationList.appendChild(li);
    });
  }
}

function updateGroceryList() {
  const pantry = JSON.parse(localStorage.getItem('pantry')) || [];
  const pantryIngredients = pantry.map(item => item.name.toLowerCase());
  const groceryList = {};

  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];

  // Go through the meal plan to find all required ingredients
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(recipeName => {
      const recipe = recipes.find(r => r.name === recipeName);
      if (recipe) {
        recipe.ingredients.forEach(ingredientEntry => {
          // Split ingredient into parts
          const parts = ingredientEntry.split(' ');
          let amount = 0;
          let unit = '';
          let ingredientName = '';

          // Handle cases where the ingredient might not have an amount or unit
          if (parts.length > 2) {
            amount = parseFraction(parts[0]);
            unit = parts[1];
            ingredientName = parts.slice(2).join(' ').toLowerCase();
          } else if (parts.length === 2) {
            amount = parseFraction(parts[0]);
            ingredientName = parts[1].toLowerCase();
          } else {
            ingredientName = parts[0].toLowerCase();
          }

          // Ignore ingredients already in the pantry
          if (!pantryIngredients.includes(ingredientName)) {
            // Initialize if ingredient not yet in groceryList
            if (!groceryList[ingredientName]) {
              groceryList[ingredientName] = { amount: 0, unit: unit };
            }

            // Add the amount to the total
            groceryList[ingredientName].amount += amount;
          }
        });
      }
    });
  });

  // Display the grocery list
  const groceryListElement = document.getElementById('groceryList');
  if (groceryListElement) {
    groceryListElement.innerHTML = '';
    Object.keys(groceryList).forEach(ingredientName => {
      const { amount, unit } = groceryList[ingredientName];
      const li = document.createElement('li');
      li.textContent = `${amount} ${unit} ${ingredientName}`;
      groceryListElement.appendChild(li);
    });
  }
}

// Helper function to parse fractions and decimals
function parseFraction(fraction) {
  if (fraction.includes('/')) {
    const [numerator, denominator] = fraction.split('/').map(Number);
    return numerator / denominator;
  }
  return parseFloat(fraction) || 0;
}


// Initialize meal planner
showRecommendations();
updateGroceryList();
