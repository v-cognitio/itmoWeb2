

function updateByCoords(updater) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            ans = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=40b59a908fc6450e086253153b78d13e&lang=ru`;
            update(ans, updater);
        },
        function (err) {
            ans = `https://api.openweathermap.org/data/2.5/weather?q=абу-даби&appid=40b59a908fc6450e086253153b78d13e&lang=ru`;
            update(ans, updater);
        });
}

const selectByCity = (city) => {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=40b59a908fc6450e086253153b78d13e&lang=ru`
}

async function update(selector, updater) {
    let result = true;
    await fetch(selector)
        .then(response => response.json())
        .then(data => {
            if (data.cod == 200) {
                updater(data);
            } else {
                alert("Такой город не найден");
                result = false;
            }
        });
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

function updateFavourite(el, data) {
    el.querySelector('h3').textContent = data.name;
    el.querySelector('span.temp').textContent = Math.round(data.main.temp) - 273 + "℃";

    el.querySelector('div.wind').textContent = data.wind.speed + " м/с";
    el.querySelector('div.clouds').textContent = capFirstLet(data.weather[0].description);
    el.querySelector('div.pressure').textContent = data.main.pressure + " мм рт. ст.";
    el.querySelector('img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";

    el.querySelector('button.close').addEventListener('click', () => deleteCity(el, data.name));

}

async function addCity() {
    var inputBox = document.querySelector('div.inputBox input');
    var city = inputBox.value;
    inputBox.value = '';
    var cities = localStorage.getItem("cities");
    if (cities) {
        cities = JSON.parse(cities);
        cities.push(city.toLowerCase());
    } else {
        cities = Array.of(city);
    }

    var res = await placeCity(city);
    if (res) {
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}

async function placeCity(city) {
    var el = document.createElement('div');
    el.innerHTML = '<div class="tableElement dotted">\n' +
        '        <div class="nameBar">\n' +
        '            <div class="nameContent">\n' +
        '                <h3></h3>\n' +
        '                <img src="icon.png" class="smallIcon">\n' +
        '                <span class="temp">5℃</span>\n' +
        '            </div>\n' +
        '            <button class="close">×</button>\n' +
        '        </div>\n' +
        '        <ul class="weatherInfo">\n' +
        '            <li class="infoElement">\n' +
        '                <div>Ветер</div>\n' +
        '                <div class="wind">5.1 м/с</div>\n' +
        '            </li>\n' +
        '            <li class="infoElement">\n' +
        '                <div>Облачность</div>\n' +
        '                <div class="clouds">Пасмурно</div>\n' +
        '            </li>\n' +
        '            <li class="infoElement">\n' +
        '                <div>Давление</div>\n' +
        '                <div class="pressure">1012 мм рт. ст.</div>\n' +
        '            </li>\n' +
        '        </ul>\n' +
        '    </div>'
    var res = await update(selectByCity(city), (data) => updateFavourite(el, data));
    if (res) {
        document.querySelector('main').appendChild(el);
        return true;
    }
    return false;
}

function deleteCity(el, name) {
    el.remove();
    var cities = JSON.parse(localStorage.getItem("cities"));
    cities.splice(cities.indexOf(name.toLowerCase()), 1);
    localStorage.setItem("cities", JSON.stringify(cities));
}

function updateCities() {
    var cities = localStorage.getItem("cities");
    if (cities) {
        for (let city of JSON.parse(cities)) {
            placeCity(city);
        }
    }
}

function init() {
    document.querySelector('div.inputBox button').addEventListener('click', addCity);
    document.querySelector('button.geo').addEventListener('click', () => updateByCoords(updateMainCity));
    updateByCoords(updateMainCity);
    updateCities();
}

window.addEventListener('load', init);



