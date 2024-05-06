import express from "express";
import bodyParser from "body-parser";
import  env from "dotenv";
import pg from "pg";
import session from "express-session";
import multer from "multer";
import passport from "passport";
import { Strategy } from "passport-local";
import fs from 'fs';
import path from 'path';
import mailSend from "./mailSender.js";
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
      res.render("Tdashboard.ejs",{name:req.user.name})
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
        console.log(userData)
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
    const result =    await db.query("select * from certificate2 where  student_id = $1;",[userData2.id])
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
app.get("/std_details",async(req,res)=>{
    try{
    console.log(req.user.email);
    const results = await db.query("select * from teacher join student on student.section = teacher.teach_sec and teacher.teach_sem = student.sem and teacher.dept = student.branch and teacher.email = $1;", [req.user.email]);
    const studentsData = results.rows
    console.log(studentsData)
    res.render("Tstudents.ejs",{
        studentDataArray : studentsData
    });
    }
    catch(error){
        console.log("error fetching student details.")
    }
    
})
app.get("/Trequest",async(req,res)=>{
   const result = await db.query("SELECT rs.id, rs.student_id, rs.currentSem, rs.activity, rs.location, rs.mode, rs.date, rs.first_selection, rs.second_selection, rs.apg, rs.approval_status, rs.checking_team_status,  rs.image_name, rs.image_data FROM req_stack rs JOIN student s ON rs.student_id = s.id  JOIN teacher t ON s.branch = t.dept AND s.sem = t.teach_sem AND s.section = t.teach_sec  WHERE t.email = $1 AND rs.approval_status = 'false' AND rs.checking_team_status = 'false';",[req.user.email])
   const val = result.rows
//    console.log(val);
    res.render("Trequest.ejs",{dataVal :val})
})

app.get("/approve_reject",(req,res)=>{
    res.render("Trequest.ejs")
})

app.post("/approve_reject", async (req, res) => {
    try {
        console.log(req.body);
        if(req.body.approval === "reject")
        {
            const requestData = await db.query("SELECT * FROM req_stack WHERE image_name = $1", [req.body.image_name]);
            const request = requestData.rows[0];
            const studentData = await db.query("SELECT email FROM student WHERE id = $1", [request.student_id]);
            const studentEmail = studentData.rows[0].email;
            mailSend(studentEmail,"Your App points certificate got rejected due to some reason please contact your corresponding faculty.");
            await db.query("DELETE FROM req_stack WHERE image_name = $1", [req.body.image_name]);
        } 
        else if (req.body.approval === "accept") 
        {
            const requestData = await db.query("SELECT * FROM req_stack WHERE image_name = $1", [req.body.image_name]);
            const request = requestData.rows[0];
            const studentData = await db.query("SELECT email FROM student WHERE id = $1", [request.student_id]);
            const studentEmail = studentData.rows[0].email;
            mailSend(studentEmail,"Your App points are successfully got verified.");
            await db.query("INSERT INTO certificate2 (student_id, currentSem, activity, location, mode, date, first_selection, second_selection, apg, image_name, image_data,approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)",
                [request.student_id, 6, request.activity, request.location, request.mode, request.date, request.first_selection, request.second_selection, request.apg, request.image_name, request.image_data,'True']
            );
            await db.query("DELETE FROM req_stack WHERE image_name = $1", [req.body.image_name]);
        }
        res.redirect("/Trequest");
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Internal Server Error");
    }
});

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
app.post("/request123", upload.single('image'), async(req, res) => {
    const file = req.file;
    const studentID = req.user.id;
    const result = await db.query("SELECT id FROM certificate2 ORDER BY id DESC;")
    const result2 =  await db.query("SELECT id FROM req_stack ORDER BY id DESC;")
    const ren = result.rows[0].id
    const ren2 = result2.rows[0].id+1
    const sum = ren+ren2
    const newFilename = `${studentID}${sum}.${file.originalname.split('.').pop()}`;
    fs.rename(file.path, path.join(file.destination, newFilename), (err) => {
        if (err) {
            console.error("Error renaming file:", err);
            return res.status(500).send("Error renaming file");
        }
        console.log("File renamed successfully");
        res.status(200).send("File uploaded and renamed successfully");
    });
    await db.query("INSERT INTO req_stack (student_id, currentSem, activity, location, mode, date, first_selection, second_selection, apg, image_name, image_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11); ",[req.user.id,6,req.body.activity,req.body.location,req.body.mode,req.body.date,req.body.firstSelection,req.body.secondSelection, 5, newFilename, req.file.image_data])
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
                // console.log(data)
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
