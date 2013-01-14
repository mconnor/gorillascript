test "empty class", #
  let Class = class
  
  eq "function", typeof Class
  eq 0, Class.length
  ok new Class() instanceof Class

test "empty class, two-level inheritance", #
  let Base = class
  let Child = class extends Base

  eq "function", typeof Child
  eq 0, Child.length
  ok new Child() instanceof Child
  ok new Child() instanceof Base

test "simple class, empty constructor", #
  let Class = class
    def constructor() ->
  
  ok Class
  ok new Class() instanceof Class

test "simple class, simple constructor", #
  let mutable hit-constructor = false
  let Class = class
    def constructor()
      hit-constructor := true
  
  ok Class
  ok not hit-constructor
  ok new Class() instanceof Class
  ok hit-constructor

test "empty class, two-level inheritance", #
  let mutable hit-constructor = false
  let Base = class
    def constructor()
      hit-constructor := true
  let Child = class extends Base

  eq "function", typeof Child
  eq 0, Child.length
  ok not hit-constructor
  ok new Child() instanceof Child
  ok hit-constructor
  ok new Child() instanceof Base

test "calling super from child constructor", #
  let mutable hit-constructor = false
  let Base = class
    def constructor()
      hit-constructor := true
  let Child = class extends Base
    def constructor()
      super()

  eq "function", typeof(Child)
  eq 0, Child.length
  eq false, hit-constructor
  new Child()
  eq true, hit-constructor

test "simple class with members", #
  let Class = class
    def method(...args)
      [this, args]
  
  let obj = new Class
  ok obj instanceof Class
  arrayEq [obj, []], obj.method()
  arrayEq [obj, ["alpha"]], obj.method "alpha"
  arrayEq [obj, ["alpha", "bravo"]], obj.method "alpha", "bravo"

test "calling super from a child method", #
  let Base = class
    def method(...args) -> [this, args]
    def other(value) -> value + 1

  eq "function", typeof(Base)
  let base = new Base()
  arrayEq [base, []], base.method()
  arrayEq [base, ["alpha"]], base.method "alpha"
  arrayEq [base, ["alpha", "bravo"]], base.method "alpha", "bravo"
  eq 5, base.other(4)

  let Child = class extends Base
    def other(value) -> super.other(value) + 1

  eq "function", typeof(Child)
  let child = new Child()
  arrayEq [child, []], child.method()
  arrayEq [child, ["alpha"]], child.method "alpha"
  arrayEq [child, ["alpha", "bravo"]], child.method "alpha", "bravo"
  eq 5, child.other(3)

test "class can have private static variables", #
  let calls = 5
  let Class = class
    let mutable calls = 0
    def hello()
      calls += 1
      "Hello: $calls"
  
  eq "Hello: 1", (new Class).hello()
  eq "Hello: 2", (new Class).hello()
  eq 5, calls

test "class with logic in declaration", #
  let make(value)
    let Class = class
      if value
        def name() -> "alpha"
      else
        def name() -> "bravo"
    Class
  
  let Alpha = make(true)
  let Bravo = make(false)
  eq "alpha", new Alpha().name()
  eq "bravo", new Bravo().name()

test "calling super and passing along all arguments", #
  let Base = class
    def thing(...args) -> [this, args]

  let Child = class extends Base
    def thing(...args) -> [this, args, super.thing(...args)]
  
  let child = new Child
  arrayEq [child, [], [child, []]], child.thing()
  arrayEq [child, ["alpha"], [child, ["alpha"]]], child.thing("alpha")
  arrayEq [child, ["alpha", "bravo"], [child, ["alpha", "bravo"]]], child.thing("alpha", "bravo")

