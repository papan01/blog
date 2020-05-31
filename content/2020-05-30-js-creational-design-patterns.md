---
title: "Javascript Design Patterns: Creational Design Patterns"
date: "2020-05-30"
category: "Design-Pattern"
cover: "/images/spring-book-with-feather-sketch.jpg"
tags:
  - JavaScript
---

設計模式(design pattern)是程式設計中一些常見問題的解決方案，相信大家都有聽過[Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)這本由Gang of Four(所以這本書又常被稱為GoF design pattern)所編寫的經典書籍，裡面整理了經典的23個設計模式，主要可以將它們分成以下幾個種類: creational、structural與behavioral。在本章中我將介紹creational中的幾個設計模式是如何運於javascript中。

## 目的

創建型設計模式(creational design patterns)著重於處理物件創建的機制，以適合的方式針對當前情況創建物件。若以正常的方式創建物件，隨著程式逐漸茁壯可能會導致整個專案增加複雜性，而這些模式的宗旨在於通過**控制創建過程**來解決此問題。

底下將會介紹幾個基本的creational design pattern:

- [Constructor Pattern](#constructor-pattern)
- [Module Pattern](#module-pattern)
- [Singleton Pattern](#singleton-pattern)
- [Factory Pattern](#factory-pattern)
- [Abstract Factory Pattern](#abstract-factory-pattern)
- [Prototype Pattern](#prototype-pattern)
- [Builder Pattern](#builder-pattern)

## Constructor Pattern

在傳統的物件導向程式語言(OOP)中，建構子(constructor)是一個特別的函式用於初始化一個新的物件並且對其進行記憶體的配置。而在javascript當中，因為不像其他傳統class-based的程式語言，javascript的建構子就只是一個單純的函式，與類別無關，也因此如此，這個設計模式比較常看到是在說明與javascript有關。我們通常會編寫建構子函數以完成物件類型的定義，其中包含該物件的類型名稱、屬性與方法，以及當我們在創建該物件時所需要帶入的參數等等。

### 建立物件

這裡先簡單介紹一下javascript如何建立物件以及賦予屬性。

我們可以透過以下三種方式建立物件:

```javascript
// 1. 使用一對大括號表示
const object1 = {};
// 2. 使用Object.create
const object2 = Object.create( Object.prototype );
// 3. 透過Object constuctor
const object3 = new Object();
```

然後可以透過四種方式進行配置屬性:

```javascript
const myObject = {};
// 1. 使用dot語法
// Set屬性
myObject.someKey = "Hello World";
// Get屬性
var value = myObject.someKey;

// 2. 使用中括號
// Set屬性
myObject["someKey"] = "Hello World";
// Get屬性
var value = myObject["someKey"];

// 下面只能在ES5之後使用

// 3. Object.defineProperty
// Set屬性
Object.defineProperty( myObject, "someKey", {
    value: "Hello World",
    writable: true,
    enumerable: true,
    configurable: true
});
// Get使用1或2的方式

// 4. Object.defineProperties
// Set屬性
Object.defineProperties( myObject, {
  "someKey": {
    value: "Hello World",
    writable: true
  },

  "anotherKey": {
    value: "Foo",
    writable: false
  }
});
// Get使用1或2的方式
```

### 基本的建構子範例

```javascript
function Student( name, year, grade) {
  this.name = name;
  this.year = year;
  this.grade = grade;
}

Student.prototype.toString = function () {
  return `Name:${this.name} Year:${this.year} Grade:${this.grade}`;
};
```

上面可以看到我們是透過`prototype`替`Student`添加它的方法，而不是寫在`Student`這個函式中，若寫在裡面的話代表每次建構一個`Student`物件都會建立一個新的`toString()`方法，這樣比較浪費記憶體空間，所以比較好的做法是透過`prototype`添加。

或許你曾經在某些教科書上看過這種寫法，因為這十分的常見，不過在實務上比較多的寫法是等等要介紹的module pattern。

## Module Pattern

將程式進行模組化(modularization)通常有助於保持程式碼單元的清晰分離和組織，所以在現代的javascript中，已經有好幾種方便我們實踐模組化的選項可以使用了:

- 傳統的module pattern
- AMD modules
- CommonJS modules
- ES6 modules

在我的另外一篇文章當中[「You don't know JavaScript Yet:#11 模組模式(Module Pattern)」](/archives/2020-03-21-you-dont-know-js-yet-11)裡面有較詳細說明module pattern，這裡就不再重複說明。

## Singleton Pattern

在傳統物件導向語言中，當你想要控制某個類別在整個專案中只保持一個實例，可以將建構函式設定為私有的，避免外部使用`new`關鍵字創建實例，並且透過宣告一靜態方法提供另外一個創建實例的接口，這個方法將會為該類別創建實例(若未曾創建過)，如果實例已經存在，則返回該實例。

以下為C++中簡單的宣告方式:

```cpp
class Singleton {
  public:
      static Singleton* Instance();
  protected:
      Singleton();
  private:
      static Singleton* _instance;
};
```

Singleton與靜態(static)物件有所差異，靜態物件通常在程式進行編譯時就已經存在，但singleton可以讓我們自己控制何時進行創建。

在GoF design patterns中提到關於singleton有以下兩點描述:

1. There must be exactly one instance of a class, and it must be accessible to clients from a well-known access point.
2. When the sole instance should be extensible by subclassing, and clients should be able to use an extended instance without modifying their code.

第一點就如同前面所描述的那樣，只能存在一個此類別的實例，且提供一個能夠存取到這個實例的地方。在javascript當中若使用ES6 modules則其本身特性就是singleton，若是傳統的module pattern，通常我們會透過[IIFE](/archives/2020-03-12-you-dont-know-js-yet-9#immediately-invoked-functions-expressionsiife)先進行一個類似namespace的宣告。由於javascript畢竟不是class-based的程式語言，所以最終透過singleton創建函式所返回的並非一個類別的實例，但也不是一個物件，正確來說應該是透過[「閉包(Clouse)」](/archives/2020-03-16-you-dont-know-js-yet-10)後的結果:

```javascript
const Singleton = (function () {

  let instance;

  function initialization() {
    const privateRandomNumber = Math.random();

    function privateMethod(){
        console.log( "Hello, I'm the Singletion" );
    }

    return {
      publicMethod: function () {
        privateMethod();
      },
      publicProperty: {
        'p1' : 0,
        'p2' : 1
      },
      getRandomNumber: function() {
        return privateRandomNumber;
      }
    };
  };

  return {
    getInstance: function () {
      return !instance ? instance = initialization() : instance;
    }
  };
})();

const singletone = Singleton.getInstance();
singletone.publicMethod(); // Hello, I'm the Singletion
```

而第二點則是替client提供多個singleton的擴展類別，程式碼會看起來如下:

```javascript
return {
  getInstance : function(option) {
    if ( instance === null ) {
      if ( option === 'Foo' ) {
         instance = new FooSingleton();
      } else {
         instance = new BasicSingleton();
      }
    }
    return this._instance;
  }
}
```

## Factory Pattern

假設我有一個物流公司，在最初運送的交通工具只有`貨車`這個選項，但之後我的公司日漸茁壯，成長到有海外業務，所以我需要`郵輪`與`飛機`來增加我的運輸量，但我的物流管理系統一開始可能只有`貨車`這個類別相關的程式碼，若在其中加入`郵輪`與`飛機`的邏輯則可能需要大幅度修改程式碼，為了以後會出現更多的運輸工具可能性，使用factory pattern解決有類似行為的module是個好方法。

通常factory pattern用於提供client選擇其想創建的物件，有點類似上面singleton第二點那樣，在創建時通常不會透過`new`關鍵字進行創建，而是直接向factory function要求需要的物件。這些物件通常都會有一些共通性(方法或者屬性)，例如以上面的例子來看，它們可以有乘載噸數、每公里成本或速度等等屬性，有遞送、裝載或卸貨等等方法。

若在一些可以創建`interface`的物件導向程式語言中，通常會建立一個`interface`，並且宣告這些共通的方法與屬性，下面以C#為例:

```cs
interface ITransport {
  decimal Speed {get; set;}
  decimal Cost {get; set;}
  decimal Tonnes {get; set;}

  void deliver();
}
```

但在javascript並沒有`interface`可以使用，或許你可能想到typescript，不過在本篇還是希望以pure javascript為主。那麼要如何達到像其他語言一樣限制類別，使其必須實作這些方法呢?在javascript中實際上不在乎這些，
因為javascript使用稱為[duck typing](https://en.wikipedia.org/wiki/Duck_typing)用於描述物件的方式，它在乎的是物件有沒有該屬性與方法，而不在乎物件本身是屬於什麼型別，其他語言像是golang也是使用[duck typing](https://en.wikipedia.org/wiki/Duck_typing)，不過golang有`interface`使用，這裡就不多做描述。

下面為在javascript中使用factory pattern的例子:

```javascript
function Truck() {
  this.speed = 10;
  this.cost = 2;
  this.tonnes = 2;
}

Truck.prototype.deliver = function () {
  console.log('Go~~~Truck!!');
}

function Ship(){
  this.speed = 15;
  this.cost = 20;
  this.tonnes = 30;
}

Ship.prototype.deliver = function () {
  console.log('Go~~~Ship!!');
}

function TransportFactory() {}
TransportFactory.prototype.transportClass = Truck;
TransportFactory.prototype.createTransport= function ( transportType ) {

  switch(transportType){
    case "truck":
      this.transportClass = truck;
      break;
    case "ship":
      this.transportClass = Ship;
      break;
  }
  return new this.transportClass();
};

const transportFactory = new TransportFactory();
const transport = transportFactory.createTransport("truck");
  
console.log( transport instanceof Truck ); // true
```

只要我的運輸工具有`speed`、`cost`與`tonnes`我就認定為它是我的運輸工具之一([duck typing](https://en.wikipedia.org/wiki/Duck_typing))，那就可以把它加入到我的物流管理系統當中，當然這只是簡單的例子，實際上的運用會有許多的方法與額外的屬性。

### 使用的時機

使用factory pattern的時機:

- 無法預期一個物件將被創建的型別。
- 它們擁有許多相同屬性或者方法時(不一定要完全一樣)。
- 將這些物件組合進factory時，它們必須滿足共同的API，由於[duck typing](https://en.wikipedia.org/wiki/Duck_typing)的緣故，若某個物件未實作某個方法時，也會在執行時拋出`TypeError`。

### 不該使用的時機

若你需要大量執行這些物件不共通的方法時，這將會帶來額外的型別判斷，透過工廠生成的物件後續的行為邏輯理當說是要一致的，若在其中穿插各個物件自己特有的行為，勢必需要處理各個型別對應的動作。

## Abstract Factory Pattern

Abstract factory pattern有點像是在factory pattern上多一層wrapper，將許多factory進行整合，而這些factory都有一些共同的行為(方法)。

假設我們需要開發一個關於汽車產品的程式，根據不同品牌有不同的生產方式，例如我們有`BMW`、`Toyota`與`Ford`這幾個品牌，而它們都有`Sedan`、`Hatchback`與`Coupe`等種類的車子:

```javascript
// BMW
function BMWSedan() {
  function start() {
    console.log(`BMW-Sedan`);
  }

  return {
    start,
  };
}

function BMWHatchback() {
  function start() {
    console.log(`BMW-Hatchback`);
  }

  return {
    start,
  };
}

function BMWCoupe() {
  function start() {
    console.log(`BMW-Coupe`);
  }

  return {
    start,
  };
}

function BMWFactory() {
  return {
    createSedan: BMWSedan,
    createHatchback: BMWHatchback,
    createCoupe: BMWCoupe,
  };
}

// Toyota
function ToyotaSedan() {
  function start() {
    console.log(`Toyota-Sedan`);
  }

  return {
    start,
  };
}

function ToyotaHatchback() {
  function start() {
    console.log(`Toyota-Hatchback`);
  }

  return {
    start,
  };
}

function ToyotaCoupe() {
  function start() {
    console.log(`Toyota-Coupe`);
  }

  return {
    start,
  };
}

function ToyotaFactory() {
  return {
    createSedan: ToyotaSedan,
    createHatchback: ToyotaHatchback,
    createCoupe: ToyotaCoupe,
  };
}

// Ford
function FordSedan() {
  function start() {
    console.log(`Ford-Sedan`);
  }

  return {
    start,
  };
}

function FordHatchback() {
  function start() {
    console.log(`Ford-Hatchback`);
  }

  return {
    start,
  };
}

function FordCoupe() {
  function start() {
    console.log(`Ford-Coupe`);
  }

  return {
    start,
  };
}

function FordFactory() {
  return {
    createSedan: FordSedan,
    createHatchback: FordHatchback,
    createCoupe: FordCoupe,
  };
}

// Abstract Factory
function CarFactoryProducer(brand) {
  switch (brand) {
    case 'BMW':
      return BMWFactory();
    case 'Toyota':
      return ToyotaFactory();
    case 'Ford':
      return FordFactory();
    default:
      return BMWFactory();
  }
}

const carFactory = CarFactoryProducer('BMW');
carFactory.createCoupe().start(); // BMW-Coupe
carFactory.createSedan().start(); // BMW-Sedan
carFactory.createHatchback().start(); // BMW-Hatchback
```

在javascript中少了各種`abstract class`或者`interface`，看起來會比較簡潔一點，但我個人認為缺少了約束型別的`CarFactoryProducer`似乎沒有符合原本abstract factory pattern的宗旨，來看看GoF中關於abstract factory pattern的部分:

1. a system should be independent of how its products are created, composed, and represented.
2. a system should be configured with one of multiple families of products.
3. a family of related product objects is designed to be used together, and
you need to enforce this constraint.
4. you want to provide a class library of products, and you want to reveal just their interfaces, not their implementations.

上面的第四點因為語言的限制所以就見仁見智如何解讀它了，但第三點或許我們可以透過改寫`CarFactoryProducer`，提供一個註冊的API，並且加入屬性的檢驗來達到這個目的:

```javascript
// Abstract Factory
function CarFactoryProducer() {
  const brands = {};

  function registerCarBrand(brand, carFactory) {
    const seden = carFactory.createSedan;
    const hatchback = carFactory.createHatchback;
    const coupe = carFactory.createCoupe;

    // 只允許註冊有定義createSedan、createHatchback與createCoupe的品牌
    if (seden && hatchback && coupe) {
      brands[brand] = carFactory;
    }
  }

  function getCarFactory(brand) {
    const carFactory = brands[brand];
    return carFactory || null;
  }

  return {
    getCarFactory,
    registerCarBrand,
  };
}

const carFactoryProducer = CarFactoryProducer();
carFactoryProducer.registerCarBrand('BMW', BMWFactory());
carFactoryProducer.registerCarBrand(
  'Toyota',
  ToyotaFactory(),
);
carFactoryProducer.registerCarBrand('Ford', FordFactory());

const carFactory = carFactoryProducer.getCarFactory('BMW');

carFactory.createSedan().start(); // BMW-Sedan
```

改成這樣可以強制限制註冊的品牌必須擁有一些指定的屬性，但這種檢查在javascript中挺繁瑣的，且我們還沒有檢查到更深入一層`start`這個方法是否有被定義，所以我覺得在javascript中的abstract factory pattern有點四不像的感覺，不如退而直接使用factory pattern就好。

## Prototype Pattern

這裡的prototype pattern不是在說明javascript的繼承與prototype chain，而是指GoF design pattern中提到的prototype pattern。

Prototype pattern的用途在於複製一個物件，但又不透過其型別本身的方法來達到此目的。

在javascript要達到此目的相對於傳統的物件導向程式語言來說算是比較簡單的:

```javascript
// 透過Object.create
function Stuff(a, b) {
  this.a = a;
  this.b = b;
}

Stuff.prototype.go = function() {
  console.log('go');
};

Stuff.prototype.stop = function() {
  console.log('stop');
};

const test = new Stuff(1, 2);

const mock = Object.create(test);

console.log('mock.a:', mock.a); //mock.a: 1
mock.go() // go

// Object.creat允許我們透過第二個參數初始化一些屬性

const mock2 = Object.create(test, {
  id: {
    value: 100,
    enumerable: true,
  },

  model: {
    value: 'MOCK',
    enumerable: true,
  },
});

console.log('mock2.id:', mock2.id); // mock2.id: 100
```

值得注意的是，上面的屬性`a`與`b`並沒有真正的複製到`mock`與`mock2`中:

```javascript
// 只有印出透過Object.create第二個參數初始化的屬性
Object.keys(mock2).map(key => {
  console.log(key);
});
// id
// model
```

原因在於`Object.create`是將`mock`與`mock2`的`prototype`鏈結到`test`物件上，若在執行遍歷屬性時需要小心這個環節。

## Builder Pattern

當你有一個複雜的模組在被創建時需要根據需求產生不同形式的物件時，builder pattern會是個好選擇。

例如我們去速食店點餐，我們有時候想要A+B餐的組合，有時想要B+C餐的組合，根據不同的客戶提供不同的選擇。

其中Builder Pattern會包含四個部分:

- Product:代表正在被組裝的物件。
- Builder: 此為ConcreteBuilder的interface，在javascript中就沒有用到。
- ConcreteBuilder:負責實作Builder，實作各個部件的製造接口，同時也會有提供client獲取Product的地方。
- Director: 負責提供一些特定訂單或者配置的生產流程，嚴格來說，這個部分是可選擇的，可以直接越過它透過Builder建立產品就好。

```javascript
function Product() {
  this.parts = [];
}

Product.prototype.printParts = function printParts() {
  console.log(`Product parts: ${this.parts}`);
};

function ConcreteBuilder() {
  let product = new Product();

  const reset = () => {
    product = new Product();
  };

  const producePartA = () => {
    product.parts.push('PartA');
  };

  const producePartB = () => {
    product.parts.push('PartB');
  };

  const producePartC = () => {
    product.parts.push('PartC');
  };

  const getProduct = () => {
    const result = product;
    reset();
    return result;
  };

  return {
    producePartA,
    producePartB,
    producePartC,
    getProduct,
  };
}

function Director() {
  let currentBuilder;

  const setBuilder = builder => {
    currentBuilder = builder;
  };

  const buildProductAplusB = () => {
    currentBuilder.producePartA();
    currentBuilder.producePartB();
  };

  const buildProductBplusC = () => {
    currentBuilder.producePartB();
    currentBuilder.producePartC();
  };

  return {
    setBuilder,
    buildProductAplusB,
    buildProductBplusC,
  };
}

const builder = ConcreteBuilder();
const director = Director();
director.setBuilder(builder);

director.buildProductAplusB();
builder.getProduct().printParts(); // Product parts: PartA,PartB

director.buildProductBplusC();
builder.getProduct().printParts(); // Product parts: PartB,PartC

console.log('Custom product:');
builder.producePartA();
builder.producePartB();
builder.producePartC();
builder.getProduct().printParts(); // Product parts: PartA,PartB,PartC
```

在我們的專案中可能不會只有一個`ConcreteBuilder`，可以產品需求來增加。

## 結語

由於javascript本身就與其他傳統物件導向程式語言有所不同，而GoF design pattern中很多著重於upper casting描述物件彼此間繼承以及所屬關係，上面提到的[Factory Pattern](#factory-pattern)、[Abstract Factory Pattern](#abstract-factory-pattern)與[Builder Pattern](#builder-pattern)在使用javascript時就會少了抽象類或者interface這層約束，若少了這層關係這樣還符不符合design pattern的設計理念呢?我個人認為就見仁見智，畢竟程式是活的，只要能夠根據其方針設計程式並且達到該有的目的這樣就夠了。

## Reference

- [dofactory - JavaScript Design Patterns](https://www.dofactory.com/javascript/design-patterns)
- [tutorialspoint - Design Patterns in Java Tutorial](https://www.tutorialspoint.com/design_pattern/index.htm)
- [Refactoring.Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)