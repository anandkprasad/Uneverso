var express = require('express');
var passport = require("passport");
var bodyParser  = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var LocalStrategy= require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var flash = require("connect-flash");
var {v4: uuidV4} = require('uuid');

var app = express();

mongoose.connect('mongodb+srv://admin:<password>@cluster0.l5dwg.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    auth: {
      user: "Enter username here",
      password: "Enter password here"
    },
    useNewUrlParser:true,
    useUnifiedTopology: true
      }).then(
        () => { 
            console.log("MongoAtlas Database connected.");
        },
        err => { 
            /** handle initial connection error */ 
            console.log("Error in database connection. ", err);
        }
    );

mongoose.set('useFindAndModify', false);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    type: String,
    cart: []
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

var productSchema = new mongoose.Schema({
    title: String,
    body: String,
    strategy: String,
    image: String,
    featured: Boolean,
    category: String,
    price: String,
    link: String
});

var Product = mongoose.model("Product", productSchema);

var contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String
});

var Contact = mongoose.model("Contact", contactSchema);

var orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    uic: String,
    productid: String,
    product: String
});

var Order = mongoose.model("Order", orderSchema);

//PASSPORT CONFIG
app.use(require('express-session')({
    secret: "I can do it!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());


app.use(function(req,res,next){   
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

isAdmin = function(req,res,next){
    if(req.user.type == 0){
        return next();
    }
    req.flash("error", "You need to be logged in from a admin account to do that!");
    res.redirect("/dashboard");
}

isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login first!");
    res.redirect("/login");
}

app.get('/', function(req, res){
    Product.find({}, function(err, product){
        if(err){
            console.log("Some error occurred");
            console.log(err);
        } else {
            res.render("home.ejs", {product : product});
        }
    })
});

app.get('/about', function(req, res){
    res.render("about.ejs");
});

app.get("/login", function(req, res){
    res.render("login.ejs");
});

app.get("/signup", function(req, res){
    res.render("signup.ejs");
});

app.get("/dashboard",isLoggedIn, function(req, res){
    if(req.user.type == 0){
        res.redirect('/admin')
    } else {
        res.redirect('/')
    }
})

app.get("/admin", isLoggedIn, isAdmin, function(req,res){
    Order.find({}, function(err,order){
        if(err){
            res.send("Something went wrong!");
        } else {
            Contact.find({}, function(err, contact){
                if(err){
                    res.send("Something went Wrong!");
                } else {
                    Product.find({}, function(err, product){
                        if(err){
                            res.send("Something went Wrong!");
                        } else {
                            res.render("admin.ejs", {product: product, contact: contact, order: order});
                        }
                    })
                }
            })
        }
    });
});

app.post("/signup", function(req, res){
    User.register(new User({username: req.body.username, email: req.body.email, type: req.body.type}), req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("/signup");
        }
        passport.authenticate("local")(req,res, function(){
            res.redirect("/");
        });    
    });
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), function(req,res){
});

app.get("/logout" ,function(req,res){
    req.logOut();
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
});

//Categories

app.get('/products', function(req, res){
    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("all-products.ejs", {product: product});
        }
    })
})

app.get('/products/mobile', function(req, res){
    var input = "Mobile";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/electronics', function(req, res){
    var input = "Electronics";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/fashion', function(req, res){
    var input = "fashion";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/home', function(req, res){
    var input = "Home";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/sports', function(req, res){
    var input = "Sports";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/health', function(req, res){
    var input = "Health";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/toys', function(req, res){
    var input = "Toys";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});

app.get('/products/gifts', function(req, res){
    var input = "Gifts";

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
});


app.post('/search', function(req,res){
    var input = req.body.input;

    if(input == "phones" || input == "phone"){
        input = "mobile";
    }

    if(input == "beauty"){
        input = "health";
    }

    if(input == "kids" || input == "kid"){
        input = "toys";
    }

    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("searchResults.ejs", {input: input, product: product});
        }
    })
})

app.get("/showproduct/:id", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("productnetwork.ejs", {foundProduct: foundProduct});
        }
    })
})

app.get("/product/affiliate/:id", function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.redirect(foundProduct.link);
        }
    })
})

