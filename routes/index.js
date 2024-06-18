var express = require('express');
var router = express.Router();

const userModel=require("./users");
const postModel=require("./posts");
const passport = require('passport');
const upload=require("./multer");

const localStrategy=require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* router.get('/allusers',async function(req,res,next){
  let user=await userModel.findOne({_id:"66181cc8961c789794338b89"}).populate("posts");
  res.send(user);
})

router.get('/createuser',async function(req,res,next){
  let createduser=await userModel.create({
    user_name: "Dikshant",
    password: "Dikshant",
    posts: [],
    emails: "dikshant@gmail.com",
    fullname:"Dikshant Pooja Sharma",
  });
  res.send(createduser);
});
router.get('/createpost',async function(req,res,next){
  let createpost=await postModel.create({
    postText: "Hello dost wtsup kya hal chal",
    user:"66181cc8961c789794338b89",
  });
  let user=await userModel.findOne({_id:"66181cc8961c789794338b89"});
  user.posts.push(createpost._id);  
  await user.save();
  res.send("done");
})  */
router.get("/profile",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("profile",{user});
});
router.get("/addPost",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render("addPost",{user});
});
router.get("/postDescription",isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("postDescription",{user});
});
router.post("/createPost",isLoggedIn,upload.single("postImage"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/register',function(req,res){
  // const userData=new userModel({
  //   user_name:req.body.user_name,
  //   email:req.body.email,
  //   fullname:req.body.fullname
  // })
  const {username,email,fullname}=req.body;
  const userData=new userModel({username,email,fullname});

  //after register go into below page
  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  });
});

router.get('/feed',function(req,res,next){
  res.render("feed");
});


router.get('/login',function(req,res,next){
  console.log(req.flash('error'));
  res.render('login',{error:req.flash('error')});
});

router.post('/fileupload',isLoggedIn,upload.single("profileImage"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  user.dp=req.file.filename;
  await user.save();
  res.redirect("/profile");
});
router.post('/upload',isLoggedIn,upload.single('file'), async function(req,res,next){
  if(!req.file){
    return res.status(404).send('no file were given');
  }
  // res.send("file uploaded succesfully");
  const user=await userModel.findOne({username:req.session.passport.user});
  const post=await postModel.create({
    image:req.file.filename,
    imageText:req.body.filecaption,
    user:user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/login',passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true
}),function(req,res){});

router.get("/logout",function(req,res){
  req.logOut(function(err){
    if(err){return next(err);}
    res.redirect("/");
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated())return next();
  res.redirect("/login");
}

module.exports = router;
