import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
const app = express();
const port = 3000;

// app.use(express.static("public"))
// app.use(bodyParser.urlencoded({extended : true}))

// app.use(session({
//     secret : "TOPSECRET",
//     resave: false,
//     saveUninitialized: true,
//     cookie : {maxAge:1000*60*60*24}
// }))
// app.use(passport.initialize())
// app.use(passport.session())


// const db =new  pg.Client({
//     user: "postgres",
//     database : "college",
//     port: 5432,
//     host:"localhost",
//     password: "Lakshman@123"
// })

// db.connect();
// app.get("/",(req,res)=>{
//     res.render("login.ejs");
// });

// app.get("/secrets",(req,res)=>{
//     if(req.isAuthenticated()){
//       res.render("hai.ejs")
//     }else{
//       res.redirect("/student-login")
//     }
//   })
  

// // app.post("/student-login",async (req,res)=>{
// //     let userMail = req.body.email
// //     let password = req.body.password
// //     try{
// //         var result = await db.query("select * from student where email = $1",[userMail])
// //         if(result.rows.length<=0){
// //             console.log("No user found try to sign Up")
// //             res.render("login.ejs",{message:"No user found try to sign Up",act:"active"})
            
// //         }else{ 
// //             var data = result.rows[0]
// //             console.log(data["password"])

// //             if(password == data.password){
// //                 res.sendStatus(200)
// //             }else{
// //                 res.render("login.ejs",{message:"wrong password",act:"active"})
// //             }
// //         }
// //     }catch(err){
// //         res.redirect("error bro")
// //     }
    
// // });



// app.post("/teacher-login",(req,res)=>{
//     res.sendStatus(200)
// });


// app.post("/student-login",passport.authenticate("local",{
//     successRedirect :"/secrets",
//     failureRedirect : "/"
// }))

// passport.use(new Strategy(async function verify(username,password,cb){
//     // let userMail = req.body.email
//     // let password = req.body.password
//     try{
//         var result = await db.query("select * from student where email = $1",[username])
//         if(result.rows.length<=0){
//             return cb("User not found")
//             // console.log("No user found try to sign Up")
//             // res.render("login.ejs",{message:"No user found try to sign Up",act:"active"})
            
//         }else{ 
//             var user = result.rows[0]
//             // console.log(data["password"])
//             var Hashed = user["password"]
//             if(password == Hashed){
//                 return cb(null,user)
//             }else{
//                 return cb(null,false)
//                 // res.render("login.ejs",{message:"wrong password",act:"active"})
//             }
//         }
//     }catch(err){
//         return cb(err)
//         // res.redirect("error bro")
//     }
// }))


// passport.serializeUser((user,cb)=>{
//     cb(null,user)
// })

// passport.deserializeUser((user,cb)=>{
//     cb(null,user)
// })

app.get("/",(req,res)=>{
    res.render("")
})

app.listen(port,(req,res)=>{
    console.log(`http://localhost:${port}`)
});

