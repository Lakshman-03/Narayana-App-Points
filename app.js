import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
const app = express();
const port = 3000;

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))
app.use(session({
    secret : "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie : {maxAge:1000*60*60*24}
}))
  
app.use(passport.initialize())
app.use(passport.session())
  
const db =new  pg.Client({
    user: "postgres",
    database : "college",
    port: 5432,
    host:"localhost",
    password: "Lakshman@123"
})

db.connect();
app.get("/",(req,res)=>{
    res.render("login.ejs");
});
app.get("/Authentication",(req,res)=>{
    if(req.isAuthenticated()){
      res.render("hai.ejs")
    }else{
      res.redirect("/")
    }
  })

// app.post("/student-login",async (req,res)=>{
//     let userMail = req.body.email
//     let password = req.body.password
//     try{
//         var result = await db.query("select * from student where email = $1",[userMail])
//         if(result.rows.length<=0){
//             console.log("No user found try to sign Up")
//             res.render("login.ejs",{message:"No user found try to sign Up",act:"active"})
            
//         }else{ 
//             var data = result.rows[0]
//             console.log(data["password"])
//             if(password == data.password){
//                 res.sendStatus(200)
//             }else{
//                 res.render("login.ejs",{message:"wrong password",act:"active"})
//             }
//         }
//     }catch(err){
//         res.redirect("error bro")
//     }
    
// });
app.get("/wait",(req,res)=>{
    res.render("login.ejs")
})


app.post("/student-login",passport.authenticate("local",{
    successRedirect:"/Authentication",
    failureRedirect : "/wait"
} ));


app.post("/teacher-login",(req,res)=>{
    res.sendStatus(200)
});

passport.use(new Strategy(async function verify(username,password,cb){
    try{
        var result = await db.query("select * from student where email = $1",[username])
        if(result.rows.length<=0){
            // console.log("No user found try to sign Up")
            // res.render("login.ejs",{message:"No user found try to sign Up",act:"active"})
            console.log("No user found try to sign Up");
            return cb("User not found")
        }else{ 
            var data = result.rows[0]
            console.log(data)
            if(password == data.password){
                console.log("right")
                return cb(null,data)
                // res.sendStatus(200)
            }else{
                console.log("wrong password")
                return cb(null,false)
                // res.render("login.ejs",{message:"wrong password",act:"active"})
            }
        }
    }
    catch(err){
        
        cb(err)
        // res.redirect("error bro")
    }
}))




passport.serializeUser((data,cb)=>{
    cb(null,data)
})

passport.deserializeUser((data,cb)=>{
    cb(null,data)
})

app.listen(port,(req,res)=>{
    console.log(`http://localhost:${port}`)
});
