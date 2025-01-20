const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");

const app=express();

// Middleware for parsing URL-encoded data and serving static files
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Set the view engine to EJS for rendering html templates
app.set('view engine', 'ejs');


// Connect to MongoDB database 'noteDB' (create it if it doesn't exist)
mongoose.connect("mongodb://localhost:27017/noteDB");

//schema or structure of the note collection
const noteSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Link to User collection
      ref: 'User',
    },
    creationDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    tags: {
      type: [String],
      default: [],
    },
    collaborators: {
      type: [mongoose.Schema.Types.ObjectId], // References to other users
      ref: 'User',
      default: [],
    },
  });


//schema  of the user collection
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId, // Reference to Note collection
        ref: 'Note',
      },
    ],
  });

//For enabling full text search
noteSchema.index({ title: 'text', content: 'text' });

//Creation of the models
const User=new mongoose.model('User',userSchema);
const Note=new mongoose.model('Note',noteSchema);

// Route for rendering the signup page
app.get("/",function(req,res){
    res.render("signup");
});


// Route to handle user signup
app.post("/signup", function(req, res) {
  // Create a new user instance from the form data
  const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
  });

  // Save the new user to the database
  newUser.save()
      .then(function() {
          // After saving the user, fetch all notes and render the home page
          Note.find({})
              .then((notes) => {
                  res.render("home", { notes: notes, searchQuery: "", isSearch: false });
              })
              .catch((err) => {
                  console.log(err);
                  res.render("home", { notes: [], searchQuery: "", isSearch: false });  // Handle error and render empty notes
              });
      })
      .catch(function(err) {
          console.log(err);
      });
});

// Route to render the login page
app.get("/login",function(req,res){
    res.render("login");
});

// Route to handle user login
app.post("/login",function(req,res){
    // Find a user by name and password
    User.findOne({name:req.body.name,password:req.body.password}).
    then((foundUser)=>{
        if(!foundUser){
            res.render("failure");// Render failure page if user not found
        }else{
            res.redirect("home");// Redirect to home page if login is successful
        }
    })
    .catch((err)=>{
        console.log(err);
    })
});

// Route to handle failure and redirect to the signup page
app.post("/failure",function(req,res){
    res.redirect("/");
});

// Route to render the home page with all notes
app.get("/home",function(req,res){
   // Fetch all notes from the database
    Note.find({})
    .then((notes)=>{
        res.render("home",{notes:notes,searchQuery:"",isSearch:false});
    })
});

// Route to handle note creation
app.post("/home",function(req,res){
  // Create a new note from the form data
    const newNote=new Note({
        title:req.body.title,
        content:req.body.content,
        tags:req.body.tags,
    });
    // Save the new note to the database
    newNote.save()
    .then(function(){
        res.redirect("home");// Redirect to home page after saving the note
    })
    .catch(function(err){
        console.log(err);
    });
});

// Route to render the create note page
app.get("/create",function(req,res){
    res.render("create",{searchQuery:""});
})

// Route to display a specific note based on the title
app.get("/:postName",function(req,res){
    const requestedTitle=req.params.postName;
    Note.findOne({title:requestedTitle})
    .then(function(note){
        res.render("post",{note:note,searchQuery:""});
    })
    .catch(function(err){
        console.log(err);
    })
});

// Route for handling search requests
app.post('/search', function (req, res) {
    const query = req.body.search || "";
  
    // Check if the query looks like a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(query)) {
      Note.findById(query)
        .then((note) => {
          if (note) {
            // If a note with the given ID is found, render post.ejs
            return res.render('post', { note: note, searchQuery: query ,isSearch:true});
          } else {
            // If no note with the given ID is found, proceed with text search
            return Note.find({ $text: { $search: query } });
          }
        })
        .then((notes) => {
          if (Array.isArray(notes) && notes.length > 0) {
            // If notes are found in the text search, render the home page
            res.render('home', { notes: notes, searchQuery: query ,isSearch:true});
          } else if (Array.isArray(notes)) {
            // If no notes are found in the text search
            res.render("searchFailure");
          }
        })
        .catch((err) => {
          console.log(err);
          res.render("searchFailure");
        });
    } else {
      // If the query is not a valid ObjectId, perform a text search
      Note.find({ $text: { $search: query } })
        .then((notes) => {
          if (notes.length > 0) {
            res.render('home', { notes: notes, searchQuery: query ,isSearch:true});
          } else {
            res.render("searchFailure");
          }
        })
        .catch((err) => {
          console.log(err);
          res.render("searchFailure");
        });
    }
  });
  
// Route to delete a specific note
app.post("/delete/:noteID",function(req,res){
    const noteID=req.params.noteID;
    Note.findByIdAndDelete(noteID)
    .then(()=>{
        res.redirect("/home");// Redirect to home page after deleting the note
    })
    .catch((err)=>{
        console.log(err);
        res.redirect("/home");
    })
})

// Route to render the edit note page
app.get("/edit/:noteId",function(req,res){
    const noteId=req.params.noteId;
    Note.findById(noteId)
    .then((note)=>{
        if(!note){
            res.redirect("/home");// Redirect if the note doesn't exist
        }else{
        res.render("edit",{note:note,searchQuery:""});
        }
    })
    .catch((err)=>{
        console.log(err);
     })
})

// Route to handle note edits
app.post("/edit/:noteID", (req, res) => {
    const noteID = req.params.noteID;

    // Updated fields
    const updatedNote = {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags.split(",").map((tag) => tag.trim()), // Convert tags to an array
        lastUpdate: Date.now() // Update the lastUpdate timestamp
    };

    Note.findByIdAndUpdate(noteID, updatedNote, { new: true })
        .then(() => {
            console.log(`Note with ID ${noteID} updated successfully.`);
            res.redirect("/home");
        })
        .catch((err) => {
            console.error(err);
            res.redirect("/home");
        });
});

// Start the server 
app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000");
});



