let state = {
    hotelArray: [],
    searchResults: [],
};

$(document).ready(function () {
    jQuery(init);
    document.querySelector("form").addEventListener("submit", handleSubmit);

    var modal = document.getElementById("myModal");

    var btn = document.getElementById("myBtn");
    
    var span = document.getElementsByClassName("close")[0];
    
    btn.onclick = function() {
      modal.style.display = "block";
    }
    
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
});

function init($) {
    const options = {
        url: 'data.json',
        success: handleInitRequest
    };
    $.ajax(options);
}

function handleInitRequest(resData) {
    state.hotelArray = resData[1]['entries'];
    displayListOptions(getGuestRatings(state.hotelArray), '#ratings');
    displayListOptions(getAllFilters(state.hotelArray), '#sorting');
    displayListOptions(getLocations(state.hotelArray), '#location');
}

$('#iconified').on('keyup', function () {
    var input = $(this);
    if (input.val().length === 0) {
        input.addClass('empty');
    } else {
        input.removeClass('empty');
    }
});

function handleSubmit(event) {
    event.preventDefault();

    const input = document.querySelector("#search-input");
    state.searchResults = searchByLocation(state.hotelArray, input);
    displayMaxPrice(getPriceRange(state.searchResults));
    displayResults(state.searchResults);
    console.log(state.searchResults);
}

function searchByLocation(hotelData, location) {
    return hotelData.filter(hotel => hotel.city === location.value) || null;
}

function filterHotelsByPrice() {
    const priceRangeElement = document.querySelector("#price-range");
    const value = priceRangeElement.value;
    const filteredResults = state.searchResults.filter(item => item.price <= value);
    displayResults(filteredResults);
}

function displayResults(data) {
    const outputHtmlElement = document.querySelector("#results");
    const mapHtmlElement = document.querySelector('#map');
    if (data.length) {
        outputHtmlElement.innerHTML = data.map(item => hotelItemTemplate(item)).join('');
        mapHtmlElement.innerHTML = mapLocationIframe(data.slice(-1)[0]);
    } else {
        outputHtmlElement.innerHTML = 'There are no results';
    }
}

function displayListOptions(data, selector) {
    const outputHtmlElement = document.querySelector(selector);
    outputHtmlElement.innerHTML = data.map(item => optionItemTemplate(item)).join('');
}

function displayMaxPrice(priceRange) {
    const maxPriceLabel = document.querySelector("#max-price");
    const priceRangeElement = document.querySelector("#price-range");
    maxPriceLabel.innerHTML = `${priceRange[1]} €`;
    priceRangeElement.setAttribute('min', priceRange[0]);
    priceRangeElement.setAttribute('max', priceRange[1]);
}

function getPriceRange(data) {
    let prices = data.map(d => d.price);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);
    return [minPrice, maxPrice];
}

function mapLocationIframe(data) {
    if (data) {
        return `<iframe src="${data.mapurl}" width="600" height="450" style="border:0" allowfullscreen></iframe>`
    }
}

function getAllFilters(data) {
    const filtersArrays = data.map(item => item.filters);
    const filtersFlatArray = filtersArrays.flat(2);
    const bulkFiltersNames = filtersFlatArray.map(item => item['name']);
    const uniqueFiltersNames = Array.from(new Set(bulkFiltersNames));
    return uniqueFiltersNames;
}

function getGuestRatings(data) {
    const bulkRatings = data.map(item => item.ratings.text);
    const uniqueRatings = Array.from(new Set(bulkRatings));
    return uniqueRatings;
}

function getLocations(data) {
    const bulkLocations = data.map(item => item.city);
    const uniqueLocations = Array.from(new Set(bulkLocations));
    return uniqueLocations;
}

function optionItemTemplate(item) {
    return `<option>${item}</option>`
}

function hotelItemTemplate(item) {
    return `
    <div class="row mt-1">
            <div class="col-3">
                <img width="100%" height="200px" src="${item.thumbnail}">
            </div>
            <div class="col-4">
                <div id="hotel-name" class="my-1 row big letter">
                    <h3>${item.hotelName}</h3>
                </div>
                <div class="row my-3 sfont">
                    ${item.rating} &#9733; &nbsp<span class="text-dark">Hotel</span>
                </div>
                <div class="row my-3 sfont">
                    ${item.city}
                </div>
                <div class="row my-1">
                    <p class="boxed em">${item.ratings.no}</p><i class="letter">${item.ratings.text}</i>
                </div>
            </div>

            <div class="col-3" id="hotel-features">
                <i>features :</i>
            </div>

            <div class="col-2" id="hotel-price">
                <div class="big pt-2 center">${item.price}€</div>
                <div>
                    <button class="sfont btn btn-success final">View Deal</button>
                </div>
            </div>
        </div>
    <div>
    `
}
