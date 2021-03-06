Meteor.methods({
  comment: makeComment,
  changePassword: changePassword,
  changeUser: changeUser,
  changeSetting: changeSetting,
  post: makePost,
  login: loginUser,
  deleteComment: deleteComment,
  deletePost: deletePost
});

function checkAuth(auth) {
  return Users.findOne({apikey: auth});
}

function changePassword(args) {
  if(user = checkAuth(args.auth)) {
    if(hashPassword(args.current_password, user.salt) == user.password) {
      Users.update({apikey: args.auth}, {$set: {password: hashPassword(args.password, user.salt)}});
      return true;
    }
  }
  return false;
}

function changeUser(args) {
  if(user = checkAuth(args.auth)) {
    Users.update({apikey: args.auth}, {$set: {name: args.name}});
    return true;
  }
  return false;
}

function changeSetting(args) {
  if(user = checkAuth(args.auth)) {
    _.each(args.settings, function(setting) {
      Settings.update({key: setting[0]}, {$set: {value: setting[1]}});
    });
    return true;
  }
  return false;
}

function deleteComment(args) {
  if(user = checkAuth(args.auth)) {
    Comments.remove({_id: args.commentId});
    return true;
  }
  return false;
}

function deletePost(args) {
  if(user = checkAuth(args.auth)) {
    Posts.remove({_id: args.commentId});
    return true;
  }
  return false;
}

function loginUser(username, password) {
  user = Users.findOne({username: username});
  if(user) {
    if(user.password == hashPassword(password, user.salt)) {
      thisUser = {name: user.name, username: user.username, auth: user.apikey};
      return thisUser;
    }
  }
  throw new Meteor.Error(401, 'Login not correct');
}

function makePost(args) {
  if(user = checkAuth(args.auth)) {
    Posts.insert({
      title: args.title,
      body: args.body,
      slug: args.slug,
      userId: user._id,
      created: new Date()
    });
    return true;
  }
  return false;
}

function makeComment(args) {
  if(args && args.postId) {
    Comments.insert({
      postId: args.postId,
      name: args.name,
      comment: args.comment,
      created: new Date()
    });
  }
}

function setSetting(key, value, description) {
  Settings.insert({
    key: key,
    value: value,
    description: description
  });
}

function hashPassword(password, salt) {
  return Crypto.SHA256(salt + '-' + password);
}

function createUser(vals) {
  vals.salt = Crypto.SHA256(Math.random().toString());
  vals.password = hashPassword(vals.password, vals.salt);
  vals.created = new Date();
  //This apikey is because we don't have server side sessions yet
  vals.apikey = Crypto.SHA256(Math.random().toString());
  id = Users.insert(vals);
  return id;
}
