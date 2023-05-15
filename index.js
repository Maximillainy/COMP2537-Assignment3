const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let types = []
let selectedTypes = []

const showTypes = async () => {
  types.forEach(type => {
    $('#types').append(`
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" id="${type.name}" name="${type.name}">
          <label class="form-check-label" for="${type.name}">${type.name}</label>
        </div>
      `);
  });
}

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const startPage = Math.max(1, (currentPage - 2));
  const endPage = Math.min(numPages, (currentPage + 2));
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>
      `)
  }
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons${(i == currentPage) ? ' active' : ''}" value="${i}">${i}</button>
      `)
  }
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
      `)
  }
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })

  $('#numDisplayed').html(`<br><h3>Displaying ${selected_pokemons.length} of ${pokemons.length} Pokemon</h3><br>`)
}

const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  let response2 = await axios.get('https://pokeapi.co/api/v2/type');
  types = response2.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)
  showTypes(types)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
    console.log("currentPage: ", currentPage);
  })

  // add event listener to type checkboxes
  $('body').on('click', ".form-check-input", async function (e) {
  const type = e.target.name;
  if (e.target.checked) {
    selectedTypes.push(type);
  } else {
    selectedTypes = selectedTypes.filter((t) => t !== type);
  }
  console.log("selectedTypes: ", selectedTypes);

  pokemons = response.data.results;
  let filteredPokemonsPromises = pokemons.map(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    const types = res.data.types.map((type) => type.type.name)
    if (selectedTypes.every((type) => types.includes(type))) {
      return pokemon;
    }
  });

  const filteredPokemons = (await Promise.all(filteredPokemonsPromises)).filter(Boolean);
  // console.log("filteredPokemons: ", filteredPokemons);
  pokemons = filteredPokemons;
  // console.log("pokemons: ", pokemons);

  currentPage = 1;
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  paginate(currentPage, PAGE_SIZE, pokemons);
  updatePaginationDiv(currentPage, numPages);
});

}


$(document).ready(setup)