var Selfies = new Mongo.Collection('selfies');
var ATTRIBUTES = {
  colorCategory: ["red", "pink", "orange", "nude", "brown", "purple", "other"],
  productType: ["Lip Stick", "Lip Stain", "Lip Gloss", "Lip Balm"],
  applicationType: ["Gel", "Stick", "Liquid", "Pencil"],
  finish: ["Matte", "Glossy", "Silky", "Satin", "Dry"],
  intensity: ["Sheer", "Medium", "Opaque", "Intsense", "Extreme"],
  priceGroup: ["$", "$$", "$$$"],
  skinTone: ["Fair", "Light", "Medium", "Tan", "Dark"],
  concern: ["Multi colored lips", "Small lips", "Uneven lips"],
  hairColor: ["Brown","Black","Red", "Blonde", "Dyed"],
  eyeColor: ["Brown","Black","Green","Blue"],
};

if (Meteor.isClient) {
  Session.set({
    "filterSelections": {}
  });

  Router.configure({
    layoutTemplate: 'layout'
  });
  Router.route('/', function() {
    this.render('home');
  });
  Router.route('/me', function() {
    this.render('account');
  });
  Router.route('/upload', function() {
    this.render('submission');
  });
  Template.body.events({
    'click .upload-button': function() {
      UI.insert(UI.render(Template.submission), document.body);
    }
  });
  Template.home.helpers({
    selfies: function() {
      return Selfies.find(Session.get("filterSelections"));
    },
    noSelfies: function() {
      return  Selfies.find(Session.get("filterSelections")).count() === 0;
    }
  });
  Template.login.events({
      'click #facebook-login': function(event) {
          Meteor.loginWithFacebook({}, function(err){
              if (err) {
                  throw new Meteor.Error("Facebook login failed");
              } else {
                Router.go('/me');
              }
          });
      },

      'click #logout': function(event) {
          Meteor.logout(function(err){
              if (err) {
                  throw new Meteor.Error("Logout failed");
              }
          })
      },
      'click #profile': function(event) {
        Router.go('/me');
      }
  });
  Template.filters.helpers({
    dropdownAttributes: function() {
      return {
        title: this.title,
        id: this.attribute,
        attributes: ATTRIBUTES[this.attribute],
      };
    },
    selectedOptions: function(filter) {
      if(Session.get("filterSelections")[filter]){
        return Session.get("filterSelections")[filter]["$in"];
      } else {
        return "";
      }
    },
    attributeList: function() {
      return $.map(ATTRIBUTES, function(v, i){return i;});
    },
    shouldDisplayClear: function() {
      return Object.keys(Session.get("filterSelections")).length !== 0;
    }
  });
  Template.filters.events({
    'click .clear-button': function(event, template) {
      Session.set("filterSelections", {});
    }
  });
  Template.dropdownItem.events({
    'click .item': function(event, template) {
      var filter = this.filter;
      var attribute = this.attribute;
      var selections = Session.get("filterSelections");
      if(selections[filter]){
        if(selections[filter]["$in"].indexOf(attribute) >= 0){
          selections[filter]["$in"].splice(selections[filter]["$in"].indexOf(attribute), 1 );
          if(selections[filter]["$in"].length==0){
            delete selections[filter];
          }
        } else {
          selections[filter]["$in"].push(attribute);
        }
      } else {
        selections[filter] = {"$in":new Array(attribute)};
      }
      Session.set("filterSelections", selections);
    }
  });
  Template.dropdownItem.helpers({
    selected: function(filter, attribute) {
      if(Session.get("filterSelections")[filter] && Session.get("filterSelections")[filter]["$in"].indexOf(attribute) >=0){
        return "selected active";
      } else {
        return "";
      }
    }
  });
  Template.selectedOptionItem.events({
    'click .item': function() {
      var filter = this.filter;
      var attribute = this.attribute;
      var selections = Session.get("filterSelections");
      if(selections[filter]){
        if(selections[filter]["$in"].indexOf(attribute) >= 0){
          selections[filter]["$in"].splice(selections[filter]["$in"].indexOf(attribute), 1 );
          if(selections[filter]["$in"].length==0){
            delete selections[filter];
          }
        }
      }
      Session.set("filterSelections", selections);
    }
  });
  Template.dropdown.helpers({
    selectedOptions: function(filter) {
      if(Session.get("filterSelections")[filter]){
        return Session.get("filterSelections")[filter]["$in"];
      } else {
        return "";
      }
    }
  });
  Template.selfie.events({
    'click .image': function(event, template) {
      $(template.find('.modal')).modal('show');
    },
    'click .header': function(event, template) {
      $(template.find('.modal')).modal('show');
    },
    'click .favorite-this': function(event, template) {
      var newProfile = Meteor.user().profile
      var index = -1;
      if(!newProfile.favorites){
        newProfile.favorites = [];
      }
      for (var i = 0; i < newProfile.favorites.length; i++) {
          if(newProfile.favorites[i]._id === this._id){
            index = i;
            break;
          }
      }
      if(index === -1){
        newProfile.favorites.push(this);
      }else{
        newProfile.favorites.splice(index,1);
      }
      Meteor.users.update({ _id: Meteor.userId()}, {$set: {profile:newProfile}});
    }
  });
  Template.selfie.helpers({
    isFavorited: function() {
      var favorites = Meteor.user().profile.favorites || [];
      for (var i = 0; i < favorites.length; i++) {
          if(favorites[i]._id === this._id){
            return true;
          }
      }
      return false;
    }
  });
  Template.account.events({
    'click .ui.dropdown': function(event, template) {
      $(event.currentTarget).dropdown();
    },
    'change .ui.dropdown': function(event, template) {
      var attribute = $(event.target).attr('name');
      var newVal = $(event.target).attr('value');
      var newProfile = Meteor.user().profile;
      newProfile[attribute] = newVal;
      Meteor.users.update({ _id: Meteor.userId()}, {$set: {profile:newProfile}});
    }
  });
  Template.account.helpers({
    currentSelection: function(property) {
      return Meteor.user().profile[property] || "Select";
    },
    selected: function(property, option) {
      return Meteor.user().profile[property] === option;
    },
    favorites: function() {
      return Meteor.user().profile.favorites;
    },
    mySelfies: function() {
      return Selfies.find({username:Meteor.user().username});
    }
  });
  Template.submission.events({
    'change .filepicker': function(event, template) {
      var file, reader;
      file = event.currentTarget.files[0];
      reader = new FileReader;
      reader.onload = function(event) {
        $(template.find('img')).attr('src', event.target.result);
      };
      reader.readAsDataURL(file);
    },
    'submit #new-image': function(event, template) {
      var applicationTypeIndex, finishIndex, intensityIndex, productTypeIndex, price, priceGroup, user;
      event.preventDefault();
      productTypeIndex = event.target.productType.selectedIndex;
      applicationTypeIndex = event.target.applicationType.selectedIndex;
      finishIndex = event.target.finish.selectedIndex;
      intensityIndex = event.target.intensity.selectedIndex;
      price = event.target.price.value;
      user = Meteor.user();
      if (price < 10){priceGroup = "$";}
      else if (price < 20){priceGroup = "$$";}
      else{priceGroup = "$$$"};
      Selfies.insert({
        image: $(template.find('img')).attr('src'),
        product: event.target.sku.value,
        shade: event.target.shade.value,
        colorCategory: event.target.colorCategory.value,
        productType: event.target.productType.options[productTypeIndex].text,
        applicationType: event.target.applicationType.options[applicationTypeIndex].text,
        url: event.target.url.value,
        price: price,
        priceGroup: priceGroup,
        finish: event.target.finish.options[finishIndex].text,
        intensity: event.target.intensity.options[intensityIndex].text,
        skinTone: user.profile.skinTone,
        concern: user.profile.concern,
        hairColor: user.profile.hairColor,
        eyeColor: user.profile.eyeColor,
        createdAt: new Date,
        username: user.username
      });
      Router.go('/');
    }
  });
  Accounts.ui.config({
    requestPermissions: {
      facebook: ['public_profile']
    },
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

if (Meteor.isServer) {
  ServiceConfiguration.configurations.remove({
    service: 'facebook'
  });

  ServiceConfiguration.configurations.insert({
      service: 'facebook',
      appId: '1070649046295383',
      secret: 'c1bafcad192bc1b45b8c0c3c676d8410'
  });

  Accounts.onCreateUser(function(options, user) {
    if (!options.profile) {
      options.profile = {};
    }
    options.profile.skinTone = "Medium";
    options.profile.concern = "multi tone";
    options.profile.hairColor = "black";
    options.profile.eyeColor = "black";
    options.profile.favorites = [];
    if (options.profile) {
      user.profile = options.profile;
    }
    return user;
  });
}
