import {
    group,
    sleep,
    check
} from 'k6';
import http from 'k6/http';

// Version: 1.0
// Creator: Thu Nguyen

export let options = {

    // Page views during various peaks
    // 25th Aug 2019 9PM (highest load the past couple of months 2019 in analytics) 10k page views/min, 167/s
    // 19th Nov 2018 9PM (highest load for black week 2018 in analytics) 20k page views/min, 333/s


    // 1 VU equals the load of about 15-18 real users
    // Current avg for 1 VU
    // Page views/s: 0.8
    // Requests/s : 1.4

    // https://support.loadimpact.com/4.0/core-concepts/types-of-load-performance-tests/
    // Basline test
    stages: [
        {
            "duration": "10s",
            "target": 1
        },
        {
            "duration": "25s",
            "target": 1
        },
        {
            "duration": "20s",
            "target": 1
        },
        {
            "duration": "5s",
            "target": 1
        }
    ],

    // Stress test
    //        stages: [
    //        { "duration": "5m0s", "target": 100 },
    //        { "duration": "10m0s", "target": 100 },
    //        { "duration": "5m0s", "target": 200 },
    //        { "duration": "10m0s", "target": 200 },
    //        { "duration": "5m0s", "target": 400 },
    //        { "duration": "10m0s", "target": 400 },
    //        { "duration": "5m0s", "target": 800 },
    //        { "duration": "10m0s", "target": 800 },
    //        { "duration": "5m0s", "target": 1000 },
    //        { "duration": "10m0s", "target": 1000 },
    //        { "duration": "1m0s", "target": 0 }],

    // Load test
    //        stages: [
    //        { "duration": "5m0s", "target": 1000 },
    //        { "duration": "15m0s", "target": 1000 },
    //        { "duration": "5m0s", "target": 0 }],

    // Spike test
    //        stages: [
    //        { "duration": "1m0s", "target": 500 },
    //        { "duration": "9m0s", "target": 500 },
    //        { "duration": "3m0s", "target": 1000 },
    //        { "duration": "7m0s", "target": 1000 },
    //        { "duration": "10m0s", "target": 0 }],

    // Soak test
    //        stages: [
    //        { "duration": "10m0s", "target": 1000 },
    //        { "duration": "300m0s", "target": 1000 },
    //        { "duration": "10m0s", "target": 0 }],

    maxRedirects: 2,
    //discardResponseBodies: true, // Require to set to false to get the body content that contain token

    ext: {
        loadimpact: {
            projectID: __ENV.ProjectId,
            distribution: {
                //loadZoneLabel1: { loadZone: "amazon:se:stockholm", percent: 40 },
                loadZoneLabel2: {
                    loadZone: "amazon:de:frankfurt",
                    percent: 100
                }
            }
        }
    }
};

// Percentage of sessions that looked at products
// Black week 2018: 67.39%
// September 2018: 68.10%
// September 2019: 67.85%
var productPagePercentage = 70;

// Percentage of sessions that also added to cart
// Black week 2018: 18.06%
// September 2018: 12.39%
// September 2019: 11.41%
var addToCartPercentage = 20;

// Percentage of sessions that also went to the checkout
// Black week 2018: 56.23%
// September 2018: 42.48%
// September 2019: 36.54%
var checkoutPagePercentage = 60;

// Percentage of sessions that also converted
// Black week 2018: 28.32%
// September 2018: 28.22%
// September 2019: 34.83%
var conversionPercentage = 30;

// Pages / session
// Black week 2018: 15.61
// September 2018: 15.89
// September 2019: 9.55


var host = "foundation_demo.localtest.me";
var baseUrl = 'http://' + host;
var startpages = ['/en'];
var categories = [
    '/en/new-arrivals/',
    '/en/sale2/',
    '/en/guides/inspiration/',
    '/en/fashion/mens/mens-shoes/',
    '/en/fashion/mens/mens-jackets/',
    '/en/fashion/mens/mens-shirts/',
    '/en/fashion/mens/mens-sweatshirts/',
    '/en/fashion/womens/womens-shoes/',
    '/en/fashion/womens/womens-jackets/',
    '/en/fashion/womens/womens-tees/',
    '/en/fashion/womens/womens-bottoms/'
];