test "public static members", #
  let NoCtor = class
    @static := "alpha"
  
  eq "alpha", NoCtor.static
  eq void, (new NoCtor).static
  
  let WithCtor = class
    def constructor() ->
    @static := "bravo"
  
  eq "bravo", WithCtor.static
  eq void, (new WithCtor).static
  
  let WithLateCtor = class
    @static := "charlie"
    def constructor() ->
  
  eq "charlie", WithLateCtor.static
  eq void, (new WithLateCtor).static

test "nested classes", #
  let Outer = class
    def constructor()
      @label := "Outer"
    
    def method() -> "from outer"
    
    @Inner := class
      def constructor()
        @label := "Inner"
      
      def method() -> "from inner"

  eq "Outer", (new Outer).label
  eq "Outer", new Outer().label
  eq "from outer", (new Outer).method()
  eq "from outer", new Outer().method()
  eq "Inner", (new Outer.Inner).label
  eq "Inner", new Outer.Inner().label
  eq "from inner", (new Outer.Inner).method()
  eq "from inner", new Outer.Inner().method()

test "named nested classes", #
  class Outer
    def constructor()
      @label := "Outer"
    
    def method() -> "from outer"
    
    class @Inner
      def constructor()
        @label := "Inner"
      
      def method() -> "from inner"

  eq "Outer", (new Outer).label
  eq "Outer", new Outer().label
  eq "from outer", (new Outer).method()
  eq "from outer", new Outer().method()
  eq "Inner", (new Outer.Inner).label
  eq "Inner", new Outer.Inner().label
  eq "from inner", (new Outer.Inner).method()
  eq "from inner", new Outer.Inner().method()

test "Nested inheritance", #
  let Outer = class
    def constructor()
      @label := "Outer"
    
    def outer() -> "outer"
    def method() -> "from outer"
    
    @Inner := class extends this
      def constructor()
        @label := "Inner"
    
      def method() -> "from inner"

  eq "Outer", (new Outer).label
  eq "Outer", new Outer().label
  eq "from outer", (new Outer).method()
  eq "from outer", new Outer().method()
  eq "outer", (new Outer).outer()
  eq "outer", new Outer().outer()
  eq "Inner", (new Outer.Inner).label
  eq "Inner", new Outer.Inner().label
  eq "from inner", (new Outer.Inner).method()
  eq "from inner", new Outer.Inner().method()
  eq "outer", (new Outer.Inner).outer()
  eq "outer", new Outer.Inner().outer()
  ok new Outer.Inner() instanceof Outer.Inner
  ok new Outer.Inner() instanceof Outer
  ok new Outer() instanceof Outer
  ok new Outer() not instanceof Outer.Inner

test "a four-level inheritance chain", #
  let Base = class
    def constructor(name)
      @name := name
    
    def bark() -> "arf"
    
    @static := "static"
  
  eq 1, Base.length, "Base.length"
  eq "static", Base.static, 'Base.static == "static"'
  eq "name", new Base("name").name, 'new Base("name").name == "name"'
  eq "arf", new Base("name").bark(), 'new Base("name").bark() == "arf"'
  
  let FirstChild = class extends Base
    def bark() -> "woof"
  
  eq "name", new FirstChild("name").name, 'new FirstChild("name").name == "name"'
  eq "woof", new FirstChild("name").bark(), 'new FirstChild("name").bark() == "woof"'
  
  let SecondChild = class extends FirstChild
    def constructor(name, sign)
      super(name)
      @sign := sign
  
  eq 2, SecondChild.length
  eq "name", new SecondChild("name", "taurus").name
  eq "taurus", new SecondChild("name", "taurus").sign
  eq "woof", new SecondChild("name", "taurus").bark()
  
  let ThirdChild = class extends SecondChild
    def bark(name)
      super.bark() & ", " & name
  
  eq "name", new ThirdChild("name", "taurus").name
  eq "taurus", new ThirdChild("name", "taurus").sign
  eq "woof, sammy", new ThirdChild("name", "taurus").bark("sammy")

