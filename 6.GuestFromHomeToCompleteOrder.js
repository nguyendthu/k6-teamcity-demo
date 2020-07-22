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
    //discardResponseBodies: true, // nedd set to false, to get the token

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
var baseUrl = "http://" + host;

var shippingFee = 10.0;

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
    { Code: 'SKU-40707713', Price: 630 },
    { Code: 'SKU-40707735', Price: 630 },
    { Code: 'SKU-41136685', Price: 290 },
    { Code: 'SKU-41136683', Price: 290 },
    { Code: 'SKU-43093280', Price: 540 },
    { Code: 'SKU-43093282', Price: 540 },
    { Code: 'SKU-40707729', Price: 540 },
    { Code: 'SKU-40707701', Price: 540 },
    { Code: 'SKU-37001733', Price: 330 },
    { Code: 'SKU-37001258', Price: 330 },
    { Code: 'SKU-41680136', Price: 165 },
    { Code: 'SKU-41680139', Price: 165 },
    { Code: 'SKU-40977269', Price: 210 },
    { Code: 'SKU-40977316', Price: 210 },
    { Code: 'SKU-22153156', Price: 195 },
    { Code: 'SKU-27436708', Price: 195 },
    { Code: 'SKU-42087852', Price: 165 },
    { Code: 'SKU-42087869', Price: 165 },
    { Code: 'SKU-40799209', Price: 260 },
    { Code: 'SKU-40799212', Price: 260 },
    { Code: 'SKU-42087915', Price: 195 },
    { Code: 'SKU-42087921', Price: 195 },
    { Code: 'SKU-42708712', Price: 235 },
    { Code: 'SKU-27312001', Price: 720 },
    { Code: 'SKU-27312186', Price: 490 },
    { Code: 'SKU-27312187', Price: 490 },
    { Code: 'SKU-36276861', Price: 350 },
    { Code: 'SKU-36278481', Price: 350 },
    { Code: 'SKU-42518256', Price: 280 },
    { Code: 'SKU-36127195', Price: 400 },
    { Code: 'SKU-36127198', Price: 400 },
    { Code: 'SKU-39813617', Price: 540 },
    { Code: 'SKU-39850363', Price: 280 },
    { Code: 'SKU-41071811', Price: 490 },
    { Code: 'SKU-41071800', Price: 490 },
    { Code: 'SKU-21320040', Price: 24.5 }
];



var checkoutPages = ['/en/checkout'];

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

    var q = 1;

    // Visit Start page
    StartPage();

    // Percentage check to simulate different users doing different things on the site
    if (!precentageCheck(productPagePercentage)) {
        return;
    }

    if ((Math.random() * 100) < (productPagePercentage / 10)) {
        Search();
    }

    while (q <= 4) { //Couldn't get it working with for-loops
        CategoryPage();
        q++;
    }

    q = 1;
    while (q <= 10) {
        ProductPage();
        q++;
    }

    ////if (!precentageCheck(addToCartPercentage)) {
    ////    return;
    ////}

    var itemsInCart = [];
    q = 1;
    var totalAmount = 0;
    while (q <= 1) {
        var variantToAdd = randomItem(variants);
        itemsInCart.push(variantToAdd);
        AddToCart(variantToAdd.Code);
        q++;
        totalAmount += variantToAdd.Price;
    }
    totalAmount += shippingFee;
    GuestCheckOut(totalAmount);

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

