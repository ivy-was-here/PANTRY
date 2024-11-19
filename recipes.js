// Function to display recipes
function displayRecipes() {
  const recipes = JSON.parse(localStorage.getItem('recipes')) || []; // Fetch recipes from localStorage
  const recipeList = document.getElementById('recipeList'); // Target the recipe list container

  if (recipeList) {
    recipeList.innerHTML = ''; // Clear any existing content

    recipes.forEach((recipe, index) => {
      const li = document.createElement('li');
      li.classList.add('recipe-item'); // Optional: Add a class for styling
      li.innerHTML = `
        <strong>${recipe.name}</strong>
        <button class="toggle-details">View Details</button>
        <div class="recipe-details" style="display: none;">
          <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
          <button class="delete-recipe" data-index="${index}">Delete</button>
        </div>
      `;

      // Add toggle functionality for details
      const toggleButton = li.querySelector('.toggle-details');
      const detailsDiv = li.querySelector('.recipe-details');
      toggleButton.addEventListener('click', () => {
        detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
      });

      // Add delete functionality
      const deleteButton = li.querySelector('.delete-recipe');
      deleteButton.addEventListener('click', () => {
        deleteRecipe(index);
      });

      recipeList.appendChild(li);
    });
  }
}

// Function to delete a recipe
function deleteRecipe(index) {
  const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
  recipes.splice(index, 1); // Remove recipe from the array
  localStorage.setItem('recipes', JSON.stringify(recipes)); // Save updated array to localStorage
  displayRecipes(); // Refresh the displayed list
}

// Initialize the recipe book page
displayRecipes();
