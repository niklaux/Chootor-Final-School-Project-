const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

let subjects = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://insert credentials//, {useNewUrlParser: true});

//Schemas
const studentSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true}
});

const teacherSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  subjects: [{type: String, required: true}],
  bio: {type: String, required: true},
  city: {type: String, required: true},
  country: {type: String, required: true},
  password: {type: String, required: true}
});

//Models
const Student = mongoose.model("Student", studentSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);

app.get("/", function(req, res){
  res.render("start");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/studentsignup", function(req, res){
  res.render("studentsignup");
});

app.get("/teachersignup", function(req, res){
  res.render("teachersignup");
});

app.get("/signuperror", function(req, res){
  res.render("signuperror");
});

app.get("/settings", function(req, res){
  res.render("settings");
});

app.get("/homepage", function(req, res){

  Teacher.find({}, function(err, foundTeachers){
    res.render("homepage", {teacherCard: foundTeachers});
  });
});

app.get("/search", function(req, res){

  Teacher.find({}, function(err, foundTeachers){
    res.render("search", {teacherCard: foundTeachers});
  });

});

app.post("/search", function(req, res){
  const search = _.startCase(req.body.search);

  Teacher.find({$or: [{subjects: search}, {firstName: search}, {lastName: search}, {city: search}, {country: search}]}, function(err, foundTeachers){
    res.render("search", {teacherCard: foundTeachers});
  });

});

app.post("/teacherlogin", function(req, res){
  const checkEmail = req.body.checkEmail;
  const checkPassword = req.body.checkPassword;

  Teacher.findOne({$and: [{email: checkEmail, password: checkPassword}]}, function(err, foundAccount){
    if (!err){
      if (!foundAccount){
        res.redirect("/login");
      }
      else {
        res.redirect("/homepage");
      }
    }
  });

});

app.post("/studentlogin", function(req, res){
  const checkEmail = req.body.checkEmail;
  const checkPassword = req.body.checkPassword;

  Student.findOne({$and: [{email: checkEmail, password: checkPassword}]}, function(err, foundAccount){
    if (!err){
      if (!foundAccount){
        res.redirect("/login");
      } else {
        res.redirect("/homepage");
      }
    }
  });

});

app.post("/studentsignup", function(req, res){
  const newFirstName = _.startCase(req.body.newFirstName);
  const newLastName  = _.startCase(req.body.newLastName);
  const newEmail = req.body.newEmail;
  const newPassword = req.body.newPassword;

  Student.findOne({email: newEmail}, function(err, foundEmail){
    if (!err){
      if (!foundEmail){
        const newStudentAccount = new Student({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          password: newPassword

        });
        newStudentAccount.save();
        res.redirect("/");

      } else {
        console.log("Email is already registered");
        res.redirect("/signuperror");
      }
    }
  });

});

app.post("/teachersignup", function(req, res){
  const newFirstName = _.startCase(req.body.newFirstName);
  const newLastName  = _.startCase(req.body.newLastName);
  const newEmail = req.body.newEmail;
  const newBio = req.body.newBio;
  const newCity = _.startCase(req.body.newCity);
  const newCountry = _.startCase(req.body.newCountry);
  const newPassword = req.body.newPassword;
  const newSubjects = req.body.newSubjects.split(",");

  for (var i=0; i<newSubjects.length; i++){
    newSubjects[i] = _.startCase(newSubjects[i]);
  }

  Teacher.findOne({email: newEmail}, function(err, foundEmail){
      if (!err){
        if (!foundEmail){
          const newTeacherAccount = new Teacher({
            firstName: newFirstName,
            lastName: newLastName,
            email: newEmail,
            subjects: newSubjects,
            bio: newBio,
            city: newCity,
            country: newCountry,
            password: newPassword
          });

          newTeacherAccount.save();
          res.redirect("/")

        } else {
          console.log("Email is already registered");
          res.redirect("/signuperror");
        }
      }
  });
});

app.post("/studentupdate", function(req,res){
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  Student.findOneAndUpdate({$and: [{email: email, password: oldPassword}]},
    {$set: {password: newPassword}}, function(err, foundAccount){
      if(!err){
        if (!foundAccount){
          res.redirect("/settings");
        }
        else {
          res.redirect("/homepage");
        }
      }
    });

});

app.post("/teacherupdate", function(req,res){
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const newSubjects = req.body.newSubjects.split(",");
  for (var i=0; i<newSubjects.length; i++){
    newSubjects[i] = _.startCase(newSubjects[i]);
  }

  const newBio = req.body.newBio;
  const newCity = _.startCase(req.body.newCity);
  const newCountry = _.startCase(req.body.newCountry);

  Teacher.findOneAndUpdate({$and: [{email: email, password: oldPassword}]},
    {$set:
      {
      password: newPassword,
      subjects: newSubjects,
      bio: newBio,
      city: newCity,
      country: newCountry}},
      function(err, foundAccount){
      if (!err){
        if (!foundAccount){
          res.redirect("/settings");
        }
        else {
          res.redirect("/homepage");
        }
      }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res){
  console.log("Server started successfully");
});