function StartPage() {
    group("Start page", function () {
        let req, res;

        res = http.get(baseUrl + randomItem(startpages));

        check(res, {
            "Page - status 200": (r) => r.status === 200
        });

    });
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

function GuestCheckOut(totalAmount) {
    let response;

    group(
        "Checkout Page",
        function () {

            response = http.get(
                baseUrl + "/en/checkout/?isGuest=1"
            );

            //Get the body of the first page
            let inputToken = response.html("#jsCheckoutForm input");
            let token;
            if (inputToken === undefined) {
                console.log("Check out token underfined");
                return;
            }
            else {
                token = inputToken.val();                
            }


            response = http.post(
                baseUrl + "/en/checkout/UpdatePaymentOption/",
                '{"PaymentMethodId":"8f753d06-a527-4566-8f24-407800386af7","SystemKeyword":"CashOnDelivery"}',
                {
                    headers: {
                        Host: host,
                        Connection: "keep-alive",
                        Accept: "*/*",
                        "Content-Type": "application/json;charset=UTF-8",
                        Origin: baseUrl,
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8,da;q=0.7",
                    },
                }
            );

            response = http.post(
                baseUrl + "/en/checkout/UpdatePayment/",
                "BillingAddress.AddressId=&BillingAddress.BillingDefault=False&BillingAddress.City=&BillingAddress.CountryCode=USA&BillingAddress.CountryRegion.Region=Alabama&BillingAddress.DaytimePhoneNumber=&BillingAddress.Email=&BillingAddress.FirstName=&BillingAddress.LastName=&BillingAddress.Line1=&BillingAddress.Line2=&BillingAddress.Name=&BillingAddress.Organization=&BillingAddress.PostalCode=&BillingAddress.ShippingDefault=False&BillingAddressType=2&IsUsePaymentPlan=false&OrderSummary.PaymentTotal=" + totalAmount + "&PaymentMethodId%5B0%5D=8f753d06-a527-4566-8f24-407800386af7&PaymentMethodId%5B1%5D=8f753d06-a527-4566-8f24-407800386af7&PaymentMethodType=on&PaymentPlanSetting.CycleLength=0&PaymentPlanSetting.EndDate=&SKU-39813617=1&Shipments[0].Address.AddressId=&Shipments[0].Address.BillingDefault=False&Shipments[0].Address.City=Croydon&Shipments[0].Address.CountryCode=GBR&Shipments[0].Address.CountryRegion.Region=-&Shipments[0].Address.DaytimePhoneNumber=&Shipments[0].Address.Email=thu.nguyen%2540mailinator.com&Shipments[0].Address.FirstName=thu&Shipments[0].Address.LastName=nguyen&Shipments[0].Address.Line1=2%2520Whitestone%2520Way&Shipments[0].Address.Line2=address2&Shipments[0].Address.Name=&Shipments[0].Address.Organization=Ms.&Shipments[0].Address.PostalCode=CR0%25204FG&Shipments[0].Address.ShippingDefault=False&Shipments[0].ShippingAddressType=0&Shipments[0].ShippingMethodId=25c04e97-adc2-433e-ad2a-8cfc88501448&SystemKeyword=CashOnDelivery&__RequestVerificationToken=" + token + "&address-htmlfieldprefix%5B0%5D=Shipments[0].Address.CountryRegion&address-htmlfieldprefix%5B1%5D=BillingAddress.CountryRegion",
                {
                    headers: {
                        Host: host,
                        Connection: "keep-alive",
                        Accept: "*/*",
                        "Content-Type": "application/x-www-form-urlencoded",
                        Origin: baseUrl,
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8,da;q=0.7",
                    },
                }
            );
            check(response, {
                "Checkout - status 200": (r) => r.status === 200
            });


            response = http.post(
                baseUrl + "/en/checkout/PlaceOrder/",
                "BillingAddress.AddressId=&BillingAddress.BillingDefault=False&BillingAddress.City=&BillingAddress.CountryCode=USA&BillingAddress.CountryRegion.Region=Alabama&BillingAddress.DaytimePhoneNumber=&BillingAddress.Email=&BillingAddress.FirstName=&BillingAddress.LastName=&BillingAddress.Line1=&BillingAddress.Line2=&BillingAddress.Name=&BillingAddress.Organization=&BillingAddress.PostalCode=&BillingAddress.ShippingDefault=False&BillingAddressType=2&IsUsePaymentPlan=false&PaymentPlanSetting.CycleLength=0&PaymentPlanSetting.EndDate=&SKU-41680136=1&SKU-43093280=2&Shipments[0].Address.AddressId=&Shipments[0].Address.BillingDefault=False&Shipments[0].Address.City=Hanoi&Shipments[0].Address.CountryCode=VNM&Shipments[0].Address.CountryRegion.Region=none&Shipments[0].Address.DaytimePhoneNumber=&Shipments[0].Address.Email=thunguyen%2540mailinator.com&Shipments[0].Address.FirstName=Thu&Shipments[0].Address.LastName=Nguyen&Shipments[0].Address.Line1=Hanoi%252C%2BVietnam&Shipments[0].Address.Line2=&Shipments[0].Address.Name=&Shipments[0].Address.Organization=&Shipments[0].Address.PostalCode=100000&Shipments[0].Address.ShippingDefault=False&Shipments[0].ShippingAddressType=0&Shipments[0].ShippingMethodId=25c04e97-adc2-433e-ad2a-8cfc88501448&__RequestVerificationToken=" + token + "&address-htmlfieldprefix%5B0%5D=Shipments[0].Address.CountryRegion&address-htmlfieldprefix%5B1%5D=BillingAddress.CountryRegion",
                {
                    headers: {
                        Host: host,
                        Connection: "keep-alive",
                        "Cache-Control": "max-age=0",
                        "Upgrade-Insecure-Requests": "1",
                        Origin: baseUrl,
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept:
                            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8,da;q=0.7",
                    },
                }
            );
            check(response, {
                "Place Order - status 200": (r) => r.status === 200
            });

        }
    );

    // Automatically added sleep
    //sleep(1);
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