test "spread constructor", #
  let Class = class
    def constructor(...args)
      @args := args
  
  eq 0, Class.length
  arrayEq ["alpha", "bravo", "charlie"], new Class("alpha", "bravo", "charlie").args
  let arr = [1, 2, 3]
  ok new Class(...arr) instanceof Class
  arrayEq arr, new Class(...arr).args

test "class with JS-keyword properties as method names", #
  let Class = class
    def if() -> true
    def while = true
  
  eq true, new Class().if()
  eq true, new Class().while

test "class with literal string names", #
  let Class = class
    def "method" = #-> "method"
    def "other method" = #-> "other method"

  let obj = new Class
  ok obj instanceof Class
  eq "method", obj.method()
  eq "other method", obj["other method"]()

test "namespaced classes don't reserve their name outside their scope", #
  let alpha = {}
  let bravo = {}
  
  alpha.Monkey := class
    @label := "alpha"
  
  bravo.Monkey := class
    @label := "bravo"
  
  eq "undefined", typeof eval "Monkey"
  eq "alpha", alpha.Monkey.label
  eq "bravo", bravo.Monkey.label

test "class factory", #
  let makeClass(superClass)
    class extends superClass
      def fun()
        super.fun() & " B"
  
  let Base = class
    def fun() -> "A"
  
  let Child = makeClass(Base)
  eq "A B", new Child().fun()

test "named class", #
  class Class
    def method() -> "result"
    @static := "hello"
  
  eq "function", typeof Class
  eq 0, Class.length
  eq "Class", Class.displayName
  ok new Class instanceof Class
  eq "result", new Class().method()
  eq "hello", Class.static

test "namespaced named classes", #
  let alpha = {}
  let bravo = {}
  
  class alpha.Monkey
    @label := "alpha"
  
  class bravo.Monkey
    @label := "bravo"
  
  eq "undefined", typeof eval "Monkey"
  eq "alpha", alpha.Monkey.label
  eq "bravo", bravo.Monkey.label
  eq "Monkey", alpha.Monkey.displayName
  eq "Monkey", bravo.Monkey.displayName

test "named class as an expression rather than a statement", #
  let Alpha = class Bravo
    def method() -> "blah"
  
  eq Alpha, Bravo
  eq "Bravo", Alpha.displayName
  ok new Alpha instanceof Bravo
  ok new Bravo instanceof Alpha

test "named class with inheritance", #
  class Alpha
    def method() -> "alpha"
  
  class Bravo extends Alpha
    def method()
      "$(super.method()) bravo"
  
  eq "alpha", new Alpha().method()
  eq "alpha bravo", new Bravo().method()

test "namespaced named class with inheritance", #
  class Base
    def method() -> "base"
  
  let alpha = {}
  let bravo = {}
  
  class alpha.Child extends Base
    def method()
      "$(super.method()) alpha"
  
  class bravo.Child extends Base
    def method()
      "$(super.method()) bravo"
  
  eq "base alpha", new alpha.Child().method()
  eq "base bravo", new bravo.Child().method()

test "class with calculated method names", #
  class Class
    for i in 1 til 4
      def ("method" & i) = #-> i
  
  let obj = new Class()
  eq 1, obj.method1()
  eq 2, obj.method2()
  eq 3, obj.method3()

test "class with interpolated method names", #
  class Class
    for i in 1 til 4
      def "method$i" = #-> i
  
  let obj = new Class()
  eq 1, obj.method1()
  eq 2, obj.method2()
  eq 3, obj.method3()

test "calling class without new returns correct class", #
  class Class
  
  ok Class() instanceof Class
  
  let anon = class
  
  ok anon() instanceof anon

test "calling class without new throws an error", #
  class Class
    def constructor() ->
  
  throws #-> Class(), #(e) -> e.message == "Class must be called with new"
  
  let anon = class
    def constructor() ->
  
  throws #-> anon(), #(e) -> e.message == "Must be called with new"

