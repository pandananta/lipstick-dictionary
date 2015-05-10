var Selfies = new Mongo.Collection('selfies');
var ATTRIBUTES = {
  colorCategory: ["red", "pink", "orange", "nude", "brown", "purple", "other"],
  productType: ["lip stick", "lip stain", "lip gloss", "lip balm"],
  applicationType: ["gel", "stick", "liquid", "pencil"],
  finish: ["matte", "glossy", "silky", "satin", "dry"],
  intensity: ["sheer", "medium", "opaque", "intsense", "extreme"],
  price: ["$", "$$", "$$$"]
}

if (Meteor.isClient) {
  Router.configure({
    layoutTemplate: 'layout'
  });
  Router.route('/', function() {
    this.render('home');
  });
  Router.route('/account', function() {
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
      return Selfies.find({});
    }
  });
  Template.filters.helpers({
    dropdownOneAttributes: function() {
      return {
        title: this.title,
        id: this.attribute,
        attributes: ATTRIBUTES[this.attribute],
      };
    }
  });
  Template.selfie.events({
    'click .selfie': function(event, template) {
      var data, id, modalId;
      id = event.currentTarget.id;
      data = Selfies.findOne({
        _id: id
      });
      modalId = "#modal-" + id;
      return $(modalId).modal('show');
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
      var applicationTypeIndex, finishIndex, intensityIndex, productTypeIndex;
      event.preventDefault();
      productTypeIndex = event.target.productType.selectedIndex;
      applicationTypeIndex = event.target.applicationType.selectedIndex;
      finishIndex = event.target.finish.selectedIndex;
      intensityIndex = event.target.intensity.selectedIndex;
      Selfies.insert({
        image: $(template.find('img')).attr('src'),
        product: event.target.sku.value,
        shade: event.target.shade.value,
        colorCategory: event.target.colorCategory.value,
        productType: event.target.productType.options[productTypeIndex].text,
        applicationType: event.target.applicationType.options[applicationTypeIndex].text,
        url: event.target.url.value,
        price: event.target.price.value,
        finish: event.target.finish.options[finishIndex].text,
        intensity: event.target.intensity.options[intensityIndex].text,
        createdAt: new Date,
        username: Meteor.user().username
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
  Accounts.onCreateUser(function(options, user) {
    if (!options.profile) {
      options.profile = {};
    }
    options.profile.skinTone = 3;
    options.profile.concern = "multi tone";
    options.profile.hairColor = "black";
    options.profile.eyeColor = "black";
    if (options.profile) {
      user.profile = options.profile;
    }
    return user;
  });
}