var products = [
    '/en/fashion/mens/mens-shoes/p-39813617/',
    '/en/fashion/mens/mens-shoes/p-42518256/',
    '/en/fashion/mens/mens-shoes/p-36127195/',
    '/en/fashion/mens/mens-shoes/p-39850363/',
    '/en/fashion/mens/mens-jackets/p-21320040/',
    '/en/fashion/mens/mens-jackets/p-41071811/',
    '/en/fashion/mens/mens-jackets/p-37378633/',
    '/en/fashion/mens/mens-shirts/p-24797574/',
    '/en/fashion/mens/mens-shirts/p-38193107/',
    '/en/fashion/mens/mens-shirts/p-39101253/',
    '/en/fashion/mens/mens-shirts/p-22471422/',
    '/en/fashion/mens/mens-sweatshirts/p-22471487/',
    '/en/fashion/mens/mens-sweatshirts/p-22471486/',
    '/en/fashion/mens/mens-sweatshirts/p-22471481/',
    '/en/fashion/mens/mens-sweatshirts/p-39205836/',
    '/en/fashion/womens/womens-shoes/p-27312186/',
    '/en/fashion/womens/womens-shoes/p-27312001/',
    '/en/fashion/womens/womens-shoes/p-42708712/',
    '/en/fashion/womens/womens-shoes/p-36276861/',
    '/en/fashion/womens/womens-jackets/p-43093280/',
    '/en/fashion/womens/womens-jackets/p-40707729/',
    '/en/fashion/womens/womens-jackets/p-40707713/',
    '/en/fashion/womens/womens-jackets/p-41136685/',
    '/en/fashion/womens/womens-tees/p-40977269/',
    '/en/fashion/womens/womens-tees/p-37001733/',
    '/en/fashion/womens/womens-tees/p-41680136/',
    '/en/fashion/womens/womens-tees/p-22153156/',
    '/en/fashion/womens/womens-bottoms/p-40799209/',
    '/en/fashion/womens/womens-bottoms/p-42087915/',
    '/en/fashion/womens/womens-bottoms/p-42087852/'
];

var variants = [
    'SKU-40707713',
    'SKU-40707735',
    'SKU-41136685',
    'SKU-41136683',
    'SKU-43093280',
    'SKU-43093282',
    'SKU-40707729',
    'SKU-40707701',
    'SKU-37001733',
    'SKU-37001258',
    'SKU-41680136',
    'SKU-41680139',
    'SKU-40977269',
    'SKU-40977316',
    'SKU-22153156',
    'SKU-27436708',
    'SKU-42087852',
    'SKU-42087869',
    'SKU-40799209',
    'SKU-40799212',
    'SKU-42087915',
    'SKU-42087921',
    'SKU-42708712',
    'SKU-27312001',
    'SKU-27312186',
    'SKU-27312187',
    'SKU-36276861',
    'SKU-36278481',
    'SKU-42518256',
    'SKU-36127195',
    'SKU-36127198',
    'SKU-39813617',
    'SKU-39850363',
    'SKU-41071811',
    'SKU-41071800',
    'SKU-21320040',
    'SKU-21320033',
    'SKU-37378633',
    'SKU-37378635',
    'SKU-38193107',
    'SKU-38193121',
    'SKU-39101253',
    'SKU-39101302',
    'SKU-24797574',
    'SKU-24796232',
    'SKU-22471422',
    'SKU-22471421',
    'SKU-22471487',
    'SKU-36210818',
    'SKU-22471486',
    'SKU-36210821',
    'SKU-22471481'
];

var members = [
    { Uid: 'admin@example.com', Password: 'store' },
    { Uid: 'shipping@example.com', Password: 'store' },
    { Uid: 'editor@example.com', Password: 'store' },
    { Uid: 'manager@example.com', Password: 'store' },
    { Uid: 'supervisor@example.com', Password: 'store' },
    { Uid: 'webaadmin@example.com', Password: 'store' }
];

var searchPages = ['/en/search'];

var searchWords = ['coat',
    'cotton',
    'luke',
    'TROUSER',
    'Sweaters',
    'Suits',
    'white'];


function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function precentageCheck(percentage) {
    return (Math.random() * 100) <= percentage;
}

export default function () {

    initEnvParams();

    // Visit Start page
    LoginStartPage();

    //// Percentage check to simulate different users doing different things on the site
    //if (!precentageCheck(productPagePercentage)) {
    //    return;
    //}

    if ((Math.random() * 100) < (productPagePercentage / 10)) {
        Search();
    }

    var q = 1;
    while (q <= 4) { //Couldn't get it working with for-loops
        CategoryPage();
        q++;
    }

    q = 1;
    while (q <= 10) {
        ProductPage();
        q++;
    }

    if (!precentageCheck(addToCartPercentage)) {
        return;
    }

    var itemsInCart = [];
    q = 1;
    while (q <= 7) {
        var variantToAdd = randomItem(variants);
        itemsInCart.push(variantToAdd);
        AddToCart(variantToAdd);
        q++;
    }

    LogoutPage();
}