test "multiple constructors", #
  let makeClass(value) -> class Class
    @static := value // occurring before the constructor
    if value
      def constructor()
        @value := true
    else
      def constructor()
        @value := false

  let truthy = makeClass(true)
  let falsy = makeClass(false)
  ok new truthy().value
  ok not new falsy().value
  eq "Class", truthy.displayName
  eq "Class", falsy.displayName
  ok truthy.static
  ok not falsy.static

test "bound constructors", #
  class Class
    def constructor(value)@
      @value := value
  
  ok Class("alpha") instanceof Class
  ok new Class("bravo") instanceof Class
  eq "charlie", Class("charlie").value
  eq "delta", new Class("delta").value

test "constructor set to other function", #
  class Class
    let ctor(value)
      @value := value
      return
    def constructor = ctor
  
  ok new Class() instanceof Class
  eq "alpha", new Class("alpha").value

test "constructor set to mutable function, later changed.", #
  class Class
    let mutable ctor = #(value)
      @value := value
      return
    def constructor = ctor
    ctor := null
  
  ok new Class() instanceof Class
  eq "alpha", new Class("alpha").value

test "constructor set to provided function", #
  let make(ctor) -> class
    def constructor = ctor
  
  let Class = make #(value) -> do
    @value := value
    return
  
  ok new Class() instanceof Class
  eq "alpha", new Class("alpha").value

test "bound static methods", #
  let obj = {}
  
  class Class
    def constructor(@id) ->
    
    @new := #@ -> new this(obj)
  
  ok Class.new() instanceof Class
  eq obj, Class.new().id

test "extending expressions rather than simple accesses", #
  class Base
  
  let id(x) -> x
  
  class Child extends id Base
  
  ok new Child instanceof Child
  ok new Child instanceof Base

test "Named class that is a reserved word", #
  let obj = {}
  
  class obj.if
  
  ok new obj.if instanceof obj.if
  //eq "if", obj.if.displayName


test "constructor with this setters", #
  class Class
    def constructor(@alpha, @bravo) ->
  
  ok new Class("charlie", "delta") instanceof Class
  eq "charlie", new Class("charlie", "delta").alpha
  eq "delta", new Class("charlie", "delta").bravo

/*
let global = window ? this ? GLOBAL
test "bound constructor with this setters", #
  class Class
    def constructor(@alpha, @bravo)@ ->
  
  delete global.alpha
  ok Class("charlie", "delta") instanceof Class
  ok global not ownskey "alpha"
  eq "charlie", Class("charlie", "delta").alpha
  eq "delta", Class("charlie", "delta").bravo
*/
test "using super without having a superclass should direct to Object", #
  class Class
    def constructor(@value) ->
    def has(key)
      super.hasOwnProperty(key)
  
  ok new Class instanceof Class
  ok new Class instanceof Object
  ok new Class().has("value")

/*
test "two constructors on top-level", -> do
  throws -> Cotton.compile("""class Class
    new = ->
    new = ->
  end"""), (e) -> e.line == 3
end
*/

test "default value on method", #
  class Class
    def method(value = "hello")
      value
  
  ok new Class instanceof Class
  eq "hello", new Class().method()
  eq "there", new Class().method("there")

test "type checking on method", #
  class Class
    def method(value as String)
      value
  
  ok new Class instanceof Class
  eq "hello", new Class().method("hello")
  eq "there", new Class().method("there")
  throws #-> new Class().method(), TypeError
  throws #-> new Class().method(void), TypeError
  throws #-> new Class().method(null), TypeError
  throws #-> new Class().method(0), TypeError
  throws #-> new Class().method({}), TypeError
  throws #-> new Class().method([]), TypeError

test "Empty definition turns into not implemented", #
  class Class
    def method
  
  throws #-> new Class().method(), #(e) -> e.message == "Not implemented: Class.method()"

test "Immediate new call of a class", #
  let object = new class
  
  eq "object", typeof object