app.get('/product/cart/:id',isLoggedIn, function(req, res){
    var check = false;
    for(var i = 0; i < req.user.cart.length; i++){
        if(req.params.id == req.user.cart[i]){
            check = true;
        }
    }

    if(!check){
        User.findByIdAndUpdate(req.user._id, {
            $push:{cart: req.params.id}
        }, {new : true}, function(err, result){
            if(err){
                res.send("Something went wrong!");
            } else {
                req.flash("success", "Product added to cart");
                res.redirect("/cart");
            }
        });
    } else {
        req.flash("error", "Product is already in cart");
        res.redirect("/cart");
    }
})

app.get('/cart/remove/:id', function(req,res){
    User.findByIdAndUpdate(req.user._id, {
        $pull:{cart: req.params.id}
    }, {new : true}, function(err, result){
        if(err){
            res.send("Something went wrong!");
        } else {
            req.flash("success", "Product removed from cart");
            res.redirect("/cart");
        }
    });
});

app.get('/cart' ,isLoggedIn, function(req, res){
  
    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else {
            res.render("cart.ejs", {product: product});
        }
    })
})

app.get('/contact', function(req, res){
    res.render("contact.ejs");
});

app.post('/contact', function(req,res){

    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var message = req.body.message;

    Contact.create({name: name, email: email, phone: phone, message: message}, function(err, result){
        if(err){
            res.send("Something went Wrong!");
        } else {
            req.flash("success", "Your response has been recorded successfully. We will get back to you soon.");
            res.redirect("/");
        }
    })

})

app.post("/admin/product", isLoggedIn, isAdmin, function(req,res){
    var title =  req.body.title;
    var body  =  req.body.body;
    var image = req.body.image;
    var featured = req.body.featured;
    var category = req.body.category;
    var strategy = req.body.strategy;
    var price = req.body.price;
    var link = req.body.link;

    var product = { 
                    title: title, 
                    body: body,
                    image: image,  
                    featured :featured, 
                    category: category, 
                    strategy: strategy, 
                    price: price, 
                    link: link 
                  };
    
    Product.create(product, function(err, foundProduct){
        if(err){
            console.log("Some error occurred");
            console.log(err);
        }else {
             res.redirect("/admin"); 
        }
    });
});

app.get('/admin/product/new', function(req, res){
    res.render("product-new.ejs");
})

app.get("/admin/product", function(req, res){
    Product.find({}, function(err, product){
        if(err){
            res.send("Something went wrong!");
        } else{
            res.render("admin-products.ejs", {product: product});
        }
    });
});

app.get("/admin/order", function(req, res){
    Order.find({}, function(err, order){
        if(err){
            res.send("Something went wrong!");
        } else{
            res.render("admin-orders.ejs", {order: order});
        }
    });
});

app.get("/admin/contact", function(req, res){
    Contact.find({}, function(err, contact){
        if(err){
            res.send("Something went wrong!");
        } else{
            res.render("admin-contacts.ejs", {contact: contact});
        }
    });
});

app.get("/admin/product/remove/:id", function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err, product){
        if(err){
            res.send("Something went Wrong!");
        } else {
            req.flash("success", "Product removed successfully!");
            res.redirect("/admin");
        }
    });
});

app.get('/checkout', isLoggedIn, function(req, res){
    Product.find({}, function(err, product){
        if(err){
            res.send("Something went Wrong!");
        } else {
            res.render("checkout.ejs", {product: product});
        }
    })
})

app.post('/success/:id',isLoggedIn, function(req, res){
    
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var uic = req.body.uic;
    var productid = req.params.id;

    Product.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.send("Something went wrong!");
        } else {
            var order = {
                name: name,
                email: email,
                phone: phone,
                uic: uic,
                productid: productid,
                product: foundProduct.title
            }

            Order.create(order, function(err, foundOrder){
                if(err){
                    console.log("Some error occurred");
                    console.log(err);
                }else {
                    res.render("success-checkout.ejs");
                }
            });
        }
    })
});

app.get('/buynow/:id',isLoggedIn, function(req,res){
    var orderid = uuidV4();

    Product.findById(req.params.id, function(err, product){
        if(err){
            res.send("Something went Wrong!");
        } else {
            res.render("buynow.ejs", {product: product});
        }
    });
});

app.listen(process.env.port, function(req, res){
    console.log("Uneverso Server Started on port 3000. Welcome to Uneverso Store!");
})