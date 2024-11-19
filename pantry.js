const pantry = JSON.parse(localStorage.getItem('pantry')) || [];

// Helper function to group items by category
function groupByCategory(items) {
  return items.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

// Function to display pantry categories and items
function displayPantryItems(filteredItems = pantry) {
  const pantryCategories = document.getElementById('pantryCategories');
  pantryCategories.innerHTML = ''; // Clear current content

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

    grouped[category].forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('item');
      itemDiv.textContent = `${item.name} ${
        item.expiry ? `(Expires: ${item.expiry})` : '- No Expiry'
      }`;
      itemsDiv.appendChild(itemDiv);
    });

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(itemsDiv);
    pantryCategories.appendChild(categoryDiv);
  });
}

// Function to filter pantry items
function filterPantryItems() {
  const filter = document.getElementById('filterOptions').value;
  const now = new Date();

  let filteredItems = pantry;

  switch (filter) {
    case 'expiring1':
      filteredItems = pantry.filter(item => {
        if (!item.expiry) return false;
        const expiry = new Date(item.expiry);
        return expiry - now <= 7 * 24 * 60 * 60 * 1000;
      });
      break;
    case 'expiring2':
      filteredItems = pantry.filter(item => {
        if (!item.expiry) return false;
        const expiry = new Date(item.expiry);
        return expiry - now <= 14 * 24 * 60 * 60 * 1000;
      });
      break;
    case 'recentlyAdded':
      filteredItems = [...pantry].reverse(); // Newest first
      break;
    case 'oldestAdded':
      filteredItems = [...pantry]; // Oldest first
      break;
    default:
      break;
  }

  displayPantryItems(filteredItems);
}

// Function to search pantry items
function searchPantryItems() {
  const query = document.getElementById('searchBox').value.toLowerCase();
  const filteredItems = pantry.filter(item =>
    item.name.toLowerCase().includes(query)
  );
  displayPantryItems(filteredItems);
}

// Function to remove a pantry item
function removePantryItem(index) {
  pantry.splice(index, 1); // Remove the item from the array
  localStorage.setItem('pantry', JSON.stringify(pantry)); // Update localStorage
  displayPantryItems(); // Refresh the list
}

// Update display function to include delete buttons
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
        ${item.name} ${
          item.expiry ? `(Expires: ${item.expiry})` : '- No Expiry'
        }
        <button class="delete-btn" onclick="removePantryItem(${index})">Delete</button>
      `;
      itemsDiv.appendChild(itemDiv);
    });

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(itemsDiv);
    pantryCategories.appendChild(categoryDiv);
  });
}


// Event Listeners
document.getElementById('applyFilter').addEventListener('click', filterPantryItems);
document.getElementById('searchBox').addEventListener('input', searchPantryItems);

// Initial Display
displayPantryItems();
