document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchField = document.getElementById('search-field');
    const resultsContainer = document.getElementById('results');
    const newListButton = document.getElementById('new-list-button');
    const newListInput = document.getElementById('new-list-input');
    const addToListButton = document.getElementById('add-to-list-button');
    const listNameInput = document.getElementById('list-name-input');
    const heroIdInput = document.getElementById('hero-id-input'); // You'll need an input to specify which hero to add
    const nresults = document.getElementById('n')
    // Reference to the sort button and sort field
    const sortButton = document.getElementById('sort-button');
    const sortField = document.getElementById('sort-field');
    fetchFavoriteLists();
    var sortResult = []

      // Add event listener for the sort button
      sortButton.addEventListener('click', function() {
        const field = sortField.value; // Convert to lowercase to match your data keys
        sortSuperheroes(field);
      });

      document.getElementById('delete-list-button').addEventListener('click', function(event) {
        event.preventDefault(); 
        const listName = document.getElementById('delete-list-input').value;
        deleteList(listName);
    });

      // Add event listener for the 'Get List Info' button
      const getListButton = document.getElementById('get-list-button');
      getListButton.addEventListener('click', function() {
          const listName = document.getElementById('get-list-input').value;
          getListInfo(listName);

      });

   