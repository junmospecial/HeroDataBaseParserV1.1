function displaySuperheroInfo(superhero) {
    const superheroInfo = `
        ID: ${superhero.id}<br>
        Name: ${superhero.name}<br>
        Gender: ${superhero.Gender}<br>
        Eye color: ${superhero['Eye color']}<br>
        Race: ${superhero.Race}<br>
        Hair color: ${superhero['Hair color']}<br>
        Height: ${superhero.Height}<br>
        Publisher: ${superhero.Publisher}<br>
        Skin color: ${superhero['Skin color']}<br>
        Alignment: ${superhero.Alignment}<br>
        Weight: ${superhero.Weight}
    `;

    const superheroDiv = document.createElement('div');
    superheroDiv.classList.add('superhero-info');
    superheroDiv.innerHTML = superheroInfo;

    document.getElementById('superheroInfoContainer').appendChild(superheroDiv);

}

    document.getElementById('SuperheroSearch').addEventListener('submit', function (event) {
        event.preventDefault();

        fetch('client/superhero_info.json')
            .then(response => response.json())
            .then(data => {
                const superheroName = document.getElementById('id').value.toLowerCase();
                const superheros = data.filter(superhero => superhero.name.toLowerCase().includes(superheroName));

                if (superheros.length > 0) {
                    document.getElementById('superheroInfoContainer').innerHTML = ''; // Clear previous results
                    superheros.forEach(superhero => displaySuperheroInfo(superhero));
                } else {
                    alert("No matching superheroes found");
                }
            })
            .catch(error => console.error('Error:', error));
    });