/// Init environment params by CLI, e.g:   -e productPagePercentage=22 -e conversionPercentage=33
function initEnvParams() {

    if (__ENV.hostname !== undefined) {
        host = __ENV.hostname;
        baseUrl = "http://" + host;
    }

    if (__ENV.productPagePercentage !== undefined) {
        productPagePercentage = __ENV.productPagePercentage;
    }

    if (__ENV.addToCartPercentage !== undefined) {
        addToCartPercentage = __ENV.addToCartPercentage;
    }

    if (__ENV.checkoutPagePercentage !== undefined) {
        checkoutPagePercentage = __ENV.checkoutPagePercentage;
    }

    if (__ENV.conversionPercentage !== undefined) {
        conversionPercentage = __ENV.conversionPercentage;
    }
}

function LoginStartPage() {
    group("Start page", function () {
        let req, res;

        var startPage = baseUrl + randomItem(startpages);
        res = http.get(startPage);

        check(res, {
            "Start Page - status 200": (r) => r.status === 200
        });
        //Get the body of the first page
        let inputToken = res.html("#login-selector-signin form input[name=\"__RequestVerificationToken\"]").toArray()[0];
        let token;

        if (inputToken === undefined && res.status !== 200) {
            console.log("Login token underfined " + res.status);
            return;
        }
        else {
            token = inputToken.val();
            //console.log(token);
        }

        //Login page
        LoginPage(token);
    });
}
function LoginPage(token) {

    let member = randomItem(members);

    let response = http.post(
        baseUrl + "/PublicApi/InternalLogin",
        'Content-Type: multipart/form-data;\r\n boundary="----WebKitFormBoundary1akCXWfWdq8IgdCc"\r\nDate: Wed, 15 Jul 2020 09:08:27 +0000\r\nMessage-Id: <1594804107644-26e15054-a76fdbd4-9641982f@localhost>\r\nMIME-Version: 1.0\r\n\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc\r\nContent-Disposition: form-data; name=Email\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n' + member.Uid + '\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc\r\nContent-Disposition: form-data; name=Password\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n' + member.Password + '\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc\r\nContent-Disposition: form-data; name=RememberMe\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\nfalse\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc\r\nContent-Disposition: form-data; name=ReturnUrl\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc\r\nContent-Disposition: form-data; name=__RequestVerificationToken\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n' + token + '\r\n------WebKitFormBoundary1akCXWfWdq8IgdCc--\r\n',
        {
            headers: {
                Host: host,
                Referer: baseUrl,
                Connection: "keep-alive",
                Accept: "*/*",
                "Content-Type":
                    "multipart/form-data; boundary=----WebKitFormBoundary1akCXWfWdq8IgdCc",
                Origin: baseUrl,
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.9,vi;q=0.8,da;q=0.7",
            },
        }
    );

    check(response, {
        "Login - status 200": (r) => r.status === 200
    });

}
function LogoutPage() {
    let response = http.get(
        baseUrl + "/publicapi/signout",
        {
            headers: {
                Host: host,
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "en-US,en;q=0.9,vi;q=0.8,da;q=0.7",
            },
        }
    );

    check(response, {
        "Logout - status": (r) => r.status === 200
    });

    //if (response.status !== 200) {
    //    console.log(response.status + "-------" + response.html().text)
    //}
}
function CategoryPage() {
    group("Category", function () {
        let req, res;

        res = http.get(baseUrl + randomItem(categories));

        check(res, {
            "Page - status 200": (r) => r.status === 200
        });
        //sleep(Math.random() * 1 + 3);

        res = http.get(baseUrl + randomItem(categories) + "?facets=AvailableColors%3ANAVY");

        check(res, {
            "Page - status 200": (r) => r.status === 200
        });

    });
}

function AddToCart(variant) {
    group("Add to cart", function () {
        let req, res;
        let body = { Code: variant, Quantity: "1", Store: "delivery", requestFrom: "axios" };

        req = [{
            "method": "post",
            "url": baseUrl + "/DefaultCart/AddToCart",
            "body": body
        }];
        res = http.batch(req);

        check(res[0], {
            "Add to cart - status OK": (r) => r.status === 200
        });

        //sleep(Math.random() * 1 + 5);
    });
}


function ProductPage() {
    group("Product page", function () {
        let req, res;

        res = http.get(baseUrl + randomItem(products));

        check(res, {
            "Page - status 200": (r) => r.status === 200
        });

        //sleep(Math.random() * 1 + 5);
    });
}

function Search() {
    group("Search", function () {
        let res;

        var searchPage = randomItem(searchPages);
        var searchString = randomItem(searchWords);

        res = http.get(baseUrl + searchPage + "?search=" + searchString);
        check(res, {
            "Search - status 200": (r) => r.status === 200
        });
    });
}