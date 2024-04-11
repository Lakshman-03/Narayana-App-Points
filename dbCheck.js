import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = process.env.PORT || 3000;
env.config();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false 
  }
});

// Connect to the database
db.connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

app.get("/",async(req,res)=>{
    const result = await db.query("select * from app;")
    // const result = await db.query("insert into app(student_id,sem1,sem2,sem3,sem4,sem5,sem6,sem7,sem8) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",['21711A0548'	,10	,20,	20,	10,	9	,10,	25,	20])
    console.log(result.rows)
    res.render("login.ejs")
})



// Your routes...

// passport.use(
//   new Strategy(async function verify(username, password, cb) {
//     try {
//       var result = await db.query("select * from student where email = $1", [
//         username,
//       ]);
//       if (result.rows.length <= 0) {
//         return cb(null, false, { message: "User not found" });
//       } else {
//         var data = result.rows[0];
//         if (password == data.password) {
//           console.log(data);
//           return cb(null, data);
//         } else {
//           return cb(null, false, { message: "Incorrect password" });
//         }
//       }
//     } catch (err) {
//       cb(err);
//     }
//   })
// );

// passport.serializeUser((data, cb) => {
//   cb(null, data);
// });

// passport.deserializeUser((data, cb) => {
//   cb(null, data);
// });

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
