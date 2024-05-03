import express from "express";
import bodyParser from "body-parser";
import  env from "dotenv";
import pg from "pg";
import session from "express-session";
import multer from "multer";
import passport from "passport";
import { Strategy } from "passport-local";
const app = express();
const port = 3000;
env.config();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))
app.use(session({
    secret : "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie : {maxAge:1000*60*60*24*10}
}))
  
app.use(passport.initialize())
app.use(passport.session())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
const upload = multer({storage})

const db =new  pg.Client({
    user: process.env.USER,
    database : process.env.DATABASE,
    port: process.env.PORT,
    host:process.env.HOST,
    password: process.env.PASSWORD
})


db.connect();
app.get("/",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("dashboard.ejs")
      }else{
        res.render("login.ejs");
      }
    
});
app.get("/Authentication",(req,res)=>{
    if(req.isAuthenticated()){
      res.render("dashboard.ejs")
    }else{
      res.redirect("/")
    }
  }
)
app.get("/Teacher-Authentication",(req,res)=>{
    if(req.isAuthenticated()){
      res.render("welcome.ejs",{name:req.user.name})
    }else{
      res.redirect("/")
    }
  }
)
app.get("/profile",async(req,res)=>{
    try{
        const userData = req.user;
        const result= await db.query("select * from app where student_id = $1",[userData.id])
        let prog = result.rows[0]
        console.log(prog)
        let percent  = (prog.totalapp/160)*100
    
        res.render("profile.ejs",{
            name: userData.name,
            rollNo: userData.id,
            email: userData.email,
            contact: userData.contact,
            year: userData.year,
            branch: userData.branch,
            section: userData.section,
            sem: userData.sem,
            image: userData.profile_pic,
            progess:Math.floor(percent),
            total : prog.totalapp
        }); 
    }catch{
        res.send("404")
    }
    
});

// app.get("/dash",(req,res)=>{
// res.render("dashboard.ejs")
// })

app.get("/details",async(req,res)=>{
    try{
    const userData2 = req.user;
    const result =    await db.query("select * from certificate where  student_id = $1;",[userData2.id])
    console.log(result.rows)
     const c= 0
     var t = 0
    res.render("details.ejs",{data : result.rows,count:c,total :t});
    }catch{
        res.send("You're not Authorized person")
    }
    
})

app.get("/request",(req,res)=>{
    res.render("request.ejs")
})
app.get("/wait",(req,res)=>{
    res.render("login.ejs")
})

app.get("/about",(req,res)=>{
    res.render("about.ejs")
})

app.get("/nbot",(req,res) =>{

    res.render("nbot.ejs")
})
app.get("/logout",(req,res)=>{
    req.logout(()=>{
        res.redirect("/")
    });
})

// app.post("/student-login",passport.authenticate("local",{
//     successRedirect:"/Authentication",
//     failureRedirect : "/wait"
// } ));
app.post("/student-login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (info && info.message==="User not found") {
            return res.render("login.ejs",{message: "User not found" ,act:"active"});
        }
        if (info && info.message === "Incorrect password") {
            return res.render("login.ejs",{message:"Incorrect password",act:"active"});
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/Authentication");
        });
    })(req, res, next);
});
app.post("/request123",upload.single('image'),(req,res)=>{
    
    console.log(req.body);
});

app.post("/teacher-login",(req,res,next)=>{
    passport.authenticate("teacher-local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (info && info.message==="User not found") {
            return res.render("login.ejs",{message: "User not found" ,act:"active"});
        }
        if (info && info.message === "Incorrect password") {
            return res.render("login.ejs",{message:"Incorrect password",act:"active"});
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/Teacher-Authentication");
        });
    })(req, res, next);
});

// passport.use(new Strategy(async function verify(username,password,cb){
//     try{
//         var result = await db.query("select * from student where email = $1",[username])
//         if(result.rows.length<=0){
//             // console.log("No user found try to sign Up")
//             // res.render("login.ejs",{message:"No user found try to sign Up",act:"active"})
//             console.log("No user found try to sign Up");
//             return cb(null,false,"User not found")
//         }else{ 
//             var data = result.rows[0]
//             console.log(data)
//             if(password == data.password){
//                 console.log("right")
//                 return cb(null,data)
//                 // res.sendStatus(200)
//             }else{
//                 console.log("wrong password")
//                 return cb(null,false,{message:"wrong password"})
//                 // res.render("login.ejs",{message:"wrong password",act:"active"})
//             }
//         }
//     }
//     catch(err){
        
//         cb(err)
//         // res.redirect("error bro")
//     }
// }))
var data = {}
passport.use("local",new Strategy(async function verify(username, password, cb) {
    try {
        var result = await db.query("select * from student where email = $1", [username])
        if (result.rows.length <= 0) {
            return cb(null, false, { message: "User not found" });
        } else {
             data = result.rows[0];
            if (password ==data.password) {
                console.log(data)
                return cb(null, data);
            } else {
                return cb(null, false, { message: "Incorrect password" });
            }
        }
    } catch (err) {
        cb(err);
    }
}));

passport.use("teacher-local",new Strategy(async function verify(username, password, cb) {
    try {
        var result = await db.query("select * from teacher where email = $1", [username])
        if (result.rows.length <= 0) {
            return cb(null, false, { message: "User not found" });
        } else {
             data = result.rows[0];
            if (password == data.password) {
                console.log(data)
                return cb(null, data);
            } else {
                return cb(null, false, { message: "Incorrect password" });
            }
        }
    } catch (err) {
        cb(err);
    }
}));




passport.serializeUser((data,cb)=>{
    cb(null,data)
})

passport.deserializeUser((data,cb)=>{
    cb(null,data)
})

app.listen(port,(req,res)=>{
    console.log(`http://localhost:${port}`)
});
