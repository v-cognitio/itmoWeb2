function updateByCoords(updater) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            ans = `http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}`;
            update(ans, updater, document.querySelector('div.mainMargin'));
        },
        function (err) {
            ans = `http://localhost:3000/weather/city?q=абу-даби`;
            update(ans, updater, document.querySelector('div.mainMargin'));
        });
}

const selectByCity = (city) => {
    return `http://localhost:3000/weather/city?q=${city}`
}

async function update(selector, updater, el = null) {
    let result = 0;

    try {
        await fetch(selector)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    updater(data);
                    result = 200;
                } else {
                    result = 404;
                }
            });
    } catch (err) {
        if (el) {
            makeInvalid(el);
        }
        result = -1;
    }
    return result;
}

function capFirstLet(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateMainCity(data) {
    document.querySelector('div.mainMargin h2').textContent = data.name;
    document.querySelector('div.mainMargin div.mainTemp').textContent = Math.round(data.main.temp) - 273 + "℃";
    document.querySelector('div.mainMargin ul li div.wind').textContent = data.wind.speed + " м/с";
    document.querySelector('div.mainMargin ul li div.clouds').textContent = capFirstLet(data.weather[0].description);
    document.querySelector('div.mainMargin ul li div.pressure').textContent = data.main.pressure + " мм рт. ст.";
    document.querySelector('div.mainMargin img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
}

function updateFavourite(el, data, city) {
    el.querySelector('h3').textContent = data.name;
    el.querySelector('span.temp').textContent = Math.round(data.main.temp) - 273 + "℃";
    el.querySelector('div.wind').textContent = data.wind.speed + " м/с";
    el.querySelector('div.clouds').textContent = capFirstLet(data.weather[0].description);
    el.querySelector('div.pressure').textContent = data.main.pressure + " мм рт. ст.";
    el.querySelector('img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    el.querySelector('button.close').addEventListener('click', () => deleteCity(el, city));
}

function makeInvalid(el) {
    var header = el.querySelector('h2');
    if (header) {
        header.textContent = "Ошибка загрузки";
    }

    header = el.querySelector('h3');
    if (header) {
        header.textContent = "Ошибка загрузки";
    }
}

async function getCities() {
    let cities;
    await fetch("http://localhost:3000/features")
        .then(response => response.json())
        .then(data => {
            cities = data;
        })
    return cities;
}

async function addCity() {
    var inputBox = document.querySelector('div.inputBox input');
    var city = inputBox.value.toLowerCase();
    inputBox.value = '';

    var res = await placeCity(city, false);
    if (res) {
        await fetch('http://localhost:3000/features?city=' + city,
            {
                method: 'POST'
            })
    }
}

async function placeCity(city, loader = true) {
    var el = document.querySelector('#tableElement').content.cloneNode(true);
    document.querySelector('main').append(el);
    el = document.querySelector('main').lastElementChild;

    let prevDisplay = el.style.display;
    if (!loader) {
        el.style.display = 'none';
    }
    var res = await update(selectByCity(city), (data) => updateFavourite(el, data, city));

    if (res === 200) {
        if (!loader) {
            el.style.display = prevDisplay;
        }
        return true;
    } else if (res === 404) {
        el.remove();
        alert("Такой город не найден");
    } else if (res === -1) {
        makeInvalid(el);
    }

    return false;
}

function deleteCity(el, city) {
    city = city.toLowerCase();
    fetch('http://localhost:3000/features?city=' + city,
        {
            method: 'DELETE'
        })
        .then(res => {
            if (res.status === 200) {
                el.remove();
            }
        })
}

async function updateCities() {
    let cities = await getCities();
    if (cities) {
        for (let city of cities) {
            placeCity(city);
        }
    }
}

function init() {
    document.querySelector('form.addCity').addEventListener('submit', (event) => {
        event.preventDefault();
        addCity();
    });
    document.querySelector('button.plus').addEventListener('click', addCity);
    document.querySelector('button.geo').addEventListener('click',
        () => updateByCoords(updateMainCity));
    updateByCoords(updateMainCity);
    updateCities();
}

window.addEventListener('load', init);



